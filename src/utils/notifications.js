import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// appOwnership was deprecated in SDK 46 and is unreliable in SDK 53+
const isExpoGo =
  Constants.executionEnvironment === 'storeClient' ||
  Constants.appOwnership === 'expo' ||
  !Constants.executionEnvironment;

const IDS = {
  PEAK: 'smart-peak-v1',
  GOAL: 'smart-goal-v1',
  STREAK: 'smart-streak-v1',
};

export async function cancelSmartNotifications() {
  if (isExpoGo) return;
  for (const id of Object.values(IDS)) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  }
}

export async function scheduleSmartNotifications({
  enabled,
  notifications,
  bestWindow,
  streak,
  todaySessions,
  focusGoal,
  sessionHistory,
}) {
  await cancelSmartNotifications();
  if (!enabled || !notifications || isExpoGo) return;

  const now = new Date();
  const todayKey = now.toISOString().split('T')[0];
  const todayCount = sessionHistory[todayKey] || 0;
  const sessionsLeft = Math.max(0, focusGoal - todaySessions);

  // Daily peak focus reminder
  if (bestWindow) {
    await Notifications.scheduleNotificationAsync({
      identifier: IDS.PEAK,
      content: {
        title: '⚡ Peak focus window',
        body: `Your most productive time is now (${bestWindow.label}). Make it count.`,
        sound: false,
      },
      trigger: { hour: bestWindow.startHour, minute: 0, repeats: true },
    }).catch(() => {});
  }

  // Tonight goal nudge at 7 PM — only if goal not yet reached
  if (sessionsLeft > 0) {
    const goalTime = new Date(now);
    goalTime.setHours(19, 0, 0, 0);
    if (goalTime > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: IDS.GOAL,
        content: {
          title: '🎯 Goal check-in',
          body: `${sessionsLeft} session${sessionsLeft !== 1 ? 's' : ''} left to hit your daily goal. You've got this.`,
          sound: false,
        },
        trigger: { date: goalTime },
      }).catch(() => {});
    }
  }

  // Tonight streak guardian at 9 PM — only if no sessions today and streak > 0
  if (todayCount === 0 && streak > 0) {
    const streakTime = new Date(now);
    streakTime.setHours(21, 0, 0, 0);
    if (streakTime > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: IDS.STREAK,
        content: {
          title: '🔥 Streak at risk',
          body: `Don't break your ${streak}-day streak! One session is all it takes.`,
          sound: false,
        },
        trigger: { date: streakTime },
      }).catch(() => {});
    }
  }
}
