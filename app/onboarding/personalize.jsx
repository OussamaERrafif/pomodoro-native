import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';
import {
  PillButton, ArrowIcon, BookIcon, BriefIcon,
  EditIcon, HeartIcon, ZapIcon,
} from '../../src/components';
import { FONT_DISPLAY } from '../../src/constants/tokens';

function PageDots({ active, total, colors }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[
          styles.dot,
          { width: i === active ? 22 : 6, backgroundColor: i === active ? colors.focus : colors.line },
        ]} />
      ))}
    </View>
  );
}

const GOALS = [
  { label: 'Study', Icon: BookIcon },
  { label: 'Work', Icon: BriefIcon },
  { label: 'Writing', Icon: EditIcon },
  { label: 'Fitness', Icon: HeartIcon },
  { label: 'Reading', Icon: BookIcon },
  { label: 'Practice', Icon: ZapIcon },
];

export default function OnboardingPersonalize() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const focusDuration = useAppStore((s) => s.focusDuration);
  const shortBreakDuration = useAppStore((s) => s.shortBreakDuration);
  const setFocusDuration = useAppStore((s) => s.setFocusDuration);
  const setShortBreakDuration = useAppStore((s) => s.setShortBreakDuration);

  const [selectedGoals, setSelectedGoals] = useState(['Study', 'Work', 'Reading']);

  const toggleGoal = (label) => {
    setSelectedGoals((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top + 12 }]}>
      <View style={styles.topRow}>
        <Text style={[styles.step, { color: colors.mute }]}>Step 2 of 3</Text>
        <TouchableOpacity onPress={() => router.push('/onboarding/notifications')}>
          <Text style={[styles.skip, { color: colors.ink }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={[styles.headline, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>Set your rhythm</Text>
        <Text style={[styles.sub, { color: colors.mute }]}>You can change these anytime in Settings.</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Duration cards */}
        <View style={styles.durationRow}>
          {[
            { label: 'Focus', value: focusDuration, tint: colors.focus, onMinus: () => setFocusDuration(Math.max(5, focusDuration - 5)), onPlus: () => setFocusDuration(Math.min(60, focusDuration + 5)) },
            { label: 'Break', value: shortBreakDuration, tint: colors.breakC, onMinus: () => setShortBreakDuration(Math.max(1, shortBreakDuration - 1)), onPlus: () => setShortBreakDuration(Math.min(30, shortBreakDuration + 5)) },
          ].map((c, i) => (
            <View key={i} style={[styles.durationCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.durationLabel, { color: c.tint }]}>{c.label}</Text>
              <View style={styles.durationNum}>
                <Text style={[styles.bigNum, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>{c.value}</Text>
                <Text style={[styles.unit, { color: colors.mute }]}>min</Text>
              </View>
              <View style={[styles.stepper, { backgroundColor: colors.bg }]}>
                <TouchableOpacity onPress={c.onMinus} style={[styles.stepBtn, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.stepLabel, { color: colors.mute }]}>−</Text>
                </TouchableOpacity>
                <View style={[styles.stepDivider, { backgroundColor: colors.line }]} />
                <TouchableOpacity onPress={c.onPlus} style={[styles.stepBtnPlus, { backgroundColor: c.tint }]}>
                  <Text style={[styles.stepLabel, { color: '#fff' }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Goals */}
        <View style={[styles.goalsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.goalsTitle, { color: colors.ink }]}>What are you focusing on?</Text>
          <Text style={[styles.goalsSub, { color: colors.mute }]}>Choose any that fit.</Text>
          <View style={styles.goalsGrid}>
            {GOALS.map((g, i) => {
              const on = selectedGoals.includes(g.label);
              const { Icon } = g;
              return (
                <TouchableOpacity key={i} onPress={() => toggleGoal(g.label)} activeOpacity={0.7}
                  style={[styles.goalChip, { backgroundColor: on ? colors.ink : colors.bg }]}>
                  <Icon size={14} color={on ? colors.bg : colors.ink} strokeWidth={1.8} />
                  <Text style={[styles.goalLabel, { color: on ? colors.bg : colors.ink }]}>{g.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <PageDots active={1} total={3} colors={colors} />
        <PillButton colors={colors} primary size="lg" style={styles.btn}
          onPress={() => {
            useAppStore.getState().setSelectedGoals(selectedGoals);
            router.push('/onboarding/notifications');
          }}>
          <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '600' }}>Continue</Text>
          <ArrowIcon size={16} color={colors.bg} />
        </PillButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 28, paddingBottom: 8 },
  step: { fontSize: 13, fontWeight: '500' },
  skip: { fontSize: 13, fontWeight: '600' },
  header: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 8 },
  headline: { fontSize: 34, fontWeight: '400', letterSpacing: -0.7, lineHeight: 38, marginBottom: 8 },
  sub: { fontSize: 14, lineHeight: 20 },
  content: { paddingHorizontal: 20, gap: 14, paddingTop: 8, paddingBottom: 16 },
  durationRow: { flexDirection: 'row', gap: 12 },
  durationCard: {
    flex: 1, borderRadius: 22, padding: 18,
  },
  durationLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8 },
  durationNum: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 14 },
  bigNum: { fontSize: 48, fontWeight: '400', lineHeight: 52, letterSpacing: -1 },
  unit: { fontSize: 13 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 100, padding: 4, height: 32 },
  stepBtn: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepBtnPlus: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { fontSize: 16, fontWeight: '500', lineHeight: 20 },
  stepDivider: { width: 4, height: 4, borderRadius: 2 },
  goalsCard: { borderRadius: 22, padding: 18 },
  goalsTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  goalsSub: { fontSize: 12, marginBottom: 14 },
  goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 100 },
  goalLabel: { fontSize: 13, fontWeight: '550' },
  footer: { paddingHorizontal: 28, gap: 18, paddingTop: 16 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { height: 6, borderRadius: 3 },
  btn: { width: '100%' },
});
