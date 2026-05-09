export const ACHIEVEMENTS = [
  {
    id: 'first_tomato',
    title: 'First Tomato',
    desc: 'Complete your first focus session',
    icon: '🍅',
    check: ({ totalPomodoros }) => totalPomodoros >= 1,
  },
  {
    id: 'getting_started',
    title: 'Getting Started',
    desc: 'Complete 10 focus sessions',
    icon: '🌱',
    check: ({ totalPomodoros }) => totalPomodoros >= 10,
  },
  {
    id: 'centurion',
    title: 'Centurion',
    desc: 'Complete 100 focus sessions',
    icon: '💯',
    check: ({ totalPomodoros }) => totalPomodoros >= 100,
  },
  {
    id: 'on_a_roll',
    title: 'On a Roll',
    desc: 'Keep a 3-day focus streak',
    icon: '🔥',
    check: ({ streak }) => streak >= 3,
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    desc: 'Keep a 7-day focus streak',
    icon: '⚡',
    check: ({ streak }) => streak >= 7,
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    desc: 'Keep a 30-day focus streak',
    icon: '🏆',
    check: ({ streak }) => streak >= 30,
  },
  {
    id: 'flow_state',
    title: 'Flow State',
    desc: 'Complete 8 sessions in a single day',
    icon: '🌊',
    check: ({ sessionHistory }) => {
      return Object.values(sessionHistory).some((count) => count >= 8);
    },
  },
  {
    id: 'task_master',
    title: 'Task Master',
    desc: 'Fully complete 10 tasks',
    icon: '✅',
    check: ({ tasks }) => tasks.filter((t) => t.complete).length >= 10,
  },
];

export function computeUnlocked({ totalPomodoros, streak, sessionHistory, tasks }) {
  return ACHIEVEMENTS
    .filter((a) => a.check({ totalPomodoros, streak, sessionHistory, tasks }))
    .map((a) => a.id);
}

export function getTotalPomodoros(sessionHistory) {
  return Object.values(sessionHistory).reduce((sum, n) => sum + n, 0);
}
