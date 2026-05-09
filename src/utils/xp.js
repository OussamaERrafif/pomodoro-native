const LEVELS = [
  { level: 1,  min: 0,    title: 'Seedling',           icon: '🌱' },
  { level: 2,  min: 100,  title: 'Focused',             icon: '🎯' },
  { level: 3,  min: 300,  title: 'Consistent',          icon: '🔄' },
  { level: 4,  min: 600,  title: 'Flow Seeker',         icon: '💫' },
  { level: 5,  min: 1000, title: 'Deep Worker',         icon: '🔥' },
  { level: 6,  min: 1500, title: 'Focus Pro',           icon: '⚡' },
  { level: 7,  min: 2100, title: 'Momentum',            icon: '🌊' },
  { level: 8,  min: 2800, title: 'Peak Performer',      icon: '🏆' },
  { level: 9,  min: 3600, title: 'Flow Master',         icon: '🎖️' },
  { level: 10, min: 4500, title: 'Deep Focus Legend',   icon: '🌟' },
];

// 10 XP per session, 50 XP per achievement
export function computeXP(sessionHistory, unlockedAchievements = []) {
  const sessionXP = Object.values(sessionHistory).reduce((s, n) => s + n, 0) * 10;
  const achievementXP = unlockedAchievements.length * 50;
  return sessionXP + achievementXP;
}

export function getLevelInfo(xp) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.min) current = l;
    else break;
  }
  const next = LEVELS[current.level] ?? null; // current.level is 1-based → next index
  const progress = next ? (xp - current.min) / (next.min - current.min) : 1;
  return {
    ...current,
    xp,
    nextMin: next?.min ?? null,
    nextTitle: next?.title ?? null,
    progress: Math.min(1, progress),
    xpToNext: next ? next.min - xp : 0,
  };
}
