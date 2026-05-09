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
  const logEnergy = useAppStore((s) => s.logEnergy);
  const startTimer = useAppStore((s) => s.startTimer);
  const focusDuration = useAppStore((s) => s.focusDuration);

  const [selected, setSelected] = useState(4);
  const [energy, setEnergy] = useState(2); // 1=Low 2=Medium 3=High
  const [note, setNote] = useState('');

  const moodColors = [colors.focus, colors.focusSoft, colors.warm, colors.breakSoft, colors.breakC];

  const handleStart = () => {
    logMood(selected, note.trim());
    logEnergy(energy);
    startTimer();
    router.back();
  };

  const ENERGY_LEVELS = [
    { value: 1, label: 'Low',    icon: '🔋' },
    { value: 2, label: 'Medium', icon: '⚡' },
    { value: 3, label: 'High',   icon: '🚀' },
  ];

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

        {/* Energy level */}
        <View style={styles.energySection}>
          <Text style={[styles.energyLabel, { color: colors.mute }]}>ENERGY LEVEL</Text>
          <View style={styles.energyRow}>
            {ENERGY_LEVELS.map((e) => {
              const isOn = energy === e.value;
              return (
                <TouchableOpacity
                  key={e.value}
                  onPress={() => setEnergy(e.value)}
                  activeOpacity={0.75}
                  style={[
                    styles.energyChip,
                    {
                      backgroundColor: isOn ? `${colors.focus}18` : colors.surface,
                      borderColor: isOn ? colors.focus : 'transparent',
                      borderWidth: isOn ? 1.5 : 0,
                    },
                  ]}
                >
                  <Text style={styles.energyIcon}>{e.icon}</Text>
                  <Text style={[styles.energyChipLabel, { color: isOn ? colors.focus : colors.mute, fontWeight: isOn ? '700' : '500' }]}>
                    {e.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
  energySection: { gap: 8 },
  energyLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  energyRow: { flexDirection: 'row', gap: 10 },
  energyChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 14 },
  energyIcon: { fontSize: 16 },
  energyChipLabel: { fontSize: 13 },
  noteField: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, padding: 14,
  },
  notePre: { fontSize: 13 },
  noteOptional: { fontSize: 13 },
  noteInput: { flex: 1, fontSize: 13 },
  btn: { width: '100%', marginTop: 4 },
});
