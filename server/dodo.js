import crypto from 'node:crypto';
import { config } from './config.js';

async function api(method, path, body) {
  const res = await fetch(config.dodo.baseUrl + path, {
    method,
    headers: { Authorization: `Bearer ${config.dodo.apiKey}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) {
    const err = new Error(`Dodo API ${method} ${path} failed (${res.status}): ${data.message || data.raw || text}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function createCheckoutSession({ quote, email, name, country }) {
  const product_cart = [{ product_id: config.dodo.subscriptionProductId, quantity: 1 }];
  if (config.dodo.trialFeeProductId) product_cart.unshift({ product_id: config.dodo.trialFeeProductId, quantity: 1 });

  return api('POST', '/checkouts', {
    product_cart,
    customer: { email, name: name || email.split('@')[0] },
    ...(country ? { billing_address: { country } } : {}),
    subscription_data: { trial_period_days: config.plan.trialDays },
    return_url: `${config.appUrl}/success?quote=${encodeURIComponent(quote.id)}`,
    cancel_url: `${config.appUrl}/checkout/${encodeURIComponent(quote.id)}?cancelled=1`,
    metadata: { quote_id: quote.id, email },
    customization: { show_order_details: true },
  });
}

export const getSubscription = (id) => api('GET', `/subscriptions/${encodeURIComponent(id)}`);
export const getPayment = (id) => api('GET', `/payments/${encodeURIComponent(id)}`);
export const cancelSubscription = (id) =>
  api('PATCH', `/subscriptions/${encodeURIComponent(id)}`, { cancel_at_next_billing_date: true });

// Standard Webhooks verification (https://www.standardwebhooks.com)
export function verifyWebhook(rawBody, headers) {
  const secret = config.dodo.webhookSecret;
  if (!secret) throw new Error('DODO_WEBHOOK_SECRET not configured');
  const id = headers['webhook-id'];
  const ts = headers['webhook-timestamp'];
  const sigHeader = headers['webhook-signature'];
  if (!id || !ts || !sigHeader) throw new Error('Missing webhook headers');
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) throw new Error('Webhook timestamp out of tolerance');

  const key = secret.startsWith('whsec_') ? Buffer.from(secret.slice(6), 'base64') : Buffer.from(secret);
  const expected = crypto.createHmac('sha256', key).update(`${id}.${ts}.${rawBody}`).digest();
  const ok = sigHeader.split(' ').some((part) => {
    const [ver, sig] = part.split(',');
    if (ver !== 'v1' || !sig) return false;
    const given = Buffer.from(sig, 'base64');
    return given.length === expected.length && crypto.timingSafeEqual(given, expected);
  });
  if (!ok) throw new Error('Invalid webhook signature');
  return JSON.parse(rawBody);
}
