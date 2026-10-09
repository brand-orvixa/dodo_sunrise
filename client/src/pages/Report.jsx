import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useTitle from '../components/useTitle.js';
import { api, store, money, fmtDate } from '../api.js';

export default function Report() {
  useTitle('Your construction estimate');
  const { id } = useParams();
  const nav = useNavigate();
  const [r, setR] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('token');
    if (fromUrl) { store.setReportToken(id, fromUrl); window.history.replaceState(null, '', `/report/${id}`); }
    const t = store.reportToken(id);
    if (!t) { nav(`/quote/${id}`, { replace: true }); return; }
    api(`/quotes/${id}/report?token=${encodeURIComponent(t)}`).then(setR).catch((e) => {
      if (e.status === 403) nav(`/quote/${id}`, { replace: true });
      else setErr(e.status === 402 ? 'Your membership has ended. Reactivate to view this report.' : e.message);
    });
  }, [id, nav]);

  if (err) return <div className="container page center"><h2>{err}</h2><Link to={`/checkout/${id}`} className="btn btn-primary mt-2">Reactivate membership</Link></div>;
  if (!r) return <div className="container page"><div className="spinner" /></div>;
  const q = r.quote;
  const s = q.summary;
  const range = (x) => `${money(x.low)} – ${money(x.high)}`;
  const maxCost = Math.max(...q.breakdown.map((b) => b.cost));
  const groups = [...new Set(q.breakdown.map((b) => b.group))];

  return (
    <div className="container page report">
      <div className="report-head" data-reveal>
        <div>
          <span className="pill success">Full report · Estimate #{r.id}</span>
          <h1 className="h2">{r.projectName ? `${r.projectName}: ` : ''}{s.projectType}</h1>
          <p className="muted">
            Generated {fmtDate(r.createdAt)} · {s.area.toLocaleString('en-US')} sq ft · {s.floors} floor{s.floors > 1 ? 's' : ''} · {s.quality} · {s.site} · {s.region}
          </p>
        </div>
        <div className="no-print report-actions">
          <button className="btn btn-ghost" onClick={() => window.print()}>⬇ Download PDF</button>
          <Link to="/quote" className="btn btn-primary">New estimate</Link>
        </div>
      </div>

      <section className="tiers">
        {Object.entries(q.tiers).map(([k, t], i) => (
          <div key={k} className={`card tier hover-lift ${k === 'mid' ? 'featured' : ''}`} data-reveal style={{ '--d': `${i * 100}ms` }}>
            {k === 'mid' && <span className="tier-badge">Most common</span>}
            <small>{t.label}</small>
            <b>{range(t)}</b>
            <span className="muted tiny">≈ {money(t.perSqft)} per sq ft</span>
          </div>
        ))}
      </section>

      <div className="report-grid">
        <section className="card" data-reveal>
          <h3>Cost breakdown <span className="muted tiny">(mid-range builder)</span></h3>
          {groups.map((g) => (
            <div key={g}>
              <div className="bd-group">{g}</div>
              {q.breakdown.filter((b) => b.group === g).map((b, i) => (
                <div className="bd-row" key={b.label}>
                  <span>{b.label}</span>
                  <div className="bar"><i className="grow" style={{ width: (b.cost / maxCost) * 100 + '%', '--d': `${i * 60}ms` }} /></div>
                  <strong>{money(b.cost)}</strong>
                </div>
              ))}
            </div>
          ))}
          <div className="line-row total"><span>Estimated total</span><strong>{money(q.total)}</strong></div>
        </section>

        <div className="stack">
          <section className="card" data-reveal="right">
            <h3>At a glance</h3>
            <div className="glance"><span>Complexity</span><b>{q.complexity}/10</b></div>
            <div className="meter"><i className="grow" style={{ width: q.complexity * 10 + '%' }} /></div>
            <div className="glance mt-2"><span>Build time</span><b>{q.timelineWeeks.min}–{q.timelineWeeks.max} weeks</b></div>
            <div className="glance"><span>Cost per sq ft</span><b>{money(q.tiers.mid.perSqft)}</b></div>
            <div className="glance"><span>Design fees</span><b>{s.design ? 'Included' : 'Excluded'}</b></div>
          </section>
          <section className="card" data-reveal="right" style={{ '--d': '100ms' }}>
            <h3>Construction phases</h3>
            <ol className="phases">{q.phases.map((p) => <li key={p.name}><span>{p.name}</span><b>{p.weeks} wk</b></li>)}</ol>
          </section>
        </div>
      </div>

      <div className="report-grid">
        <section className="card" data-reveal>
          <h3>Milestone payment schedule</h3>
          <p className="muted tiny">Based on the low end of the mid-range estimate. Pay only after each stage is complete and inspected.</p>
          {q.paymentSchedule.map((p) => (
            <div className="line-row" key={p.stage}><span><b className="pct">{p.pct}%</b> {p.stage}</span><span>{money(p.amount)}</span></div>
          ))}
        </section>
        <section className="card" data-reveal style={{ '--d': '100ms' }}>
          <h3>Approximate materials</h3>
          {q.materials.map((m) => <div className="line-row" key={m.label}><span>{m.label}</span><strong>{m.qty}</strong></div>)}
          <h3 className="mt-3">Specialists you'll need</h3>
          <div className="chips static">{q.trades.map((t) => <span className="chip on" key={t}>{t}</span>)}</div>
          {s.features.length > 0 && (<><h3 className="mt-3">Included add-ons</h3><div className="chips static">{s.features.map((f) => <span className="chip" key={f}>{f}</span>)}</div></>)}
        </section>
      </div>

      <div className="report-grid three">
        <section className="card" data-reveal><h3>💡 Money-saving tips</h3><ul className="check-list">{q.tips.map((t) => <li key={t}>{t}</li>)}</ul></section>
        <section className="card" data-reveal style={{ '--d': '100ms' }}><h3>🚩 Red flags</h3><ul className="flag-list">{q.redFlags.map((t) => <li key={t}>{t}</li>)}</ul></section>
        <section className="card" data-reveal style={{ '--d': '200ms' }}><h3>❓ Questions to ask contractors</h3><ol className="q-list">{q.questions.map((t) => <li key={t}>{t}</li>)}</ol></section>
      </div>

      <p className="tiny muted mt-3">
        This is an independent preliminary estimate based on typical regional construction rates and quantity benchmarks. It is not a bid,
        valuation or engineering assessment. Actual costs depend on final drawings, site investigation, contractor and market conditions.
        Always get detailed bids from licensed contractors.
      </p>
    </div>
  );
}
