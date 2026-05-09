import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/hooks/useTheme';
import { useTimer } from '../../src/hooks/useTimer';
import { useAppStore } from '../../src/store';
import { BlobTimer, TomatoDots, ResetIcon, PlayIcon, PauseIcon, SkipIcon, TargetIcon, MicIcon, WaveIcon, ShieldIcon, ChatIcon } from '../../src/components';
import { SOUND_SOURCES } from '../../src/hooks/useAmbientSound';
import { FONT_DISPLAY } from '../../src/constants/tokens';
import { fmt } from '../../src/utils/time';
import { getBestFocusHours } from '../../src/utils/scheduling';
import { computeXP, getLevelInfo } from '../../src/utils/xp';
import { FOCUS_SPACES } from '../../src/constants/tokens';
import { getSuggestedDuration } from '../../src/utils/adaptive';

export default function TimerScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
  const deepWorkMode = useAppStore((s) => s.deepWorkMode);
  const ritualEnabled = useAppStore((s) => s.ritualEnabled);
  const quickStartMode = useAppStore((s) => s.quickStartMode);
  const startTimer = useAppStore((s) => s.startTimer);
  const pauseTimer = useAppStore((s) => s.pauseTimer);
  const resetTimer = useAppStore((s) => s.resetTimer);
  const skipSession = useAppStore((s) => s.skipSession);
  const sessionHistory = useAppStore((s) => s.sessionHistory);
  const unlockedAchievements = useAppStore((s) => s.unlockedAchievements);
  const activeSpace = useAppStore((s) => s.activeSpace);
  const energyHistory = useAppStore((s) => s.energyHistory);
  const setFocusDuration = useAppStore((s) => s.setFocusDuration);
  const aiEnabled = useAppStore((s) => s.aiEnabled);

  const xp = computeXP(sessionHistory, unlockedAchievements);
  const levelInfo = getLevelInfo(xp);
  const spaceInfo = activeSpace ? FOCUS_SPACES.find((s) => s.id === activeSpace) : null;

  const currentTask = tasks.find((t) => t.id === currentTaskId && !t.complete);
  const totalDuration = isBreak
    ? (sessionCount % sessionsBeforeLongBreak === 0 ? longBreakDuration : shortBreakDuration) * 60
    : focusDuration * 60;
  const progress = 1 - secondsLeft / totalDuration;
  const sessionInCycle = (sessionCount % sessionsBeforeLongBreak) + (isBreak ? 0 : 1);
  const sessionLabel = isBreak
    ? sessionCount % sessionsBeforeLongBreak === 0 ? 'Long break' : 'Short break'
    : 'Focus';

  const todaySessions = useAppStore((s) => s.todaySessions);
  const sessionLog = useAppStore((s) => s.sessionLog);
  const pendingSessionNote = useAppStore((s) => s.pendingSessionNote);
  const BURNOUT_THRESHOLD = 8;

  useEffect(() => {
    if (pendingSessionNote) {
      router.push('/modal/session-note');
    }
  }, [pendingSessionNote]);
  const showBurnoutNudge = todaySessions >= BURNOUT_THRESHOLD && !isBreak && !isRunning;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];

  const moodHistory = useAppStore((s) => s.moodHistory);
  const todayKey = new Date().toISOString().split('T')[0];
  const isFullTimer = secondsLeft === focusDuration * 60;

  const adaptiveSuggestion = getSuggestedDuration({
    focusDuration,
    energyHistory,
    moodHistory,
    sessionLog,
  });

  const handlePlayPause = () => {
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (isRunning) {
      pauseTimer();
    } else if (!isBreak && !quickStartMode && !moodHistory[todayKey]) {
      router.push('/modal/mood');
    } else if (!isBreak && !quickStartMode && ritualEnabled && isFullTimer) {
      router.push('/modal/ritual');
    } else {
      startTimer();
    }
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

  // ── Staggered entrance animations ────────────────────────────────
  const headerAnim = useSharedValue(0);
  const pillAnim = useSharedValue(0);
  const timerAnim = useSharedValue(0);
  const taskAnim = useSharedValue(0);
  const controlsAnim = useSharedValue(0);
  const fabAnim = useSharedValue(0);

  useEffect(() => {
    const cfg = { duration: 420, easing: Easing.out(Easing.cubic) };
    headerAnim.value = withTiming(1, cfg);
    pillAnim.value = withDelay(65, withTiming(1, cfg));
    timerAnim.value = withDelay(130, withTiming(1, cfg));
    taskAnim.value = withDelay(200, withTiming(1, cfg));
    controlsAnim.value = withDelay(265, withTiming(1, cfg));
    fabAnim.value = withDelay(330, withTiming(1, cfg));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerAnim.value,
    transform: [{ translateY: (1 - headerAnim.value) * 10 }],
  }));
  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillAnim.value,
    transform: [{ translateY: (1 - pillAnim.value) * 8 }],
  }));
  const timerStyle = useAnimatedStyle(() => ({
    opacity: timerAnim.value,
    transform: [{ translateY: (1 - timerAnim.value) * 14 }],
  }));
  const taskStyle = useAnimatedStyle(() => ({
    opacity: taskAnim.value,
    transform: [{ translateY: (1 - taskAnim.value) * 8 }],
  }));
  const controlsStyle = useAnimatedStyle(() => ({
    opacity: controlsAnim.value,
    transform: [{ translateY: (1 - controlsAnim.value) * 8 }],
  }));
  const fabStyle = useAnimatedStyle(() => ({
    opacity: fabAnim.value,
    transform: [{ translateY: (1 - fabAnim.value) * 6 }],
  }));

  // ── Play button spring press ──────────────────────────────────────
  const playScale = useSharedValue(1);
  const playStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playScale.value }],
  }));

  // ── Side button spring press ──────────────────────────────────────
  const resetScale = useSharedValue(1);
  const skipScale = useSharedValue(1);
  const resetStyle = useAnimatedStyle(() => ({ transform: [{ scale: resetScale.value }] }));
  const skipStyle = useAnimatedStyle(() => ({ transform: [{ scale: skipScale.value }] }));

  // ── Distraction button animated fade ─────────────────────────────
  const distractionAnim = useSharedValue(isRunning ? 1 : 0);
  useEffect(() => {
    distractionAnim.value = withTiming(isRunning ? 1 : 0, { duration: 280 });
  }, [isRunning]);
  const distractionStyle = useAnimatedStyle(() => ({
    opacity: distractionAnim.value,
    transform: [{ translateY: (1 - distractionAnim.value) * 4 }],
  }));

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <Animated.View style={[styles.header, { paddingTop: insets.top + 14 }, headerStyle]}>
        <View>
          <Text style={[styles.dayLabel, { color: colors.mute }]}>{today}</Text>
          <Text style={[styles.greeting, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
            Let's focus, {userName}
          </Text>
        </View>
        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, { backgroundColor: colors.focusSoft }]}>
            <Text style={[styles.avatarText, { color: '#fff', fontFamily: FONT_DISPLAY }]}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: colors.bg, borderColor: `${colors.focus}40` }]}>
            <Text style={styles.levelBadgeIcon}>{levelInfo.icon}</Text>
            <Text style={[styles.levelBadgeNum, { color: colors.focus }]}>{levelInfo.level}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Session pill */}
      <Animated.View style={[styles.pillRow, pillStyle]}>
        <View style={[styles.pill, { backgroundColor: `${accentColor}18` }]}>
          <View style={[styles.pillDot, { backgroundColor: accentColor }]} />
          <Text style={[styles.pillText, { color: accentColor }]}>
            {sessionLabel.toUpperCase()} · {sessionInCycle} OF {sessionsBeforeLongBreak}
          </Text>
        </View>
        {deepWorkMode && (
          <View style={[styles.deepWorkBadge, { backgroundColor: `${colors.focus}18` }]}>
            <ShieldIcon size={11} color={colors.focus} />
            <Text style={[styles.deepWorkText, { color: colors.focus }]}>Deep work</Text>
          </View>
        )}
        {spaceInfo && (
          <View style={[styles.deepWorkBadge, { backgroundColor: `${colors.breakC}18` }]}>
            <Text style={{ fontSize: 11 }}>{spaceInfo.icon}</Text>
            <Text style={[styles.deepWorkText, { color: colors.breakC }]}>{spaceInfo.label}</Text>
          </View>
        )}
      </Animated.View>

      {/* Timer */}
      <Animated.View style={[styles.timerArea, timerStyle]}>
        <Pressable onPress={handlePlayPause} style={styles.timerPress}>
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

        {showBurnoutNudge ? (
          <View style={[styles.burnoutNudge, { backgroundColor: `${colors.warm || colors.breakC}15`, borderColor: `${colors.warm || colors.breakC}30` }]}>
            <Text style={styles.burnoutEmoji}>🌿</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.burnoutTitle, { color: colors.ink }]}>You've done {todaySessions} sessions today</Text>
              <Text style={[styles.burnoutSub, { color: colors.mute }]}>That's a strong day. Consider a proper rest before pushing further.</Text>
            </View>
          </View>
        ) : (() => {
          const bestWindow = getBestFocusHours(sessionLog);
          const now = new Date().getHours();
          const inWindow = bestWindow && now >= bestWindow.startHour && now < bestWindow.endHour;

          if (!isRunning && !isBreak && adaptiveSuggestion) {
            return (
              <TouchableOpacity
                onPress={() => setFocusDuration(adaptiveSuggestion.duration)}
                activeOpacity={0.75}
                style={[styles.adaptiveChip, { backgroundColor: `${colors.focus}12`, borderColor: `${colors.focus}30` }]}
              >
                <Text style={styles.adaptiveEmoji}>{adaptiveSuggestion.direction === 'up' ? '🚀' : '🌿'}</Text>
                <Text style={[styles.adaptiveText, { color: colors.ink }]}>{adaptiveSuggestion.reason}</Text>
                <Text style={[styles.adaptiveTap, { color: colors.focus }]}>Tap to apply</Text>
              </TouchableOpacity>
            );
          }
          if (!isRunning && !isBreak && bestWindow) {
            return (
              <Text style={[styles.motivation, { color: inWindow ? colors.focus : colors.mute, fontFamily: FONT_DISPLAY }]}>
                {inWindow
                  ? `⚡ Peak focus window — ${bestWindow.label}`
                  : `Peak window: ${bestWindow.label}`}
              </Text>
            );
          }
          return (
            <Text style={[styles.motivation, { color: colors.mute, fontFamily: FONT_DISPLAY }]}>
              {isBreak ? '"Take a breath. Stretch."' : '"Nice work. Keep going."'}
            </Text>
          );
        })()}
      </Animated.View>

      {/* Current task */}
      <Animated.View style={[styles.taskSection, taskStyle]}>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/tasks')}
          activeOpacity={0.78}
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
            <TomatoDots done={currentTask.done} total={currentTask.total} colors={colors} size={7} />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Controls */}
      <Animated.View style={[styles.controls, controlsStyle]}>
        <Pressable
          onPressIn={() => { resetScale.value = withSpring(0.87, { damping: 14, stiffness: 500 }); }}
          onPressOut={() => { resetScale.value = withSpring(1, { damping: 10, stiffness: 320 }); }}
          onPress={handleReset}
        >
          <Animated.View style={[styles.sideBtn, { backgroundColor: colors.surface, shadowColor: colors.ink }, resetStyle]}>
            <ResetIcon size={22} color={colors.ink} strokeWidth={1.8} />
          </Animated.View>
        </Pressable>

        <Pressable
          onPressIn={() => { playScale.value = withSpring(0.91, { damping: 12, stiffness: 500 }); }}
          onPressOut={() => { playScale.value = withSpring(1, { damping: 9, stiffness: 280 }); }}
          onPress={handlePlayPause}
        >
          <Animated.View style={[styles.playBtn, { backgroundColor: accentColor, shadowColor: accentColor }, playStyle]}>
            {isRunning
              ? <PauseIcon size={32} color="#fff" />
              : <PlayIcon size={32} color="#fff" />}
          </Animated.View>
        </Pressable>

        <Pressable
          onPressIn={() => { skipScale.value = withSpring(0.87, { damping: 14, stiffness: 500 }); }}
          onPressOut={() => { skipScale.value = withSpring(1, { damping: 10, stiffness: 320 }); }}
          onPress={handleSkip}
        >
          <Animated.View style={[styles.sideBtn, { backgroundColor: colors.surface, shadowColor: colors.ink }, skipStyle]}>
            <SkipIcon size={22} color={colors.ink} />
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* Distraction button — fades in/out instead of mount/unmount */}
      <Animated.View
        style={[styles.distractionWrap, distractionStyle]}
        pointerEvents={isRunning ? 'auto' : 'none'}
      >
        <TouchableOpacity
          onPress={() => router.push('/modal/distraction')}
          activeOpacity={0.7}
          style={[styles.distractionBtn, { borderColor: `${colors.mute}40` }]}
        >
          <Text style={[styles.distractionText, { color: colors.mute }]}>Got distracted?</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom FABs */}
      <Animated.View style={[styles.fabRow, fabStyle]}>
        {aiEnabled && (
          <TouchableOpacity
            onPress={() => router.push('/voice')}
            activeOpacity={0.8}
            style={[styles.fab, { backgroundColor: `${colors.focus}15` }]}
          >
            <MicIcon size={16} color={colors.focus} />
            <Text style={[styles.fabText, { color: colors.focus }]}>Voice tasks</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => router.push('/modal/ambient')}
          activeOpacity={0.8}
          style={[styles.fab, {
            backgroundColor: ambientSound !== 'none' && SOUND_SOURCES[ambientSound] ? `${colors.breakC}20` : `${colors.focus}15`,
          }]}
        >
          <WaveIcon size={16} color={ambientSound !== 'none' && SOUND_SOURCES[ambientSound] ? colors.breakC : colors.focus} />
          <Text style={[styles.fabText, {
            color: ambientSound !== 'none' && SOUND_SOURCES[ambientSound] ? colors.breakC : colors.focus,
          }]}>
            {ambientSound !== 'none' && SOUND_SOURCES[ambientSound] ? 'Sound on' : 'Sounds'}
          </Text>
        </TouchableOpacity>

        {aiEnabled && (
          <TouchableOpacity
            onPress={() => router.push('/modal/coach')}
            activeOpacity={0.8}
            style={[styles.fab, { backgroundColor: `${colors.focus}15` }]}
          >
            <ChatIcon size={16} color={colors.focus} />
            <Text style={[styles.fabText, { color: colors.focus }]}>Coach</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
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
  avatarWrap: { alignItems: 'center' },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '500' },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 100,
    borderWidth: 1, marginTop: 4,
  },
  levelBadgeIcon: { fontSize: 10 },
  levelBadgeNum: { fontSize: 10, fontWeight: '700' },
  pillRow: { paddingTop: 20, paddingHorizontal: 24, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
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
  distractionWrap: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  distractionBtn: {
    borderWidth: 1, borderRadius: 100,
    paddingVertical: 6, paddingHorizontal: 16,
  },
  distractionText: { fontSize: 12, fontWeight: '500' },
  fabRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 10,
    marginBottom: 6,
  },
  fab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 100,
  },
  fabText: { fontSize: 13, fontWeight: '600' },
  deepWorkBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 5, paddingHorizontal: 10, borderRadius: 100, marginLeft: 8,
  },
  deepWorkText: { fontSize: 11, fontWeight: '600' },
  adaptiveChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 18, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1, maxWidth: 300,
  },
  adaptiveEmoji: { fontSize: 18 },
  adaptiveText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 17 },
  adaptiveTap: { fontSize: 11, fontWeight: '700' },
  burnoutNudge: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    marginTop: 18, paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: 14, borderWidth: 1, maxWidth: 300,
  },
  burnoutEmoji: { fontSize: 22, lineHeight: 26 },
  burnoutTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  burnoutSub: { fontSize: 12, lineHeight: 17 },
});
