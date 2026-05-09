import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { computeUnlocked, getTotalPomodoros } from '../utils/achievements';
import { computeStreak } from '../utils/time';
import { FOCUS_SPACES } from '../constants/tokens';

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
      themeMode: 'light', // 'light' | 'dark' | 'auto'
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
      setThemeMode: (v) => set({ themeMode: v }),
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

      aiEnabled: true,
      setAiEnabled: (v) => set({ aiEnabled: v }),

      deepWorkMode: false,
      setDeepWorkMode: (v) => set({ deepWorkMode: v }),

      quickStartMode: false,
      setQuickStartMode: (v) => set({ quickStartMode: v }),

      activeSpace: null, // id of active focus space, or null for custom
      applySpace: (id) => {
        const space = FOCUS_SPACES.find((s) => s.id === id);
        if (!space) return;
        set({
          activeSpace: id,
          focusDuration: space.focusDuration,
          shortBreakDuration: space.shortBreak,
          longBreakDuration: space.longBreak,
          ambientSound: space.sound,
          palette: space.palette,
          secondsLeft: space.focusDuration * 60,
        });
      },

      smartNotifications: true,
      setSmartNotifications: (v) => set({ smartNotifications: v }),

      ritualEnabled: false,
      ritualType: 'breathe', // 'breathe' | 'intention'
      setRitualEnabled: (v) => set({ ritualEnabled: v }),
      setRitualType: (v) => set({ ritualType: v }),

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
        const { isBreak, sessionCount, sessionsBeforeLongBreak, focusDuration, shortBreakDuration, longBreakDuration } = get();
        let total;
        if (!isBreak) {
          total = focusDuration;
        } else {
          total = sessionCount % sessionsBeforeLongBreak === 0 ? longBreakDuration : shortBreakDuration;
        }
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

          const currentTask2 = tasks.find((t) => t.id === currentTaskId);
          const pendingNote = currentTask2
            ? { taskId: currentTask2.id, taskTitle: currentTask2.title, tag: currentTask2.tag }
            : { taskId: null, taskTitle: null, tag: null };
          const newSessionLog = [
            ...get().sessionLog,
            { ts: Date.now(), tag: currentTask2?.tag || null },
          ].slice(-500); // cap to avoid unbounded growth

          set({
            isBreak: true,
            sessionCount: newCount,
            secondsLeft: breakSecs,
            isRunning: false,
            todaySessions: todaySessions + 1,
            sessionHistory: newHistory,
            tasks: updatedTasks,
            sessionLog: newSessionLog,
            pendingSessionNote: pendingNote,
          });
          get().checkAchievements();
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
              id: crypto.randomUUID(),
              done: 0,
              complete: false,
              active: false,
              createdAt: Date.now(),
            },
          ],
        })),

      addTasks: (taskList) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            ...taskList.map((task) => ({
              ...task,
              id: crypto.randomUUID(),
              done: 0,
              complete: false,
              active: false,
              createdAt: Date.now(),
            })),
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

      updateTask: (id, changes) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...changes } : t)),
        })),

      toggleSubtask: (taskId, subtaskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: (t.subtasks || []).map((st) =>
                    st.id === subtaskId ? { ...st, done: !st.done } : st
                  ),
                }
              : t
          ),
        })),

      // ── Session Notes ────────────────────────────────────────
      sessionNotes: [],
      pendingSessionNote: null, // {taskId, taskTitle, tag} or null

      addSessionNote: ({ taskId, taskTitle, tag, rating, completed, blockers }) => {
        set((s) => ({
          sessionNotes: [
            {
              id: Date.now().toString(),
              ts: Date.now(),
              taskId, taskTitle, tag,
              rating, completed, blockers,
            },
            ...s.sessionNotes,
          ].slice(0, 100),
          pendingSessionNote: null,
        }));
      },

      clearPendingSessionNote: () => set({ pendingSessionNote: null }),

      // ── Achievements ──────────────────────────────────────────
      unlockedAchievements: [], // array of achievement IDs
      newlyUnlocked: [],        // transient — cleared once read

      checkAchievements: () => {
        const { unlockedAchievements, sessionHistory, tasks } = get();
        const totalPomodoros = getTotalPomodoros(sessionHistory);
        const streak = computeStreak(sessionHistory);
        const nowUnlocked = computeUnlocked({ totalPomodoros, streak, sessionHistory, tasks });
        const fresh = nowUnlocked.filter((id) => !unlockedAchievements.includes(id));
        if (fresh.length > 0) {
          set({
            unlockedAchievements: [...unlockedAchievements, ...fresh],
            newlyUnlocked: fresh,
          });
        }
      },

      clearNewlyUnlocked: () => set({ newlyUnlocked: [] }),

      // ── Stats ─────────────────────────────────────────────────
      sessionHistory: DEFAULT_HISTORY,
      sessionLog: [], // [{ts, tag}] — used for time-of-day scheduling
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

      energyHistory: {}, // date → 1|2|3 (low/medium/high)
      logEnergy: (value) => {
        const today = new Date().toISOString().split('T')[0];
        set((s) => ({ energyHistory: { ...s.energyHistory, [today]: value } }));
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
        themeMode: s.themeMode,
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
        aiEnabled: s.aiEnabled,
        deepWorkMode: s.deepWorkMode,
        smartNotifications: s.smartNotifications,
        ritualEnabled: s.ritualEnabled,
        ritualType: s.ritualType,
        unlockedAchievements: s.unlockedAchievements,
        sessionLog: s.sessionLog,
        sessionNotes: s.sessionNotes,
        energyHistory: s.energyHistory,
        activeSpace: s.activeSpace,
        quickStartMode: s.quickStartMode,
      }),
    }
  )
);
