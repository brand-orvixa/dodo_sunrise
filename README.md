# Sunrise Infratech

Instant construction cost estimates (new homes, extensions, renovations, fit-outs, commercial, industrial).
Funnel: questionnaire → free preview → $1 for 7-day access → renews at $29/month (Dodo Payments).

## Run
```bash
cp .env.example .env      # fill in values
npm install               # installs server + client
npm run dev               # API :4000 + Vite :5173 (hot reload)
# production
npm run build && npm start   # serves everything on :4000
```
With `DODO_API_KEY` empty the app runs in **demo mode** (simulated checkout page, no real charges).

## Dodo Payments setup
1. Dashboard → Products → create a **subscription** product: $29 / month.
   Set **Trial amount = $1** and trial = 7 days (paid trial). Put its id in `DODO_SUBSCRIPTION_PRODUCT_ID`.
   - If your account has no "trial amount" option: create a one-time $1 product and set
     `DODO_TRIAL_FEE_PRODUCT_ID`. It is added to the same cart, and the subscription gets a free 7-day trial.
2. Developer → API keys → `DODO_API_KEY`, `DODO_ENV=test|live`.
3. Developer → Webhooks → endpoint `{APP_URL}/api/webhooks/dodo`, copy the secret to `DODO_WEBHOOK_SECRET`.
   Events used: `payment.succeeded`, `subscription.active|renewed|updated|cancelled|expired|failed|on_hold`.
4. Set `APP_URL` to your public URL (used for the checkout return/cancel URLs).
5. Run one test-mode purchase and confirm you see $1 today, $29 at renewal, and the webhooks arriving.

## Email (Hostinger SMTP)
Set `SMTP_*` in `.env` (smtp.hostinger.com:465, SSL). Emails sent automatically:
| Template | When |
|---|---|
| `estimateReady` | Visitor enters email on the preview page (once per estimate) |
| `welcome` | First successful $1 payment: report link, trial end date, $29/mo disclosure, cancel link |
| `trialReminder` | ~48h before the trial converts to $29/month (hourly scheduler) |
| `renewed` | `subscription.renewed` webhook (receipt) |
| `cancelled` | Member cancels (account page or webhook) |
| `contactToSupport` / `contactAck` | Contact form |

Preview all templates: `npm run emails:preview` writes HTML files to `data/email-previews/`.
Email links use `APP_URL`, so set it to your real domain in production.

## Structure
- `server/index.js`: Express API, checkout, confirmation, webhooks, account/cancel, serves `client/dist`
- `server/quoteEngine.js`: construction pricing model (rates per sq ft, trade shares, add-ons, timelines)
- `server/emailTemplates.js`, `server/mailer.js`: branded HTML emails and SMTP sending
- `server/dodo.js`: Dodo REST client + Standard Webhooks signature check
- `server/db.js`: JSON-file store at `data/db.json` (swap for a real DB at scale)
- `client/`: React + Vite (pages, legal pages, logo in `components/Logo.jsx`, `public/favicon.svg`)

Company name, address and support email on the legal pages come from `.env`.
Have the Terms, Privacy and Refund policies reviewed by a lawyer before going live.
