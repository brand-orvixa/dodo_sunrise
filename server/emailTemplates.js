// Branded, table-based HTML emails (inline styles for Gmail/Outlook compatibility).
import { config } from './config.js';

const C = { ink: '#141a3a', ink2: '#3b4266', muted: '#6b7194', line: '#e7e8f2', sun: '#ff6a3d', pink: '#e8366f', soft: '#fff8f3' };
const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: config.plan.currency, maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
const date = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const plan = () => ({ trial: money(config.plan.trialPrice), recurring: money(config.plan.recurringPrice), days: config.plan.trialDays });

function button(href, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0"><tr><td style="border-radius:999px;background:${C.sun};background-image:linear-gradient(120deg,#ffb347,${C.sun} 45%,${C.pink})">
  <a href="${href}" style="display:inline-block;padding:14px 30px;font-weight:700;font-size:16px;color:#ffffff;text-decoration:none;border-radius:999px">${label}</a></td></tr></table>`;
}

function rows(items) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.soft};border:1px solid #ffe0cf;border-radius:12px;margin:18px 0">
  ${items.map(([k, v], i) => `<tr><td style="padding:12px 16px;color:${C.ink2};font-size:14px;${i ? `border-top:1px dashed #ffd2bc;` : ''}">${k}</td>
  <td align="right" style="padding:12px 16px;color:${C.ink};font-weight:700;font-size:14px;${i ? `border-top:1px dashed #ffd2bc;` : ''}">${v}</td></tr>`).join('')}
  </table>`;
}

function layout({ preheader, title, body }) {
  const c = config.company;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f9;font-family:'Plus Jakarta Sans',Segoe UI,Helvetica,Arial,sans-serif;color:${C.ink}">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f9;padding:28px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
    <tr><td style="background:${C.ink};border-radius:18px 18px 0 0;padding:22px 32px">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="width:40px;height:40px;border-radius:10px;background:${C.sun};background-image:linear-gradient(135deg,#ffb347,${C.sun},${C.pink});text-align:center;font-size:22px;line-height:40px">&#9728;</td>
        <td style="padding-left:12px;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px">Sunrise <span style="color:#ffb38e">Infratech</span>
          <div style="font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#9ea3c4">Construction cost estimates</div></td>
      </tr></table>
    </td></tr>
    <tr><td style="height:4px;background:${C.sun};background-image:linear-gradient(90deg,#ffb347,${C.sun},${C.pink})"></td></tr>
    <tr><td style="background:#ffffff;padding:36px 32px;border-radius:0 0 18px 18px;font-size:15px;line-height:1.65;color:${C.ink2}">
      <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:${C.ink}">${title}</h1>
      ${body}
      <p style="margin:28px 0 0">Thanks,<br><strong style="color:${C.ink}">The ${esc(c.name)} team</strong></p>
    </td></tr>
    <tr><td style="padding:22px 32px;font-size:12px;line-height:1.6;color:${C.muted};text-align:center">
      Questions? Reply to this email or write to <a href="mailto:${c.email}" style="color:${C.sun}">${c.email}</a>.<br>
      <a href="${config.appUrl}/account" style="color:${C.muted}">Manage membership</a> ·
      <a href="${config.appUrl}/terms" style="color:${C.muted}">Terms</a> ·
      <a href="${config.appUrl}/privacy" style="color:${C.muted}">Privacy</a> ·
      <a href="${config.appUrl}/refund-policy" style="color:${C.muted}">Refunds</a><br>
      ${esc(c.legalName)} · ${esc(c.address)}
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

const disclosure = (renewDate) => {
  const p = plan();
  return `<p style="font-size:13px;color:${C.muted};margin:0">Your ${p.days}-day trial cost ${p.trial}. Unless you cancel before <strong>${date(renewDate)}</strong>,
  your membership renews automatically at <strong>${p.recurring} per month</strong> until you cancel. You can cancel anytime in your account, with no fees.</p>`;
};

export const templates = {
  estimateReady({ quote, link }) {
    const s = quote.quote.summary;
    const p = plan();
    return {
      subject: `Your ${s.projectType.toLowerCase()} estimate #${quote.id} is ready`,
      text: `Your construction estimate #${quote.id} (${s.projectType}, ${s.area} sq ft) is ready. Unlock the full report for ${p.trial} (${p.days}-day access, then ${p.recurring}/month unless cancelled): ${link}`,
      html: layout({
        preheader: `Complexity ${quote.quote.complexity}/10 · ${quote.quote.timelineWeeks.min}–${quote.quote.timelineWeeks.max} weeks build time`,
        title: 'Your construction estimate is ready',
        body: `<p>We've finished costing your project. Here's a quick summary:</p>
        ${rows([['Estimate', `#${esc(quote.id)}`], ['Project', esc(s.projectType)], ['Floor area', `${s.area.toLocaleString('en-US')} sq ft · ${s.floors} floor${s.floors > 1 ? 's' : ''}`],
          ['Finish level', esc(s.quality)], ['Complexity', `${quote.quote.complexity}/10`], ['Build time', `${quote.quote.timelineWeeks.min}–${quote.quote.timelineWeeks.max} weeks`]])}
        <p>Your full report includes builder price ranges, a trade-by-trade breakdown, a milestone payment schedule, material quantities and a contractor checklist.</p>
        ${button(link, `Unlock my full estimate for ${p.trial}`)}
        <p style="font-size:13px;color:${C.muted}">${p.trial} gives you ${p.days}-day access. After the trial, membership renews at ${p.recurring}/month unless you cancel.</p>`,
      }),
    };
  },

  welcome({ member, quote, reportLink, accountLink }) {
    const p = plan();
    return {
      subject: `Welcome to Sunrise Infratech: your estimate #${quote.id} is unlocked`,
      text: `Your payment of ${p.trial} was received and estimate #${quote.id} is unlocked: ${reportLink}\n\nTrial ends ${date(member.trialEndsAt)}. Unless you cancel before then, you'll be charged ${p.recurring}/month. Manage or cancel: ${accountLink}`,
      html: layout({
        preheader: `Your ${p.days}-day access has started. Open your full estimate now.`,
        title: "You're in! Your full estimate is unlocked 🎉",
        body: `<p>Thanks for joining Sunrise Infratech. Your payment was successful and your ${p.days}-day access has started.</p>
        ${button(reportLink, 'Open my full estimate')}
        ${rows([['Paid today', p.trial], ['Trial ends', date(member.trialEndsAt)], ['Then', `${p.recurring}/month`], ['Estimate ID', `#${esc(quote.id)}`]])}
        <p><strong style="color:${C.ink}">Keep this email.</strong> Use your email and estimate ID <strong>#${esc(quote.id)}</strong> to sign in from any device.</p>
        <p>While you're a member you can create <strong>unlimited estimates</strong> for any project.</p>
        ${disclosure(member.trialEndsAt)}
        <p style="margin-top:14px"><a href="${accountLink}" style="color:${C.sun};font-weight:700">Manage or cancel my membership →</a></p>`,
      }),
    };
  },

  trialReminder({ member, accountLink }) {
    const p = plan();
    return {
      subject: `Reminder: your trial ends ${date(member.trialEndsAt)}, then ${p.recurring}/month`,
      text: `Your Sunrise Infratech trial ends on ${date(member.trialEndsAt)}. After that you'll be charged ${p.recurring}/month unless you cancel: ${accountLink}`,
      html: layout({
        preheader: `No action needed to keep your membership. Cancel anytime before ${date(member.trialEndsAt)} to avoid charges.`,
        title: 'Your trial is ending soon',
        body: `<p>This is a friendly reminder that your ${p.days}-day trial ends on <strong style="color:${C.ink}">${date(member.trialEndsAt)}</strong>.</p>
        ${rows([['Trial ends', date(member.trialEndsAt)], ['Then you pay', `${p.recurring}/month`], ['Billed to', 'Your payment method on file']])}
        <p><strong style="color:${C.ink}">Want to keep going?</strong> You don't need to do anything. You'll keep unlimited estimates and saved reports.</p>
        <p><strong style="color:${C.ink}">Don't need it anymore?</strong> Cancel before the trial ends and you won't be charged again.</p>
        ${button(accountLink, 'Manage my membership')}`,
      }),
    };
  },

  renewed({ member, accountLink }) {
    const p = plan();
    return {
      subject: `Payment receipt: ${p.recurring} Sunrise Infratech membership`,
      text: `We received your ${p.recurring} membership payment. Next billing date: ${member.nextBillingAt ? date(member.nextBillingAt) : 'in one month'}. Manage: ${accountLink}`,
      html: layout({
        preheader: 'Thanks, your membership payment was received.',
        title: 'Payment received',
        body: `<p>Thanks! Your monthly membership payment was processed successfully.</p>
        ${rows([['Amount', p.recurring], ['Date', date(new Date())], ['Next billing date', member.nextBillingAt ? date(member.nextBillingAt) : 'In one month']])}
        <p style="font-size:13px;color:${C.muted}">The charge appears on your statement from Dodo Payments, our Merchant of Record. Didn't mean to renew? Contact us within 7 days. See our <a href="${config.appUrl}/refund-policy" style="color:${C.sun}">Refund Policy</a>.</p>
        ${button(accountLink, 'View my account')}`,
      }),
    };
  },

  cancelled({ member }) {
    const until = member.accessUntil ? date(member.accessUntil) : null;
    return {
      subject: 'Your Sunrise Infratech membership has been cancelled',
      text: `Your membership has been cancelled. You will not be charged again.${until ? ` You keep access until ${until}.` : ''}`,
      html: layout({
        preheader: 'Cancellation confirmed. You will not be charged again.',
        title: 'Cancellation confirmed',
        body: `<p>Your membership has been cancelled and <strong style="color:${C.ink}">you will not be charged again</strong>.</p>
        ${until ? rows([['Access until', until], ['Future charges', 'None']]) : ''}
        <p>Your saved estimates stay in your account. You can rejoin anytime to unlock them again.</p>
        ${button(`${config.appUrl}/quote`, 'Start a new estimate')}`,
      }),
    };
  },

  contactAck({ name, message }) {
    return {
      subject: 'We received your message',
      text: `Hi ${name || 'there'}, thanks for contacting Sunrise Infratech. We'll reply within one business day.\n\nYour message:\n${message}`,
      html: layout({
        preheader: "We'll get back to you within one business day.",
        title: `Thanks${name ? `, ${esc(name)}` : ''}! We got your message`,
        body: `<p>Our support team will reply within one business day.</p>
        <div style="border-left:4px solid ${C.sun};background:${C.soft};padding:14px 18px;border-radius:0 10px 10px 0;white-space:pre-wrap;color:${C.ink2}">${esc(message)}</div>`,
      }),
    };
  },

  contactToSupport({ name, email, message }) {
    return {
      subject: `[Contact] ${name || email}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: layout({
        preheader: `New message from ${email}`,
        title: 'New contact form message',
        body: `${rows([['Name', esc(name || '-')], ['Email', esc(email)]])}
        <div style="white-space:pre-wrap;color:${C.ink2}">${esc(message)}</div>`,
      }),
    };
  },
};
