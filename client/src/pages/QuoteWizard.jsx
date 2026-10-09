import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useTitle from '../components/useTitle.js';
import { api, store } from '../api.js';
import { useConfig } from '../config.jsx';

const TYPE_ICONS = { house: '🏠', extension: '🧱', renovation: '🛠️', kitchen_bath: '🛁', interior: '🛋️', commercial: '🏢', warehouse: '🏭' };
const QUALITY_DESC = {
  standard: 'Builder-grade materials, good value.',
  premium: 'Upgraded fixtures, stone, hardwood.',
  luxury: 'Bespoke design, top-tier materials.',
};
const STEPS = ['Project', 'Size & quality', 'Add-ons', 'Details'];
const ANALYZE = ['Measuring footprint & structure', 'Costing 12 construction trades', 'Applying regional labour & material rates', 'Adding permits, design & contingency', 'Building your estimate'];

export default function QuoteWizard() {
  useTitle('Get your estimate');
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { options } = useConfig();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(-1);
  const [form, setForm] = useState({
    projectType: params.get('type') || '', area: 2000, floors: 2, quality: 'standard', site: 'flat',
    features: [], design: true, timeline: 'standard', region: 'us', projectName: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (f) => set('features', form.features.includes(f) ? form.features.filter((x) => x !== f) : [...form.features, f]);

  useEffect(() => { if (params.get('type')) setStep(1); }, []); // eslint-disable-line

  if (!options) return <div className="container page"><div className="spinner" /></div>;

  const next = () => {
    if (step === 0 && !form.projectType) return setError('Please choose a project type.');
    if (step === 1 && (!form.area || form.area < 50)) return setError('Please enter a floor area of at least 50 sq ft.');
    setError('');
    setStep(step + 1);
  };

  const submit = async () => {
    setError('');
    setAnalyzing(0);
    const started = Date.now();
    const tick = setInterval(() => setAnalyzing((a) => Math.min(a + 1, ANALYZE.length - 1)), 800);
    try {
      const res = await api('/quotes', { method: 'POST', body: form });
      await new Promise((r) => setTimeout(r, Math.max(0, 4200 - (Date.now() - started))));
      clearInterval(tick);
      if (res.unlocked) {
        store.setReportToken(res.id, res.accessToken);
        nav(`/report/${res.id}`);
      } else nav(`/quote/${res.id}`);
    } catch (e) {
      clearInterval(tick);
      setAnalyzing(-1);
      setError(e.message);
    }
  };

  if (analyzing >= 0) {
    return (
      <div className="container page narrow center">
        <div className="analyzing card">
          <div className="sun-loader"><span /></div>
          <h2>Estimating your project…</h2>
          <ul className="analyze-list">
            {ANALYZE.map((a, i) => (
              <li key={a} className={i < analyzing ? 'done' : i === analyzing ? 'active' : ''}>
                <span className="check">{i < analyzing ? '✓' : ''}</span>{a}
              </li>
            ))}
          </ul>
          <div className="progress"><i style={{ width: `${((analyzing + 1) / ANALYZE.length) * 100}%` }} /></div>
        </div>
      </div>
    );
  }

  const showFloors = !['kitchen_bath', 'interior'].includes(form.projectType);

  return (
    <div className="container page narrow">
      <div className="stepper">
        {STEPS.map((s, i) => (
          <button key={s} className={`stepper-item ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} onClick={() => i < step && setStep(i)}>
            <span>{i < step ? '✓' : i + 1}</span>{s}
          </button>
        ))}
      </div>

      <div className="card wizard">
        <div key={step} className="step-anim">
          {step === 0 && (
            <>
              <h2>What are you building?</h2>
              <div className="choice-grid">
                {options.projectTypes.map((t) => (
                  <button key={t.value} className={`choice ${form.projectType === t.value ? 'selected' : ''}`} onClick={() => { set('projectType', t.value); setError(''); }}>
                    <span className="choice-icon">{TYPE_ICONS[t.value]}</span>{t.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2>How big is it, and what finish level?</h2>
              <div className="form-grid">
                <div className={showFloors ? '' : 'full'}>
                  <label className="label">Total floor area (sq ft)</label>
                  <input className="input" type="number" min="50" step="50" value={form.area} onChange={(e) => set('area', +e.target.value)} />
                  <input type="range" min="100" max="20000" step="50" value={Math.min(form.area, 20000)} onChange={(e) => set('area', +e.target.value)} className="range mt-1" />
                  <div className="range-labels"><span>100</span><span>10,000</span><span>20,000+</span></div>
                </div>
                {showFloors && (
                  <div>
                    <label className="label">Number of floors</label>
                    <div className="stepper-input">
                      <button type="button" onClick={() => set('floors', Math.max(1, form.floors - 1))}>−</button>
                      <span>{form.floors}</span>
                      <button type="button" onClick={() => set('floors', Math.min(40, form.floors + 1))}>+</button>
                    </div>
                  </div>
                )}
              </div>
              <label className="label mt-3">Finish quality</label>
              <div className="choice-grid three">
                {options.qualities.map((d) => (
                  <button key={d.value} className={`choice tall ${form.quality === d.value ? 'selected' : ''}`} onClick={() => set('quality', d.value)}>
                    <strong>{d.label}</strong><small>{QUALITY_DESC[d.value]}</small>
                  </button>
                ))}
              </div>
              <label className="label mt-3">Site conditions</label>
              <div className="choice-grid three">
                {options.sites.map((d) => (
                  <button key={d.value} className={`choice ${form.site === d.value ? 'selected' : ''}`} onClick={() => set('site', d.value)}>{d.label}</button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2>Any add-ons or extras?</h2>
              <p className="muted">Select all that apply, or skip if none.</p>
              <div className="chips">
                {options.features.map((f) => (
                  <button key={f.value} className={`chip ${form.features.includes(f.value) ? 'on' : ''}`} onClick={() => toggle(f.value)}>
                    {form.features.includes(f.value) ? '✓ ' : '+ '}{f.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2>A few final details</h2>
              <div className="form-grid">
                <div>
                  <label className="label">Project location</label>
                  <select className="input" value={form.region} onChange={(e) => set('region', e.target.value)}>
                    {options.regions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Schedule</label>
                  <select className="input" value={form.timeline} onChange={(e) => set('timeline', e.target.value)}>
                    {options.timelines.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="full">
                  <label className="label">Project name or address (optional)</label>
                  <input className="input" value={form.projectName} maxLength={120} onChange={(e) => set('projectName', e.target.value)} placeholder="e.g. Oak Street Residence" />
                </div>
                <label className="checkbox full">
                  <input type="checkbox" checked={form.design} onChange={(e) => set('design', e.target.checked)} />
                  <span>Include architectural &amp; engineering design fees (uncheck if you already have approved drawings)</span>
                </label>
              </div>
            </>
          )}
        </div>

        {error && <p className="error">{error}</p>}

        <div className="wizard-nav">
          {step > 0 ? <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>← Back</button> : <span />}
          {step < STEPS.length - 1
            ? <button className="btn btn-primary" onClick={next}>Continue →</button>
            : <button className="btn btn-primary" onClick={submit}>Calculate my estimate →</button>}
        </div>
      </div>
    </div>
  );
}
