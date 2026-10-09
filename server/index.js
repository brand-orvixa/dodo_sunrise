import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { config, demoMode } from './config.js';
import { db } from './db.js';
import { validateInput, buildQuote, previewOf, OPTIONS } from './quoteEngine.js';
import * as dodo from './dodo.js';
import { sendMail, mailEnabled, verifyMail } from './mailer.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const token = () => crypto.randomBytes(24).toString('base64url');
const newId = () => 'Q' + crypto.randomBytes(5).toString('hex').toUpperCase();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DAY = 86400000;

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN' });
  next();
});

// ---------- Webhook (raw body needed for signature) ----------
app.post('/api/webhooks/dodo', express.raw({ type: '*/*', limit: '1mb' }), (req, res) => {
  let event;
  try {
    event = dodo.verifyWebhook(req.body.toString('utf8'), req.headers);
  } catch (e) {
    console.warn('[webhook] rejected:', e.message);
    return res.status(401).json({ error: 'invalid signature' });
  }
  const webhookId = req.headers['webhook-id'];
  if (db.seenEvent(webhookId)) return res.json({ received: true, duplicate: true });
  db.logEvent({ webhookId, type: event.type });

  try { handleEvent(event); } catch (e) { console.error('[webhook] handler error', e); }
  res.json({ received: true });
});

app.use(express.json({ limit: '100kb' }));

// ---------- Helpers ----------
function hasAccess(member) {
  if (!member) return false;
  if (['active', 'trialing', 'pending'].includes(member.status)) return true;
  if (member.accessUntil && Date.now() < new Date(member.accessUntil).getTime()) return true;
  return false;
}

function publicMember(m) {
  return {
    email: m.email,
    status: m.status,
    cancelAtPeriodEnd: !!m.cancelAtPeriodEnd,
    trialEndsAt: m.trialEndsAt,
    nextBillingAt: m.nextBillingAt,
    accessUntil: m.accessUntil,
    startedAt: m.startedAt,
    quotes: (m.quotes || []).map((id) => db.getQuote(id)).filter(Boolean).map((q) => ({
      id: q.id, createdAt: q.createdAt, projectType: q.quote.summary.projectType, accessToken: q.accessToken,
    })),
    hasAccess: hasAccess(m),
  };
}

function unlockQuote(quote) {
  if (!quote.accessToken) quote.accessToken = token();
  quote.unlocked = true;
  db.saveQuote(quote);
  return quote;
}

function activate({ quote, email, subscriptionId, paymentId, status = 'active', nextBillingAt }) {
  email = (email || quote?.email || '').toLowerCase();
  if (!email) return null;
  const now = new Date();
  let m = db.getMember(email) || { email, token: token(), quotes: [], startedAt: now.toISOString() };
  const wasActive = m.status === 'active';
  m.status = status === 'pending' ? 'pending' : 'active';
  m.subscriptionId = subscriptionId || m.subscriptionId;
  m.lastPaymentId = paymentId || m.lastPaymentId;
  m.trialEndsAt = m.trialEndsAt || new Date(now.getTime() + config.plan.trialDays * DAY).toISOString();
  m.nextBillingAt = nextBillingAt || m.nextBillingAt || m.trialEndsAt;
  m.cancelAtPeriodEnd = false;
  m.accessUntil = null;
  m.cancelEmailSentAt = null;
  if (quote) {
    unlockQuote(quote);
    quote.email = quote.email || email;
    if (!m.quotes.includes(quote.id)) m.quotes.push(quote.id);
    db.saveQuote(quote);
  }
  db.saveMember(m);
  if (quote && !wasActive && !m.welcomeSentAt) {
    m.welcomeSentAt = now.toISOString();
    db.saveMember(m);
    sendMail(m.email, 'welcome', { member: m, quote, reportLink: links.report(quote), accountLink: links.account(m) });
  }
  return m;
}

