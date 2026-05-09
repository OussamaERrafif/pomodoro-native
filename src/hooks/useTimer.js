import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAppStore } from '../store';

// expo-notifications requires a development build — it does not work in Expo Go
// (Android push notifications removed from Expo Go in SDK 53).
// Use: npx expo run:android / npx expo run:ios
const isExpoGo =
  Constants.executionEnvironment === 'storeClient' ||
  Constants.appOwnership === 'expo';

async function scheduleCompletionNotification(isBreak) {
  if (isExpoGo) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: isBreak ? '☕ Break over!' : '🍅 Focus session complete!',
        body: isBreak ? 'Ready to focus again?' : 'Time for a well-earned break.',
        sound: true,
      },
      trigger: null,
    });
  } catch (_) {}
}

export function useTimer() {
  const isRunning = useAppStore((s) => s.isRunning);
  const haptics = useAppStore((s) => s.haptics);
  const notifications = useAppStore((s) => s.notifications);
  const intervalRef = useRef(null);
  const backgroundTimeRef = useRef(null);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const state = useAppStore.getState();
      if (state.secondsLeft <= 1) {
        clearInterval(intervalRef.current);
        if (haptics) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
        if (notifications && !isExpoGo) {
          scheduleCompletionNotification(state.isBreak);
        }
        state.completeSession();
      } else {
        state.tickTimer();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, haptics, notifications]);

  // Handle app going to background — sync timer on return
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        backgroundTimeRef.current = Date.now();
      } else if (nextState === 'active' && backgroundTimeRef.current) {
        const elapsed = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
        backgroundTimeRef.current = null;
        const state = useAppStore.getState();
        if (state.isRunning && elapsed > 0) {
          const remaining = Math.max(0, state.secondsLeft - elapsed);
          if (remaining <= 0) {
            if (haptics) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            }
            state.completeSession();
          } else {
            useAppStore.setState({ secondsLeft: remaining });
          }
        }
      }
    });
    return () => sub.remove();
  }, [haptics]);
}
