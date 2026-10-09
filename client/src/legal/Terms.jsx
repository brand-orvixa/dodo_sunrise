import { Link } from 'react-router-dom';
import LegalLayout from './LegalLayout.jsx';
import { useConfig } from '../config.jsx';

export default function Terms() {
  const { company: c, trial, recurring, days } = useConfig();
  const mail = <a href={`mailto:${c.email}`}>{c.email}</a>;
  return (
    <LegalLayout
      title="Terms & Conditions"
      intro={<p className="callout"><strong>Important:</strong> Your {days}-day trial costs {trial}. Unless you cancel before the trial ends, your membership <strong>automatically renews at {recurring} per month</strong> until you cancel. See Section 4 for details. These Terms also contain an arbitration agreement and class action waiver (Section 14).</p>}
      sections={[
        ['Agreement to these Terms', <>
          <p>These Terms &amp; Conditions ("Terms") form a binding agreement between you and {c.legalName} ("{c.name}", "we", "us" or "our") and govern your use of our website, estimating tools, reports and membership (together, the "Service").</p>
          <p>By accessing the Service, creating an estimate, or purchasing a membership, you confirm that you have read, understood and agree to these Terms, our <Link to="/privacy">Privacy Policy</Link> and our <Link to="/refund-policy">Refund Policy</Link>. If you do not agree, do not use the Service.</p>
        </>],
        ['Eligibility', <p>You must be at least 18 years old and able to form a binding contract to use the Service. If you use the Service on behalf of a business, you confirm you are authorized to bind that business to these Terms.</p>],
        ['The Service', <>
          <p>{c.name} provides automated preliminary construction cost estimates ("Estimates" or "Reports") based on the information you supply and on our proprietary models of typical regional construction rates and quantities.</p>
          <p><strong>Estimates are for budgeting only.</strong> They are not bids, valuations, engineering or structural assessments, or guarantees from {c.name} or any contractor, and actual prices may vary significantly. {c.name} does not perform construction work through this Service, and we are not responsible for any decision you make, financing you apply for, or contract you enter based on a Report. Always get detailed bids from licensed professionals.</p>
        </>],
        ['Membership, trial and automatic renewal', <>
          <p><strong>Trial.</strong> To access full Reports you must purchase a trial membership. The trial costs <strong>{trial}</strong>, charged at sign-up, and lasts <strong>{days} days</strong>.</p>
          <p><strong>Automatic renewal.</strong> Unless you cancel before your trial ends, your membership converts automatically to a paid monthly membership and you authorize us (through our payment processor) to charge <strong>{recurring} per month</strong>, plus any applicable taxes, to your payment method. The first monthly charge happens at the end of the trial, and later charges happen on the same day each month until you cancel.</p>
          <p><strong>Your consent.</strong> At checkout you explicitly agree to these recurring charges. We may send you a reminder before your trial ends where required by law.</p>
          <p><strong>Price changes.</strong> We may change membership prices for future billing periods. We will give you at least 30 days' notice by email, and you can cancel before the change takes effect.</p>
          <p><strong>Failed payments.</strong> If a charge fails, we or our payment processor may retry it. Your access may be suspended until payment succeeds.</p>
        </>],
        ['Cancellation', <>
          <p>You may cancel at any time, effective at the end of your current trial or billing period, by:</p>
          <ul>
            <li>signing in at <Link to="/account">My account</Link> and selecting "Cancel membership"; or</li>
            <li>emailing {mail} from the email address used at purchase. We process email cancellations within 24 hours.</li>
          </ul>
          <p>After cancelling you keep access until the end of the period you have paid for, and you will not be charged again. Cancelling does not by itself entitle you to a refund. Our <Link to="/refund-policy">Refund Policy</Link> applies.</p>
        </>],
        ['Payments and Merchant of Record', <p>Payments are processed by Dodo Payments, which acts as our Merchant of Record and reseller. Dodo Payments handles payment processing, sales tax/VAT collection and invoicing, and its own terms and privacy policy also apply to your payment. The charge may appear on your statement under Dodo Payments' descriptor. We never receive or store your full card details.</p>],
        ['Refunds', <p>Refunds are handled under our <Link to="/refund-policy">Refund Policy</Link>, which forms part of these Terms.</p>],
        ['Your account and information', <p>You agree to provide accurate information, keep your estimate IDs and access links confidential, and tell us promptly about any unauthorized use. You are responsible for activity carried out using your access credentials.</p>],
        ['Acceptable use', <>
          <p>You agree not to:</p>
          <ul>
            <li>scrape, copy, resell, redistribute or commercially exploit Reports or our rate data without written permission;</li>
            <li>use automated means to generate estimates in bulk or to reverse engineer our pricing models;</li>
            <li>interfere with, disrupt or try to gain unauthorized access to the Service;</li>
            <li>use the Service for any unlawful, fraudulent or misleading purpose.</li>
          </ul>
          <p>We may suspend or end access for violations, without refund where permitted by law.</p>
        </>],
        ['Intellectual property', <p>The Service, including its software, design, text, pricing models, logos and Reports, is owned by {c.legalName} or its licensors. We grant you a limited, non-exclusive, non-transferable licence to use Reports for your own internal planning, including sharing them with providers you are considering hiring.</p>],
        ['Disclaimers', <p>THE SERVICE AND ALL REPORTS ARE PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF ACCURACY, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT ANY ESTIMATE WILL MATCH ACTUAL MARKET PRICES.</p>],
        ['Limitation of liability', <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, {c.legalName.toUpperCase()} WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE OR DATA. OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE WILL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM AROSE.</p>],
        ['Indemnification', <p>You agree to indemnify and hold harmless {c.legalName} and its officers, employees and agents from any claims, losses or expenses (including reasonable legal fees) arising from your misuse of the Service or your breach of these Terms.</p>],
        ['Dispute resolution and arbitration', <>
          <p>Please contact {mail} first. Most concerns can be resolved quickly. If we cannot resolve a dispute informally within 30 days, you and we agree that it will be resolved by binding individual arbitration administered by the American Arbitration Association under its Consumer Arbitration Rules, except that either party may bring an individual claim in small claims court.</p>
          <p><strong>Class action waiver:</strong> Claims may only be brought individually, not as a plaintiff or class member in any class or representative proceeding. You may opt out of this arbitration agreement by emailing {mail} within 30 days of first accepting these Terms.</p>
          <p>Nothing in this section limits rights that cannot be waived under the consumer protection laws of your country of residence.</p>
        </>],
        ['Governing law', <p>These Terms are governed by the laws of the State of California, USA, without regard to its conflict-of-law rules, except where the law of your country of residence requires otherwise.</p>],
        ['Changes to these Terms', <p>We may update these Terms from time to time. We will post the updated version with a new "Last updated" date and, for material changes, notify active members by email. Continued use after changes take effect means you accept them.</p>],
        ['Contact', <p>{c.legalName}<br />{c.address}<br />Email: {mail}<br />Phone: {c.phone}</p>],
      ]}
    />
  );
}
