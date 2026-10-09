import 'dotenv/config';

const num = (v, d) => (v === undefined || v === '' ? d : Number(v));

export const config = {
  port: num(process.env.PORT, 4000),
  appUrl: (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, ''),
  isProd: process.env.NODE_ENV === 'production',
  company: {
    name: process.env.COMPANY_NAME || 'Sunrise Infratech',
    legalName: process.env.COMPANY_LEGAL_NAME || 'Sunrise Infratech LLC',
    email: process.env.SUPPORT_EMAIL || 'support@sunriseinfratech.com',
    address: process.env.COMPANY_ADDRESS || '123 Market Street, Suite 400, San Francisco, CA 94105, USA',
    phone: process.env.SUPPORT_PHONE || '+1 (555) 010-2026',
  },
  plan: {
    trialPrice: num(process.env.TRIAL_PRICE, 1),
    trialDays: num(process.env.TRIAL_DAYS, 7),
    recurringPrice: num(process.env.RECURRING_PRICE, 29),
    interval: 'month',
    currency: process.env.CURRENCY || 'USD',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: num(process.env.SMTP_PORT, 465),
    secure: (process.env.SMTP_SECURE || 'true') !== 'false',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || `Sunrise Infratech <${process.env.SMTP_USER || 'support@sunriseinfratech.com'}>`,
    supportTo: process.env.MAIL_TO_SUPPORT || process.env.SUPPORT_EMAIL || process.env.SMTP_USER || '',
  },
  dodo: {
    apiKey: process.env.DODO_API_KEY || '',
    baseUrl: process.env.DODO_ENV === 'live' ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com',
    env: process.env.DODO_ENV === 'live' ? 'live' : 'test',
    subscriptionProductId: process.env.DODO_SUBSCRIPTION_PRODUCT_ID || '',
    trialFeeProductId: process.env.DODO_TRIAL_FEE_PRODUCT_ID || '',
    webhookSecret: process.env.DODO_WEBHOOK_SECRET || '',
  },
};

export const demoMode = !config.dodo.apiKey || !config.dodo.subscriptionProductId;
