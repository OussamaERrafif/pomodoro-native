import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useAppStore } from '../store';
import { scheduleSmartNotifications } from '../utils/notifications';
import { getBestFocusHours } from '../utils/scheduling';
import { computeStreak } from '../utils/time';

export function useSmartNotifications() {
  const smartNotifications = useAppStore((s) => s.smartNotifications);
  const notifications = useAppStore((s) => s.notifications);
  const sessionLog = useAppStore((s) => s.sessionLog);
  const sessionHistory = useAppStore((s) => s.sessionHistory);
  const todaySessions = useAppStore((s) => s.todaySessions);
  const focusGoal = useAppStore((s) => s.focusGoal);

  const schedule = () => {
    const streak = computeStreak(sessionHistory);
    const bestWindow = getBestFocusHours(sessionLog);
    scheduleSmartNotifications({
      enabled: smartNotifications,
      notifications,
      bestWindow,
      streak,
      todaySessions,
      focusGoal,
      sessionHistory,
    });
  };

  // Reschedule whenever relevant state changes
  useEffect(() => {
    schedule();
  }, [smartNotifications, notifications, todaySessions, focusGoal, sessionLog.length]);

  // Reschedule when app comes back to foreground (catches new day, etc.)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') schedule();
    });
    return () => sub.remove();
  }, [smartNotifications, notifications, todaySessions, focusGoal, sessionLog.length]);
}
