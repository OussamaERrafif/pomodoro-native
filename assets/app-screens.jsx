// app-screens.jsx — main app screens: Timer, Tasks, Stats, Settings, plus extras

// ─────────────────────────────────────────────────────────────
// HOME / TIMER
// ─────────────────────────────────────────────────────────────
function ScreenTimer({ t, statusOffset = 54, isBreak = false, paused = false, progress = 0.32, label, secondsLeft = 17 * 60 + 4 }) {
  const sessionLabel = label || (isBreak ? 'Short break' : 'Focus');
  const motivation = isBreak
    ? 'Take a breath. Stretch.'
    : 'Nice work. Keep going.';
  const taskTitle = 'Outline Q3 product narrative';

  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg, color: t.ink,
      fontFamily: FONT_UI, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        padding: `${statusOffset + 14}px 24px 0`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 12, color: t.mute, fontWeight: 500, marginBottom: 2 }}>
            Tuesday
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 400, letterSpacing: '-0.01em' }}>
            Let's focus, Maya
          </div>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: `linear-gradient(135deg, ${t.focusSoft}, ${t.focus})`,
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 500,
        }}>M</div>
      </div>

      {/* Session pill */}
      <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 100,
          background: isBreak ? `${t.breakC}18` : `${t.focus}18`,
          color: isBreak ? t.breakC : t.focus,
          fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: isBreak ? t.breakC : t.focus,
          }} />
          {sessionLabel.toUpperCase()} · 2 of 4
        </div>
      </div>

      {/* Big timer */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', position: 'relative',
        padding: '12px 0',
      }}>
        <div style={{ position: 'relative' }}>
          <BlobTimer size={272} progress={progress} isBreak={isBreak} t={t} paused={paused} seed={isBreak ? 7 : 3} />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: 64, fontWeight: 400,
              color: t.ink, letterSpacing: '-0.03em', lineHeight: 1,
              textShadow: `0 1px 2px ${t.bg}`,
            }}>{fmt(secondsLeft)}</div>
            <div style={{ fontSize: 12, color: t.mute, marginTop: 8, fontWeight: 500 }}>
              {Math.round((1 - progress) * 100)}% remaining
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 28, fontSize: 13, color: t.mute, fontStyle: 'italic',
          fontFamily: FONT_DISPLAY, fontWeight: 400, fontSize: 16,
          letterSpacing: '-0.01em', textAlign: 'center', maxWidth: 260,
        }}>"{motivation}"</div>
      </div>

      {/* Current task */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{
          background: t.surface, borderRadius: 18, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: `0 1px 0 ${t.line}`,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: `${t.focus}18`, color: t.focus,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <I.target size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: t.mute, fontWeight: 500, marginBottom: 1 }}>Now working on</div>
            <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {taskTitle}
            </div>
          </div>
          <TomatoDots done={1} total={3} t={t} size={7} />
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18,
        padding: '0 24px 14px',
      }}>
        <button style={{
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: t.surface, color: t.ink, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 1px 0 ${t.line}, 0 6px 18px rgba(0,0,0,0.04)`,
        }}><I.reset size={22} stroke={1.8} /></button>

        <button style={{
          width: 84, height: 84, borderRadius: '50%', border: 'none',
          background: isBreak ? t.breakC : t.focus, color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 12px 30px ${isBreak ? t.breakC : t.focus}50`,
        }}>
          {paused ? <I.play size={32} /> : <I.pause size={32} />}
        </button>

        <button style={{
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: t.surface, color: t.ink, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 1px 0 ${t.line}, 0 6px 18px rgba(0,0,0,0.04)`,
        }}><I.skip size={22} stroke={1.8} /></button>
      </div>

      <TabBar active="home" t={t} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TASKS
// ─────────────────────────────────────────────────────────────
function ScreenTasks({ t, statusOffset = 54 }) {
  const tasks = [
    { title: 'Outline Q3 product narrative', tag: 'Work', tagColor: t.focus, done: 1, total: 3, active: true, complete: false },
    { title: 'Read Deep Work — chapter 4', tag: 'Reading', tagColor: t.breakC, done: 1, total: 2, complete: false },
    { title: 'Sketch onboarding mood board', tag: 'Design', tagColor: t.plum, done: 0, total: 2, complete: false },
    { title: 'Process inbox & ship replies', tag: 'Work', tagColor: t.focus, done: 0, total: 1, complete: false },
    { title: 'Reply to Lin\'s thread', tag: 'Personal', tagColor: '#A47BB9', done: 1, total: 1, complete: true },
    { title: 'Meditation — morning sit', tag: 'Wellness', tagColor: t.breakC, done: 1, total: 1, complete: true },
  ];

  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg, color: t.ink,
      fontFamily: FONT_UI, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: `${statusOffset + 14}px 24px 14px` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 12, color: t.mute, fontWeight: 500, marginBottom: 4 }}>Today's plan</div>
            <h1 style={{
              fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 400,
              margin: 0, letterSpacing: '-0.02em', lineHeight: 1,
            }}>Tasks</h1>
          </div>
          <button style={{
            width: 40, height: 40, borderRadius: '50%', border: 'none',
            background: t.ink, color: t.bg, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><I.plus size={20} /></button>
        </div>

        {/* Day summary */}
        <div style={{
          background: t.surface, borderRadius: 18, padding: '14px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: `0 1px 0 ${t.line}`,
        }}>
          <div>
            <div style={{ fontSize: 11, color: t.mute, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Today</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em' }}>3</span>
              <span style={{ fontSize: 12, color: t.mute }}>of 9 tomatoes</span>
            </div>
          </div>
          <div style={{ flex: 1, padding: '0 18px' }}>
            <div style={{ height: 6, borderRadius: 3, background: t.line, overflow: 'hidden' }}>
              <div style={{ width: '33%', height: '100%', background: t.focus, borderRadius: 3 }} />
            </div>
          </div>
          <div style={{
            color: t.focus, display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 13, fontWeight: 600,
          }}>
            <I.flame size={14} fill="currentColor" stroke={0} />
            5
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, overflow: 'auto' }}>
          {[
            { label: 'All', active: true }, { label: 'Work' }, { label: 'Reading' },
            { label: 'Design' }, { label: 'Personal' },
          ].map((c, i) => (
            <div key={i} style={{
              padding: '7px 14px', borderRadius: 100, fontSize: 13, fontWeight: 550,
              background: c.active ? t.ink : t.surface,
              color: c.active ? t.bg : t.mute,
              flexShrink: 0,
              boxShadow: c.active ? 'none' : `0 1px 0 ${t.line}`,
            }}>{c.label}</div>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 20px 12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.map((task, i) => (
            <div key={i} style={{
              background: t.surface, borderRadius: 16, padding: '14px 14px 14px 12px',
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: task.active ? `0 0 0 1.5px ${t.focus}` : `0 1px 0 ${t.line}`,
              opacity: task.complete ? 0.55 : 1,
            }}>
              {/* Checkbox */}
              <div style={{
                width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                background: task.complete ? t.breakC : 'transparent',
                boxShadow: task.complete ? 'none' : `inset 0 0 0 1.5px ${t.line}`,
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {task.complete && <I.check size={14} stroke={2.5} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14.5, fontWeight: 550, marginBottom: 4,
                  textDecoration: task.complete ? 'line-through' : 'none',
                  color: task.complete ? t.mute : t.ink,
                }}>{task.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                    background: `${task.tagColor}18`, color: task.tagColor,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                  }}>{task.tag}</span>
                  <TomatoDots done={task.done} total={task.total} t={t} size={6} />
                  {task.active && <span style={{ fontSize: 11, color: t.focus, fontWeight: 600 }}>· running</span>}
                </div>
              </div>
              {task.active && (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: t.focus, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><I.pause size={14} /></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <TabBar active="tasks" t={t} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────
function ScreenStats({ t, statusOffset = 54 }) {
  const week = [
    { label: 'M', value: 4 }, { label: 'T', value: 6 }, { label: 'W', value: 3 },
    { label: 'T', value: 7 }, { label: 'F', value: 5 }, { label: 'S', value: 2 },
    { label: 'S', value: 5, today: true },
  ];
  const tags = [
    { label: 'Work', value: 8, color: t.focus },
    { label: 'Reading', value: 4, color: t.breakC },
    { label: 'Design', value: 3, color: t.plum },
    { label: 'Personal', value: 1, color: '#A47BB9' },
  ];
  const totalTags = tags.reduce((s, x) => s + x.value, 0);

  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg, color: t.ink,
      fontFamily: FONT_UI, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: `${statusOffset + 14}px 24px 14px` }}>
        <div style={{ fontSize: 12, color: t.mute, fontWeight: 500, marginBottom: 4 }}>Your rhythm</div>
        <h1 style={{
          fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 400,
          margin: 0, letterSpacing: '-0.02em', lineHeight: 1,
        }}>Insights</h1>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Today hero */}
        <div style={{
          borderRadius: 22, padding: '20px 20px 22px',
          background: `linear-gradient(135deg, ${t.plum}, ${t.focus})`,
          color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute', right: -30, top: -30, opacity: 0.18 }}>
            <circle cx="90" cy="90" r="70" fill="#fff" />
            <circle cx="120" cy="60" r="20" fill="#fff" />
          </svg>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.8 }}>Today</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 56, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1 }}>2h 05</span>
              <span style={{ fontSize: 14, opacity: 0.7 }}>focused</span>
            </div>
            <div style={{ display: 'flex', gap: 18, marginTop: 14, fontSize: 12 }}>
              <div>
                <div style={{ opacity: 0.7, fontSize: 11, marginBottom: 2 }}>Sessions</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 400 }}>5</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
              <div>
                <div style={{ opacity: 0.7, fontSize: 11, marginBottom: 2 }}>Streak</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 400, display: 'flex', alignItems: 'center', gap: 4 }}>
                  5 <I.flame size={16} fill="currentColor" stroke={0} />
                </div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
              <div>
                <div style={{ opacity: 0.7, fontSize: 11, marginBottom: 2 }}>Goal</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 400 }}>83%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Week chart */}
        <div style={{
          background: t.surface, borderRadius: 22, padding: '18px 18px 16px',
          boxShadow: `0 1px 0 ${t.line}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>This week</div>
            <div style={{ fontSize: 12, color: t.mute }}>32 sessions · 13h 20m</div>
          </div>
          <BarChart data={week} t={t} height={130} color={t.focus} />
        </div>

        {/* By tag */}
        <div style={{
          background: t.surface, borderRadius: 22, padding: '18px',
          boxShadow: `0 1px 0 ${t.line}`,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Where it went</div>
          {/* stacked bar */}
          <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 14 }}>
            {tags.map((tag, i) => (
              <div key={i} style={{ flex: tag.value, background: tag.color }} />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tags.map((tag, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: tag.color }} />
                <div style={{ flex: 1, fontSize: 13 }}>{tag.label}</div>
                <div style={{ fontSize: 13, color: t.mute }}>{Math.round(tag.value / totalTags * 100)}%</div>
                <div style={{ fontSize: 13, fontWeight: 600, minWidth: 36, textAlign: 'right' }}>{tag.value}h</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div style={{
          background: t.surface, borderRadius: 22, padding: '18px',
          boxShadow: `0 1px 0 ${t.line}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>How you felt</div>
            <div style={{ fontSize: 12, color: t.mute }}>Avg this week</div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {[3, 4, 2, 5, 4, 3, 5].map((v, i) => {
              const colors = [t.focus, t.focusSoft, t.warm, t.breakSoft, t.breakC];
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: colors[v - 1] || t.focusSoft,
                  }} />
                  <div style={{ fontSize: 10, color: t.mute }}>
                    {['M','T','W','T','F','S','S'][i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <TabBar active="stats" t={t} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────
function ScreenSettings({ t, statusOffset = 54, dark = false }) {
  const Toggle = ({ on, accent }) => (
    <div style={{
      width: 42, height: 26, borderRadius: 100, padding: 2,
      background: on ? (accent || t.focus) : t.line,
      display: 'flex', alignItems: 'center', justifyContent: on ? 'flex-end' : 'flex-start',
      transition: 'all .2s',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </div>
  );

  const Row = ({ icon, label, sub, right, last, color = t.ink }) => {
    const Ic = icon;
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px',
        borderBottom: last ? 'none' : `1px solid ${t.line}`,
      }}>
        {Ic && (
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Ic size={17} /></div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 550 }}>{label}</div>
          {sub && <div style={{ fontSize: 12, color: t.mute, marginTop: 2 }}>{sub}</div>}
        </div>
        {right}
      </div>
    );
  };

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: t.mute,
        padding: '0 4px 8px',
      }}>{title}</div>
      <div style={{
        background: t.surface, borderRadius: 16,
        boxShadow: `0 1px 0 ${t.line}`, overflow: 'hidden',
      }}>{children}</div>
    </div>
  );

  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg, color: t.ink,
      fontFamily: FONT_UI, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: `${statusOffset + 14}px 24px 14px` }}>
        <div style={{ fontSize: 12, color: t.mute, fontWeight: 500, marginBottom: 4 }}>Tune the experience</div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 400, margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>Settings</h1>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 20px 20px' }}>

        <Section title="Timer durations">
          <Row icon={I.target} color={t.focus} label="Focus" sub="Time to do deep work"
            right={<div style={{ display: 'flex', alignItems: 'center', gap: 4, color: t.ink, fontWeight: 600, fontSize: 14 }}>25 min <I.chev size={14} color={t.soft} /></div>} />
          <Row icon={I.leaf} color={t.breakC} label="Short break" sub="Between sessions"
            right={<div style={{ display: 'flex', alignItems: 'center', gap: 4, color: t.ink, fontWeight: 600, fontSize: 14 }}>5 min <I.chev size={14} color={t.soft} /></div>} />
          <Row icon={I.moon} color={t.plum} label="Long break" sub="Every 4 sessions" last
            right={<div style={{ display: 'flex', alignItems: 'center', gap: 4, color: t.ink, fontWeight: 600, fontSize: 14 }}>15 min <I.chev size={14} color={t.soft} /></div>} />
        </Section>

        <Section title="Sound & notifications">
          <Row icon={I.bell} color={t.focus} label="Notifications" sub="Session start & end"
            right={<Toggle on={true} />} />
          <Row icon={I.wave} color={t.breakC} label="Ambient sounds"
            right={<div style={{ fontSize: 13, color: t.mute, display: 'flex', alignItems: 'center', gap: 4 }}>Rain · low <I.chev size={14} /></div>} />
          <Row icon={I.zap} color={t.plum} label="Haptic feedback" last
            right={<Toggle on={true} />} />
        </Section>

        <Section title="Appearance">
          <Row icon={dark ? I.moon : I.sun} color={t.focus} label="Theme"
            right={
              <div style={{ display: 'flex', background: t.bg, borderRadius: 100, padding: 3 }}>
                {['Light', 'Dark', 'Auto'].map((m, i) => (
                  <div key={i} style={{
                    padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
                    background: (i === 0 && !dark) || (i === 1 && dark) ? t.surface : 'transparent',
                    color: (i === 0 && !dark) || (i === 1 && dark) ? t.ink : t.mute,
                    boxShadow: (i === 0 && !dark) || (i === 1 && dark) ? `0 1px 2px rgba(0,0,0,0.06)` : 'none',
                  }}>{m}</div>
                ))}
              </div>
            } />
          <Row icon={I.heart} color={t.plum} label="Color palette"
            right={
              <div style={{ display: 'flex', gap: 6 }}>
                {[t.focus, t.plum, t.breakC].map((c, i) => (
                  <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', background: c, boxShadow: i === 0 ? `0 0 0 2px ${t.bg}, 0 0 0 4px ${t.ink}` : 'none' }} />
                ))}
              </div>
            } last />
        </Section>

        <Section title="Focus mode">
          <Row icon={I.shield} color={t.focus} label="Block distractions" sub="Mute notifications during focus" last
            right={<Toggle on={true} />} />
        </Section>

      </div>

      <TabBar active="settings" t={t} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EXTRAS: Mood check-in modal
// ─────────────────────────────────────────────────────────────
function ScreenMoodCheckin({ t, statusOffset = 54 }) {
  const moods = [
    { label: 'Drained', color: t.focus, value: 1 },
    { label: 'Foggy', color: t.focusSoft, value: 2 },
    { label: 'Okay', color: t.warm, value: 3 },
    { label: 'Sharp', color: t.breakSoft, value: 4 },
    { label: 'Flowing', color: t.breakC, value: 5 },
  ];
  return (
    <div style={{
      width: '100%', height: '100%', background: 'rgba(20,10,20,0.55)',
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      fontFamily: FONT_UI, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      paddingTop: statusOffset,
    }}>
      <div style={{
        background: t.bg, borderRadius: '32px 32px 0 0',
        padding: '28px 24px 36px', color: t.ink,
        boxShadow: '0 -20px 60px rgba(0,0,0,0.25)',
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2, background: t.line,
          margin: '0 auto 22px',
        }} />
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: t.focus, marginBottom: 8,
        }}>Before you begin</div>
        <h2 style={{
          fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 400,
          margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.1,
        }}>How's your energy?</h2>
        <p style={{ fontSize: 14, color: t.mute, margin: '0 0 24px' }}>
          A quick check-in helps you notice patterns over time.
        </p>

        {/* Mood scale */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginBottom: 24 }}>
          {moods.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: m.color,
                boxShadow: i === 3 ? `0 0 0 3px ${t.bg}, 0 0 0 5px ${t.ink}` : 'none',
                opacity: i === 3 ? 1 : 0.7,
              }} />
              <div style={{ fontSize: 11, fontWeight: i === 3 ? 600 : 500, color: i === 3 ? t.ink : t.mute }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div style={{
          background: t.surface, borderRadius: 14, padding: '12px 14px',
          fontSize: 13, color: t.mute, marginBottom: 24,
          boxShadow: `0 1px 0 ${t.line}`,
        }}>
          <span style={{ color: t.ink }}>Note (optional)</span> · slept well, lots of coffee
        </div>

        <PillBtn t={t} primary size="lg" style={{ width: '100%' }}>
          Start 25-minute focus
        </PillBtn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EXTRAS: Ambient sounds picker
// ─────────────────────────────────────────────────────────────
function ScreenAmbient({ t, statusOffset = 54 }) {
  const sounds = [
    { label: 'Rain', sub: 'Soft afternoon shower', icon: I.rain, color: t.breakC, playing: true, level: 0.55 },
    { label: 'Café', sub: 'Distant chatter, espresso machine', icon: I.cafe, color: t.focus },
    { label: 'White noise', sub: 'Steady, neutral hum', icon: I.wave, color: t.plum },
    { label: 'Forest', sub: 'Birds, leaves, faraway brook', icon: I.leaf, color: t.breakC },
    { label: 'Fireplace', sub: 'Crackling embers', icon: I.fire, color: t.focus },
    { label: 'Brown noise', sub: 'Deep, low-frequency calm', icon: I.wave, color: t.plum },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.ink, fontFamily: FONT_UI, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: `${statusOffset + 14}px 24px 14px`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 1px 0 ${t.line}` }}>
          <I.chevL size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: t.mute, fontWeight: 500 }}>Ambient sounds</div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 400, margin: 0, letterSpacing: '-0.01em' }}>Pick a backdrop</h1>
        </div>
      </div>

      {/* Now playing card */}
      <div style={{ padding: '0 20px 12px' }}>
        <div style={{
          borderRadius: 22, padding: '20px',
          background: `linear-gradient(135deg, ${t.breakC}, ${t.plum})`,
          color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', right: -20, bottom: -30, opacity: 0.2 }}>
            <path d="M 0 60 Q 30 30 60 60 T 120 60" fill="none" stroke="#fff" strokeWidth="3" />
            <path d="M 0 80 Q 30 50 60 80 T 120 80" fill="none" stroke="#fff" strokeWidth="3" />
          </svg>
          <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Now playing</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 400, letterSpacing: '-0.01em', marginBottom: 14 }}>Soft afternoon rain</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.25)' }}>
              <div style={{ width: '55%', height: '100%', background: '#fff', borderRadius: 2 }} />
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', color: t.plum, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <I.pause size={16} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 20px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.mute, padding: '0 4px 10px' }}>All sounds</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sounds.map((s, i) => {
            const Ic = s.icon;
            return (
              <div key={i} style={{
                background: t.surface, borderRadius: 16, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: s.playing ? `0 0 0 1.5px ${s.color}` : `0 1px 0 ${t.line}`,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: `${s.color}20`, color: s.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><Ic size={20} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: t.mute }}>{s.sub}</div>
                </div>
                {s.playing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {[10, 16, 12, 20, 8].map((h, j) => (
                      <div key={j} style={{ width: 3, height: h, borderRadius: 2, background: s.color }} />
                    ))}
                  </div>
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.bg, color: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <I.play size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EXTRAS: Focus mode (full-bleed, blocks distractions)
// ─────────────────────────────────────────────────────────────
function ScreenFocusMode({ t, statusOffset = 54 }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: t.plum, color: t.bg,
      fontFamily: FONT_UI, display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <svg width="100%" height="100%" viewBox="0 0 360 700" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="fglow" cx="0.5" cy="0.5">
            <stop offset="0%" stopColor={t.focus} stopOpacity="0.6" />
            <stop offset="100%" stopColor={t.focus} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="180" cy="350" r="320" fill="url(#fglow)" />
      </svg>

      <div style={{ position: 'relative', padding: `${statusOffset + 14}px 24px 0`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' }}>
          <I.shield size={14} /> FOCUS MODE
        </div>
        <I.x size={22} color={t.bg} />
      </div>

      <div style={{ flex: 1, position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
        <BlobTimer size={260} progress={0.42} isBreak={false} t={{ ...t, surfaceAlt: 'rgba(255,255,255,0.06)', line: 'rgba(255,255,255,0.12)', focus: t.focus, focusSoft: t.focusSoft }} paused={false} seed={11} />
        <div style={{ marginTop: -200, fontFamily: FONT_DISPLAY, fontSize: 72, fontWeight: 400, letterSpacing: '-0.03em' }}>
          14:28
        </div>
        <div style={{ marginTop: 188 + 24, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.focusSoft, marginBottom: 8 }}>
            Outline Q3 narrative
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontStyle: 'italic', opacity: 0.7, maxWidth: 240, margin: '0 auto', lineHeight: 1.4 }}>
            "The world is silent.<br/>Your work is loud."
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: '0 24px 36px', display: 'flex', justifyContent: 'center', gap: 14, alignItems: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <I.wave size={20} color={t.bg} />
        </div>
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: t.focus, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 40px ${t.focus}80`, color: '#fff' }}>
          <I.pause size={26} />
        </div>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <I.skip size={20} color={t.bg} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EXTRAS: Add task sheet
// ─────────────────────────────────────────────────────────────
function ScreenAddTask({ t, statusOffset = 54 }) {
  const tags = [
    { label: 'Work', color: t.focus, on: true },
    { label: 'Reading', color: t.breakC },
    { label: 'Design', color: t.plum },
    { label: 'Personal', color: '#A47BB9' },
  ];
  return (
    <div style={{
      width: '100%', height: '100%', background: 'rgba(20,10,20,0.45)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      fontFamily: FONT_UI, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      paddingTop: statusOffset,
    }}>
      <div style={{ background: t.bg, borderRadius: '28px 28px 0 0', padding: '20px 24px 32px', color: t.ink, boxShadow: '0 -20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: t.line, margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 14, color: t.mute }}>Cancel</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 400 }}>New task</div>
          <div style={{ fontSize: 14, color: t.focus, fontWeight: 600 }}>Add</div>
        </div>

        <div style={{ background: t.surface, borderRadius: 14, padding: '14px 16px', marginBottom: 14, boxShadow: `0 1px 0 ${t.line}` }}>
          <div style={{ fontSize: 11, color: t.mute, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Title</div>
          <div style={{ fontSize: 16, fontWeight: 550 }}>Outline Q3 product narrative<span style={{ color: t.focus, fontWeight: 400 }}>|</span></div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, background: t.surface, borderRadius: 14, padding: '14px 16px', boxShadow: `0 1px 0 ${t.line}` }}>
            <div style={{ fontSize: 11, color: t.mute, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Tomatoes</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 400 }}>3</div>
              <TomatoDots done={3} total={3} t={t} size={9} />
            </div>
          </div>
          <div style={{ flex: 1, background: t.surface, borderRadius: 14, padding: '14px 16px', boxShadow: `0 1px 0 ${t.line}` }}>
            <div style={{ fontSize: 11, color: t.mute, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Due</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Today, 4:00pm</div>
          </div>
        </div>

        <div style={{ background: t.surface, borderRadius: 14, padding: '14px 16px', marginBottom: 14, boxShadow: `0 1px 0 ${t.line}` }}>
          <div style={{ fontSize: 11, color: t.mute, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Tag</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tags.map((tag, i) => (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 100, fontSize: 13, fontWeight: 550,
                background: tag.on ? `${tag.color}20` : t.bg,
                color: tag.on ? tag.color : t.mute,
                boxShadow: tag.on ? `inset 0 0 0 1.5px ${tag.color}` : 'none',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: tag.color }} />
                {tag.label}
              </div>
            ))}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 12px', borderRadius: 100, fontSize: 13, color: t.mute, background: t.bg }}>
              <I.plus size={12} /> New
            </div>
          </div>
        </div>

        <PillBtn t={t} primary size="lg" style={{ width: '100%' }}>Add to today</PillBtn>
      </div>
    </div>
  );
}

Object.assign(window, {
  ScreenTimer, ScreenTasks, ScreenStats, ScreenSettings,
  ScreenMoodCheckin, ScreenAmbient, ScreenFocusMode, ScreenAddTask,
});
