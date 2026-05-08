import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';
import { XIcon } from '../../src/components';
import { FONT_DISPLAY } from '../../src/constants/tokens';

const REASONS = [
  { id: 'phone',       label: 'Phone',           emoji: '📱' },
  { id: 'social',      label: 'Social media',     emoji: '💬' },
  { id: 'thoughts',    label: 'Mind wandered',    emoji: '🌀' },
  { id: 'noise',       label: 'Noise / people',   emoji: '🔊' },
  { id: 'hunger',      label: 'Hunger / thirst',  emoji: '🍵' },
  { id: 'urgent',      label: 'Urgent task',      emoji: '⚡' },
  { id: 'fatigue',     label: 'Fatigue',          emoji: '😴' },
  { id: 'other',       label: 'Other',            emoji: '✏️' },
];

export default function DistractionModal() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const logDistraction = useAppStore((s) => s.logDistraction);
  const haptics = useAppStore((s) => s.haptics);

  const [selected, setSelected] = useState(null);
  const [otherText, setOtherText] = useState('');

  const handleSelect = (id) => {
    if (haptics) Haptics.selectionAsync().catch(() => {});
    setSelected(id);
  };

  const handleLog = () => {
    const reason = selected === 'other' ? (otherText.trim() || 'Other') : selected;
    if (!reason) return;
    if (haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    logDistraction(reason);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.screen, { backgroundColor: colors.bg, paddingBottom: insets.bottom + 16 }]}>
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: colors.line }]} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.mute }]}>Log distraction</Text>
            <Text style={[styles.title, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
              What pulled you away?
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}
            style={[styles.closeBtn, { backgroundColor: colors.surface }]}>
            <XIcon size={16} color={colors.mute} />
          </TouchableOpacity>
        </View>

        {/* Reason chips */}
        <View style={styles.grid}>
          {REASONS.map((r) => {
            const active = selected === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                onPress={() => handleSelect(r.id)}
                activeOpacity={0.75}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? `${colors.focus}18` : colors.surface,
                    borderWidth: active ? 1.5 : 0,
                    borderColor: active ? colors.focus : 'transparent',
                    shadowColor: colors.ink,
                  },
                ]}
              >
                <Text style={styles.chipEmoji}>{r.emoji}</Text>
                <Text style={[styles.chipLabel, { color: active ? colors.focus : colors.ink }]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Other text input */}
        {selected === 'other' && (
          <TextInput
            value={otherText}
            onChangeText={setOtherText}
            placeholder="Describe the distraction…"
            placeholderTextColor={colors.mute}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.ink, borderColor: colors.line }]}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleLog}
          />
        )}

        {/* Log button */}
        <TouchableOpacity
          onPress={handleLog}
          activeOpacity={0.8}
          disabled={!selected}
          style={[styles.logBtn, {
            backgroundColor: selected ? colors.focus : `${colors.mute}30`,
          }]}
        >
          <Text style={[styles.logBtnText, { color: selected ? '#fff' : colors.mute }]}>
            Log it
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  eyebrow: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '400', letterSpacing: -0.3 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14,
    shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  chipEmoji: { fontSize: 16 },
  chipLabel: { fontSize: 14, fontWeight: '500' },
  input: {
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 14, marginBottom: 20,
  },
  logBtn: {
    borderRadius: 18, paddingVertical: 16, alignItems: 'center', marginTop: 'auto',
  },
  logBtnText: { fontSize: 15, fontWeight: '600' },
});
