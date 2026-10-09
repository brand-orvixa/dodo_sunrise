import { Link } from 'react-router-dom';
import useTitle from '../components/useTitle.js';
import { useConfig } from '../config.jsx';
import PlanDisclosure from '../components/PlanDisclosure.jsx';

export default function Pricing() {
  useTitle('Pricing');
  const { trial, recurring, days } = useConfig();
  return (
    <div className="container page">
      <div className="section-head">
        <span className="eyebrow">Pricing</span>
        <h1 className="h2">One simple membership</h1>
        <p className="lead">Try everything for {days} days for {trial}. Then {recurring}/month. Cancel anytime.</p>
      </div>
      <div className="pricing-cards">
        <div className="card plan">
          <h3>Free preview</h3>
          <div className="price-big">$0</div>
          <ul className="check-list">
            <li>Complete the project questionnaire</li>
            <li>Complexity score</li>
            <li>Estimated build time</li>
          </ul>
          <Link to="/quote" className="btn btn-ghost btn-block">Start free</Link>
        </div>
        <div className="card plan featured">
          <span className="tier-badge">Full access</span>
          <h3>Membership</h3>
          <div className="price-big">{trial}<span> for {days} days</span></div>
          <p className="muted">then <strong>{recurring}/month</strong>, billed monthly until you cancel</p>
          <ul className="check-list">
            <li>Full itemized construction estimates</li>
            <li>Unlimited new estimates</li>
            <li>3 builder price tiers and regional rates</li>
            <li>Timelines, payment schedules and material quantities</li>
            <li>Contractor tips, red flags and questions</li>
            <li>Downloadable PDF reports</li>
          </ul>
          <Link to="/quote" className="btn btn-primary btn-block">Get my estimate</Link>
        </div>
      </div>
      <div className="narrow mt-3"><div className="card"><h3>How billing works</h3><PlanDisclosure /></div></div>
    </div>
  );
}
