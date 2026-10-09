import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import useTitle from '../components/useTitle.js';
import { api } from '../api.js';
import { useConfig } from '../config.jsx';
import PlanDisclosure from '../components/PlanDisclosure.jsx';

const COUNTRIES = [['US', 'United States'], ['CA', 'Canada'], ['GB', 'United Kingdom'], ['AU', 'Australia'], ['IN', 'India'], ['DE', 'Germany'], ['FR', 'France'], ['NL', 'Netherlands'], ['IE', 'Ireland'], ['NZ', 'New Zealand'], ['SG', 'Singapore'], ['AE', 'United Arab Emirates']];

export default function Checkout() {
  useTitle('Secure checkout');
  const { id } = useParams();
  const [params] = useSearchParams();
  const { trial, recurring, days } = useConfig();
  const [quote, setQuote] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', country: 'US', agreed: false });
  const [err, setErr] = useState(params.get('cancelled') ? 'Checkout was cancelled. You have not been charged.' : '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/quotes/${id}`).then((q) => { setQuote(q); setForm((f) => ({ ...f, email: q.email || '' })); }).catch((e) => setErr(e.message));
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.agreed) return setErr('Please confirm you understand the trial and monthly billing terms.');
    setBusy(true);
    setErr('');
    try {
      const { checkout_url } = await api('/checkout', { method: 'POST', body: { ...form, quoteId: id } });
      window.location.href = checkout_url;
    } catch (e2) { setErr(e2.message); setBusy(false); }
  };

  if (!quote) return <div className="container page">{err ? <p className="error">{err}</p> : <div className="spinner" />}</div>;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const renew = new Date(Date.now() + days * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="container page">
      <div className="checkout-grid">
        <form className="card" onSubmit={submit}>
          <h1 className="h3">Start your {days}-day access</h1>
          <p className="muted">Estimate #{quote.id} · {quote.preview.summary.projectType}</p>
          <div className="form-grid">
            <div className="full"><label className="label">Full name</label><input className="input" required value={form.name} onChange={set('name')} placeholder="Jane Smith" /></div>
            <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={set('email')} /></div>
            <div><label className="label">Country</label>
              <select className="input" value={form.country} onChange={set('country')}>
                {COUNTRIES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-3"><PlanDisclosure /></div>

          <label className="checkbox agree">
            <input type="checkbox" checked={form.agreed} onChange={set('agreed')} />
            <span>
              I agree to pay <strong>{trial} today</strong> for {days}-day access. If I don't cancel before <strong>{renew}</strong>, I
              authorize {recurring} to be charged <strong>every month</strong> until I cancel. I have read the{' '}
              <Link to="/terms" target="_blank">Terms &amp; Conditions</Link>, <Link to="/privacy" target="_blank">Privacy Policy</Link> and{' '}
              <Link to="/refund-policy" target="_blank">Refund Policy</Link>.
            </span>
          </label>

          {err && <p className="error">{err}</p>}
          <button className="btn btn-primary btn-block btn-lg" disabled={busy}>{busy ? 'Redirecting to secure checkout…' : `Pay ${trial} & unlock my report`}</button>
          <p className="tiny muted center mt-1">You'll be redirected to Dodo Payments to complete your payment securely. Cancel anytime in My account.</p>
        </form>

        <aside>
          <div className="card order">
            <h3>Order summary</h3>
            <div className="line-row"><span>{days}-day trial membership</span><strong>{trial}</strong></div>
            <div className="line-row muted"><span>Then from {renew}</span><span>{recurring}/month</span></div>
            <div className="line-row total"><span>Due today</span><strong>{trial}</strong></div>
            <ul className="check-list mt-2">
              <li>Instant access to estimate #{quote.id}</li>
              <li>Unlimited new estimates while a member</li>
              <li>Saved reports in your account</li>
              <li>Cancel online anytime, no fees</li>
            </ul>
          </div>
          <div className="trust">
            <span>🔒 256-bit SSL</span><span>💳 Cards, Apple Pay, Google Pay</span><span>🧾 Dodo Payments (Merchant of Record)</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
