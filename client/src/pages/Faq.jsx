import { useState } from 'react';
import { Link } from 'react-router-dom';
import useTitle from '../components/useTitle.js';
import { useConfig } from '../config.jsx';

export function useFaq() {
  const { trial, recurring, days, company } = useConfig();
  return [
    ['What is Sunrise Infratech?', `Sunrise Infratech is an online tool that estimates what your construction project should cost, whether that's a new home, extension, renovation, fit-out or commercial building. You answer a few questions and get an itemized quotation with budget, mid-range and premium builder price ranges, a trade-by-trade breakdown, a build timeline and a milestone payment schedule.`],
    ['How much does it cost?', `You can build an estimate and see a free preview. To unlock the full report you start a ${days}-day trial membership for ${trial}. If you don't cancel during the trial, your membership renews automatically at ${recurring} per month until you cancel.`],
    ['When will I be charged the monthly fee?', `The ${recurring} monthly fee is first charged ${days} days after you sign up, when your trial ends, and then every month on the same date. If you cancel before the trial ends, you will only ever pay ${trial}.`],
    ['How do I cancel?', `Go to My account, sign in with your email and estimate ID, and click "Cancel membership". It takes a few seconds and there are no cancellation fees. You can also email ${company.email} and we will cancel for you within 24 hours.`],
    ['What do I get as a member?', 'Unlimited construction estimates, saved reports in your account, printable PDF reports, and updated regional cost benchmarks.'],
    ['Are the prices exact?', 'No. Our estimates are preliminary figures based on typical regional construction rates and quantity benchmarks. They are not bids from any contractor. Final prices depend on your drawings, site investigation and contractor, but our estimates give you a solid baseline for budgeting and negotiating.'],
    ['Can I get a refund?', 'Yes, in many cases. Please see our Refund Policy for details. If you were charged a monthly renewal you didn\'t mean to keep, contact us within 7 days of the charge.'],
    ['Who processes my payment?', 'Payments are processed securely by Dodo Payments, which acts as Merchant of Record. Your card details are never stored on our servers. The charge may appear on your statement as DODO PAYMENTS or similar.'],
  ];
}

export const HOME_FAQ = [1, 2, 3, 5];

export function FaqList({ items }) {
  const all = useFaq();
  const list = items ? items.map((i) => all[i]) : all;
  const [open, setOpen] = useState(0);
  return (
    <div className="faq">
      {list.map(([q, a], i) => (
        <div key={q} className={`faq-item ${open === i ? 'open' : ''}`}>
          <button onClick={() => setOpen(open === i ? -1 : i)}>{q}<span>{open === i ? '−' : '+'}</span></button>
          {open === i && <p>{a}</p>}
        </div>
      ))}
    </div>
  );
}

export default function Faq() {
  useTitle('FAQ');
  return (
    <div className="container page narrow">
      <h1 className="h2">Frequently asked questions</h1>
      <FaqList />
      <p className="mt-3 muted">Still have questions? <Link to="/contact">Contact our support team</Link>.</p>
    </div>
  );
}
