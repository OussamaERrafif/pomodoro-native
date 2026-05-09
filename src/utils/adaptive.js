// Returns a session duration suggestion based on energy, mood, and time-of-day data.
// Returns null when there's not enough data for a confident suggestion.

export function getSuggestedDuration({
  focusDuration,
  energyHistory = {},
  moodHistory = {},
  sessionLog = [],
}) {
  const todayKey = new Date().toISOString().split('T')[0];
  const energy = energyHistory[todayKey] ?? null; // 1=Low 2=Medium 3=High
  const mood = moodHistory[todayKey]?.value ?? null; // 1-5

  // Need at least one data point today to give a suggestion
  if (energy == null && mood == null) return null;

  let delta = 0;
  const reasons = [];

  // Energy-based adjustment
  if (energy === 1) {
    delta -= 10;
    reasons.push('low energy today');
  } else if (energy === 3) {
    delta += 5;
    reasons.push('high energy today');
  }

  // Mood-based fine-tuning
  if (mood != null && mood <= 2) {
    delta -= 5;
    reasons.push('low mood');
  } else if (mood != null && mood >= 4) {
    delta += 5;
    reasons.push('great mood');
  }

  // Time-of-day: if we have enough session data, shorten during off-peak
  const now = new Date().getHours();
  if (sessionLog.length >= 10) {
    const hourBins = Array(24).fill(0);
    sessionLog.forEach(({ ts }) => { hourBins[new Date(ts).getHours()]++; });
    const peakHour = hourBins.indexOf(Math.max(...hourBins));
    const distFromPeak = Math.abs(now - peakHour);
    if (distFromPeak >= 4) {
      delta -= 5;
      reasons.push('off your peak hours');
    }
  }

  if (delta === 0) return null;

  const suggested = Math.min(60, Math.max(10, focusDuration + delta));
  if (suggested === focusDuration) return null;

  const direction = suggested > focusDuration ? 'up' : 'down';
  const reasonStr = reasons.slice(0, 2).join(' & ');

  return {
    duration: suggested,
    direction,
    reason: `${direction === 'up' ? 'Push' : 'Ease'} to ${suggested}m — ${reasonStr}`,
  };
}
