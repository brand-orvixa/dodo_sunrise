import { useConfig } from '../config.jsx';

// The single source of truth for how billing is described to customers.
export default function PlanDisclosure({ compact = false }) {
  const { trial, recurring, days } = useConfig();
  const renewDate = new Date(Date.now() + days * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  if (compact) {
    return (
      <p className="disclosure-compact">
        {trial} today for {days}-day access, then <strong>{recurring}/month</strong> unless you cancel. Cancel anytime.
      </p>
    );
  }
  return (
    <div className="disclosure">
      <div className="disclosure-row">
        <span>Due today: {days}-day trial</span><strong>{trial}</strong>
      </div>
      <div className="disclosure-row">
        <span>Starting {renewDate}, then monthly</span><strong>{recurring}/month</strong>
      </div>
      <p>
        Your trial lasts {days} days. If you don't cancel before it ends, your membership renews automatically and you'll be
        charged <strong>{recurring} every month</strong> until you cancel. Cancel anytime in My account, with no cancellation fees.
      </p>
    </div>
  );
}