function handleEvent(event) {
  const d = event.data || {};
  const quoteId = d.metadata?.quote_id;
  const email = d.customer?.email || d.metadata?.email;
  const subId = d.subscription_id;
  const quote = quoteId ? db.getQuote(quoteId) : null;

  switch (event.type) {
    case 'payment.succeeded':
    case 'subscription.active':
    case 'subscription.plan_changed':
      activate({ quote, email, subscriptionId: subId, paymentId: d.payment_id, nextBillingAt: d.next_billing_date });
      break;
    case 'subscription.renewed': {
      const m = activate({ quote, email, subscriptionId: subId, nextBillingAt: d.next_billing_date });
      if (m) sendMail(m.email, 'renewed', { member: m, accountLink: links.account(m) });
      break;
    }
    case 'subscription.cancelled':
    case 'subscription.expired':
    case 'subscription.failed':
    case 'subscription.on_hold': {
      const m = (subId && db.findMemberBySubscription(subId)) || db.getMember(email);
      if (!m) break;
      m.status = event.type.split('.')[1];
      if (event.type === 'subscription.cancelled' && m.nextBillingAt && new Date(m.nextBillingAt) > new Date()) {
        m.accessUntil = m.nextBillingAt;
      }
      db.saveMember(m);
      if (event.type === 'subscription.cancelled') sendCancelled(m);
      break;
    }
    case 'subscription.updated': {
      const m = subId && db.findMemberBySubscription(subId);
      if (!m) break;
      if (d.next_billing_date) m.nextBillingAt = d.next_billing_date;
      if (typeof d.cancel_at_next_billing_date === 'boolean') {
        m.cancelAtPeriodEnd = d.cancel_at_next_billing_date;
        if (m.cancelAtPeriodEnd) m.accessUntil = m.nextBillingAt;
      }
      db.saveMember(m);
      break;
    }
    default:
      break;
  }
}

const links = {
  report: (q) => `${config.appUrl}/report/${q.id}?token=${q.accessToken}`,
  preview: (q) => `${config.appUrl}/quote/${q.id}`,
  account: (m) => `${config.appUrl}/account?m=${m.token}`,
};

function sendCancelled(m) {
  if (m.cancelEmailSentAt) return;
  m.cancelEmailSentAt = new Date().toISOString();
  db.saveMember(m);
  sendMail(m.email, 'cancelled', { member: m });
}

const memberFromReq = (req) => {
  const t = req.get('x-member-token');
  return t ? db.findMemberByToken(t) : null;
};

// ---------- API ----------
app.get('/api/config', (req, res) => {
  res.json({ plan: config.plan, company: config.company, demoMode, options: OPTIONS });
});

app.post('/api/quotes', (req, res) => {
  const { errors, input } = validateInput(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });
  const q = { id: newId(), createdAt: new Date().toISOString(), input, quote: buildQuote(input), unlocked: false };
  db.saveQuote(q);

  // Existing members get unlimited reports.
  const member = memberFromReq(req);
  if (member && hasAccess(member)) {
    q.email = member.email;
    unlockQuote(q);
    member.quotes.push(q.id);
    db.saveMember(member);
    return res.json({ id: q.id, unlocked: true, accessToken: q.accessToken });
  }
  res.json({ id: q.id, unlocked: false });
});

app.get('/api/quotes/:id', (req, res) => {
  const q = db.getQuote(req.params.id);
  if (!q) return res.status(404).json({ error: 'Quote not found' });
  res.json({ id: q.id, createdAt: q.createdAt, email: q.email || '', unlocked: !!q.unlocked, preview: previewOf(q.quote) });
});

app.post('/api/quotes/:id/email', (req, res) => {
  const q = db.getQuote(req.params.id);
  if (!q) return res.status(404).json({ error: 'Quote not found' });
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  q.email = email;
  q.name = String(req.body.name || '').slice(0, 100).trim();
  const firstTime = !q.readyEmailSentAt;
  if (firstTime) q.readyEmailSentAt = new Date().toISOString();
  db.saveQuote(q);
  if (firstTime) sendMail(email, 'estimateReady', { quote: q, link: links.preview(q) });
  res.json({ ok: true });
});

