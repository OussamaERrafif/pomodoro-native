// onboarding-screens.jsx — 5 onboarding screens (Welcome → Features → Personalize → Notifications → Final)

// Screen background wrapper
const Screen = ({ t, children, bg, style = {} }) => (
  <div style={{
    width: '100%', height: '100%', background: bg || t.bg,
    fontFamily: FONT_UI, color: t.ink,
    display: 'flex', flexDirection: 'column',
    boxSizing: 'border-box', ...style,
  }}>{children}</div>
);

// Page indicator dots
const Dots = ({ active, total, t }) => (
  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        height: 6, width: i === active ? 22 : 6, borderRadius: 3,
        background: i === active ? t.focus : t.line, transition: 'all .25s',
      }} />
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────
// 01 · Welcome
// ─────────────────────────────────────────────────────────────
function OnbWelcome({ t, statusOffset = 54 }) {
  return (
    <Screen t={t} bg={t.warm}>
      {/* Hero abstract composition */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        paddingTop: statusOffset,
      }}>
        <svg width="100%" height="100%" viewBox="0 0 360 480" preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <radialGradient id="sun" cx="0.5" cy="0.5">
              <stop offset="0%" stopColor={t.focusSoft} stopOpacity="1" />
              <stop offset="100%" stopColor={t.focus} stopOpacity="1" />
            </radialGradient>
            <linearGradient id="plum-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={t.plum} stopOpacity="0.85" />
              <stop offset="100%" stopColor={t.focus} stopOpacity="0.6" />
            </linearGradient>
          </defs>
          {/* Big sun circle */}
          <circle cx="180" cy="240" r="135" fill="url(#sun)" />
          {/* Plum arc behind */}
          <circle cx="265" cy="160" r="70" fill={t.plum} opacity="0.92" />
          {/* Cream small circle */}
          <circle cx="95" cy="335" r="42" fill={t.surface} />
          {/* Squiggle */}
          <path d="M 60 150 Q 90 130, 120 150 T 180 150" fill="none"
            stroke={t.plum} strokeWidth="3" strokeLinecap="round" />
          {/* Tiny dots */}
          <circle cx="295" cy="320" r="6" fill={t.plum} />
          <circle cx="320" cy="370" r="3" fill={t.plum} />
          <circle cx="50" cy="220" r="4" fill={t.plum} />
        </svg>
      </div>

      <div style={{ padding: '32px 28px 36px', background: t.bg, borderRadius: '32px 32px 0 0' }}>
        <div style={{
          fontFamily: FONT_UI, fontSize: 11, fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: t.focus,
          marginBottom: 12,
        }}>Tomato · Focus timer</div>
        <h1 style={{
          fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 400,
          lineHeight: 1.0, letterSpacing: '-0.02em', margin: '0 0 12px',
          color: t.ink,
        }}>
          Stay focused,<br/><em style={{ color: t.focus, fontStyle: 'italic' }}>achieve more.</em>
        </h1>
        <p style={{
          fontSize: 15, lineHeight: 1.5, color: t.mute,
          margin: '0 0 28px', textWrap: 'pretty',
        }}>
          A gentle Pomodoro timer that helps you do deep work, then breathe. Made for the way your brain actually works.
        </p>
        <PillBtn t={t} primary size="lg" style={{ width: '100%' }}>
          Get started <I.arrow size={16} />
        </PillBtn>
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: t.mute }}>
          Already have an account? <span style={{ color: t.ink, fontWeight: 600 }}>Sign in</span>
        </div>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// 02 · Features (single screen, three rows)
