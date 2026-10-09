export default function Logo({ size = 38, light = false, wordmark = true }) {
  return (
    <span className="logo" style={{ color: light ? '#fff' : 'var(--ink)' }}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="logo-mark">
        <defs>
          <linearGradient id="si-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffb347" />
            <stop offset=".5" stopColor="#ff6a3d" />
            <stop offset="1" stopColor="#e8366f" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="#141a3a" />
        <g className="logo-sun">
          <circle cx="34" cy="34" r="15" fill="url(#si-g)" />
          <g stroke="url(#si-g)" strokeWidth="3" strokeLinecap="round"><path d="M34 9v5M17 17l3.5 3.5M51 17l-3.5 3.5" /></g>
        </g>
        <path d="M10 52V36h9v16zM22 52V26h11v26zM36 52V32h9v20zM47 52V40h7v12z" fill="#fff" />
        <g fill="#141a3a">
          <rect x="25" y="30" width="2" height="2" /><rect x="29" y="30" width="2" height="2" />
          <rect x="25" y="35" width="2" height="2" /><rect x="29" y="35" width="2" height="2" />
          <rect x="25" y="40" width="2" height="2" /><rect x="29" y="40" width="2" height="2" />
          <rect x="39" y="36" width="2" height="2" /><rect x="39" y="41" width="2" height="2" />
          <rect x="13" y="40" width="2" height="2" />
        </g>
        <rect x="8" y="52" width="48" height="3" rx="1.5" fill="url(#si-g)" />
      </svg>
      {wordmark && (
        <span className="logo-text">
          <span className="logo-name">Sunrise <span className="grad-text">Infratech</span></span>
          <span className="logo-tag">Construction cost estimates</span>
        </span>
      )}
    </span>
  );
}
