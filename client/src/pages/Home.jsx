import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useTitle from '../components/useTitle.js';
import { useConfig } from '../config.jsx';
import PlanDisclosure from '../components/PlanDisclosure.jsx';
import { CountUp } from '../components/motion.jsx';
import { FaqList, HOME_FAQ } from './Faq.jsx';

const TYPES = [
  ['house', 'New home construction'], ['extension', 'Home extension / addition'], ['renovation', 'Full home renovation'],
  ['kitchen_bath', 'Kitchen & bathroom remodel'], ['interior', 'Interior fit-out'], ['commercial', 'Commercial building'], ['warehouse', 'Warehouse / industrial'],
];

export default function Home() {
  useTitle();
  const nav = useNavigate();
  const { trial, recurring, days } = useConfig();
  const [type, setType] = useState('house');

  return (
    <>
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-grid-bg" />
        <div className="container hero-grid">
          <div>
            <span className="pill anim-in" style={{ '--d': '0ms' }}>🏗️ 12 trades · 7 project types · 6 regions</span>
            <h1 className="anim-in" style={{ '--d': '80ms' }}>
              Know what your <span className="grad-text grad-animate">construction project</span> should cost before you hire a contractor.
            </h1>
            <p className="lead anim-in" style={{ '--d': '160ms' }}>
              Answer 4 quick questions and get an itemized construction estimate. It covers every trade and soft cost, budget to premium
              builder price ranges, a build timeline and a milestone payment schedule.
            </p>
            <form className="hero-search anim-in" style={{ '--d': '240ms' }} onSubmit={(e) => { e.preventDefault(); nav(`/quote?type=${type}`); }}>
              <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Project type">
                {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <button className="btn btn-primary">Get my estimate →</button>
            </form>
            <p className="hero-note anim-in" style={{ '--d': '320ms' }}>Free preview · Full report {trial} for {days}-day access, then {recurring}/mo · Cancel anytime</p>
          </div>
          <SampleCard />
        </div>
      </section>

      <section className="strip">
        <div className="container strip-inner">
          <div data-reveal><strong><CountUp to={2} /> min</strong><span>to complete</span></div>
          <div data-reveal style={{ '--d': '100ms' }}><strong><CountUp to={12} /></strong><span>trades costed</span></div>
          <div data-reveal style={{ '--d': '200ms' }}><strong><CountUp to={3} /></strong><span>builder price tiers</span></div>
          <div data-reveal style={{ '--d': '300ms' }}><strong><CountUp to={6} /></strong><span>regional benchmarks</span></div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="container">
          <div className="section-head" data-reveal>
            <span className="eyebrow">How it works</span>
            <h2>From plans to a fair price in three steps</h2>
          </div>
          <div className="steps">
            {[
              ['1', 'Describe your project', 'Choose the build type, floor area, floors, finish quality, site conditions and add-ons.'],
              ['2', 'We cost every trade', 'Our engine prices foundation, structure, MEP, finishes and soft costs against regional rates.'],
              ['3', 'Get your full estimate', 'Unlock the itemized breakdown, timeline, payment schedule and contractor checklist.'],
            ].map(([n, t, d], i) => (
              <div className="step card hover-lift" key={n} data-reveal style={{ '--d': `${i * 120}ms` }}>
                <span className="step-n">{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-head" data-reveal>
            <span className="eyebrow">What's in your estimate</span>
            <h2>Everything you need to budget, compare bids and negotiate</h2>
          </div>
          <div className="features">
            {[
              ['💰', 'Three builder price tiers', 'Budget contractor, mid-range and premium builder ranges, plus cost per sq ft.'],
              ['🧱', 'Trade-by-trade breakdown', 'Site prep, foundation, structure, roofing, MEP, finishes and every add-on.'],
              ['📅', 'Realistic build timeline', 'Phase-by-phase schedule from design and permits to handover.'],
              ['💳', 'Milestone payment plan', 'How much to pay at each stage so you never pay too far ahead.'],
              ['📦', 'Material quantities', 'Approximate concrete, steel, roofing, drywall and flooring quantities.'],
              ['🛡️', 'Contractor checklist', 'Red flags, money-saving tips and questions to ask before you sign.'],
            ].map(([i, t, d], idx) => (
              <div className="feature card hover-lift" key={t} data-reveal="zoom" style={{ '--d': `${(idx % 3) * 100}ms` }}>
                <span className="feature-icon">{i}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div data-reveal="left">
            <span className="eyebrow">Built for</span>
            <h2>Homeowners, developers and small businesses</h2>
            <ul className="check-list big">
              <li>Planning a new home or extension and setting a realistic budget</li>
              <li>Checking whether a contractor's bid is fair before signing</li>
              <li>Preparing a loan or financing application with a credible cost plan</li>
              <li>Comparing finish levels: standard vs premium vs luxury</li>
            </ul>
          </div>
          <div className="build-visual" data-reveal="right">
            <BuildingIllustration />
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container pricing-teaser">
          <div data-reveal="left">
            <span className="eyebrow">Simple pricing</span>
            <h2>Try it for {trial}</h2>
            <p className="lead">
              Get {days} days of unlimited construction estimates for {trial}. After that, membership is {recurring}/month for unlimited
              estimates, saved reports and updated cost data. Cancel anytime.
            </p>
            <Link to="/pricing" className="link-arrow">See full pricing details →</Link>
          </div>
          <div className="card price-card" data-reveal="right">
            <div className="price-big">{trial}<span> / {days} days</span></div>
            <PlanDisclosure />
            <Link to="/quote" className="btn btn-primary btn-block">Start my estimate</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <div className="section-head" data-reveal><span className="eyebrow">FAQ</span><h2>Common questions</h2></div>
          <div data-reveal><FaqList items={HOME_FAQ} /></div>
          <p className="center mt-3"><Link to="/faq" className="link-arrow">View all FAQs →</Link></p>
        </div>
      </section>

      <section className="cta-band">
        <div className="container center" data-reveal>
          <h2>Stop guessing. Know your build cost today.</h2>
          <Link to="/quote" className="btn btn-light">Get my estimate →</Link>
        </div>
      </section>
    </>
  );
}

function SampleCard() {
  return (
    <div className="sample float anim-in" style={{ '--d': '200ms' }}>
      <div className="sample-head">
        <span className="dot r" /><span className="dot y" /><span className="dot g" />
        <span className="sample-title">Estimate #Q8F21A · New home, 2,400 sq ft</span>
      </div>
      <div className="sample-body">
        <div className="sample-tiers">
          <div><small>Budget</small><b>$412k</b></div>
          <div className="hl"><small>Mid-range</small><b>$498k</b></div>
          <div><small>Premium</small><b>$655k</b></div>
        </div>
        {[['Foundation & concrete', 58], ['Structure & framing', 88], ['Plumbing & electrical', 70], ['Kitchen & bathrooms', 46], ['Contingency (10%)', 34]].map(([l, w], i) => (
          <div className="sample-line" key={l}>
            <span>{l}</span>
            <div className="bar"><i className="grow" style={{ width: w + '%', '--d': `${600 + i * 120}ms` }} /></div>
          </div>
        ))}
        <div className="sample-foot"><span>⏱ 28–40 weeks</span><span>Complexity 7/10</span></div>
      </div>
    </div>
  );
}

function BuildingIllustration() {
  return (
    <svg viewBox="0 0 400 300" className="build-svg" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff1e6" /><stop offset="1" stopColor="#ffe0cf" /></linearGradient>
        <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffb347" /><stop offset=".55" stopColor="#ff6a3d" /><stop offset="1" stopColor="#e8366f" /></linearGradient>
      </defs>
      <rect width="400" height="300" rx="24" fill="url(#sky)" />
      <circle className="sun-rise" cx="250" cy="170" r="60" fill="url(#sun)" opacity=".9" />
      <g className="crane">
        <rect x="300" y="40" width="6" height="200" fill="#141a3a" />
        <rect x="200" y="40" width="160" height="6" fill="#141a3a" />
        <line className="crane-cable" x1="225" y1="46" x2="225" y2="110" stroke="#141a3a" strokeWidth="2" />
        <rect className="crane-load" x="213" y="110" width="24" height="12" fill="#ff6a3d" />
      </g>
      <g fill="#141a3a">
        <rect className="bld b1" x="40" y="150" width="70" height="110" />
        <rect className="bld b2" x="120" y="100" width="80" height="160" />
        <rect className="bld b3" x="210" y="170" width="60" height="90" />
      </g>
      <g fill="#ffb347" opacity=".85">
        {[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} className="win" x={132 + c * 22} y={115 + r * 34} width="12" height="16" style={{ '--d': `${(r * 3 + c) * 90}ms` }} />))}
        {[0, 1, 2].map((r) => [0, 1].map((c) => <rect key={`a${r}${c}`} className="win" x={55 + c * 26} y={165 + r * 30} width="12" height="14" style={{ '--d': `${(r * 2 + c) * 110}ms` }} />))}
      </g>
      <rect x="20" y="258" width="360" height="6" rx="3" fill="url(#sun)" />
    </svg>
  );
}
