import LegalLayout from './LegalLayout.jsx';
import { useConfig } from '../config.jsx';

export default function Privacy() {
  const { company: c } = useConfig();
  const mail = <a href={`mailto:${c.email}`}>{c.email}</a>;
  return (
    <LegalLayout
      title="Privacy Policy"
      intro={<p>This Privacy Policy explains how {c.legalName} ("{c.name}", "we", "us") collects, uses, shares and protects your personal information when you use our website and services (the "Service"). We do not sell your personal information.</p>}
      sections={[
        ['Information we collect', <>
          <p><strong>Information you give us:</strong></p>
          <ul>
            <li>Contact details such as your name and email address;</li>
            <li>Project details you enter in the estimate questionnaire (project type, floor area, floors, finish level, add-ons, location, project name or address);</li>
            <li>Billing details such as country and postal code. Card numbers are collected directly by our payment processor, Dodo Payments, and are never stored by us;</li>
            <li>Messages you send to our support team.</li>
          </ul>
          <p><strong>Information collected automatically:</strong> IP address, browser and device type, pages viewed, referring URLs, and timestamps, collected through server logs, cookies and similar technologies.</p>
          <p><strong>Information from third parties:</strong> Payment status, subscription status and transaction identifiers from Dodo Payments.</p>
        </>],
        ['How we use your information', <ul>
          <li>To generate, save and deliver your estimate Reports;</li>
          <li>To process payments, manage your trial and membership, and send receipts and billing notices (including trial-ending reminders);</li>
          <li>To provide customer support and handle cancellation and refund requests;</li>
          <li>To secure the Service and prevent fraud, abuse and chargeback misuse;</li>
          <li>To analyse usage and improve our pricing models (using aggregated or de-identified data);</li>
          <li>To send product updates or marketing, which you can opt out of at any time;</li>
          <li>To comply with legal obligations.</li>
        </ul>],
        ['Legal bases (EEA/UK users)', <p>We process personal data to perform our contract with you (delivering Reports and membership), for our legitimate interests (security, improvement, fraud prevention), with your consent (marketing and non-essential cookies), and to comply with legal obligations.</p>],
        ['Cookies and local storage', <p>We use essential local storage to keep you signed in and remember your Report access on your device. We may use analytics cookies to understand how the Service is used. You can control cookies through your browser settings. Blocking essential storage may stop parts of the Service from working.</p>],
        ['How we share information', <>
          <p>We share personal information only with:</p>
          <ul>
            <li><strong>Dodo Payments</strong>, our Merchant of Record, to process payments, taxes and subscriptions;</li>
            <li><strong>Service providers</strong> such as hosting, email delivery, analytics and customer support tools, under contracts that limit their use of your data;</li>
            <li><strong>Authorities</strong> when required by law or to protect our rights, users or the public;</li>
            <li><strong>A successor entity</strong> in a merger, acquisition or sale of assets.</li>
          </ul>
          <p>We do not sell or rent your personal information, and we do not share it for cross-context behavioural advertising.</p>
        </>],
        ['Data retention', <p>We keep account, Report and transaction records for as long as your membership is active and afterwards as needed for tax, accounting and legal purposes (generally up to 7 years for transaction records). Estimate data not linked to a purchase is deleted or anonymised after 24 months.</p>],
        ['Security', <p>We use HTTPS encryption in transit, access controls and secure infrastructure to protect your information. No method of transmission or storage is completely secure, but we work to protect your data and will notify you of any breach where required by law.</p>],
        ['Your rights', <>
          <p>Depending on where you live (including under the GDPR, UK GDPR and California CCPA/CPRA), you may have the right to:</p>
          <ul>
            <li>access the personal information we hold about you;</li>
            <li>correct inaccurate information;</li>
            <li>delete your information;</li>
            <li>receive a portable copy of your data;</li>
            <li>object to or restrict certain processing, and withdraw consent;</li>
            <li>opt out of marketing communications;</li>
            <li>not be discriminated against for exercising your rights.</li>
          </ul>
          <p>To exercise these rights, email {mail}. We will verify your request and respond within 30 days (45 days for California requests). You may also complain to your local data protection authority.</p>
        </>],
        ['International transfers', <p>We are based in the United States and may process your data there or in other countries. Where required, we use appropriate safeguards such as Standard Contractual Clauses for transfers from the EEA/UK.</p>],
        ["Children's privacy", <p>The Service is not intended for anyone under 18, and we do not knowingly collect personal information from children. If you believe a child has given us information, contact us and we will delete it.</p>],
        ['Changes to this policy', <p>We may update this Privacy Policy from time to time. We will post changes on this page with a new "Last updated" date and notify you of material changes by email.</p>],
        ['Contact us', <p>{c.legalName}<br />{c.address}<br />Email: {mail}<br />Phone: {c.phone}</p>],
      ]}
    />
  );
}
