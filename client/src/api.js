const MEMBER_KEY = 'sq_member_token';
const REPORT_KEY = 'sq_report_tokens';

const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };

export const store = {
  memberToken: () => safe(() => localStorage.getItem(MEMBER_KEY), null),
  setMemberToken: (t) => safe(() => t && localStorage.setItem(MEMBER_KEY, t)),
  clearMember: () => safe(() => localStorage.removeItem(MEMBER_KEY)),
  reportToken: (id) => safe(() => JSON.parse(localStorage.getItem(REPORT_KEY) || '{}')[id], null),
  setReportToken: (id, t) => safe(() => {
    const all = JSON.parse(localStorage.getItem(REPORT_KEY) || '{}');
    all[id] = t;
    localStorage.setItem(REPORT_KEY, JSON.stringify(all));
  }),
};

export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const mt = store.memberToken();
  if (mt) headers['x-member-token'] = mt;
  const res = await fetch('/api' + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong. Please try again.');
    err.status = res.status;
    err.code = data.error;
    throw err;
  }
  return data;
}

export const money = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-');
