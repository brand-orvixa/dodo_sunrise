import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useTitle from '../components/useTitle.js';
import { api } from '../api.js';
import { useConfig } from '../config.jsx';

// Stand-in for the hosted Dodo checkout, used only when DODO_API_KEY is not configured.
export default function DemoCheckout() {
  useTitle('Demo checkout');
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { trial, recurring, days } = useConfig();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const quoteId = params.get('quote');

  const pay = async () => {
    setBusy(true);
    try {
      const { redirect } = await api('/demo/complete', { method: 'POST', body: { quoteId } });
      setTimeout(() => nav(redirect), 900);
    } catch (e) { setErr(e.message); setBusy(false); }
  };

  return (
    <div className="container page narrow">
      <div className="card demo-checkout">
        <span className="pill">Simulated Dodo Payments checkout</span>
        <h2>Pay {trial}</h2>
        <p className="muted">Sunrise Infratech membership: {trial} for {days} days, then {recurring}/month</p>
        <div className="fake-card">
          <input className="input" defaultValue="4242 4242 4242 4242" readOnly />
          <div className="form-grid"><input className="input" defaultValue="12 / 30" readOnly /><input className="input" defaultValue="123" readOnly /></div>
        </div>
        {err && <p className="error">{err}</p>}
        <button className="btn btn-primary btn-block btn-lg" onClick={pay} disabled={busy}>{busy ? 'Processing…' : `Pay ${trial} (demo)`}</button>
        <button className="btn btn-ghost btn-block mt-1" onClick={() => nav(`/checkout/${quoteId}?cancelled=1`)}>Cancel</button>
      </div>
    </div>
  );
}
