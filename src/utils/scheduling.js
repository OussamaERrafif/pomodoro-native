const HOUR_LABELS = [
  '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM',
  '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
  '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM',
  '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM',
];

export function getBestFocusHours(sessionLog) {
  if (sessionLog.length < 5) return null;

  const bins = Array(24).fill(0);
  sessionLog.forEach(({ ts }) => {
    const h = new Date(ts).getHours();
    bins[h]++;
  });

  // Find the 2-hour window with highest sum
  let bestStart = 9;
  let bestCount = 0;
  for (let h = 0; h < 23; h++) {
    const count = bins[h] + bins[h + 1];
    if (count > bestCount) {
      bestCount = count;
      bestStart = h;
    }
  }

  if (bestCount === 0) return null;
  return {
    startHour: bestStart,
    endHour: bestStart + 2,
    label: `${HOUR_LABELS[bestStart]} – ${HOUR_LABELS[bestStart + 2]}`,
    sessionCount: bestCount,
  };
}

export function getNextTask(tasks) {
  const incomplete = tasks.filter((t) => !t.complete);
  if (incomplete.length === 0) return null;

  const scored = incomplete.map((t) => {
    const ratio = t.total > 0 ? t.done / t.total : 0;
    let score = 0;
    let reason = '';

    if (ratio >= 0.66) {
      score += 50;
      reason = `${Math.round(ratio * 100)}% done — finish strong.`;
    } else if (ratio >= 0.33) {
      score += 30;
      reason = 'Good momentum — keep going.';
    } else if (t.done > 0) {
      score += 15;
      reason = 'Already started — build on it.';
    }

    if (t.total <= 2) {
      score += 18;
      if (!reason) reason = 'Quick win — clear it fast.';
    }

    if (t.active) {
      score += 22;
      if (!reason) reason = 'Currently in progress.';
    }

    if (!reason) reason = 'Up next in your queue.';

    return { ...t, score, reason };
  });

  return scored.sort((a, b) => b.score - a.score)[0];
}

export function getTodayPlan({ todaySessions, focusGoal, sessionLog }) {
  const sessionsLeft = Math.max(0, focusGoal - todaySessions);
  const minutesLeft = sessionsLeft * 25;
  const bestWindow = getBestFocusHours(sessionLog);
  const now = new Date().getHours();
  const isInBestWindow = bestWindow
    ? now >= bestWindow.startHour && now < bestWindow.endHour
    : false;

  return { sessionsLeft, minutesLeft, bestWindow, isInBestWindow };
}
