import nodemailer from 'nodemailer';
import { config } from './config.js';
import { templates } from './emailTemplates.js';

const enabled = !!(config.smtp.user && config.smtp.pass);
const transport = enabled
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    })
  : null;

export const mailEnabled = enabled;

export function verifyMail() {
  return transport ? transport.verify() : Promise.reject(new Error('SMTP not configured'));
}

// Fire-and-forget: email failures must never break checkout or webhooks.
export async function sendMail(to, template, data, extra = {}) {
  if (!to) return false;
  const { subject, html, text } = templates[template](data);
  if (!transport) {
    console.log(`[mail] (disabled) would send "${subject}" to ${to}`);
    return false;
  }
  try {
    await transport.sendMail({ from: config.smtp.from, to, subject, html, text, ...extra });
    console.log(`[mail] sent "${template}" to ${to}`);
    return true;
  } catch (e) {
    console.error(`[mail] failed "${template}" to ${to}: ${e.message}`);
    return false;
  }
}
