import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import useTitle from '../components/useTitle.js';
import { api, store } from '../api.js';
import { useConfig } from '../config.jsx';
import PlanDisclosure from '../components/PlanDisclosure.jsx';

export default function Preview() {
  useTitle('Your estimate is ready');
  const { id } = useParams();
  const nav = useNavigate();
  const { trial, days } = useConfig();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/quotes/${id}`).then((d) => {
      if (d.unlocked && store.reportToken(id)) return nav(`/report/${id}`, { replace: true });
      setData(d);
      setEmail(d.email || '');
    }).catch((e) => setErr(e.message));
  }, [id, nav]);

  const go = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api(`/quotes/${id}/email`, { method: 'POST', body: { email } });
      nav(`/checkout/${id}`);
    } catch (e2) { setErr(e2.message); setBusy(false); }
  };

  if (err && !data) return <div className="container page center"><h2>{err}</h2><Link to="/quote" className="btn btn-primary mt-2">Start a new estimate</Link></div>;
  if (!data) return <div className="container page"><div className="spinner" /></div>;
  const p = data.preview;

  return (
    <div className="container page">
      <div className="preview-grid">
        <div>
          <span className="pill success">✓ Estimate #{data.id} is ready</span>
          <h1 className="h2" data-reveal>Your {p.summary.projectType.toLowerCase()} estimate</h1>
          <div className="summary-tags">
            <span>{p.summary.area.toLocaleString('en-US')} sq ft</span><span>{p.summary.floors} floor{p.summary.floors > 1 ? 's' : ''}</span><span>{p.summary.quality}</span><span>{p.summary.region}</span>
            <span>{p.summary.timeline} schedule</span>{p.summary.features.slice(0, 4).map((f) => <span key={f}>{f}</span>)}
            {p.summary.features.length > 4 && <span>+{p.summary.features.length - 4} more</span>}
          </div>

          <div className="stat-row" data-reveal>
            <div className="card stat"><small>Complexity</small><b>{p.complexity}/10</b><div className="meter"><i style={{ width: p.complexity * 10 + '%' }} /></div></div>
            <div className="card stat"><small>Estimated build time</small><b>{p.timelineWeeks.min}–{p.timelineWeeks.max} weeks</b></div>
          </div>

          <div className="card locked-block" data-reveal>
            <h3>Estimated project cost</h3>
            <div className="sample-tiers blur">
              <div><small>Budget contractor</small><b>$XXX,XXX</b></div>
              <div className="hl"><small>Mid-range builder</small><b>$XXX,XXX</b></div>
              <div><small>Premium builder</small><b>$XXX,XXX</b></div>
            </div>
            <div className="lock-overlay">🔒 Unlock to reveal your price ranges</div>
          </div>

          <div className="card locked-block" data-reveal>
            <h3>Itemized breakdown ({p.breakdownCount} line items)</h3>
            {p.breakdownLabels.map((l) => <div className="line-row" key={l}><span>{l}</span><span className="blur">$X,XXX</span></div>)}
            <div className="line-row blur"><span>Additional items hidden</span><span>$X,XXX</span></div>
          </div>

          <div className="card" data-reveal>
            <h3>Your full report also includes</h3>
            <ul className="check-list">
              <li>Phase-by-phase construction timeline</li>
              <li>Milestone payment schedule</li>
              <li>Approximate material quantities</li>
              <li>Specialists and trades you'll need</li>
              <li>Money-saving tips tailored to your project</li>
              <li>Red flags to watch for in contractor bids</li>
              <li>Questions to ask before you sign</li>
              <li>Printable / PDF-ready report</li>
            </ul>
          </div>
        </div>

        <aside className="sticky">
          <form className="card unlock-card" onSubmit={go}>
            <h3>Unlock your full estimate</h3>
            <p className="muted">Enter your email so we can save your report and send your receipt.</p>
            <input className="input" type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            {err && <p className="error">{err}</p>}
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Please wait…' : `Continue for ${trial} →`}</button>
            <PlanDisclosure compact />
            <p className="tiny muted center">🔒 Secure checkout by Dodo Payments · {days}-day access</p>
          </form>
          <div className="card mt-2"><PlanDisclosure /></div>
        </aside>
      </div>
    </div>
  );
}
