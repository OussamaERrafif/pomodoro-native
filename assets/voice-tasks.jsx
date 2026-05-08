// voice-tasks.jsx — Voice-to-tasks flow (4 screens: idle, listening, parsing, review)

// ─────────────────────────────────────────────────────────────
// 01 · Voice idle — bottom sheet inviting the user to speak
// ─────────────────────────────────────────────────────────────
function ScreenVoiceIdle({ t, statusOffset = 54 }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg, color: t.ink,
      fontFamily: FONT_UI, display: 'flex', flexDirection: 'column',
      paddingTop: statusOffset,
    }}>
      <div style={{ padding: '14px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 1px 0 ${t.line}` }}>
          <I.chevL size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: t.mute, fontWeight: 500 }}>Plan with voice</div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 400, margin: 0, letterSpacing: '-0.01em' }}>Just say it</h1>
        </div>
      </div>

      <div style={{ flex: 1, padding: '32px 28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Mic */}
        <div style={{ position: 'relative', marginBottom: 28 }}>
          <div style={{ position: 'absolute', inset: -28, borderRadius: '50%', background: `radial-gradient(circle, ${t.focusSoft}55, ${t.focusSoft}00 70%)` }} />
          <div style={{
            width: 112, height: 112, borderRadius: '50%',
            background: `linear-gradient(135deg, ${t.focusSoft}, ${t.focus})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            boxShadow: `0 16px 36px ${t.focus}50`,
          }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" stroke="none"/>
              <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" />
            </svg>
          </div>
        </div>

        <h2 style={{
          fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 400,
          textAlign: 'center', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.1,
        }}>Tell me what's<br/>on your plate.</h2>
        <p style={{ fontSize: 14, color: t.mute, textAlign: 'center', maxWidth: 280, lineHeight: 1.5, margin: '0 0 28px' }}>
          Talk naturally. We'll turn it into tasks with tags, durations, and tomato counts.
        </p>

        {/* Example chip */}
        <div style={{
          background: t.surface, borderRadius: 16, padding: '14px 16px',
          maxWidth: 320, fontSize: 13, color: t.mute, lineHeight: 1.5,
          boxShadow: `0 1px 0 ${t.line}`,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.focus, marginBottom: 6 }}>Try saying</div>
          <div style={{ color: t.ink, fontFamily: FONT_DISPLAY, fontSize: 15, fontStyle: 'italic', lineHeight: 1.45 }}>
            "I need to outline the Q3 narrative, read chapter four of Deep Work, and reply to Lin around four."
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 28px 36px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <PillBtn t={t} primary size="lg" style={{ width: '100%' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="9" y="2" width="6" height="12" rx="3"/></svg>
          Hold to speak
        </PillBtn>
        <div style={{ textAlign: 'center', fontSize: 12, color: t.mute }}>
          Or <span style={{ color: t.ink, fontWeight: 600 }}>type instead</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 02 · Voice listening — waveform + live transcription
// ─────────────────────────────────────────────────────────────
function ScreenVoiceListening({ t, statusOffset = 54 }) {
  // Generate a deterministic-looking waveform
  const bars = Array.from({ length: 40 }, (_, i) => {
    const v = Math.sin(i * 0.6) * 0.4 + Math.cos(i * 0.31) * 0.3 + 0.5;
    return Math.max(0.08, Math.min(1, v));
  });

  return (
    <div style={{
      width: '100%', height: '100%', background: t.plum, color: t.bg,
      fontFamily: FONT_UI, display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <svg width="100%" height="100%" viewBox="0 0 360 700" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="vglow" cx="0.5" cy="0.4">
            <stop offset="0%" stopColor={t.focus} stopOpacity="0.65" />
            <stop offset="100%" stopColor={t.focus} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="180" cy="280" r="280" fill="url(#vglow)" />
      </svg>

      <div style={{ position: 'relative', padding: `${statusOffset + 14}px 24px 0`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', fontSize: 12, fontWeight: 600 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.focus, boxShadow: `0 0 0 3px ${t.focus}40` }} />
          LISTENING · 0:08
        </div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <I.x size={16} />
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Live transcript */}
        <div style={{ paddingTop: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.focusSoft, marginBottom: 14 }}>
            We hear you
          </div>
          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 400,
            lineHeight: 1.25, letterSpacing: '-0.01em',
          }}>
            "I need to outline the <span style={{ background: `${t.focus}30`, padding: '2px 6px', borderRadius: 6 }}>Q3 narrative</span>, then read <span style={{ background: `${t.focus}30`, padding: '2px 6px', borderRadius: 6 }}>chapter four</span> of Deep Work, and reply to Lin around four<span style={{ color: t.focusSoft, fontStyle: 'italic' }}> …</span>"
          </div>
        </div>

        {/* Waveform */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 72, padding: '0 8px' }}>
          {bars.map((v, i) => (
            <div key={i} style={{
              flex: 1, maxWidth: 4, borderRadius: 2,
              height: `${Math.max(4, v * 64)}px`,
              background: i < bars.length * 0.7 ? t.focus : t.focusSoft,
              opacity: i < bars.length * 0.7 ? 1 : 0.5,
            }} />
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: '0 24px 36px', display: 'flex', justifyContent: 'center', gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <I.x size={20} color={t.bg} />
        </div>
        <div style={{
          width: 76, height: 76, borderRadius: '50%',
          background: t.focus, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 12px 40px ${t.focus}80, 0 0 0 8px ${t.focus}30`,
        }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: '#fff' }} />
        </div>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <I.check size={20} color={t.bg} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 03 · Voice parsing — AI is thinking
// ─────────────────────────────────────────────────────────────
function ScreenVoiceParsing({ t, statusOffset = 54 }) {
  const steps = [
    { label: 'Transcribed', done: true },
    { label: 'Identified 3 tasks', done: true },
    { label: 'Estimating durations', active: true },
    { label: 'Suggesting tags', done: false },
  ];
  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg, color: t.ink,
      fontFamily: FONT_UI, display: 'flex', flexDirection: 'column',
      paddingTop: statusOffset,
    }}>
      <div style={{ padding: '14px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 1px 0 ${t.line}` }}>
          <I.chevL size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: t.mute, fontWeight: 500 }}>One moment</div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 400, margin: 0, letterSpacing: '-0.01em' }}>Shaping your plan</h1>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px' }}>
        {/* Animated blob */}
        <div style={{ position: 'relative', marginBottom: 36 }}>
          <BlobTimer size={180} progress={0.5} t={t} paused={false} seed={44} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: t.focus,
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v3M12 18v3M5 12H2M22 12h-3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
              <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
            </svg>
          </div>
        </div>

        <h2 style={{
          fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 400,
          textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.02em',
        }}>Sorting things out…</h2>
        <p style={{ fontSize: 13, color: t.mute, textAlign: 'center', margin: '0 0 28px' }}>
          This usually takes a second or two.
        </p>

        {/* Steps checklist */}
        <div style={{ width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 12,
              background: s.active ? `${t.focus}10` : 'transparent',
              boxShadow: s.active ? `inset 0 0 0 1px ${t.focus}40` : 'none',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: s.done ? t.breakC : s.active ? t.focus : 'transparent',
                boxShadow: s.done || s.active ? 'none' : `inset 0 0 0 1.5px ${t.line}`,
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {s.done && <I.check size={12} stroke={2.5} />}
                {s.active && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
                )}
              </div>
              <div style={{
                fontSize: 13.5, fontWeight: s.active ? 600 : 500,
                color: s.done ? t.ink : s.active ? t.ink : t.mute,
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 56 }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 04 · Voice review — drafted tasks ready to confirm/edit
// ─────────────────────────────────────────────────────────────
function ScreenVoiceReview({ t, statusOffset = 54 }) {
  const drafts = [
    {
      title: 'Outline Q3 product narrative',
      tag: 'Work', tagColor: t.focus,
      tomatoes: 3, due: 'Today',
      confidence: 0.94,
    },
    {
      title: 'Read Deep Work — chapter 4',
      tag: 'Reading', tagColor: t.breakC,
      tomatoes: 2, due: 'Today',
      confidence: 0.88,
    },
    {
      title: 'Reply to Lin\'s thread',
      tag: 'Personal', tagColor: '#A47BB9',
      tomatoes: 1, due: 'Today, 4:00pm',
      confidence: 0.79,
    },
  ];

  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg, color: t.ink,
      fontFamily: FONT_UI, display: 'flex', flexDirection: 'column',
      paddingTop: statusOffset,
    }}>
      <div style={{ padding: '14px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 1px 0 ${t.line}` }}>
          <I.chevL size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: t.mute, fontWeight: 500 }}>Review · 3 tasks</div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 400, margin: 0, letterSpacing: '-0.01em' }}>Sound right?</h1>
        </div>
        <div style={{ fontSize: 13, color: t.mute, fontWeight: 600 }}>Edit all</div>
      </div>

      {/* Original transcript pill */}
      <div style={{ padding: '14px 20px 8px' }}>
        <div style={{
          background: t.warm, borderRadius: 14, padding: '12px 14px',
          fontSize: 13, color: t.plum, lineHeight: 1.45, fontStyle: 'italic',
          fontFamily: FONT_DISPLAY, fontWeight: 400, fontSize: 14,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, marginTop: 4, opacity: 0.6 }}>
            <rect x="9" y="2" width="6" height="12" rx="3"/>
          </svg>
          <span>"I need to outline the Q3 narrative, read chapter four of Deep Work, and reply to Lin around four."</span>
        </div>
      </div>

      {/* Drafted tasks */}
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 20px 12px' }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: t.mute, padding: '6px 4px 10px',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 3v3M12 18v3M5 12H2M22 12h-3"/></svg>
          AI suggested
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {drafts.map((d, i) => (
            <div key={i} style={{
              background: t.surface, borderRadius: 16, padding: '14px',
              boxShadow: `0 1px 0 ${t.line}, 0 4px 12px rgba(0,0,0,0.03)`,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                  background: t.bg, color: t.focus,
                  boxShadow: `inset 0 0 0 1.5px ${t.line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <I.check size={12} stroke={2.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.35 }}>{d.title}</div>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 10, fontWeight: 600, color: t.breakC,
                  padding: '3px 7px', borderRadius: 100, background: `${t.breakC}15`,
                  flexShrink: 0,
                }}>
                  {Math.round(d.confidence * 100)}%
                </div>
              </div>

              {/* Editable chip row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 32 }}>
                {/* Tag chip */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px 5px 8px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                  background: `${d.tagColor}15`, color: d.tagColor,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: d.tagColor }} />
                  {d.tag}
                  <I.chevD size={10} />
                </div>
                {/* Tomatoes chip */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                  background: t.bg, color: t.ink,
                }}>
                  <TomatoDots done={d.tomatoes} total={d.tomatoes} t={t} size={6} />
                  {d.tomatoes * 25}m
                </div>
                {/* Due chip */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                  background: t.bg, color: t.mute,
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
                  {d.due}
                </div>
              </div>
            </div>
          ))}

          {/* Add another row */}
          <div style={{
            border: `1.5px dashed ${t.line}`, borderRadius: 16, padding: '12px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: t.mute, fontSize: 13, fontWeight: 500,
          }}>
            <I.plus size={14} /> Add another task
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px 30px', display: 'flex', gap: 10 }}>
        <PillBtn t={t} ghost size="lg" style={{ flex: 1 }}>
          Discard
        </PillBtn>
        <PillBtn t={t} primary size="lg" style={{ flex: 2 }}>
          Add 3 tasks <I.arrow size={16} />
        </PillBtn>
      </div>
    </div>
  );
}

Object.assign(window, {
  ScreenVoiceIdle, ScreenVoiceListening, ScreenVoiceParsing, ScreenVoiceReview,
});