// ─────────────────────────────────────────────────────────────
function OnbFeatures({ t, statusOffset = 54 }) {
  const rows = [
    {
      icon: I.target, label: 'Focus timer',
      body: '25-minute deep work sessions, gently bookended by mindful breaks.',
      tint: t.focus,
    },
    {
      icon: I.task, label: 'Task tracking',
      body: 'Plan your day in tomatoes. Tap to start, check off when it sings.',
      tint: t.plum,
    },
    {
      icon: I.chart, label: 'Progress insights',
      body: 'See your focus rhythm. Notice the patterns. Get a little better.',
      tint: t.breakC,
    },
  ];
  return (
    <Screen t={t}>
      <div style={{ padding: `${statusOffset + 12}px 28px 0`, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, color: t.mute, fontWeight: 500 }}>Step 1 of 3</div>
        <div style={{ fontSize: 13, color: t.ink, fontWeight: 600 }}>Skip</div>
      </div>
      <div style={{ padding: '36px 28px 0' }}>
        <h2 style={{
          fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 400,
          lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 8px',
        }}>What's inside</h2>
        <p style={{ fontSize: 14, color: t.mute, margin: '0 0 32px' }}>
          Three small things that, together, make a difference.
        </p>
      </div>

      <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {rows.map((r, i) => {
          const Ic = r.icon;
          return (
            <div key={i} style={{
              background: t.surface, borderRadius: 22, padding: '20px 18px',
              display: 'flex', gap: 16, alignItems: 'flex-start',
              boxShadow: `0 1px 0 ${t.line}, 0 6px 18px rgba(0,0,0,0.03)`,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                background: `${r.tint}18`, color: r.tint,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Ic size={24} stroke={1.8} />
              </div>
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ fontFamily: FONT_UI, fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                  {r.label}
                </div>
                <div style={{ fontSize: 13.5, color: t.mute, lineHeight: 1.45 }}>{r.body}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '24px 28px 36px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Dots active={0} total={3} t={t} />
        <PillBtn t={t} primary size="lg" style={{ width: '100%' }}>
          Continue <I.arrow size={16} />
        </PillBtn>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// 03 · Personalization
// ─────────────────────────────────────────────────────────────
function OnbPersonalize({ t, statusOffset = 54 }) {
  const goals = [
    { label: 'Study', icon: I.book, on: true },
    { label: 'Work', icon: I.brief, on: true },
    { label: 'Writing', icon: I.edit, on: false },
    { label: 'Fitness', icon: I.heart, on: false },
    { label: 'Reading', icon: I.book, on: true },
    { label: 'Practice', icon: I.zap, on: false },
  ];
  return (
    <Screen t={t}>
      <div style={{ padding: `${statusOffset + 12}px 28px 0`, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, color: t.mute, fontWeight: 500 }}>Step 2 of 3</div>
        <div style={{ fontSize: 13, color: t.ink, fontWeight: 600 }}>Skip</div>
      </div>
      <div style={{ padding: '32px 28px 0' }}>
        <h2 style={{
          fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 400,
          lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 8px',
        }}>Set your rhythm</h2>
        <p style={{ fontSize: 14, color: t.mute, margin: '0 0 28px' }}>
          You can change these anytime in Settings.
        </p>
      </div>

      <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
        {/* Focus / Break duration cards */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'Focus', value: 25, unit: 'min', tint: t.focus, soft: t.focusSoft },
            { label: 'Break', value: 5, unit: 'min', tint: t.breakC, soft: t.breakSoft },
          ].map((c, i) => (
            <div key={i} style={{
              flex: 1, background: t.surface, borderRadius: 22, padding: '18px 16px',
              boxShadow: `0 1px 0 ${t.line}`,
            }}>
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: c.tint, marginBottom: 8,
              }}>{c.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 14 }}>
                <span style={{
                  fontFamily: FONT_DISPLAY, fontSize: 48, fontWeight: 400,
                  lineHeight: 1, color: t.ink, letterSpacing: '-0.02em',
                }}>{c.value}</span>
                <span style={{ fontSize: 13, color: t.mute }}>{c.unit}</span>
              </div>
              {/* mini stepper */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: t.bg, borderRadius: 100, padding: 4, height: 32,
              }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.mute }}>−</div>
                <div style={{ width: 4, height: 4, borderRadius: 2, background: t.line }} />
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: c.tint, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</div>
              </div>
            </div>
          ))}
        </div>

        {/* Goals */}
        <div style={{
          background: t.surface, borderRadius: 22, padding: '18px 16px',
          boxShadow: `0 1px 0 ${t.line}`, flex: 1, overflow: 'hidden',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>What are you focusing on?</div>
          <div style={{ fontSize: 12, color: t.mute, marginBottom: 14 }}>Choose any that fit.</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {goals.map((g, i) => {
              const Ic = g.icon;
              return (
                <div key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px 8px 12px', borderRadius: 100,
                  background: g.on ? t.ink : t.bg,
                  color: g.on ? t.bg : t.ink,
                  fontSize: 13, fontWeight: 550,
                }}>
                  <Ic size={14} stroke={1.8} />
                  {g.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 28px 36px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Dots active={1} total={3} t={t} />
        <PillBtn t={t} primary size="lg" style={{ width: '100%' }}>
          Continue <I.arrow size={16} />
        </PillBtn>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// 04 · Notifications permission
// ─────────────────────────────────────────────────────────────
function OnbNotifications({ t, statusOffset = 54 }) {
  return (
    <Screen t={t}>
      <div style={{ padding: `${statusOffset + 12}px 28px 0`, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, color: t.mute, fontWeight: 500 }}>Step 3 of 3</div>
        <div style={{ fontSize: 13, color: t.ink, fontWeight: 600 }}>Skip</div>
      </div>

      <div style={{ flex: 1, padding: '36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Bell illustration */}
        <div style={{ position: 'relative', width: 200, height: 200, marginBottom: 32 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: `radial-gradient(circle, ${t.focusSoft}55, ${t.focusSoft}00 70%)`,
          }} />
          <div style={{
            position: 'absolute', inset: 30, borderRadius: '50%',
            background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 12px 40px ${t.focus}30, 0 0 0 1px ${t.line}`,
            color: t.focus,
          }}>
            <I.bell size={56} stroke={1.8} />
          </div>
          {/* Floating ping dots */}
          <div style={{
            position: 'absolute', top: 28, right: 22, width: 14, height: 14,
            borderRadius: '50%', background: t.focus,
            boxShadow: `0 0 0 4px ${t.focus}30`,
          }} />
        </div>

        <h2 style={{
          fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 400,
          lineHeight: 1.1, textAlign: 'center', margin: '0 0 12px',
          letterSpacing: '-0.02em',
        }}>A gentle nudge<br/>when it matters</h2>
        <p style={{
          fontSize: 14.5, color: t.mute, textAlign: 'center',
          maxWidth: 280, lineHeight: 1.5, margin: 0,
        }}>
          We'll only ping you when a session ends or a break is over. No streak shaming, no spam.
        </p>
      </div>

      <div style={{ padding: '0 28px 36px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <PillBtn t={t} primary size="lg" style={{ width: '100%' }}>
          Allow notifications
        </PillBtn>
        <PillBtn t={t} ghost size="lg" style={{ width: '100%' }}>
          Maybe later
        </PillBtn>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// 05 · Final
// ─────────────────────────────────────────────────────────────
function OnbFinal({ t, statusOffset = 54 }) {
  return (
    <Screen t={t} bg={t.plum}>
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        paddingTop: statusOffset,
      }}>
        <svg width="100%" height="100%" viewBox="0 0 360 700" preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <radialGradient id="glow" cx="0.5" cy="0.5">
              <stop offset="0%" stopColor={t.focus} stopOpacity="1" />
              <stop offset="60%" stopColor={t.focus} stopOpacity="0.5" />
              <stop offset="100%" stopColor={t.focus} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="180" cy="280" r="280" fill="url(#glow)" />
          <circle cx="180" cy="280" r="90" fill={t.focusSoft} />
          <circle cx="180" cy="280" r="60" fill={t.focus} />
        </svg>

        <div style={{ position: 'relative', textAlign: 'center', padding: '0 28px', zIndex: 2 }}>
          <div style={{
            fontFamily: FONT_UI, fontSize: 11, fontWeight: 600,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: t.focusSoft, marginBottom: 14, marginTop: 200,
          }}>You're all set</div>
          <h1 style={{
            fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 400,
            color: t.bg, lineHeight: 1.0, margin: 0, letterSpacing: '-0.02em',
          }}>
            Take a breath.<br/>
            <em style={{ fontStyle: 'italic', color: t.focusSoft }}>Begin.</em>
          </h1>
        </div>
      </div>

      <div style={{ padding: '0 28px 36px' }}>
        <PillBtn t={t} size="lg" style={{
          width: '100%', background: t.bg, color: t.plum,
        }}>
          Start focusing <I.arrow size={16} />
        </PillBtn>
      </div>
    </Screen>
  );
}

Object.assign(window, { OnbWelcome, OnbFeatures, OnbPersonalize, OnbNotifications, OnbFinal, Screen, Dots });
