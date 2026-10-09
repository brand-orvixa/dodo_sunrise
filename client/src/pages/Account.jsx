import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useTitle from '../components/useTitle.js';
import { api, store, fmtDate } from '../api.js';
import { useConfig } from '../config.jsx';

const STATUS = { active: 'Active', pending: 'Processing', cancelled: 'Cancelled', expired: 'Expired', failed: 'Payment failed', on_hold: 'On hold' };

export default function Account() {
  useTitle('My account');
  const { recurring, company } = useConfig();
  const [acct, setAcct] = useState(null);
  const [loading, setLoading] = useState(() => {
    const m = new URLSearchParams(window.location.search).get('m');
    if (m) { store.setMemberToken(m); window.history.replaceState(null, '', '/account'); }
    return !!store.memberToken();
  });
  const [form, setForm] = useState({ email: '', quoteId: '' });
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!store.memberToken()) return;
    api('/account').then(setAcct).catch(() => store.clearMember()).finally(() => setLoading(false));
  }, []);

  useEffect(() => { acct?.quotes.forEach((q) => q.accessToken && store.setReportToken(q.id, q.accessToken)); }, [acct]);

  const restore = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const r = await api('/account/restore', { method: 'POST', body: form });
      store.setMemberToken(r.memberToken);
      setAcct(r.account);
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  };

  const cancel = async () => {
    setErr(''); setBusy(true);
    try {
      const r = await api('/account/cancel', { method: 'POST' });
      setAcct(r); setConfirming(false);
      setMsg(`Your membership has been cancelled. You will not be charged again${r.accessUntil ? ` and keep access until ${fmtDate(r.accessUntil)}` : ''}.`);
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  };

  if (loading) return <div className="container page"><div className="spinner" /></div>;

  if (!acct) {
    return (
      <div className="container page narrow">
        <h1 className="h2">My account</h1>
        <p className="muted">Sign in to view your reports, see your billing dates, or cancel your membership. Use the email you paid with and any estimate ID from your receipt (for example Q1A2B3C4D5).</p>
        <form className="card" onSubmit={restore}>
          <label className="label">Email</label>
          <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label className="label mt-2">Estimate ID</label>
          <input className="input" required value={form.quoteId} onChange={(e) => setForm({ ...form, quoteId: e.target.value })} placeholder="Q…" />
          {err && <p className="error">{err}</p>}
          <button className="btn btn-primary btn-block mt-2" disabled={busy}>Access my account</button>
          <p className="tiny muted mt-2">Can't find your estimate ID? Email <a href={`mailto:${company.email}`}>{company.email}</a> and we'll help you or cancel for you within 24 hours.</p>
        </form>
      </div>
    );
  }

  const canCancel = ['active', 'pending'].includes(acct.status) && !acct.cancelAtPeriodEnd;
  return (
    <div className="container page narrow">
      <h1 className="h2">My account</h1>
      {msg && <p className="notice">{msg}</p>}
      <div className="card">
        <div className="acct-head">
          <div><small className="muted">Signed in as</small><div><strong>{acct.email}</strong></div></div>
          <span className={`status s-${acct.status}`}>{STATUS[acct.status] || acct.status}</span>
        </div>
        <div className="acct-grid">
          <div><small>Member since</small><b>{fmtDate(acct.startedAt)}</b></div>
          <div><small>Trial ends</small><b>{fmtDate(acct.trialEndsAt)}</b></div>
          {canCancel
            ? <div><small>Next charge</small><b>{recurring} on {fmtDate(acct.nextBillingAt)}</b></div>
            : <div><small>Access until</small><b>{acct.accessUntil ? fmtDate(acct.accessUntil) : '-'}</b></div>}
        </div>
        {canCancel && !confirming && <button className="btn btn-ghost mt-2" onClick={() => setConfirming(true)}>Cancel membership</button>}
        {confirming && (
          <div className="confirm-box">
            <p>Are you sure? You won't be charged {recurring}/month anymore. You'll keep access until the end of your current period.</p>
            <div className="row-gap">
              <button className="btn btn-danger" onClick={cancel} disabled={busy}>{busy ? 'Cancelling…' : 'Yes, cancel my membership'}</button>
              <button className="btn btn-ghost" onClick={() => setConfirming(false)}>Keep membership</button>
            </div>
          </div>
        )}
        {err && <p className="error">{err}</p>}
      </div>

      <h3 className="mt-3">My reports</h3>
      <div className="card">
        {acct.quotes.length === 0 && <p className="muted">No reports yet.</p>}
        {acct.quotes.map((q) => (
          <div className="line-row" key={q.id}>
            <span><strong>#{q.id}</strong> · {q.projectType} · <span className="muted">{fmtDate(q.createdAt)}</span></span>
            {acct.hasAccess ? <Link to={`/report/${q.id}`}>View →</Link> : <span className="muted">Locked</span>}
          </div>
        ))}
        {acct.hasAccess && <Link to="/quote" className="btn btn-primary mt-2">Create a new estimate</Link>}
      </div>
      <button className="btn btn-link mt-2" onClick={() => { store.clearMember(); setAcct(null); }}>Sign out on this device</button>
    </div>
  );
}
