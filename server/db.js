// Tiny JSON-file store. Swap for Postgres/Mongo in production at scale.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const file = path.join(dir, 'db.json');

let state = { quotes: {}, members: {}, events: [] };
if (fs.existsSync(file)) {
  try { state = { ...state, ...JSON.parse(fs.readFileSync(file, 'utf8')) }; } catch { /* start fresh */ }
}

let pending = null;
function persist() {
  if (pending) return;
  pending = setTimeout(() => {
    pending = null;
    fs.mkdirSync(dir, { recursive: true });
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
    fs.renameSync(tmp, file);
  }, 50);
}

export const db = {
  getQuote: (id) => state.quotes[id] || null,
  saveQuote(q) { state.quotes[q.id] = q; persist(); return q; },
  allMembers: () => Object.values(state.members),
  getMember: (email) => state.members[email?.toLowerCase()] || null,
  findMemberByToken: (token) => Object.values(state.members).find((m) => m.token === token) || null,
  findMemberBySubscription: (subId) => Object.values(state.members).find((m) => m.subscriptionId === subId) || null,
  saveMember(m) { state.members[m.email.toLowerCase()] = m; persist(); return m; },
  logEvent(e) {
    state.events.push({ ...e, at: new Date().toISOString() });
    if (state.events.length > 500) state.events.shift();
    persist();
  },
  seenEvent: (id) => state.events.some((e) => e.webhookId === id),
};
