const SESSION_DECLINE_THRESHOLD = 0.4; // 40% drop week-over-week
const MOOD_DECLINE_THRESHOLD = 0.8;    // avg mood drop > 0.8 points
const DISTRACTION_SPIKE_THRESHOLD = 0.5; // distraction rate increase > 50%
const HARD_RATING_THRESHOLD = 0.5;     // >50% of recent notes rated 'hard' or 'okay'

function getWeekSessions(sessionHistory, weeksAgo = 0) {
  const now = new Date();
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (weeksAgo * 7 + i));
    const key = d.toISOString().split('T')[0];
    total += sessionHistory[key] || 0;
  }
  return total;
}

function getWeekMoodAvg(moodHistory, weeksAgo = 0) {
  const now = new Date();
  const values = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (weeksAgo * 7 + i));
    const key = d.toISOString().split('T')[0];
    if (moodHistory[key]?.value) values.push(moodHistory[key].value);
  }
  if (values.length === 0) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function computeBurnoutRisk({ sessionHistory, moodHistory, distractionLog, sessionNotes }) {
  const signals = [];
  let score = 0;

  // 1 — Session decline
  const thisWeek = getWeekSessions(sessionHistory, 0);
  const lastWeek = getWeekSessions(sessionHistory, 1);
  if (lastWeek > 3 && thisWeek < lastWeek * (1 - SESSION_DECLINE_THRESHOLD)) {
    const dropPct = Math.round((1 - thisWeek / lastWeek) * 100);
    signals.push({ text: `Sessions down ${dropPct}% from last week`, severity: 'high' });
    score += 35;
  } else if (lastWeek > 0 && thisWeek < lastWeek * 0.75) {
    signals.push({ text: 'Fewer sessions than last week', severity: 'medium' });
    score += 20;
  }

  // 2 — Mood decline
  const moodNow = getWeekMoodAvg(moodHistory, 0);
  const moodLast = getWeekMoodAvg(moodHistory, 1);
  if (moodNow != null && moodLast != null && moodLast - moodNow > MOOD_DECLINE_THRESHOLD) {
    signals.push({ text: `Mood average dropped from ${moodLast.toFixed(1)} → ${moodNow.toFixed(1)}`, severity: 'high' });
    score += 30;
  } else if (moodNow != null && moodNow <= 2) {
    signals.push({ text: 'Low mood average this week', severity: 'medium' });
    score += 15;
  }

  // 3 — Distraction spike
  const cutoff7 = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const cutoff14 = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const recentD = distractionLog.filter((d) => d.timestamp >= cutoff7).length;
  const prevD = distractionLog.filter((d) => d.timestamp >= cutoff14 && d.timestamp < cutoff7).length;
  if (prevD > 2 && recentD > prevD * (1 + DISTRACTION_SPIKE_THRESHOLD)) {
    signals.push({ text: `Distractions up ${Math.round((recentD / prevD - 1) * 100)}% this week`, severity: 'medium' });
    score += 20;
  }

  // 4 — Poor session ratings
  const recentNotes = sessionNotes.filter((n) => n.ts >= cutoff7);
  if (recentNotes.length >= 3) {
    const hardCount = recentNotes.filter((n) => n.rating === 'hard' || n.rating === 'okay').length;
    const rate = hardCount / recentNotes.length;
    if (rate >= HARD_RATING_THRESHOLD) {
      signals.push({ text: `${Math.round(rate * 100)}% of recent sessions felt hard`, severity: 'medium' });
      score += 15;
    }
  }

  const risk = score >= 50 ? 'high' : score >= 25 ? 'medium' : 'low';

  const suggestions = [];
  if (risk !== 'low') {
    if (score >= 50) {
      suggestions.push('Take a proper rest day — one day off protects the whole week.');
      suggestions.push('Try 15-minute sessions instead of full Pomodoros this week.');
    } else {
      suggestions.push('Cut your daily session goal by half today.');
      suggestions.push('End the day 30 minutes earlier than planned.');
    }
    if (recentD > 5) suggestions.push('Identify your top distraction and remove it for one session.');
    if (moodNow != null && moodNow <= 2) suggestions.push('Low mood + work is a bad combo. Consider a walk first.');
  }

  return { risk, score, signals, suggestions };
}
