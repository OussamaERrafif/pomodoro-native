import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';
import { TomatoDots, CheckIcon, FlameIcon, PlusIcon, MicIcon } from '../../src/components';
import { FONT_DISPLAY } from '../../src/constants/tokens';

const FILTERS = ['All', 'Work', 'Reading', 'Design', 'Personal', 'Wellness'];

export default function TasksScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const tasks = useAppStore((s) => s.tasks);
  const todaySessions = useAppStore((s) => s.todaySessions);
  const focusGoal = useAppStore((s) => s.focusGoal);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const setTaskActive = useAppStore((s) => s.setTaskActive);
  const currentTaskId = useAppStore((s) => s.currentTaskId);
  const haptics = useAppStore((s) => s.haptics);

  const [activeFilter, setActiveFilter] = useState('All');

  const filteredTasks = activeFilter === 'All'
    ? tasks
    : tasks.filter((t) => t.tag === activeFilter);

  const totalTomatoes = tasks.reduce((s, t) => s + t.total, 0);
  const streak = Math.min(todaySessions, 10);

  const getTagColor = (task) => {
    if (task.tagColor) return task.tagColor;
    const map = { focus: colors.focus, breakC: colors.breakC, plum: colors.plum };
    return map[task.tagColorKey] || colors.mute;
  };

  const handleToggle = (id) => {
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleTask(id);
  };

  const handleSetActive = (id) => {
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setTaskActive(id);
    router.push('/(tabs)');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.mute }]}>Today's plan</Text>
            <Text style={[styles.title, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>Tasks</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push('/voice')} activeOpacity={0.7}
              style={[styles.headerBtn, { backgroundColor: colors.surface, shadowColor: colors.ink }]}>
              <MicIcon size={18} color={colors.ink} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/modal/add-task')} activeOpacity={0.8}
              style={[styles.addBtn, { backgroundColor: colors.ink }]}>
              <PlusIcon size={20} color={colors.bg} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Day summary */}
        <View style={[styles.summary, { backgroundColor: colors.surface, shadowColor: colors.ink }]}>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.mute }]}>TODAY</Text>
            <View style={styles.summaryCount}>
              <Text style={[styles.summaryNum, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
                {todaySessions}
              </Text>
              <Text style={[styles.summaryOf, { color: colors.mute }]}>of {totalTomatoes} tomatoes</Text>
            </View>
          </View>
          <View style={styles.progressWrap}>
            <View style={[styles.progressBg, { backgroundColor: colors.line }]}>
              <View style={[styles.progressFill, {
                backgroundColor: colors.focus,
                width: `${Math.min(100, (todaySessions / Math.max(totalTomatoes, 1)) * 100)}%`,
              }]} />
            </View>
          </View>
          <View style={styles.streakWrap}>
            <FlameIcon size={14} color={colors.focus} filled />
            <Text style={[styles.streakNum, { color: colors.focus }]}>{streak}</Text>
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}>
          {FILTERS.map((f) => (
            <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} activeOpacity={0.7}
              style={[styles.chip, {
                backgroundColor: activeFilter === f ? colors.ink : colors.surface,
                shadowColor: colors.ink,
              }]}>
              <Text style={[styles.chipText, { color: activeFilter === f ? colors.bg : colors.mute }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Task list */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const tagColor = getTagColor(item);
          const isActive = item.id === currentTaskId && !item.complete;

          return (
            <TouchableOpacity
              onPress={() => !item.complete && handleSetActive(item.id)}
              onLongPress={() => handleToggle(item.id)}
              activeOpacity={0.85}
              style={[
                styles.taskCard,
                {
                  backgroundColor: colors.surface,
                  borderWidth: isActive ? 1.5 : 0,
                  borderColor: isActive ? colors.focus : 'transparent',
                  opacity: item.complete ? 0.55 : 1,
                  shadowColor: colors.ink,
                },
              ]}
            >
              {/* Checkbox */}
              <TouchableOpacity onPress={() => handleToggle(item.id)} activeOpacity={0.7}
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: item.complete ? colors.breakC : 'transparent',
                    borderWidth: item.complete ? 0 : 1.5,
                    borderColor: colors.line,
                  },
                ]}>
                {item.complete && <CheckIcon size={14} color="#fff" strokeWidth={2.5} />}
              </TouchableOpacity>

              <View style={styles.taskBody}>
                <Text style={[
                  styles.taskTitle,
                  {
                    color: item.complete ? colors.mute : colors.ink,
                    textDecorationLine: item.complete ? 'line-through' : 'none',
                  },
                ]} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.taskMeta}>
                  <View style={[styles.tagPill, { backgroundColor: `${tagColor}18` }]}>
                    <Text style={[styles.tagText, { color: tagColor }]}>{item.tag}</Text>
                  </View>
                  <TomatoDots done={item.done} total={item.total} colors={colors} size={6} />
                  {isActive && (
                    <Text style={[styles.runningBadge, { color: colors.focus }]}>· running</Text>
                  )}
                </View>
              </View>

              {isActive && (
                <View style={[styles.activeDot, { backgroundColor: colors.focus }]} />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 4 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 },
  eyebrow: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  title: { fontSize: 32, fontWeight: '400', letterSpacing: -0.7, lineHeight: 34 },
  headerActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  headerBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  summary: {
    borderRadius: 18, padding: 14, flexDirection: 'row',
    alignItems: 'center', marginBottom: 14,
    shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  summaryLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 },
  summaryCount: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  summaryNum: { fontSize: 26, fontWeight: '400', letterSpacing: -0.5 },
  summaryOf: { fontSize: 12 },
  progressWrap: { flex: 1, paddingHorizontal: 18 },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  streakWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  streakNum: { fontSize: 13, fontWeight: '600' },
  filterScroll: { marginHorizontal: -24 },
  filterContent: { paddingHorizontal: 24, gap: 8, paddingBottom: 14 },
  chip: {
    paddingVertical: 7, paddingHorizontal: 14, borderRadius: 100,
    shadowOpacity: 0.03, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  chipText: { fontSize: 13, fontWeight: '550' },
  list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24, gap: 10 },
  taskCard: {
    borderRadius: 16, padding: 14, paddingLeft: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  checkbox: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  taskBody: { flex: 1, minWidth: 0 },
  taskTitle: { fontSize: 14.5, fontWeight: '550', marginBottom: 5, lineHeight: 20 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagPill: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 100 },
  tagText: { fontSize: 10.5, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  runningBadge: { fontSize: 11, fontWeight: '600' },
  activeDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
});
