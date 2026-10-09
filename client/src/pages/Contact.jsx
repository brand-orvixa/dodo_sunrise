import { useState } from 'react';
import useTitle from '../components/useTitle.js';
import { api } from '../api.js';
import { useConfig } from '../config.jsx';

export default function Contact() {
  useTitle('Contact us');
  const { company } = useConfig();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try { await api('/contact', { method: 'POST', body: form }); setSent(true); } catch (e2) { setErr(e2.message); }
  };
  return (
    <div className="container page">
      <div className="checkout-grid">
        <div>
          <h1 className="h2">Contact us</h1>
          <p className="muted">Questions about an estimate, billing or cancelling? We reply within one business day.</p>
          {sent ? <p className="notice">Thanks! Your message has been received. We'll get back to you at {form.email}.</p> : (
            <form className="card" onSubmit={submit}>
              <label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <label className="label mt-2">Email</label><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <label className="label mt-2">Message</label><textarea className="input" rows="5" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              {err && <p className="error">{err}</p>}
              <button className="btn btn-primary mt-2">Send message</button>
            </form>
          )}
        </div>
        <aside className="card">
          <h3>Support</h3>
          <p><strong>Email:</strong> <a href={`mailto:${company.email}`}>{company.email}</a></p>
          <p><strong>Phone:</strong> {company.phone}</p>
          <p><strong>Hours:</strong> Mon–Fri, 9am–6pm PT</p>
          <p><strong>Address:</strong><br />{company.legalName}<br />{company.address}</p>
        </aside>
      </div>
    </div>
  );
}
