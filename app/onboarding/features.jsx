import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { PillButton, ArrowIcon, TargetIcon, TaskIcon, ChartIcon } from '../../src/components';
import { FONT_DISPLAY } from '../../src/constants/tokens';

function PageDots({ active, total, colors }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[
          styles.dot,
          {
            width: i === active ? 22 : 6,
            backgroundColor: i === active ? colors.focus : colors.line,
          },
        ]} />
      ))}
    </View>
  );
}

const ROWS = [
  { Icon: TargetIcon, label: 'Focus timer', body: '25-minute deep work sessions, gently bookended by mindful breaks.', colorKey: 'focus' },
  { Icon: TaskIcon, label: 'Task tracking', body: 'Plan your day in tomatoes. Tap to start, check off when it sings.', colorKey: 'plum' },
  { Icon: ChartIcon, label: 'Progress insights', body: 'See your focus rhythm. Notice the patterns. Get a little better.', colorKey: 'breakC' },
];

export default function OnboardingFeatures() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top + 12 }]}>
      <View style={styles.topRow}>
        <Text style={[styles.step, { color: colors.mute }]}>Step 1 of 3</Text>
        <TouchableOpacity onPress={() => router.push('/onboarding/final')}>
          <Text style={[styles.skip, { color: colors.ink }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={[styles.headline, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>What's inside</Text>
        <Text style={[styles.sub, { color: colors.mute }]}>Three small things that, together, make a difference.</Text>
      </View>

      <View style={styles.cards}>
        {ROWS.map((row, i) => {
          const { Icon } = row;
          const tint = colors[row.colorKey];
          return (
            <View key={i} style={[styles.featureCard, { backgroundColor: colors.surface, shadowColor: colors.ink }]}>
              <View style={[styles.iconBox, { backgroundColor: `${tint}18` }]}>
                <Icon size={24} color={tint} strokeWidth={1.8} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureLabel, { color: colors.ink }]}>{row.label}</Text>
                <Text style={[styles.featureBody, { color: colors.mute }]}>{row.body}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <PageDots active={0} total={3} colors={colors} />
        <PillButton colors={colors} primary size="lg" style={styles.btn}
          onPress={() => router.push('/onboarding/personalize')}>
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
  header: { paddingHorizontal: 28, paddingTop: 28, paddingBottom: 8 },
  headline: { fontSize: 34, fontWeight: '400', letterSpacing: -0.7, lineHeight: 38, marginBottom: 8 },
  sub: { fontSize: 14, lineHeight: 20 },
  cards: { flex: 1, paddingHorizontal: 20, gap: 12, paddingTop: 8 },
  featureCard: {
    borderRadius: 22, padding: 20, flexDirection: 'row', gap: 16, alignItems: 'flex-start',
    shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  iconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureText: { flex: 1, paddingTop: 4 },
  featureLabel: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  featureBody: { fontSize: 13.5, lineHeight: 20 },
  footer: { paddingHorizontal: 28, gap: 18, paddingTop: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { height: 6, borderRadius: 3 },
  btn: { width: '100%' },
});
