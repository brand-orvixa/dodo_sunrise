import { Routes, Route, useLocation } from 'react-router-dom';
import { useScrollReveal, ScrollProgress } from './components/motion.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import QuoteWizard from './pages/QuoteWizard.jsx';
import Preview from './pages/Preview.jsx';
import Checkout from './pages/Checkout.jsx';
import DemoCheckout from './pages/DemoCheckout.jsx';
import Success from './pages/Success.jsx';
import Report from './pages/Report.jsx';
import Account from './pages/Account.jsx';
import Pricing from './pages/Pricing.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Faq from './pages/Faq.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';
import Privacy from './legal/Privacy.jsx';
import Terms from './legal/Terms.jsx';
import Refund from './legal/Refund.jsx';

export default function App() {
  const location = useLocation();
  useScrollReveal();
  return (
    <div className="app">
      <ScrollProgress />
      <Header />
      <main key={location.pathname} className="page-transition">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/quote" element={<QuoteWizard />} />
          <Route path="/quote/:id" element={<Preview />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/demo-checkout" element={<DemoCheckout />} />
          <Route path="/success" element={<Success />} />
          <Route path="/report/:id" element={<Report />} />
          <Route path="/account" element={<Account />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund-policy" element={<Refund />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
