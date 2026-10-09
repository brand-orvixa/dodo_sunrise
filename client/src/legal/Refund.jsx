import { Link } from 'react-router-dom';
import LegalLayout from './LegalLayout.jsx';
import { useConfig } from '../config.jsx';

export default function Refund() {
  const { company: c, trial, recurring, days } = useConfig();
  const mail = <a href={`mailto:${c.email}`}>{c.email}</a>;
  return (
    <LegalLayout
      title="Refund Policy"
      intro={<p>We want you to be happy with {c.name}. This Refund Policy explains how trials, cancellations and refunds work. It forms part of our <Link to="/terms">Terms &amp; Conditions</Link>.</p>}
      sections={[
        ['Trial membership', <>
          <p>Your trial costs <strong>{trial}</strong> and gives you full access for <strong>{days} days</strong>. Unless you cancel before the trial ends, your membership renews automatically at <strong>{recurring} per month</strong>.</p>
          <p>Because the trial fee gives you immediate access to digital Reports, the {trial} trial fee is generally non-refundable. If you were charged in error or could not access your Report because of a technical problem on our side, contact us and we will refund it.</p>
        </>],
        ['Monthly membership charges', <>
          <p>If you were charged a monthly renewal fee of {recurring} and you did not mean to continue your membership, contact us within <strong>7 days</strong> of the charge. If you have not created or viewed any Reports since the charge, we will cancel your membership and refund that charge in full.</p>
          <p>Requests made more than 7 days after a renewal charge, or after the membership was used during that billing period, are generally not refundable. We may still make exceptions at our discretion.</p>
        </>],
        ['How to cancel', <>
          <p>You can cancel anytime so you are not charged again:</p>
          <ul>
            <li>Online: <Link to="/account">My account</Link> → "Cancel membership" (immediate confirmation)</li>
            <li>By email: {mail} (processed within 24 hours)</li>
          </ul>
          <p>When you cancel, you keep access until the end of your current trial or billing period and will not be billed again.</p>
        </>],
        ['How to request a refund', <>
          <p>Email {mail} with:</p>
          <ul>
            <li>the email address used at purchase;</li>
            <li>your estimate ID or the transaction ID from your receipt; and</li>
            <li>a short description of your request.</li>
          </ul>
          <p>We respond within 1 business day.</p>
        </>],
        ['Processing refunds', <p>Approved refunds are issued to your original payment method through our Merchant of Record, Dodo Payments. Refunds usually appear within 5–10 business days, depending on your bank or card issuer. Refunded memberships are cancelled immediately and Report access ends.</p>],
        ['Chargebacks', <p>If you have a billing concern, please contact us first. We can usually fix it faster than a bank dispute. Filing a chargeback may lead to your membership being suspended while the dispute is reviewed.</p>],
        ['Statutory rights', <p>Nothing in this policy affects rights you have under applicable consumer protection laws. If you are in the EU or UK, you agree at checkout that the digital service starts immediately during the withdrawal period, and you acknowledge that your right of withdrawal ends once the Report has been fully provided. This does not limit refunds available under this policy.</p>],
        ['Contact', <p>{c.legalName}<br />{c.address}<br />Email: {mail}<br />Phone: {c.phone}</p>],
      ]}
    />
  );
}
