import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';
import { FONT_DISPLAY } from '../../src/constants/tokens';

const RATINGS = [
  { id: 'great', label: 'Nailed it', icon: '🔥' },
  { id: 'solid', label: 'Solid', icon: '👍' },
  { id: 'okay',  label: 'Okay', icon: '😌' },
  { id: 'hard',  label: 'Struggled', icon: '😓' },
];

export default function SessionNoteModal() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const pendingSessionNote = useAppStore((s) => s.pendingSessionNote);
  const addSessionNote = useAppStore((s) => s.addSessionNote);
  const clearPendingSessionNote = useAppStore((s) => s.clearPendingSessionNote);

  const [rating, setRating] = useState(null);
  const [completed, setCompleted] = useState('');
  const [blockers, setBlockers] = useState('');

  const taskTitle = pendingSessionNote?.taskTitle;
  const tag = pendingSessionNote?.tag;
  const taskId = pendingSessionNote?.taskId;

  const handleSave = () => {
    addSessionNote({
      taskId,
      taskTitle,
      tag,
      rating,
      completed: completed.trim(),
      blockers: blockers.trim(),
    });
    router.back();
  };

  const handleSkip = () => {
    clearPendingSessionNote();
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.tomato}>🍅</Text>
          <Text style={[styles.title, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>Session complete</Text>
          {taskTitle ? (
            <Text style={[styles.taskName, { color: colors.mute }]} numberOfLines={2}>
              {taskTitle}{tag ? `  ·  ${tag}` : ''}
            </Text>
          ) : null}
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.mute }]}>HOW DID IT GO?</Text>
          <View style={styles.ratingRow}>
            {RATINGS.map((r) => (
              <TouchableOpacity
                key={r.id}
                onPress={() => setRating(r.id)}
                activeOpacity={0.75}
                style={[
                  styles.ratingChip,
                  {
                    backgroundColor: rating === r.id ? colors.focus : `${colors.ink}08`,
                    borderColor: rating === r.id ? colors.focus : 'transparent',
                  },
                ]}
              >
                <Text style={styles.ratingIcon}>{r.icon}</Text>
                <Text style={[styles.ratingLabel, { color: rating === r.id ? '#fff' : colors.ink }]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Completed */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.mute }]}>WHAT DID YOU GET DONE?</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.ink, borderColor: colors.line }]}
            placeholder="Finished the intro draft, reviewed section 2…"
            placeholderTextColor={colors.soft}
            value={completed}
            onChangeText={setCompleted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Blockers */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.mute }]}>ANY BLOCKERS?</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.ink, borderColor: colors.line }]}
            placeholder="Got stuck on the API, need to revisit tomorrow…"
            placeholderTextColor={colors.soft}
            value={blockers}
            onChangeText={setBlockers}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.8}
            style={[styles.saveBtn, { backgroundColor: colors.focus }]}
          >
            <Text style={styles.saveBtnText}>Save note</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={[styles.skipText, { color: colors.mute }]}>Skip</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 24, gap: 24 },
  header: { alignItems: 'center', gap: 8, paddingBottom: 4 },
  tomato: { fontSize: 40 },
  title: { fontSize: 28, fontWeight: '400', letterSpacing: -0.5 },
  taskName: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  section: { gap: 10 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  ratingRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ratingChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1.5,
  },
  ratingIcon: { fontSize: 16 },
  ratingLabel: { fontSize: 13, fontWeight: '600' },
  input: {
    borderRadius: 14, padding: 13, fontSize: 14, lineHeight: 20,
    borderWidth: 1, minHeight: 80,
  },
  actions: { gap: 12, alignItems: 'center' },
  saveBtn: { width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  skipText: { fontSize: 14, fontWeight: '500', paddingVertical: 4 },
});
