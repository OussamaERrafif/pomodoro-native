import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';
import { PillButton, TomatoDots, PlusIcon, ArrowIcon, SparkleIcon, CheckIcon, XIcon } from '../../src/components';
import { FONT_DISPLAY } from '../../src/constants/tokens';
import { breakdownGoal, autoTagTask } from '../../src/utils/openai';

const TAG_OPTIONS = [
  { label: 'Work', colorKey: 'focus' },
  { label: 'Reading', colorKey: 'breakC' },
  { label: 'Design', colorKey: 'plum' },
  { label: 'Personal', color: '#A47BB9' },
  { label: 'Wellness', colorKey: 'breakC' },
];

const TAG_COLOR_MAP = { Work: 'focus', Reading: 'breakC', Design: 'plum', Personal: null, Wellness: 'breakC' };

export default function AddTaskModal() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addTask = useAppStore((s) => s.addTask);
  const addTasks = useAppStore((s) => s.addTasks);
  const openAIKey = useAppStore((s) => s.openAIKey);
  const aiEnabled = useAppStore((s) => s.aiEnabled);
  const tasks = useAppStore((s) => s.tasks);

  const [mode, setMode] = useState('manual');

  // Manual mode state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tomatoes, setTomatoes] = useState(2);
  const [selectedTag, setSelectedTag] = useState('Work');
  const [subtasks, setSubtasks] = useState([]);
  const newSubtaskRef = useRef(null);

  // Auto-tag state
  const [aiTag, setAiTag] = useState(null);       // tag suggested by AI
  const [aiTagLoading, setAiTagLoading] = useState(false);

  const handleTitleBlur = async () => {
    if (!aiEnabled || !openAIKey || title.trim().length < 3 || aiTag) return;
    setAiTagLoading(true);
    try {
      const suggested = await autoTagTask(title.trim(), openAIKey);
      if (suggested) {
        setAiTag(suggested);
        setSelectedTag(suggested);
      }
    } catch (_) {
      // silent — auto-tag is best-effort
    } finally {
      setAiTagLoading(false);
    }
  };

  // AI mode state
  const [goal, setGoal] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiTasks, setAiTasks] = useState([]);
  const [selectedAiTasks, setSelectedAiTasks] = useState(new Set());

  // Workload calculation — updated reactively as `tomatoes` changes
  const pendingPomodoros = tasks
    .filter((t) => !t.complete)
    .reduce((sum, t) => sum + Math.max(0, t.total - t.done), 0);
  const endOfDay = new Date(); endOfDay.setHours(22, 0, 0, 0);
  const remainingMins = Math.max(0, (endOfDay - Date.now()) / 60000);
  const capacityPomodoros = Math.floor(remainingMins / 30);
  const totalWithNew = pendingPomodoros + tomatoes;
  const isOverloaded = capacityPomodoros > 0 && totalWithNew > capacityPomodoros;

  const getTagColor = (tag) => {
    const t = TAG_OPTIONS.find((x) => x.label === tag);
    return t?.color || colors[t?.colorKey] || colors.focus;
  };

  const addSubtask = () => {
    const id = Date.now().toString();
    setSubtasks((prev) => [...prev, { id, title: '', done: false }]);
    setTimeout(() => newSubtaskRef.current?.focus(), 50);
  };

  const updateSubtask = (id, title) =>
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));

  const removeSubtask = (id) =>
    setSubtasks((prev) => prev.filter((s) => s.id !== id));

  const handleAdd = () => {
    if (!title.trim()) return;
    const tagOpt = TAG_OPTIONS.find((t) => t.label === selectedTag);
    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      subtasks: subtasks.filter((s) => s.title.trim()).map((s) => ({ ...s, title: s.title.trim() })),
      tag: selectedTag,
      tagColorKey: tagOpt?.colorKey,
      tagColor: tagOpt?.color,
      total: tomatoes,
    });
    router.back();
  };

  const handleBreakdown = async () => {
    if (!goal.trim()) return;
    if (!openAIKey) { setAiError('Add your OpenAI API key in Settings first.'); return; }
    setAiError('');
    setAiTasks([]);
    setSelectedAiTasks(new Set());
    setAiLoading(true);
    try {
      const tasks = await breakdownGoal(goal.trim(), openAIKey);
      setAiTasks(tasks);
      setSelectedAiTasks(new Set(tasks.map((_, i) => i)));
    } catch (e) {
      setAiError(e.message || 'Something went wrong.');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleAiTask = (i) =>
    setSelectedAiTasks((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const handleAddAll = () => {
    const selected = aiTasks
      .filter((_, i) => selectedAiTasks.has(i))
      .map((t) => {
        const colorKey = TAG_COLOR_MAP[t.tag];
        return {
          title: t.title,
          tag: t.tag || 'Work',
          tagColorKey: colorKey || undefined,
          tagColor: !colorKey ? '#A47BB9' : undefined,
          total: t.total || 2,
        };
      });
    addTasks(selected);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => router.back()} />

      <View style={[styles.sheet, { backgroundColor: colors.bg, paddingBottom: insets.bottom + 24 }]}>
        <View style={[styles.handle, { backgroundColor: colors.line }]} />

        <View style={styles.sheetHeader}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.cancel, { color: colors.mute }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.sheetTitle, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>New task</Text>
          {mode === 'manual' ? (
            <TouchableOpacity onPress={handleAdd}>
              <Text style={[styles.addBtn, { color: colors.focus }]}>Add</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>

        {/* Mode toggle — only shown when AI is enabled */}
        {aiEnabled && (
          <View style={[styles.modeToggle, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              onPress={() => setMode('manual')}
              style={[styles.modeTab, mode === 'manual' && { backgroundColor: colors.bg }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeTabText, { color: mode === 'manual' ? colors.ink : colors.mute }]}>Manual</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode('ai')}
              style={[styles.modeTab, mode === 'ai' && { backgroundColor: colors.bg }]}
              activeOpacity={0.7}
            >
              <SparkleIcon size={13} color={mode === 'ai' ? colors.focus : colors.mute} />
              <Text style={[styles.modeTabText, { color: mode === 'ai' ? colors.focus : colors.mute }]}>AI Breakdown</Text>
            </TouchableOpacity>
          </View>
        )}

        {(mode === 'manual' || !aiEnabled) ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 12 }}
          >
            {/* Title */}
            <View style={[styles.field, { backgroundColor: colors.surface }]}>
              <Text style={[styles.fieldLabel, { color: colors.mute }]}>TITLE</Text>
              <TextInput
                value={title}
                onChangeText={(v) => { setTitle(v); if (aiTag) setAiTag(null); }}
                onBlur={handleTitleBlur}
                placeholder="What are you working on?"
                placeholderTextColor={colors.soft}
                style={[styles.titleInput, { color: colors.ink }]}
                autoFocus
                returnKeyType="next"
              />
            </View>

            {/* Description */}
            <View style={[styles.field, { backgroundColor: colors.surface }]}>
              <Text style={[styles.fieldLabel, { color: colors.mute }]}>DESCRIPTION</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add context, goals, or notes…"
                placeholderTextColor={colors.soft}
                style={[styles.descInput, { color: colors.ink }]}
                multiline
                returnKeyType="default"
                blurOnSubmit={false}
              />
            </View>

            {/* Sub-tasks */}
            <View style={[styles.field, { backgroundColor: colors.surface }]}>
              <View style={styles.subtaskHeader}>
                <Text style={[styles.fieldLabel, { color: colors.mute }]}>STEPS</Text>
                <TouchableOpacity onPress={addSubtask} activeOpacity={0.7}
                  style={[styles.addStepBtn, { backgroundColor: `${colors.focus}18` }]}>
                  <PlusIcon size={12} color={colors.focus} />
                  <Text style={[styles.addStepText, { color: colors.focus }]}>Add step</Text>
                </TouchableOpacity>
              </View>
              {subtasks.length === 0 ? (
                <TouchableOpacity onPress={addSubtask} activeOpacity={0.6}>
                  <Text style={[styles.subtaskPlaceholder, { color: colors.soft }]}>
                    Break it into steps — e.g. "Research", "Draft", "Review"
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={{ gap: 8, marginTop: 4 }}>
                  {subtasks.map((st, i) => (
                    <View key={st.id} style={[styles.subtaskRow, { borderBottomColor: colors.line, borderBottomWidth: i < subtasks.length - 1 ? StyleSheet.hairlineWidth : 0 }]}>
                      <View style={[styles.stepDot, { borderColor: colors.line }]} />
                      <TextInput
                        ref={i === subtasks.length - 1 ? newSubtaskRef : null}
                        value={st.title}
                        onChangeText={(v) => updateSubtask(st.id, v)}
                        placeholder={`Step ${i + 1}`}
                        placeholderTextColor={colors.soft}
                        style={[styles.subtaskInput, { color: colors.ink }]}
                        returnKeyType="next"
                        onSubmitEditing={addSubtask}
                        blurOnSubmit={false}
                      />
                      <TouchableOpacity onPress={() => removeSubtask(st.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <XIcon size={14} color={colors.soft} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.row2}>
              <View style={[styles.halfField, { backgroundColor: colors.surface }]}>
                <Text style={[styles.fieldLabel, { color: colors.mute }]}>TOMATOES</Text>
                <View style={styles.tomatoRow}>
                  <Text style={[styles.tomatoNum, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>{tomatoes}</Text>
                  <TomatoDots done={tomatoes} total={tomatoes} colors={colors} size={9} />
                </View>
                <View style={styles.tomatoStepper}>
                  <TouchableOpacity onPress={() => setTomatoes((t) => Math.max(1, t - 1))}
                    style={[styles.tStep, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.tStepLabel, { color: colors.mute }]}>−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setTomatoes((t) => Math.min(8, t + 1))}
                    style={[styles.tStep, { backgroundColor: colors.focus }]}>
                    <Text style={[styles.tStepLabel, { color: '#fff' }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.halfField, { backgroundColor: colors.surface }]}>
                <Text style={[styles.fieldLabel, { color: colors.mute }]}>DURATION</Text>
                <Text style={[styles.durationText, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
                  {tomatoes * 25}m
                </Text>
                <Text style={[styles.durationSub, { color: colors.mute }]}>total focus time</Text>
              </View>
            </View>

            {/* Workload banner */}
            {pendingPomodoros > 0 && (
              <View style={[
                styles.workloadBanner,
                {
                  backgroundColor: isOverloaded ? `${colors.warm || '#E8A030'}12` : `${colors.focus}0D`,
                  borderColor: isOverloaded ? `${colors.warm || '#E8A030'}40` : `${colors.focus}25`,
                },
              ]}>
                <Text style={[styles.workloadText, { color: isOverloaded ? (colors.warm || '#E8A030') : colors.mute }]}>
                  {isOverloaded
                    ? `Heads up — ${totalWithNew} 🍅 queued (${Math.round(totalWithNew * 0.5)}h of focus). That's more than your day can fit.`
                    : `${pendingPomodoros} 🍅 already queued · ${totalWithNew} total with this task`}
                </Text>
              </View>
            )}

            {/* Tag picker */}
            <View style={[styles.field, { backgroundColor: colors.surface }]}>
              <View style={styles.tagHeader}>
                <Text style={[styles.fieldLabel, { color: colors.mute }]}>TAG</Text>
                {aiTagLoading && (
                  <View style={styles.aiTagHint}>
                    <ActivityIndicator size="small" color={colors.focus} />
                    <Text style={[styles.aiTagHintText, { color: colors.focus }]}>Auto-tagging…</Text>
                  </View>
                )}
                {aiTag && !aiTagLoading && (
                  <View style={styles.aiTagHint}>
                    <SparkleIcon size={11} color={colors.focus} />
                    <Text style={[styles.aiTagHintText, { color: colors.focus }]}>AI suggestion</Text>
                  </View>
                )}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tagScroll}>
                {TAG_OPTIONS.map((tag) => {
                  const tc = tag.color || colors[tag.colorKey];
                  const isOn = selectedTag === tag.label;
                  const isAiPick = aiTag === tag.label;
                  return (
                    <TouchableOpacity key={tag.label}
                      onPress={() => { setSelectedTag(tag.label); setAiTag(null); }}
                      activeOpacity={0.7}
                      style={[
                        styles.tagChip,
                        { backgroundColor: isOn ? `${tc}20` : colors.bg, borderWidth: isOn ? 1.5 : 0, borderColor: isOn ? tc : 'transparent' },
                      ]}>
                      <View style={[styles.tagDot, { backgroundColor: tc }]} />
                      <Text style={[styles.tagLabel, { color: isOn ? tc : colors.mute }]}>{tag.label}</Text>
                      {isAiPick && isOn && (
                        <Text style={[styles.aiChipBadge, { color: tc }]}>✦</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <PillButton colors={colors} primary size="lg" style={styles.submitBtn} onPress={handleAdd}>
              <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '600' }}>Add to today</Text>
              <ArrowIcon size={16} color={colors.bg} />
            </PillButton>
          </ScrollView>
        ) : (
          <>
            <View style={[styles.field, { backgroundColor: colors.surface }]}>
              <Text style={[styles.fieldLabel, { color: colors.mute }]}>DESCRIBE YOUR GOAL</Text>
              <TextInput
                value={goal}
                onChangeText={setGoal}
                placeholder="e.g. Write the Q3 investor update deck"
                placeholderTextColor={colors.soft}
                style={[styles.titleInput, { color: colors.ink }]}
                autoFocus
                multiline
              />
            </View>

            {aiError ? (
              <Text style={[styles.aiError, { color: colors.warm || '#E57373' }]}>{aiError}</Text>
            ) : null}

            {aiTasks.length > 0 && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 260 }}>
                <View style={[styles.field, { backgroundColor: colors.surface, gap: 8 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.mute }]}>
                    {selectedAiTasks.size} OF {aiTasks.length} TASKS SELECTED
                  </Text>
                  {aiTasks.map((t, i) => {
                    const colorKey = TAG_COLOR_MAP[t.tag];
                    const tc = colorKey ? colors[colorKey] : '#A47BB9';
                    const isOn = selectedAiTasks.has(i);
                    return (
                      <TouchableOpacity key={i} onPress={() => toggleAiTask(i)} activeOpacity={0.75}
                        style={[styles.aiTaskRow, { backgroundColor: isOn ? `${tc}12` : colors.bg, borderColor: isOn ? `${tc}40` : colors.line }]}>
                        <View style={[styles.aiCheck, { backgroundColor: isOn ? tc : 'transparent', borderColor: isOn ? tc : colors.line }]}>
                          {isOn && <CheckIcon size={11} color="#fff" strokeWidth={2.5} />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.aiTaskTitle, { color: colors.ink }]}>{t.title}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <View style={[styles.tagPill, { backgroundColor: `${tc}18` }]}>
                              <Text style={[styles.tagPillText, { color: tc }]}>{t.tag}</Text>
                            </View>
                            <Text style={[styles.aiTaskMeta, { color: colors.mute }]}>{t.total} 🍅</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            {aiTasks.length > 0 ? (
              <PillButton colors={colors} primary size="lg" style={styles.submitBtn} onPress={handleAddAll}>
                <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '600' }}>
                  Add {selectedAiTasks.size} task{selectedAiTasks.size !== 1 ? 's' : ''}
                </Text>
                <ArrowIcon size={16} color={colors.bg} />
              </PillButton>
            ) : (
              <PillButton colors={colors} primary size="lg" style={styles.submitBtn} onPress={handleBreakdown} disabled={aiLoading || !goal.trim()}>
                {aiLoading ? (
                  <ActivityIndicator color={colors.bg} size="small" />
                ) : (
                  <>
                    <SparkleIcon size={16} color={colors.bg} />
                    <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '600' }}>Break it down</Text>
                  </>
                )}
              </PillButton>
            )}
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, paddingTop: 12,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 30, shadowOffset: { width: 0, height: -10 },
    elevation: 20, maxHeight: '92%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 10 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cancel: { fontSize: 14 },
  sheetTitle: { fontSize: 20, fontWeight: '400' },
  addBtn: { fontSize: 14, fontWeight: '600' },
  modeToggle: { flexDirection: 'row', borderRadius: 12, padding: 3, marginBottom: 14 },
  modeTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: 10 },
  modeTabText: { fontSize: 13, fontWeight: '600' },
  field: { borderRadius: 14, padding: 14 },
  fieldLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 },
  titleInput: { fontSize: 16, fontWeight: '550' },
  descInput: { fontSize: 14, lineHeight: 20, minHeight: 52 },
  subtaskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addStepBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 100 },
  addStepText: { fontSize: 12, fontWeight: '600' },
  subtaskPlaceholder: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 8 },
  stepDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, flexShrink: 0 },
  subtaskInput: { flex: 1, fontSize: 14 },
  row2: { flexDirection: 'row', gap: 10 },
  halfField: { flex: 1, borderRadius: 14, padding: 14 },
  tomatoRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  tomatoNum: { fontSize: 26, fontWeight: '400', letterSpacing: -0.5 },
  tomatoStepper: { flexDirection: 'row', gap: 8 },
  tStep: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tStepLabel: { fontSize: 18, lineHeight: 22 },
  durationText: { fontSize: 26, fontWeight: '400', letterSpacing: -0.5, marginBottom: 4 },
  durationSub: { fontSize: 11 },
  tagHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  aiTagHint: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  aiTagHintText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.4 },
  tagScroll: { gap: 8 },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 100 },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  tagLabel: { fontSize: 13, fontWeight: '550' },
  aiChipBadge: { fontSize: 10, fontWeight: '700' },
  submitBtn: { width: '100%', marginTop: 4 },
  workloadBanner: { borderRadius: 10, padding: 10, borderWidth: 1 },
  workloadText: { fontSize: 12, lineHeight: 17 },
  aiError: { fontSize: 13, textAlign: 'center' },
  aiTaskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, padding: 10, borderWidth: 1 },
  aiCheck: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aiTaskTitle: { fontSize: 13.5, fontWeight: '550' },
  aiTaskMeta: { fontSize: 12 },
  tagPill: { paddingVertical: 2, paddingHorizontal: 7, borderRadius: 100 },
  tagPillText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
});
