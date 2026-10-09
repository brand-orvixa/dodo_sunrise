import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useConfig } from '../config.jsx';

export default function Footer() {
  const { company } = useConfig();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo light />
            <p className="muted-light mt-2">Instant, itemized construction cost estimates so you can budget and hire contractors with confidence.</p>
          </div>
          <div>
            <h4>Product</h4>
            <Link to="/quote">Get an estimate</Link>
            <Link to="/how-it-works">How it works</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/faq">FAQ</Link>
          </div>
          <div>
            <h4>Support</h4>
            <Link to="/account">Manage membership</Link>
            <Link to="/account">Cancel membership</Link>
            <Link to="/contact">Contact us</Link>
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </div>
          <div>
            <h4>Legal</h4>
            <Link to="/terms">Terms &amp; Conditions</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/refund-policy">Refund Policy</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {company.legalName}. All rights reserved.</span>
          <span>{company.address}</span>
        </div>
      </div>
    </footer>
  );
}
