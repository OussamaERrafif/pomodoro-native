import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Stop, RadialGradient, LinearGradient, Defs } from 'react-native-svg';
import { useTheme } from '../../src/hooks/useTheme';
import { PillButton, ArrowIcon } from '../../src/components';
import { FONT_DISPLAY } from '../../src/constants/tokens';

const { width, height } = Dimensions.get('window');

export default function OnboardingWelcome() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { backgroundColor: colors.warm }]}>
      {/* Hero abstract composition */}
      <View style={styles.heroArea}>
        <Svg width={width} height={height * 0.52} viewBox="0 0 360 480" preserveAspectRatio="xMidYMid slice">
          <Defs>
            <RadialGradient id="sun" cx="0.5" cy="0.5">
              <Stop offset="0%" stopColor={colors.focusSoft} stopOpacity="1" />
              <Stop offset="100%" stopColor={colors.focus} stopOpacity="1" />
            </RadialGradient>
          </Defs>
          <Circle cx="180" cy="240" r="135" fill="url(#sun)" />
          <Circle cx="265" cy="160" r="70" fill={colors.plum} opacity="0.9" />
          <Circle cx="95" cy="335" r="42" fill={colors.surface} />
          <Path d="M 60 150 Q 90 130, 120 150 T 180 150" fill="none"
            stroke={colors.plum} strokeWidth="3" strokeLinecap="round" />
          <Circle cx="295" cy="320" r="6" fill={colors.plum} />
          <Circle cx="320" cy="370" r="3" fill={colors.plum} />
          <Circle cx="50" cy="220" r="4" fill={colors.plum} />
        </Svg>
      </View>

      {/* Content card */}
      <View style={[styles.card, { backgroundColor: colors.bg, paddingBottom: insets.bottom + 24 }]}>
        <Text style={[styles.eyebrow, { color: colors.focus }]}>Tomato · Focus timer</Text>
        <Text style={[styles.headline, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
          Stay focused,{'\n'}
          <Text style={{ color: colors.focus, fontStyle: 'italic' }}>achieve more.</Text>
        </Text>
        <Text style={[styles.body, { color: colors.mute }]}>
          A gentle Pomodoro timer that helps you do deep work, then breathe. Made for the way your brain actually works.
        </Text>

        <PillButton colors={colors} primary size="lg" style={styles.btn}
          onPress={() => router.push('/onboarding/features')}>
          <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '600' }}>Get started</Text>
          <ArrowIcon size={16} color={colors.bg} />
        </PillButton>

        <TouchableOpacity onPress={() => router.push('/onboarding/features')} style={styles.signInRow}>
          <Text style={[styles.signInText, { color: colors.mute }]}>
            Already have an account?{' '}
            <Text style={{ color: colors.ink, fontWeight: '600' }}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  heroArea: { flex: 1, overflow: 'hidden' },
  card: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  headline: {
    fontSize: 44,
    fontWeight: '400',
    lineHeight: 48,
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  btn: { width: '100%' },
  signInRow: { marginTop: 20, alignItems: 'center' },
  signInText: { fontSize: 13 },
});
