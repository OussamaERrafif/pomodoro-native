export function computeFocusScore({ todaySessions, focusGoal, todayMood, sessionHistory }) {
  const sessionPts = Math.round(Math.min(todaySessions / Math.max(focusGoal, 1), 1) * 40);

  const moodPts = todayMood ? Math.round(((todayMood - 1) / 4) * 30) : 0;

  const today = new Date();
  let activeDays = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if ((sessionHistory[key] || 0) > 0) activeDays++;
  }
  const consistencyPts = Math.round((activeDays / 7) * 30);

  const total = sessionPts + moodPts + consistencyPts;
  return { total, sessionPts, moodPts, consistencyPts };
}

export function scoreLabel(total) {
  if (total >= 90) return 'Elite';
  if (total >= 75) return 'On fire';
  if (total >= 60) return 'Solid';
  if (total >= 40) return 'Building';
  return 'Rest day';
}
