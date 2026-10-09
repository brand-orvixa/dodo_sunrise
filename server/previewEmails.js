// Renders every email template to data/email-previews/*.html for review: `npm run emails:preview`
import fs from 'node:fs';
import path from 'node:path';
import { templates } from './emailTemplates.js';
import { buildQuote, validateInput } from './quoteEngine.js';

const out = path.join(process.cwd(), 'data', 'email-previews');
fs.mkdirSync(out, { recursive: true });
const { input } = validateInput({ projectType: 'house', area: 2400, floors: 2, quality: 'premium', features: ['garage'] });
const quote = { id: 'Q1A2B3C4D5', accessToken: 'demo', quote: buildQuote(input) };
const member = { email: 'jane@example.com', token: 'demo', trialEndsAt: new Date(Date.now() + 7 * 864e5), nextBillingAt: new Date(Date.now() + 37 * 864e5), accessUntil: new Date(Date.now() + 5 * 864e5) };
const link = 'https://sunriseinfratech.com/report/Q1A2B3C4D5';
const data = {
  estimateReady: { quote, link },
  welcome: { member, quote, reportLink: link, accountLink: link },
  trialReminder: { member, accountLink: link },
  renewed: { member, accountLink: link },
  cancelled: { member },
  contactAck: { name: 'Jane', message: 'Hi, can I get help with my estimate?' },
  contactToSupport: { name: 'Jane', email: 'jane@example.com', message: 'Hi, can I get help with my estimate?' },
};
for (const [name, d] of Object.entries(data)) {
  const t = templates[name](d);
  fs.writeFileSync(path.join(out, `${name}.html`), t.html);
  console.log(`${name}.html  ->  ${t.subject}`);
}
