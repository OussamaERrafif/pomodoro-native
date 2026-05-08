import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/hooks/useTheme';
import { useTimer } from '../../src/hooks/useTimer';
import { useAppStore } from '../../src/store';
import { BlobTimer, TomatoDots, ResetIcon, PlayIcon, PauseIcon, SkipIcon, TargetIcon, MicIcon, WaveIcon } from '../../src/components';
import { FONT_DISPLAY } from '../../src/constants/tokens';
import { fmt } from '../../src/utils/time';

export default function TimerScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Activate the timer hook (handles tick, background sync, notifications)
  useTimer();

  const secondsLeft = useAppStore((s) => s.secondsLeft);
  const isRunning = useAppStore((s) => s.isRunning);
  const isBreak = useAppStore((s) => s.isBreak);
  const sessionCount = useAppStore((s) => s.sessionCount);
  const sessionsBeforeLongBreak = useAppStore((s) => s.sessionsBeforeLongBreak);
  const focusDuration = useAppStore((s) => s.focusDuration);
  const shortBreakDuration = useAppStore((s) => s.shortBreakDuration);
  const longBreakDuration = useAppStore((s) => s.longBreakDuration);
  const currentTaskId = useAppStore((s) => s.currentTaskId);
  const tasks = useAppStore((s) => s.tasks);
  const userName = useAppStore((s) => s.userName);
  const haptics = useAppStore((s) => s.haptics);
  const ambientSound = useAppStore((s) => s.ambientSound);
  const startTimer = useAppStore((s) => s.startTimer);
  const pauseTimer = useAppStore((s) => s.pauseTimer);
  const resetTimer = useAppStore((s) => s.resetTimer);
  const skipSession = useAppStore((s) => s.skipSession);

  const currentTask = tasks.find((t) => t.id === currentTaskId && !t.complete);
  const totalDuration = isBreak
    ? (sessionCount % sessionsBeforeLongBreak === 0 ? longBreakDuration : shortBreakDuration) * 60
    : focusDuration * 60;
  const progress = 1 - secondsLeft / totalDuration;
  const sessionInCycle = (sessionCount % sessionsBeforeLongBreak) + (isBreak ? 0 : 1);
  const sessionLabel = isBreak
    ? sessionCount % sessionsBeforeLongBreak === 0 ? 'Long break' : 'Short break'
    : 'Focus';

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];

  const handlePlayPause = () => {
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    isRunning ? pauseTimer() : startTimer();
  };

  const handleReset = () => {
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    resetTimer();
  };

  const handleSkip = () => {
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    skipSession();
  };

  const accentColor = isBreak ? colors.breakC : colors.focus;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View>
          <Text style={[styles.dayLabel, { color: colors.mute }]}>{today}</Text>
          <Text style={[styles.greeting, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
            Let's focus, {userName}
          </Text>
        </View>
        <View style={[styles.avatar, { background: undefined, backgroundColor: colors.focusSoft }]}>
          <Text style={[styles.avatarText, { color: '#fff', fontFamily: FONT_DISPLAY }]}>
            {userName.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Session pill */}
      <View style={styles.pillRow}>
        <View style={[styles.pill, { backgroundColor: `${accentColor}18` }]}>
          <View style={[styles.pillDot, { backgroundColor: accentColor }]} />
          <Text style={[styles.pillText, { color: accentColor }]}>
            {sessionLabel.toUpperCase()} · {sessionInCycle} OF {sessionsBeforeLongBreak}
          </Text>
        </View>
      </View>

      {/* Timer */}
      <View style={styles.timerArea}>
        <Pressable
          onPress={handlePlayPause}
          style={styles.timerPress}
        >
          <BlobTimer
            size={272}
            progress={progress}
            isBreak={isBreak}
            colors={colors}
            paused={!isRunning}
          />
          <View style={styles.timerOverlay} pointerEvents="none">
            <Text style={[styles.timerText, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
              {fmt(secondsLeft)}
            </Text>
            <Text style={[styles.timerSub, { color: colors.mute }]}>
              {Math.round((1 - progress) * 100)}% remaining
            </Text>
          </View>
        </Pressable>

        <Text style={[styles.motivation, { color: colors.mute, fontFamily: FONT_DISPLAY }]}>
          {isBreak ? '"Take a breath. Stretch."' : '"Nice work. Keep going."'}
        </Text>
      </View>

      {/* Current task */}
      <View style={styles.taskSection}>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/tasks')}
          activeOpacity={0.8}
          style={[styles.taskCard, { backgroundColor: colors.surface, shadowColor: colors.ink }]}
        >
          <View style={[styles.taskIcon, { backgroundColor: `${colors.focus}18` }]}>
            <TargetIcon size={18} color={colors.focus} />
          </View>
          <View style={styles.taskInfo}>
            <Text style={[styles.taskNow, { color: colors.mute }]}>Now working on</Text>
            <Text style={[styles.taskTitle, { color: colors.ink }]} numberOfLines={1}>
              {currentTask ? currentTask.title : 'No task selected — tap to add one'}
            </Text>
          </View>
          {currentTask && (
            <TomatoDots
              done={currentTask.done}
              total={currentTask.total}
              colors={colors}
              size={7}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={handleReset} activeOpacity={0.75}
          style={[styles.sideBtn, { backgroundColor: colors.surface, shadowColor: colors.ink }]}>
          <ResetIcon size={22} color={colors.ink} strokeWidth={1.8} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePlayPause} activeOpacity={0.8}
          style={[styles.playBtn, {
            backgroundColor: accentColor,
            shadowColor: accentColor,
          }]}>
          {isRunning
            ? <PauseIcon size={32} color="#fff" />
            : <PlayIcon size={32} color="#fff" />}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} activeOpacity={0.75}
          style={[styles.sideBtn, { backgroundColor: colors.surface, shadowColor: colors.ink }]}>
          <SkipIcon size={22} color={colors.ink} />
        </TouchableOpacity>
      </View>

      {/* Bottom FABs */}
      <View style={styles.fabRow}>
        <TouchableOpacity
          onPress={() => router.push('/voice')}
          activeOpacity={0.8}
          style={[styles.fab, { backgroundColor: `${colors.focus}15` }]}
        >
          <MicIcon size={16} color={colors.focus} />
          <Text style={[styles.fabText, { color: colors.focus }]}>Voice tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/modal/ambient')}
          activeOpacity={0.8}
          style={[styles.fab, {
            backgroundColor: ambientSound !== 'none' ? `${colors.breakC}20` : `${colors.focus}15`,
          }]}
        >
          <WaveIcon size={16} color={ambientSound !== 'none' ? colors.breakC : colors.focus} />
          <Text style={[styles.fabText, {
            color: ambientSound !== 'none' ? colors.breakC : colors.focus,
          }]}>
            {ambientSound !== 'none' ? 'Sound on' : 'Sounds'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLabel: { fontSize: 12, fontWeight: '500', marginBottom: 2 },
  greeting: { fontSize: 22, fontWeight: '400', letterSpacing: -0.3 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '500' },
  pillRow: { paddingTop: 20, paddingHorizontal: 24, alignItems: 'center' },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 100,
  },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.6 },
  timerArea: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12,
  },
  timerPress: { alignItems: 'center', justifyContent: 'center' },
  timerOverlay: {
    position: 'absolute',
    alignItems: 'center', justifyContent: 'center',
  },
  timerText: { fontSize: 64, fontWeight: '400', letterSpacing: -2, lineHeight: 68 },
  timerSub: { fontSize: 12, fontWeight: '500', marginTop: 8 },
  motivation: {
    marginTop: 22, fontSize: 16, fontStyle: 'italic', letterSpacing: -0.2,
    textAlign: 'center', maxWidth: 260, lineHeight: 22,
  },
  taskSection: { paddingHorizontal: 20, paddingBottom: 12 },
  taskCard: {
    borderRadius: 18, padding: 14, flexDirection: 'row',
    alignItems: 'center', gap: 12,
    shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  taskIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  taskInfo: { flex: 1, minWidth: 0 },
  taskNow: { fontSize: 11, fontWeight: '500', marginBottom: 1 },
  taskTitle: { fontSize: 14, fontWeight: '600' },
  controls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 18, paddingHorizontal: 24, paddingBottom: 10,
  },
  sideBtn: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  playBtn: {
    width: 84, height: 84, borderRadius: 42,
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10,
  },
  fabRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 10,
    marginBottom: 6,
  },
  fab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 100,
  },
  fabText: { fontSize: 13, fontWeight: '600' },
});
