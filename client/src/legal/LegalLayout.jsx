import useTitle from '../components/useTitle.js';

export const UPDATED = 'October 10, 2026';

export default function LegalLayout({ title, intro, sections }) {
  useTitle(title);
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <div className="container page legal">
      <h1 className="h2">{title}</h1>
      <p className="muted">Last updated: {UPDATED}</p>
      {intro}
      <nav className="toc card">
        <strong>Contents</strong>
        <ol>{sections.map(([h]) => <li key={h}><a href={`#${slug(h)}`}>{h}</a></li>)}</ol>
      </nav>
      {sections.map(([h, body], i) => (
        <section key={h} id={slug(h)}>
          <h2>{i + 1}. {h}</h2>
          {body}
        </section>
      ))}
    </div>
  );
}
