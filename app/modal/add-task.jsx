import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';
import { PillButton, TomatoDots, PlusIcon, ArrowIcon } from '../../src/components';
import { FONT_DISPLAY } from '../../src/constants/tokens';

const TAG_OPTIONS = [
  { label: 'Work', colorKey: 'focus' },
  { label: 'Reading', colorKey: 'breakC' },
  { label: 'Design', colorKey: 'plum' },
  { label: 'Personal', color: '#A47BB9' },
  { label: 'Wellness', colorKey: 'breakC' },
];

export default function AddTaskModal() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addTask = useAppStore((s) => s.addTask);

  const [title, setTitle] = useState('');
  const [tomatoes, setTomatoes] = useState(2);
  const [selectedTag, setSelectedTag] = useState('Work');

  const getTagColor = (tag) => {
    const t = TAG_OPTIONS.find((x) => x.label === tag);
    if (!t) return colors.focus;
    return t.color || colors[t.colorKey];
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    const tagOpt = TAG_OPTIONS.find((t) => t.label === selectedTag);
    addTask({
      title: title.trim(),
      tag: selectedTag,
      tagColorKey: tagOpt?.colorKey,
      tagColor: tagOpt?.color,
      total: tomatoes,
    });
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
          <TouchableOpacity onPress={handleAdd}>
            <Text style={[styles.addBtn, { color: colors.focus }]}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Title input */}
        <View style={[styles.field, { backgroundColor: colors.surface }]}>
          <Text style={[styles.fieldLabel, { color: colors.mute }]}>TITLE</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What are you working on?"
            placeholderTextColor={colors.soft}
            style={[styles.titleInput, { color: colors.ink }]}
            autoFocus
            returnKeyType="done"
          />
        </View>

        <View style={styles.row2}>
          {/* Tomatoes */}
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

          {/* Duration display */}
          <View style={[styles.halfField, { backgroundColor: colors.surface }]}>
            <Text style={[styles.fieldLabel, { color: colors.mute }]}>DURATION</Text>
            <Text style={[styles.durationText, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
              {tomatoes * 25}m
            </Text>
            <Text style={[styles.durationSub, { color: colors.mute }]}>total focus time</Text>
          </View>
        </View>

        {/* Tag picker */}
        <View style={[styles.field, { backgroundColor: colors.surface }]}>
          <Text style={[styles.fieldLabel, { color: colors.mute }]}>TAG</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagScroll}>
            {TAG_OPTIONS.map((tag) => {
              const tc = tag.color || colors[tag.colorKey];
              const isOn = selectedTag === tag.label;
              return (
                <TouchableOpacity key={tag.label} onPress={() => setSelectedTag(tag.label)}
                  activeOpacity={0.7}
                  style={[
                    styles.tagChip,
                    {
                      backgroundColor: isOn ? `${tc}20` : colors.bg,
                      borderWidth: isOn ? 1.5 : 0,
                      borderColor: isOn ? tc : 'transparent',
                    },
                  ]}>
                  <View style={[styles.tagDot, { backgroundColor: tc }]} />
                  <Text style={[styles.tagLabel, { color: isOn ? tc : colors.mute }]}>{tag.label}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={[styles.tagChip, { backgroundColor: colors.bg }]}>
              <PlusIcon size={12} color={colors.mute} />
              <Text style={[styles.tagLabel, { color: colors.mute }]}>New</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <PillButton colors={colors} primary size="lg" style={styles.submitBtn} onPress={handleAdd}>
          <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '600' }}>Add to today</Text>
          <ArrowIcon size={16} color={colors.bg} />
        </PillButton>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, paddingTop: 12, gap: 14,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 30, shadowOffset: { width: 0, height: -10 },
    elevation: 20,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 6 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cancel: { fontSize: 14 },
  sheetTitle: { fontSize: 20, fontWeight: '400' },
  addBtn: { fontSize: 14, fontWeight: '600' },
  field: { borderRadius: 14, padding: 14 },
  fieldLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.8,
    textTransform: 'uppercase', marginBottom: 4,
  },
  titleInput: { fontSize: 16, fontWeight: '550' },
  row2: { flexDirection: 'row', gap: 10 },
  halfField: { flex: 1, borderRadius: 14, padding: 14 },
  tomatoRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  tomatoNum: { fontSize: 26, fontWeight: '400', letterSpacing: -0.5 },
  tomatoStepper: { flexDirection: 'row', gap: 8 },
  tStep: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tStepLabel: { fontSize: 18, lineHeight: 22 },
  durationText: { fontSize: 26, fontWeight: '400', letterSpacing: -0.5, marginBottom: 4 },
  durationSub: { fontSize: 11 },
  tagScroll: { gap: 8, paddingTop: 4 },
  tagChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 7, paddingHorizontal: 12, borderRadius: 100,
  },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  tagLabel: { fontSize: 13, fontWeight: '550' },
  submitBtn: { width: '100%' },
});
