import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';
import { PillButton } from '../../src/components';
import { FONT_DISPLAY } from '../../src/constants/tokens';

const MOODS = [
  { label: 'Drained', value: 1 },
  { label: 'Foggy',   value: 2 },
  { label: 'Okay',    value: 3 },
  { label: 'Sharp',   value: 4 },
  { label: 'Flowing', value: 5 },
];

export default function MoodModal() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const logMood = useAppStore((s) => s.logMood);
  const focusDuration = useAppStore((s) => s.focusDuration);

  const [selected, setSelected] = useState(4);
  const [note, setNote] = useState('');

  const moodColors = [colors.focus, colors.focusSoft, colors.warm, colors.breakSoft, colors.breakC];

  const handleStart = () => {
    logMood(selected, note.trim());
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => router.back()} />

      <View style={[styles.sheet, { backgroundColor: colors.bg, paddingBottom: insets.bottom + 28 }]}>
        <View style={[styles.handle, { backgroundColor: colors.line }]} />

        <Text style={[styles.eyebrow, { color: colors.focus }]}>Before you begin</Text>
        <Text style={[styles.headline, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
          How's your energy?
        </Text>
        <Text style={[styles.body, { color: colors.mute }]}>
          A quick check-in helps you notice patterns over time.
        </Text>

        {/* Mood scale */}
        <View style={styles.moodRow}>
          {MOODS.map((m) => {
            const isSelected = selected === m.value;
            const mc = moodColors[m.value - 1];
            return (
              <TouchableOpacity
                key={m.value}
                onPress={() => setSelected(m.value)}
                activeOpacity={0.75}
                style={styles.moodItem}
              >
                <View style={[
                  styles.moodCircle,
                  {
                    backgroundColor: mc,
                    opacity: isSelected ? 1 : 0.55,
                    transform: [{ scale: isSelected ? 1.1 : 1 }],
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: isSelected ? colors.ink : 'transparent',
                  },
                ]} />
                <Text style={[
                  styles.moodLabel,
                  { color: isSelected ? colors.ink : colors.mute, fontWeight: isSelected ? '600' : '500' },
                ]}>{m.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Note field */}
        <View style={[styles.noteField, { backgroundColor: colors.surface }]}>
          <Text style={[styles.notePre, { color: colors.ink }]}>Note </Text>
          <Text style={[styles.noteOptional, { color: colors.mute }]}>(optional) · </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="slept well, lots of coffee…"
            placeholderTextColor={colors.soft}
            style={[styles.noteInput, { color: colors.ink }]}
            returnKeyType="done"
          />
        </View>

        <PillButton colors={colors} primary size="lg" style={styles.btn} onPress={handleStart}>
          <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '600' }}>
            Start {focusDuration}-minute focus
          </Text>
        </PillButton>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, paddingTop: 16, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 30,
    shadowOffset: { width: 0, height: -10 }, elevation: 20,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 10 },
  eyebrow: {
    fontSize: 11, fontWeight: '600', letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  headline: { fontSize: 30, fontWeight: '400', letterSpacing: -0.5, lineHeight: 34, marginTop: 4 },
  body: { fontSize: 14, lineHeight: 20 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  moodItem: { flex: 1, alignItems: 'center', gap: 8 },
  moodCircle: { width: 44, height: 44, borderRadius: 22 },
  moodLabel: { fontSize: 11 },
  noteField: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, padding: 14,
  },
  notePre: { fontSize: 13 },
  noteOptional: { fontSize: 13 },
  noteInput: { flex: 1, fontSize: 13 },
  btn: { width: '100%', marginTop: 4 },
});
