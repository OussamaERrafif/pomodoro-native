// pomodoro-ui.jsx — shared UI primitives: blob timer, ring, buttons, chart, icons

// ─────────────────────────────────────────────────────────────
// Icons (stroked, 1.6 weight, rounded — matching SF Symbols / Lucide vibe)
// ─────────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, color = 'currentColor', stroke = 1.7, fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);
const I = {
  play: (p) => <Icon {...p} d={<path d="M7 5v14l12-7z" fill="currentColor" stroke="none" />} />,
  pause: (p) => <Icon {...p} d={<g><rect x="6.5" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none" /></g>} />,
  reset: (p) => <Icon {...p} d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />,
  skip: (p) => <Icon {...p} d={<g><path d="M5 5l9 7-9 7z" fill="currentColor" stroke="none" /><rect x="15" y="5" width="2.5" height="14" rx="1" fill="currentColor" stroke="none" /></g>} />,
  plus: (p) => <Icon {...p} d="M12 5v14M5 12h14" />,
  check: (p) => <Icon {...p} d="M5 12.5l4.5 4.5L19 7" />,
  x: (p) => <Icon {...p} d="M6 6l12 12M18 6L6 18" />,
  chev: (p) => <Icon {...p} d="M9 6l6 6-6 6" />,
  chevL: (p) => <Icon {...p} d="M15 6l-6 6 6 6" />,
  chevD: (p) => <Icon {...p} d="M6 9l6 6 6-6" />,
  bell: (p) => <Icon {...p} d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9zM10 21a2 2 0 0 0 4 0" />,
  moon: (p) => <Icon {...p} d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  sun: (p) => <Icon {...p} d={<g><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></g>} />,
  flame: (p) => <Icon {...p} d="M12 2c1 4 5 5 5 10a5 5 0 1 1-10 0c0-3 2-4 2-7 2 1 3 3 3 5 0-3 0-6 0-8z" />,
  leaf: (p) => <Icon {...p} d="M21 3c-7 0-13 4-15 11-1 4 0 7 0 7s3-1 7-2c7-2 11-7 11-15-1 0-2 0-3 0z M9 17c4-3 7-6 9-10" />,
  list: (p) => <Icon {...p} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  chart: (p) => <Icon {...p} d="M3 21h18M7 21V10M12 21V4M17 21v-7" />,
  cog: (p) => <Icon {...p} d={<g><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></g>} />,
  home: (p) => <Icon {...p} d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z" />,
  task: (p) => <Icon {...p} d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
  edit: (p) => <Icon {...p} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />,
  trash: (p) => <Icon {...p} d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />,
  rain: (p) => <Icon {...p} d="M16 13a4 4 0 0 0 0-8 5 5 0 0 0-9.5 1A4 4 0 0 0 6 13M8 17l-1 3M12 17l-1 3M16 17l-1 3" />,
  cafe: (p) => <Icon {...p} d="M3 8h14v6a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8zM17 9h2a2 2 0 0 1 0 4h-2M6 1v3M10 1v3M14 1v3" />,
  wave: (p) => <Icon {...p} d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />,
  fire: (p) => <Icon {...p} d="M12 2c1 4 5 5 5 10a5 5 0 1 1-10 0c0-3 2-4 2-7 2 1 3 3 3 5 0-3 0-6 0-8z" />,
  target: (p) => <Icon {...p} d={<g><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></g>} />,
  book: (p) => <Icon {...p} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />,
  brief: (p) => <Icon {...p} d="M3 7h18v13H3zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
  heart: (p) => <Icon {...p} d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />,
  zap: (p) => <Icon {...p} d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />,
  shield: (p) => <Icon {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  arrow: (p) => <Icon {...p} d="M5 12h14M13 5l7 7-7 7" />,
  drag: (p) => <Icon {...p} d={<g><circle cx="9" cy="6" r="1.2" fill="currentColor" /><circle cx="15" cy="6" r="1.2" fill="currentColor" /><circle cx="9" cy="12" r="1.2" fill="currentColor" /><circle cx="15" cy="12" r="1.2" fill="currentColor" /><circle cx="9" cy="18" r="1.2" fill="currentColor" /><circle cx="15" cy="18" r="1.2" fill="currentColor" /></g>} />,
};

// ─────────────────────────────────────────────────────────────
// Liquid Blob Timer — SVG with feTurbulence + feDisplacementMap
// progress: 0..1 (0 = full, 1 = empty)
// ─────────────────────────────────────────────────────────────
function BlobTimer({ size = 280, progress = 0.3, isBreak = false, t, paused = false, seed = 1 }) {
  const r = size / 2 - 4;
  const cx = size / 2, cy = size / 2;
  const fillColor = isBreak ? t.breakC : t.focus;
  const fillSoft = isBreak ? t.breakSoft : t.focusSoft;

  // Wave height: how tall the surface ripple is
  const waveH = 8;
  // Fill level (y position): 0 progress = top filled (full timer), 1 = empty
  const fillY = cy - r + (size - 8) * progress;

  // Generate a wavy path for the water surface
  const segs = 8;
  const path = [];
  path.push(`M ${cx - r} ${size}`);
  path.push(`L ${cx - r} ${fillY}`);
  for (let i = 0; i <= segs; i++) {
    const x = cx - r + (i / segs) * (r * 2);
    const y = fillY + Math.sin(i * 1.3 + seed) * waveH;
    path.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  path.push(`L ${cx + r} ${size}`);
  path.push('Z');

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
        <defs>
          <filter id={`blob-${seed}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed={seed}>
              {!paused && <animate attributeName="baseFrequency" dur="14s" values="0.010;0.018;0.010" repeatCount="indefinite" />}
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale={paused ? 8 : 22} />
          </filter>
          <linearGradient id={`fillg-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillSoft} />
            <stop offset="100%" stopColor={fillColor} />
          </linearGradient>
          <clipPath id={`clip-${seed}`}><circle cx={cx} cy={cy} r={r} /></clipPath>
        </defs>

        {/* Background ring */}
        <circle cx={cx} cy={cy} r={r} fill={t.surfaceAlt} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={t.line} strokeWidth="1" />

        {/* Liquid fill — clipped to circle, displacement filter for organic morph */}
        <g clipPath={`url(#clip-${seed})`}>
          <path d={path.join(' ')} fill={`url(#fillg-${seed})`} filter={`url(#blob-${seed})`} opacity="0.95">
            {!paused && (
              <animateTransform attributeName="transform" type="translate"
                values="0 0; 4 -2; -3 1; 0 0" dur="6s" repeatCount="indefinite" />
            )}
          </path>
          {/* Second translucent layer for depth */}
          <path d={path.join(' ')} fill={fillSoft} filter={`url(#blob-${seed})`} opacity="0.35"
            transform="translate(0 6)" />
        </g>

        {/* Outer ring with subtle progress mark */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={t.line} strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Format mm:ss
// ─────────────────────────────────────────────────────────────
const fmt = (sec) => {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

// ─────────────────────────────────────────────────────────────
// Pill button
// ─────────────────────────────────────────────────────────────
function PillBtn({ children, onClick, t, primary = false, ghost = false, size = 'md', style = {}, ...p }) {
  const h = size === 'sm' ? 36 : size === 'lg' ? 56 : 46;
  const base = {
    height: h, padding: `0 ${h * 0.45}px`, borderRadius: h,
    fontFamily: FONT_UI, fontWeight: 550, fontSize: size === 'lg' ? 16 : 14,
    letterSpacing: '-0.01em', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    border: 'none', transition: 'transform .15s, background .15s',
  };
  const variants = {
    primary: { background: t.ink, color: t.bg },
    ghost: { background: 'transparent', color: t.ink, boxShadow: `inset 0 0 0 1px ${t.line}` },
    default: { background: t.surface, color: t.ink, boxShadow: `0 1px 0 ${t.line}, 0 4px 12px rgba(0,0,0,0.04)` },
  };
  const v = primary ? variants.primary : ghost ? variants.ghost : variants.default;
  return <button onClick={onClick} style={{ ...base, ...v, ...style }} {...p}>{children}</button>;
}

// ─────────────────────────────────────────────────────────────
// Bar chart
// ─────────────────────────────────────────────────────────────
function BarChart({ data, t, height = 140, color, labelKey = 'label', valueKey = 'value' }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  const c = color || t.focus;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height, paddingTop: 12 }}>
      {data.map((d, i) => {
        const h = (d[valueKey] / max) * (height - 24);
        const isToday = d.today;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
              <div style={{
                width: '100%', maxWidth: 28, height: Math.max(h, 4), borderRadius: 8,
                background: isToday ? c : `${c}55`,
                boxShadow: isToday ? `0 4px 12px ${c}40` : 'none',
              }} />
            </div>
            <div style={{
              fontFamily: FONT_UI, fontSize: 10, color: isToday ? t.ink : t.soft,
              fontWeight: isToday ? 600 : 500,
            }}>{d[labelKey]}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tomato dots (sessions completed)
// ─────────────────────────────────────────────────────────────
function TomatoDots({ done = 2, total = 4, t, size = 8 }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: size, height: size, borderRadius: '50%',
          background: i < done ? t.focus : t.line,
          boxShadow: i < done ? `0 0 0 2px ${t.focus}20` : 'none',
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab bar (iOS-style, used in mocks where helpful)
// ─────────────────────────────────────────────────────────────
function TabBar({ active, t }) {
  const tabs = [
    { id: 'home', label: 'Focus', icon: I.home },
    { id: 'tasks', label: 'Tasks', icon: I.task },
    { id: 'stats', label: 'Stats', icon: I.chart },
    { id: 'settings', label: 'Settings', icon: I.cog },
  ];
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around',
      padding: '10px 8px 22px', background: t.surface,
      borderTop: `1px solid ${t.line}`,
    }}>
      {tabs.map(tab => {
        const A = tab.icon;
        const isActive = active === tab.id;
        return (
          <div key={tab.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: isActive ? t.focus : t.soft, padding: '4px 12px',
          }}>
            <A size={22} stroke={isActive ? 2 : 1.7} />
            <div style={{ fontFamily: FONT_UI, fontSize: 10, fontWeight: isActive ? 600 : 500 }}>
              {tab.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { Icon, I, BlobTimer, fmt, PillBtn, BarChart, TomatoDots, TabBar });
