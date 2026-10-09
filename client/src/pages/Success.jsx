import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import useTitle from '../components/useTitle.js';
import { api, store } from '../api.js';
import { useConfig } from '../config.jsx';

export default function Success() {
  useTitle('Payment confirmation');
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { company } = useConfig();
  const [state, setState] = useState('checking');
  const quoteId = params.get('quote');

  useEffect(() => {
    let tries = 0;
    let timer;
    const body = { quoteId, subscription_id: params.get('subscription_id'), payment_id: params.get('payment_id') };
    if (params.get('status') === 'failed' || params.get('status') === 'cancelled') { setState('failed'); return; }
    const check = async () => {
      tries += 1;
      try {
        const r = await api('/checkout/confirm', { method: 'POST', body });
        if (r.status === 'active') {
          store.setReportToken(quoteId, r.accessToken);
          store.setMemberToken(r.memberToken);
          setState('active');
          timer = setTimeout(() => nav(`/report/${quoteId}`, { replace: true }), 1500);
          return;
        }
        if (r.status === 'failed') return setState('failed');
      } catch { /* retry */ }
      if (tries < 15) timer = setTimeout(check, 2000);
      else setState('slow');
    };
    check();
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line

  return (
    <div className="container page narrow center">
      <div className="card result">
        {state === 'checking' && (<><div className="sun-loader"><span /></div><h2>Confirming your payment…</h2><p className="muted">This usually takes a few seconds.</p></>)}
        {state === 'active' && (<><div className="big-check">✓</div><h2>You're in! 🎉</h2><p className="muted">Payment confirmed. Opening your full report…</p></>)}
        {state === 'failed' && (<><div className="big-x">!</div><h2>Payment not completed</h2><p className="muted">You have not been charged. You can try again below.</p><Link to={`/checkout/${quoteId}`} className="btn btn-primary mt-2">Try again</Link></>)}
        {state === 'slow' && (<><h2>Still processing</h2><p className="muted">Your payment is taking longer than usual to confirm. Refresh this page in a minute, or contact <a href={`mailto:${company.email}`}>{company.email}</a> with estimate #{quoteId}.</p><button className="btn btn-primary mt-2" onClick={() => window.location.reload()}>Refresh</button></>)}
      </div>
    </div>
  );
}
