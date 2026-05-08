import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_TASKS = [
  {
    id: '1', title: 'Outline Q3 product narrative', tag: 'Work',
    tagColorKey: 'focus', done: 1, total: 3, active: true, complete: false,
    createdAt: Date.now(),
  },
  {
    id: '2', title: 'Read Deep Work — chapter 4', tag: 'Reading',
    tagColorKey: 'breakC', done: 1, total: 2, active: false, complete: false,
    createdAt: Date.now(),
  },
  {
    id: '3', title: 'Sketch onboarding mood board', tag: 'Design',
    tagColorKey: 'plum', done: 0, total: 2, active: false, complete: false,
    createdAt: Date.now(),
  },
  {
    id: '4', title: 'Process inbox & ship replies', tag: 'Work',
    tagColorKey: 'focus', done: 0, total: 1, active: false, complete: false,
    createdAt: Date.now(),
  },
];

const DEFAULT_HISTORY = {};

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Onboarding ──────────────────────────────────────────
      hasCompletedOnboarding: false,
      userName: 'Maya',

      completeOnboarding: (name) =>
        set({ hasCompletedOnboarding: true, userName: name || 'Maya' }),

      // ── Settings ─────────────────────────────────────────────
      palette: 'sunset',
      darkMode: false,
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
      notifications: true,
      haptics: true,
      ambientSound: 'none',
      ambientVolume: 0.7,
      focusGoal: 8,
      selectedGoals: ['Study', 'Work', 'Reading'],

      setDarkMode: (darkMode) => set({ darkMode }),
      setPalette: (palette) => set({ palette }),
      setFocusDuration: (v) => set({ focusDuration: v }),
      setShortBreakDuration: (v) => set({ shortBreakDuration: v }),
      setLongBreakDuration: (v) => set({ longBreakDuration: v }),
      setSessionsBeforeLongBreak: (v) => set({ sessionsBeforeLongBreak: v }),
      setNotifications: (v) => set({ notifications: v }),
      setHaptics: (v) => set({ haptics: v }),
      setAmbientSound: (v) => set({ ambientSound: v }),
      setAmbientVolume: (v) => set({ ambientVolume: v }),
      setFocusGoal: (v) => set({ focusGoal: v }),
      setSelectedGoals: (v) => set({ selectedGoals: v }),
      setUserName: (v) => set({ userName: v }),

      openAIKey: '',
      setOpenAIKey: (v) => set({ openAIKey: v }),

      // ── Timer ─────────────────────────────────────────────────
      secondsLeft: 25 * 60,
      isRunning: false,
      isBreak: false,
      sessionCount: 0,
      currentTaskId: '1',
      todaySessions: 0,

      startTimer: () => set({ isRunning: true }),
      pauseTimer: () => set({ isRunning: false }),

      resetTimer: () => {
        const { isBreak, focusDuration, shortBreakDuration } = get();
        const total = isBreak ? shortBreakDuration : focusDuration;
        set({ secondsLeft: total * 60, isRunning: false });
      },

      tickTimer: () => set((s) => ({ secondsLeft: Math.max(0, s.secondsLeft - 1) })),

      completeSession: () => {
        const {
          isBreak, sessionCount, sessionsBeforeLongBreak,
          focusDuration, shortBreakDuration, longBreakDuration,
          todaySessions, sessionHistory, currentTaskId, tasks,
        } = get();

        if (!isBreak) {
          const newCount = sessionCount + 1;
          const isLongBreak = newCount % sessionsBeforeLongBreak === 0;
          const breakSecs = (isLongBreak ? longBreakDuration : shortBreakDuration) * 60;
          const today = new Date().toISOString().split('T')[0];
          const newHistory = { ...sessionHistory, [today]: (sessionHistory[today] || 0) + 1 };

          // Increment done count for current task
          const updatedTasks = tasks.map((t) =>
            t.id === currentTaskId && t.done < t.total
              ? { ...t, done: t.done + 1, complete: t.done + 1 >= t.total }
              : t
          );

          set({
            isBreak: true,
            sessionCount: newCount,
            secondsLeft: breakSecs,
            isRunning: false,
            todaySessions: todaySessions + 1,
            sessionHistory: newHistory,
            tasks: updatedTasks,
          });
        } else {
          set({
            isBreak: false,
            secondsLeft: focusDuration * 60,
            isRunning: false,
          });
        }
      },

      skipSession: () => {
        const {
          isBreak, sessionCount, sessionsBeforeLongBreak,
          focusDuration, shortBreakDuration, longBreakDuration,
        } = get();
        if (!isBreak) {
          const newCount = sessionCount + 1;
          const isLongBreak = newCount % sessionsBeforeLongBreak === 0;
          set({
            isBreak: true,
            sessionCount: newCount,
            secondsLeft: (isLongBreak ? longBreakDuration : shortBreakDuration) * 60,
            isRunning: false,
          });
        } else {
          set({ isBreak: false, secondsLeft: focusDuration * 60, isRunning: false });
        }
      },

      setCurrentTask: (id) => set({ currentTaskId: id }),

      // ── Tasks ─────────────────────────────────────────────────
      tasks: DEFAULT_TASKS,

      addTask: (task) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              ...task,
              id: Date.now().toString(),
              done: 0,
              complete: false,
              active: false,
              createdAt: Date.now(),
            },
          ],
        })),

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, complete: !t.complete, active: false } : t
          ),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      setTaskActive: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => ({ ...t, active: t.id === id })),
          currentTaskId: id,
        })),

      // ── Stats ─────────────────────────────────────────────────
      sessionHistory: DEFAULT_HISTORY,
      moodHistory: {},
      distractionLog: [],

      logDistraction: (reason) =>
        set((s) => ({
          distractionLog: [
            ...s.distractionLog,
            { id: Date.now().toString(), reason, timestamp: Date.now() },
          ],
        })),

      logMood: (value, note) => {
        const today = new Date().toISOString().split('T')[0];
        set((s) => ({
          moodHistory: { ...s.moodHistory, [today]: { value, note } },
        }));
      },
    }),
    {
      name: 'tomato-app-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        hasCompletedOnboarding: s.hasCompletedOnboarding,
        userName: s.userName,
        palette: s.palette,
        darkMode: s.darkMode,
        focusDuration: s.focusDuration,
        shortBreakDuration: s.shortBreakDuration,
        longBreakDuration: s.longBreakDuration,
        sessionsBeforeLongBreak: s.sessionsBeforeLongBreak,
        notifications: s.notifications,
        haptics: s.haptics,
        ambientSound: s.ambientSound,
        ambientVolume: s.ambientVolume,
        focusGoal: s.focusGoal,
        selectedGoals: s.selectedGoals,
        tasks: s.tasks,
        sessionHistory: s.sessionHistory,
        moodHistory: s.moodHistory,
        distractionLog: s.distractionLog,
        todaySessions: s.todaySessions,
        openAIKey: s.openAIKey,
      }),
    }
  )
);
