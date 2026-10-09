import { createContext, useContext, useEffect, useState } from 'react';
import { api, money } from './api.js';

const defaults = {
  plan: { trialPrice: 1, trialDays: 7, recurringPrice: 29, interval: 'month', currency: 'USD' },
  company: {
    name: 'Sunrise Infratech', legalName: 'Sunrise Infratech LLC', email: 'support@sunriseinfratech.com',
    address: '123 Market Street, Suite 400, San Francisco, CA 94105, USA', phone: '+1 (555) 010-2026',
  },
  demoMode: true,
  options: null,
};

const Ctx = createContext(defaults);

export function ConfigProvider({ children }) {
  const [cfg, setCfg] = useState(defaults);
  useEffect(() => { api('/config').then((c) => setCfg({ ...defaults, ...c })).catch(() => {}); }, []);
  return <Ctx.Provider value={cfg}>{children}</Ctx.Provider>;
}

export function useConfig() {
  const cfg = useContext(Ctx);
  const p = cfg.plan;
  return {
    ...cfg,
    trial: money(p.trialPrice, p.currency),
    recurring: money(p.recurringPrice, p.currency),
    days: p.trialDays,
  };
}
