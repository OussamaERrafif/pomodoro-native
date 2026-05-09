import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';
import { TomatoDots, CheckIcon, XIcon, PlusIcon, TargetIcon, ChevRightIcon } from '../../src/components';
import { FONT_DISPLAY } from '../../src/constants/tokens';

export default function TaskDetailModal() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const tasks = useAppStore((s) => s.tasks);
  const updateTask = useAppStore((s) => s.updateTask);
  const toggleSubtask = useAppStore((s) => s.toggleSubtask);
  const setTaskActive = useAppStore((s) => s.setTaskActive);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const haptics = useAppStore((s) => s.haptics);
  const currentTaskId = useAppStore((s) => s.currentTaskId);

  const task = tasks.find((t) => t.id === id);

  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(task?.description || '');
  const [newStepTitle, setNewStepTitle] = useState('');
  const [addingStep, setAddingStep] = useState(false);

  if (!task) {
    return (
      <View style={[styles.overlay, { backgroundColor: colors.bg }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeRow}>
          <XIcon size={20} color={colors.mute} />
        </TouchableOpacity>
        <Text style={[styles.emptyText, { color: colors.mute }]}>Task not found.</Text>
      </View>
    );
  }

  const subtasks = task.subtasks || [];
  const doneSubtasks = subtasks.filter((s) => s.done).length;
  const isActive = task.id === currentTaskId && !task.complete;

  const tagColorMap = { focus: colors.focus, breakC: colors.breakC, plum: colors.plum };
  const tagColor = task.tagColor || tagColorMap[task.tagColorKey] || colors.focus;

  const handleFocus = () => {
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setTaskActive(task.id);
    router.back();
    router.push('/(tabs)');
  };

  const saveDescription = () => {
    updateTask(task.id, { description: descDraft.trim() || undefined });
    setEditingDesc(false);
  };

  const handleToggleSubtask = (subtaskId) => {
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleSubtask(task.id, subtaskId);
  };

  const handleAddStep = () => {
    if (!newStepTitle.trim()) { setAddingStep(false); return; }
    const existing = task.subtasks || [];
    updateTask(task.id, {
      subtasks: [...existing, { id: Date.now().toString(), title: newStepTitle.trim(), done: false }],
    });
    setNewStepTitle('');
    setAddingStep(false);
  };

  const handleDeleteStep = (subtaskId) => {
    updateTask(task.id, {
      subtasks: subtasks.filter((s) => s.id !== subtaskId),
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete task',
      `"${task.title}" will be permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => { deleteTask(task.id); router.back(); } },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => router.back()} />

      <View style={[styles.sheet, { backgroundColor: colors.bg, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.handle, { backgroundColor: colors.line }]} />

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={[styles.tagBadge, { backgroundColor: `${tagColor}18` }]}>
            <View style={[styles.tagDot, { backgroundColor: tagColor }]} />
            <Text style={[styles.tagText, { color: tagColor }]}>{task.tag}</Text>
          </View>
          <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.deleteText, { color: colors.mute }]}>Delete</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Title */}
          <Text style={[styles.title, { color: task.complete ? colors.mute : colors.ink, fontFamily: FONT_DISPLAY,
            textDecorationLine: task.complete ? 'line-through' : 'none' }]}>
            {task.title}
          </Text>

          {/* Tomato progress */}
          <View style={styles.progressRow}>
            <TomatoDots done={task.done} total={task.total} colors={colors} size={9} />
            <Text style={[styles.progressText, { color: colors.mute }]}>
              {task.done}/{task.total} sessions
            </Text>
            {isActive && (
              <View style={[styles.activePill, { backgroundColor: `${colors.focus}18` }]}>
                <View style={[styles.activeDot, { backgroundColor: colors.focus }]} />
                <Text style={[styles.activeText, { color: colors.focus }]}>Focusing now</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={[styles.section, { borderTopColor: colors.line }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: colors.mute }]}>DESCRIPTION</Text>
              {!editingDesc && (
                <TouchableOpacity onPress={() => { setDescDraft(task.description || ''); setEditingDesc(true); }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={[styles.editText, { color: colors.focus }]}>
                    {task.description ? 'Edit' : 'Add'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {editingDesc ? (
              <View style={{ gap: 8 }}>
                <TextInput
                  value={descDraft}
                  onChangeText={setDescDraft}
                  placeholder="Add context, goals, or notes…"
                  placeholderTextColor={colors.soft}
                  style={[styles.descInput, { color: colors.ink, borderColor: colors.line }]}
                  multiline
                  autoFocus
                />
                <View style={styles.descActions}>
                  <TouchableOpacity onPress={() => setEditingDesc(false)}
                    style={[styles.descBtn, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.descBtnText, { color: colors.mute }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={saveDescription}
                    style={[styles.descBtn, { backgroundColor: colors.focus }]}>
                    <Text style={[styles.descBtnText, { color: '#fff' }]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : task.description ? (
              <Text style={[styles.descText, { color: colors.ink }]}>{task.description}</Text>
            ) : (
              <TouchableOpacity onPress={() => { setDescDraft(''); setEditingDesc(true); }} activeOpacity={0.6}>
                <Text style={[styles.descText, { color: colors.soft }]}>
                  Tap "Add" to describe this task…
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Sub-tasks */}
          <View style={[styles.section, { borderTopColor: colors.line }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: colors.mute }]}>
                STEPS{subtasks.length > 0 ? ` · ${doneSubtasks}/${subtasks.length}` : ''}
              </Text>
              <TouchableOpacity onPress={() => setAddingStep(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={[styles.editText, { color: colors.focus }]}>+ Add</Text>
              </TouchableOpacity>
            </View>

            {subtasks.length === 0 && !addingStep && (
              <TouchableOpacity onPress={() => setAddingStep(true)} activeOpacity={0.6}>
                <Text style={[styles.descText, { color: colors.soft }]}>
                  Break this task into steps…
                </Text>
              </TouchableOpacity>
            )}

            {subtasks.length > 0 && (
              <View style={{ gap: 2 }}>
                {/* Progress bar */}
                <View style={[styles.stepsBar, { backgroundColor: colors.line }]}>
                  <View style={[styles.stepsBarFill, {
                    backgroundColor: colors.breakC,
                    width: `${subtasks.length > 0 ? (doneSubtasks / subtasks.length) * 100 : 0}%`,
                  }]} />
                </View>
                <View style={{ gap: 0, marginTop: 8 }}>
                  {subtasks.map((st, i) => (
                    <View key={st.id} style={[
                      styles.stepRow,
                      { borderBottomColor: colors.line, borderBottomWidth: i < subtasks.length - 1 ? StyleSheet.hairlineWidth : 0 },
                    ]}>
                      <TouchableOpacity
                        onPress={() => handleToggleSubtask(st.id)}
                        activeOpacity={0.7}
                        style={[
                          styles.stepCheck,
                          {
                            backgroundColor: st.done ? colors.breakC : 'transparent',
                            borderColor: st.done ? colors.breakC : colors.line,
                          },
                        ]}
                      >
                        {st.done && <CheckIcon size={10} color="#fff" strokeWidth={3} />}
                      </TouchableOpacity>
                      <Text style={[
                        styles.stepTitle,
                        {
                          color: st.done ? colors.mute : colors.ink,
                          textDecorationLine: st.done ? 'line-through' : 'none',
                          flex: 1,
                        },
                      ]}>
                        {st.title}
                      </Text>
                      <TouchableOpacity onPress={() => handleDeleteStep(st.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <XIcon size={13} color={colors.soft} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {addingStep && (
              <View style={[styles.newStepRow, { borderColor: colors.focus }]}>
                <View style={[styles.stepDot, { borderColor: colors.focus }]} />
                <TextInput
                  value={newStepTitle}
                  onChangeText={setNewStepTitle}
                  placeholder="New step…"
                  placeholderTextColor={colors.soft}
                  style={[styles.subtaskInput, { color: colors.ink }]}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleAddStep}
                  onBlur={handleAddStep}
                />
              </View>
            )}
          </View>
        </ScrollView>

        {/* Focus button */}
        {!task.complete && (
          <TouchableOpacity
            onPress={handleFocus}
            activeOpacity={0.85}
            style={[
              styles.focusBtn,
              { backgroundColor: isActive ? `${colors.focus}20` : colors.focus },
            ]}
          >
            <TargetIcon size={18} color={isActive ? colors.focus : '#fff'} />
            <Text style={[styles.focusBtnText, { color: isActive ? colors.focus : '#fff' }]}>
              {isActive ? 'Currently focusing' : 'Focus on this'}
            </Text>
            {!isActive && <ChevRightIcon size={16} color="#fff" strokeWidth={2} />}
          </TouchableOpacity>
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
    elevation: 20, maxHeight: '90%',
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
  closeRow: { padding: 20 },
  emptyText: { textAlign: 'center', fontSize: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  tagBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: 12, borderRadius: 100 },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  tagText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
  deleteText: { fontSize: 13 },
  title: { fontSize: 26, fontWeight: '400', letterSpacing: -0.5, lineHeight: 32, marginBottom: 12 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  progressText: { fontSize: 12 },
  activePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 100 },
  activeDot: { width: 5, height: 5, borderRadius: 3 },
  activeText: { fontSize: 11, fontWeight: '600' },
  section: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 18, paddingBottom: 4, marginTop: 16, gap: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' },
  editText: { fontSize: 13, fontWeight: '600' },
  descText: { fontSize: 14, lineHeight: 21 },
  descInput: {
    fontSize: 14, lineHeight: 21, borderWidth: 1, borderRadius: 10,
    padding: 10, minHeight: 80,
  },
  descActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  descBtn: { paddingVertical: 7, paddingHorizontal: 18, borderRadius: 100 },
  descBtnText: { fontSize: 13, fontWeight: '600' },
  stepsBar: { height: 5, borderRadius: 3, overflow: 'hidden', marginBottom: 2 },
  stepsBarFill: { height: '100%', borderRadius: 3 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  stepCheck: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepTitle: { fontSize: 14, lineHeight: 20 },
  newStepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 4 },
  stepDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, flexShrink: 0 },
  subtaskInput: { flex: 1, fontSize: 14 },
  focusBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 18, marginTop: 16,
  },
  focusBtnText: { fontSize: 16, fontWeight: '600' },
});
