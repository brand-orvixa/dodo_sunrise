import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <Link to="/" onClick={close} aria-label="Sunrise Infratech home"><Logo /></Link>
          <nav className={`nav ${open ? 'open' : ''}`}>
            <NavLink to="/how-it-works" onClick={close}>How it works</NavLink>
            <NavLink to="/pricing" onClick={close}>Pricing</NavLink>
            <NavLink to="/faq" onClick={close}>FAQ</NavLink>
            <NavLink to="/account" onClick={close}>My account</NavLink>
            <Link to="/quote" className="btn btn-primary btn-sm" onClick={close}>Get my estimate</Link>
          </nav>
          <button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}>
            <span /><span /><span />
          </button>
        </div>
      </header>
    </>
  );
}
