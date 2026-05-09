import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';
import { FONT_DISPLAY } from '../../src/constants/tokens';
import { planMyDay } from '../../src/utils/openai';
import { getTodayPlan } from '../../src/utils/scheduling';

const ENERGY_LABELS = { 1: 'Low 🔋', 2: 'Medium ⚡', 3: 'High 🚀' };
const MOOD_LABELS = ['', 'Drained', 'Foggy', 'Okay', 'Sharp', 'Flowing'];
const TAG_ICONS = { Work: '💼', Reading: '📚', Design: '🎨', Personal: '🌿', Wellness: '💪' };

export default function DayPlanModal() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const tasks = useAppStore((s) => s.tasks);
  const todaySessions = useAppStore((s) => s.todaySessions);
  const focusGoal = useAppStore((s) => s.focusGoal);
  const sessionLog = useAppStore((s) => s.sessionLog);
  const energyHistory = useAppStore((s) => s.energyHistory);
  const moodHistory = useAppStore((s) => s.moodHistory);
  const openAIKey = useAppStore((s) => s.openAIKey);
  const setTaskActive = useAppStore((s) => s.setTaskActive);

  const todayKey = new Date().toISOString().split('T')[0];
  const energyLevel = energyHistory[todayKey] ?? 2;
  const moodValue = moodHistory[todayKey]?.value ?? null;

  const { sessionsLeft } = getTodayPlan({ todaySessions, focusGoal, sessionLog });
  const pendingTasks = tasks.filter((t) => !t.complete);

  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!openAIKey) { setError('Add your OpenAI API key in Settings first.'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await planMyDay({ tasks: pendingTasks, sessionsLeft, energyLevel, moodValue }, openAIKey);
      setPlan(result);
      setGenerated(true);
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleFocusTask = (taskTitle) => {
    const task = tasks.find((t) => t.title === taskTitle && !t.complete);
    if (task) {
      setTaskActive(task.id);
      router.back();
    }
  };

  const totalPlannedSessions = plan.reduce((s, p) => s + p.sessions, 0);

  return (
    <KeyboardAvoidingView
      style={[styles.overlay, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={[styles.closeText, { color: colors.mute }]}>Close</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>Plan my day</Text>
        <View style={{ width: 52 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>

        {/* Context card */}
        <View style={[styles.contextCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.contextLabel, { color: colors.mute }]}>TODAY'S CONTEXT</Text>
          <View style={styles.contextRow}>
            <View style={styles.contextItem}>
              <Text style={[styles.contextNum, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>{sessionsLeft}</Text>
              <Text style={[styles.contextSub, { color: colors.mute }]}>sessions left</Text>
            </View>
            <View style={[styles.contextDiv, { backgroundColor: colors.line }]} />
            <View style={styles.contextItem}>
              <Text style={[styles.contextNum, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>{pendingTasks.length}</Text>
              <Text style={[styles.contextSub, { color: colors.mute }]}>tasks pending</Text>
            </View>
            <View style={[styles.contextDiv, { backgroundColor: colors.line }]} />
            <View style={styles.contextItem}>
              <Text style={[styles.contextNum, { color: colors.ink }]}>{ENERGY_LABELS[energyLevel] ?? '—'}</Text>
              <Text style={[styles.contextSub, { color: colors.mute }]}>energy</Text>
            </View>
          </View>
          {moodValue && (
            <Text style={[styles.moodLine, { color: colors.mute }]}>
              Mood logged: {MOOD_LABELS[moodValue]}
            </Text>
          )}
        </View>

        {/* Generate button */}
        {!generated && (
          <TouchableOpacity
            onPress={handleGenerate}
            disabled={loading}
            activeOpacity={0.8}
            style={[styles.generateBtn, { backgroundColor: colors.focus }]}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.generateBtnText}>Generate my plan</Text>}
          </TouchableOpacity>
        )}

        {error ? (
          <Text style={[styles.errorText, { color: colors.warm || '#E57373' }]}>{error}</Text>
        ) : null}

        {/* Plan items */}
        {plan.length > 0 && (
          <View style={{ gap: 10 }}>
            <View style={styles.planHeader}>
              <Text style={[styles.planTitle, { color: colors.ink }]}>Your plan</Text>
              <Text style={[styles.planSub, { color: colors.mute }]}>
                {totalPlannedSessions} session{totalPlannedSessions !== 1 ? 's' : ''} · {totalPlannedSessions * 25}min
              </Text>
            </View>

            {plan.map((item, i) => {
              const task = tasks.find((t) => t.title === item.taskTitle && !t.complete);
              const tagIcon = task ? (TAG_ICONS[task.tag] || '📌') : '📌';
              const tagColor = task
                ? ({ focus: colors.focus, breakC: colors.breakC, plum: colors.plum }[task.tagColorKey] || colors.mute)
                : colors.mute;

              return (
                <View key={i} style={[styles.planItem, { backgroundColor: colors.surface }]}>
                  <View style={[styles.planOrder, { backgroundColor: `${colors.focus}18` }]}>
                    <Text style={[styles.planOrderNum, { color: colors.focus, fontFamily: FONT_DISPLAY }]}>{i + 1}</Text>
                  </View>
                  <View style={styles.planBody}>
                    <Text style={[styles.planTaskTitle, { color: colors.ink }]} numberOfLines={2}>
                      {tagIcon}  {item.taskTitle}
                    </Text>
                    <Text style={[styles.planReason, { color: colors.mute }]}>{item.reason}</Text>
                    <View style={styles.planMeta}>
                      <View style={[styles.sessionsBadge, { backgroundColor: `${tagColor}15` }]}>
                        <Text style={[styles.sessionsText, { color: tagColor }]}>
                          {item.sessions} session{item.sessions !== 1 ? 's' : ''} · {item.sessions * 25}min
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleFocusTask(item.taskTitle)}
                    activeOpacity={0.78}
                    style={[styles.focusBtn, { backgroundColor: colors.focus }]}
                  >
                    <Text style={styles.focusBtnText}>Start</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <TouchableOpacity
              onPress={handleGenerate}
              disabled={loading}
              style={[styles.regenBtn, { borderColor: `${colors.focus}40` }]}
              activeOpacity={0.75}
            >
              {loading
                ? <ActivityIndicator size="small" color={colors.focus} />
                : <Text style={[styles.regenText, { color: colors.focus }]}>Regenerate plan</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Empty state */}
        {!generated && !loading && pendingTasks.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.mute }]}>
            No pending tasks. Add some tasks first and come back.
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  closeBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  closeText: { fontSize: 15 },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  content: { paddingHorizontal: 20, paddingTop: 4, gap: 14 },
  contextCard: {
    borderRadius: 18, padding: 16, gap: 10,
  },
  contextLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  contextRow: { flexDirection: 'row', alignItems: 'center' },
  contextItem: { flex: 1, alignItems: 'center', gap: 2 },
  contextNum: { fontSize: 18, fontWeight: '600' },
  contextSub: { fontSize: 11 },
  contextDiv: { width: 1, height: 28 },
  moodLine: { fontSize: 12, textAlign: 'center' },
  generateBtn: {
    paddingVertical: 16, borderRadius: 16, alignItems: 'center',
  },
  generateBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  errorText: { fontSize: 13, textAlign: 'center' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 2 },
  planTitle: { fontSize: 16, fontWeight: '700' },
  planSub: { fontSize: 12 },
  planItem: {
    borderRadius: 16, padding: 14, flexDirection: 'row',
    alignItems: 'center', gap: 12,
  },
  planOrder: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  planOrderNum: { fontSize: 16, fontWeight: '400' },
  planBody: { flex: 1, minWidth: 0, gap: 3 },
  planTaskTitle: { fontSize: 14, fontWeight: '600', lineHeight: 19 },
  planReason: { fontSize: 12, lineHeight: 16 },
  planMeta: { flexDirection: 'row', marginTop: 2 },
  sessionsBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 100 },
  sessionsText: { fontSize: 11, fontWeight: '600' },
  focusBtn: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 100, flexShrink: 0 },
  focusBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  regenBtn: { borderWidth: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  regenText: { fontSize: 14, fontWeight: '600' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
