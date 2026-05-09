const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function getBestWeekday(sessionHistory) {
  const totals = Array(7).fill(0);
  const counts = Array(7).fill(0);
  Object.entries(sessionHistory).forEach(([dateKey, sessions]) => {
    if (sessions > 0) {
      // new Date('YYYY-MM-DD') parses in UTC; adjust for local midnight
      const d = new Date(`${dateKey}T00:00:00`);
      const dow = d.getDay();
      totals[dow] += sessions;
      counts[dow]++;
    }
  });
  const avgs = totals.map((t, i) => (counts[i] > 0 ? t / counts[i] : 0));
  const maxIdx = avgs.indexOf(Math.max(...avgs));
  return {
    dayName: DAY_NAMES[maxIdx],
    dayShort: DAY_SHORT[maxIdx],
    dayIndex: maxIdx,
    avg: avgs[maxIdx],
    avgs,
    hasData: counts.some((c) => c > 0),
  };
}

export function getMoodCorrelation(sessionHistory, moodHistory) {
  const highSessions = [];
  const lowSessions = [];
  Object.keys(sessionHistory).forEach((date) => {
    const mood = moodHistory[date]?.value;
    const sessions = sessionHistory[date] || 0;
    if (mood == null) return;
    if (mood >= 4) highSessions.push(sessions);
    else if (mood <= 2) lowSessions.push(sessions);
  });
  const avg = (arr) =>
    arr.length ? Math.round((arr.reduce((s, n) => s + n, 0) / arr.length) * 10) / 10 : null;
  return {
    highMoodAvg: avg(highSessions),
    lowMoodAvg: avg(lowSessions),
    highCount: highSessions.length,
    lowCount: lowSessions.length,
  };
}

export function getDistractionPeakTime(distractionLog) {
  if (distractionLog.length === 0) return null;
  const bins = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
  distractionLog.forEach(({ timestamp }) => {
    const h = new Date(timestamp).getHours();
    if (h >= 5 && h < 12) bins.Morning++;
    else if (h >= 12 && h < 17) bins.Afternoon++;
    else if (h >= 17 && h < 22) bins.Evening++;
    else bins.Night++;
  });
  const peak = Object.entries(bins).sort((a, b) => b[1] - a[1])[0];
  return { label: peak[0], count: peak[1], bins };
}

export function getTagInsight(tasks) {
  const stats = {};
  tasks.forEach((t) => {
    if (!stats[t.tag]) stats[t.tag] = { done: 0, total: 0, colorKey: t.tagColorKey, color: t.tagColor };
    stats[t.tag].done += t.done;
    stats[t.tag].total += t.total;
  });
  const entries = Object.entries(stats)
    .filter(([, s]) => s.total > 0)
    .map(([tag, s]) => ({ tag, rate: s.done / s.total, done: s.done, ...s }))
    .sort((a, b) => b.done - a.done);
  return entries[0] || null;
}