app.get('/api/quotes/:id/report', (req, res) => {
  const q = db.getQuote(req.params.id);
  if (!q) return res.status(404).json({ error: 'Quote not found' });
  const t = String(req.query.token || '');
  if (!q.unlocked || !q.accessToken || t.length !== q.accessToken.length ||
      !crypto.timingSafeEqual(Buffer.from(t), Buffer.from(q.accessToken))) {
    return res.status(403).json({ error: 'locked' });
  }
  const member = db.getMember(q.email);
  if (member && !hasAccess(member)) return res.status(402).json({ error: 'membership_ended' });
  res.json({ id: q.id, createdAt: q.createdAt, projectName: q.input.projectName, quote: q.quote });
});

app.post('/api/checkout', async (req, res) => {
  const { quoteId, name, country, agreed } = req.body || {};
  const email = String(req.body.email || '').trim().toLowerCase();
  const q = db.getQuote(quoteId);
  if (!q) return res.status(404).json({ error: 'Quote not found' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (agreed !== true) return res.status(400).json({ error: 'Please accept the subscription terms to continue.' });

  q.email = email;
  q.name = String(name || q.name || '').slice(0, 100).trim();
  q.checkoutStartedAt = new Date().toISOString();
  q.termsAcceptedAt = new Date().toISOString();
  db.saveQuote(q);

  if (demoMode) return res.json({ checkout_url: `/demo-checkout?quote=${q.id}`, demo: true });

  try {
    const session = await dodo.createCheckoutSession({ quote: q, email, name: q.name, country: /^[A-Z]{2}$/.test(country || '') ? country : undefined });
    q.checkoutSessionId = session.session_id;
    db.saveQuote(q);
    res.json({ checkout_url: session.checkout_url });
  } catch (e) {
    console.error(e.message);
    res.status(502).json({ error: 'Could not start checkout. Please try again in a moment.' });
  }
});

// Demo-only: simulates a successful Dodo checkout locally.
app.post('/api/demo/complete', (req, res) => {
  if (!demoMode) return res.status(404).end();
  const q = db.getQuote(req.body.quoteId);
  if (!q || !q.email) return res.status(404).json({ error: 'Quote not found' });
  const subId = 'sub_demo_' + crypto.randomBytes(6).toString('hex');
  res.json({ redirect: `/success?quote=${q.id}&subscription_id=${subId}&status=active` });
});

app.post('/api/checkout/confirm', async (req, res) => {
  const { quoteId, subscription_id: subId, payment_id: payId } = req.body || {};
  const q = db.getQuote(quoteId);
  if (!q) return res.status(404).json({ error: 'Quote not found' });

  const done = () => {
    const m = db.getMember(q.email);
    return res.json({ status: 'active', accessToken: q.accessToken, memberToken: m?.token });
  };
  if (q.unlocked) return done(); // webhook already processed it

  try {
    if (demoMode) {
      if (!String(subId || '').startsWith('sub_demo_')) return res.status(400).json({ error: 'Invalid demo session' });
      activate({ quote: q, email: q.email, subscriptionId: subId });
      return done();
    }
    if (subId) {
      const sub = await dodo.getSubscription(subId);
      if (sub.metadata?.quote_id && sub.metadata.quote_id !== q.id) return res.status(400).json({ error: 'Session mismatch' });
      if (sub.status === 'active') {
        activate({ quote: q, email: sub.customer?.email || q.email, subscriptionId: subId, nextBillingAt: sub.next_billing_date });
        return done();
      }
      if (['failed', 'cancelled', 'expired'].includes(sub.status)) return res.json({ status: 'failed' });
      return res.json({ status: 'pending' });
    }
    if (payId) {
      const p = await dodo.getPayment(payId);
      if (p.metadata?.quote_id && p.metadata.quote_id !== q.id) return res.status(400).json({ error: 'Session mismatch' });
      if (p.status === 'succeeded') {
        activate({ quote: q, email: p.customer?.email || q.email, subscriptionId: p.subscription_id, paymentId: payId });
        return done();
      }
      if (p.status === 'failed' || p.status === 'cancelled') return res.json({ status: 'failed' });
      return res.json({ status: 'pending' });
    }
    return res.json({ status: 'pending' });
  } catch (e) {
    console.error(e.message);
    res.status(502).json({ error: 'Could not verify payment yet.' });
  }
});

app.get('/api/account', (req, res) => {
  const m = memberFromReq(req);
  if (!m) return res.status(401).json({ error: 'Not signed in' });
  res.json(publicMember(m));
});

// Restore access on a new device with email + any report ID belonging to that email.
app.post('/api/account/restore', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const q = db.getQuote(String(req.body.quoteId || '').trim().toUpperCase());
  const m = db.getMember(email);
  if (!m || !q || q.email !== email || !m.quotes.includes(q.id)) {
    return res.status(404).json({ error: 'We could not find a membership matching that email and report ID.' });
  }
  res.json({ memberToken: m.token, account: publicMember(m) });
});

app.post('/api/account/cancel', async (req, res) => {
  const m = memberFromReq(req);
  if (!m) return res.status(401).json({ error: 'Not signed in' });
  try {
    if (!demoMode && m.subscriptionId) await dodo.cancelSubscription(m.subscriptionId);
    m.cancelAtPeriodEnd = true;
    m.status = 'cancelled';
    m.accessUntil = m.nextBillingAt || new Date().toISOString();
    m.cancelledAt = new Date().toISOString();
    db.saveMember(m);
    sendCancelled(m);
    res.json(publicMember(m));
  } catch (e) {
    console.error(e.message);
    res.status(502).json({ error: `We could not cancel automatically. Please email ${config.company.email} and we will cancel within 24 hours.` });
  }
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!EMAIL_RE.test(String(email || '')) || !String(message || '').trim()) {
    return res.status(400).json({ error: 'Please provide your email and a message.' });
  }
  const msg = { name: String(name || '').slice(0, 100), email: String(email), message: String(message).slice(0, 4000) };
  db.logEvent({ type: 'contact', ...msg });
  sendMail(config.smtp.supportTo, 'contactToSupport', msg, { replyTo: msg.email });
  sendMail(msg.email, 'contactAck', msg);
  res.json({ ok: true });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// ---------- Static client (production) ----------
const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// Trial-ending reminder, sent ~48h before the first ${config.plan.recurringPrice} charge.
function sendTrialReminders() {
  const now = Date.now();
  for (const m of db.allMembers()) {
    if (m.status !== 'active' || m.cancelAtPeriodEnd || m.trialReminderSentAt || !m.trialEndsAt) continue;
    const ends = new Date(m.trialEndsAt).getTime();
    if (ends > now && ends - now <= 48 * 3600 * 1000) {
      m.trialReminderSentAt = new Date().toISOString();
      db.saveMember(m);
      sendMail(m.email, 'trialReminder', { member: m, accountLink: links.account(m) });
    }
  }
}
setInterval(sendTrialReminders, 60 * 60 * 1000).unref();
setTimeout(sendTrialReminders, 10 * 1000).unref();

if (mailEnabled) verifyMail().then(() => console.log(`[mail] SMTP ready (${config.smtp.host})`)).catch((e) => console.error('[mail] SMTP verify failed:', e.message));

app.listen(config.port, () => {
  console.log(`Sunrise Infratech API on http://localhost:${config.port}  (${demoMode ? 'DEMO mode - no real charges' : `Dodo ${config.dodo.env} mode`})`);
});
