import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Reveals any element with [data-reveal] when it scrolls into view. Also picks up
// elements rendered later (after data loads) via a MutationObserver.
export function useScrollReveal() {
  const { pathname } = useLocation();
  useEffect(() => {
    const show = (el) => el.classList.add('is-visible');
    if (reduced() || !('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal]').forEach(show);
      return undefined;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    const scan = () => document.querySelectorAll('[data-reveal]:not(.is-visible):not([data-watched])').forEach((el) => {
      el.setAttribute('data-watched', '');
      io.observe(el);
    });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [pathname]);
}

// Thin gradient bar showing scroll progress + toggles header shadow.
export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        setP(h > 0 ? window.scrollY / h : 0);
        document.body.classList.toggle('scrolled', window.scrollY > 8);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);
  return <div className="scroll-progress" style={{ transform: `scaleX(${p})` }} />;
}

// Animated number that counts up once visible.
export function CountUp({ to, duration = 1400, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const [val, setVal] = useState(reduced() ? to : 0);
  useEffect(() => {
    if (reduced()) return undefined;
    const el = ref.current;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - start) / duration);
        setVal(Math.round(to * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString('en-US')}{suffix}</span>;
}
