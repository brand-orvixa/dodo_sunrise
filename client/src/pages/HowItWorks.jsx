import { Link } from 'react-router-dom';
import useTitle from '../components/useTitle.js';
import { useConfig } from '../config.jsx';

export default function HowItWorks() {
  useTitle('How it works');
  const { trial, recurring, days } = useConfig();
  const steps = [
    ['Tell us about your project', 'Choose your build type, floor area, number of floors, finish quality, site conditions, add-ons and location. It takes about two minutes.'],
    ['Our engine costs every trade', 'Your project is split into trades (site prep, foundation, structure, roofing, plumbing, electrical, HVAC, finishes and more), each priced per sq ft against regional labour and material rates. We then add your extras, design fees, permits, contractor overhead and a 10% contingency, and give you budget, mid-range and premium builder ranges.'],
    ['Preview your results for free', 'See your project complexity and estimated build time right away, before you pay anything.'],
    [`Unlock the full report for ${trial}`, `Your ${trial} payment starts a ${days}-day trial membership. If you keep your membership after the trial, it's ${recurring}/month for unlimited estimates. Cancel anytime from My account.`],
    ['Brief and negotiate with confidence', 'Use your itemized estimate to set a budget, compare contractor bids line by line, plan milestone payments, and spot bids that are too high or suspiciously low.'],
  ];
  return (
    <div className="container page narrow">
      <h1 className="h2">How Sunrise Infratech works</h1>
      <ol className="timeline">
        {steps.map(([t, d], i) => <li key={t}><span>{i + 1}</span><div><h3>{t}</h3><p>{d}</p></div></li>)}
      </ol>
      <Link to="/quote" className="btn btn-primary btn-lg mt-2">Get my estimate →</Link>
    </div>
  );
}
