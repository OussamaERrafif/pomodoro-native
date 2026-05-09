import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';
import { PillButton } from '../../src/components';
import { FONT_DISPLAY } from '../../src/constants/tokens';

const INHALE_MS = 4000;
const HOLD_MS = 4000;
const EXHALE_MS = 6000;
const CYCLE_MS = INHALE_MS + HOLD_MS + EXHALE_MS;

const PHASE_COPY = {
  inhale: 'Inhale slowly…',
  hold: 'Hold…',
  exhale: 'Exhale gently…',
};

function BreathingGuide({ colors }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [phase, setPhase] = useState('inhale');

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: INHALE_MS, useNativeDriver: true }),
        Animated.delay(HOLD_MS),
        Animated.timing(anim, { toValue: 0, duration: EXHALE_MS, useNativeDriver: true }),
      ])
    );
    loop.start();

    let elapsed = 0;
    const id = setInterval(() => {
      elapsed = (elapsed + 200) % CYCLE_MS;
      if (elapsed < INHALE_MS) setPhase('inhale');
      else if (elapsed < INHALE_MS + HOLD_MS) setPhase('hold');
      else setPhase('exhale');
    }, 200);

    return () => {
      loop.stop();
      clearInterval(id);
    };
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] });
  const ringOpacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.25, 0.55, 0.9] });

  return (
    <View style={styles.breatheWrap}>
      <Animated.View
        style={[
          styles.breatheRing,
          { borderColor: colors.breakC, transform: [{ scale }], opacity: ringOpacity },
        ]}
      />
      <View style={[styles.breatheCore, { backgroundColor: `${colors.breakC}25`, borderColor: `${colors.breakC}60` }]} />
      <Text style={[styles.phaseLabel, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
        {PHASE_COPY[phase]}
      </Text>
    </View>
  );
}

export default function RitualModal() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const startTimer = useAppStore((s) => s.startTimer);
  const ritualType = useAppStore((s) => s.ritualType);
  const focusDuration = useAppStore((s) => s.focusDuration);
  const [intention, setIntention] = useState('');

  const handleBegin = () => {
    startTimer();
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleBegin} />

      <View style={[styles.sheet, { backgroundColor: colors.bg, paddingBottom: insets.bottom + 28 }]}>
        <View style={[styles.handle, { backgroundColor: colors.line }]} />

        <View style={styles.sheetHeader}>
          <Text style={[styles.eyebrow, { color: colors.breakC }]}>Before you begin</Text>
          <TouchableOpacity onPress={handleBegin} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.skipText, { color: colors.mute }]}>Skip</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.headline, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
          {ritualType === 'breathe' ? 'One breath to center' : 'Set your intention'}
        </Text>

        {ritualType === 'breathe' ? (
          <BreathingGuide colors={colors} />
        ) : (
          <View style={[styles.intentionCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.intentionPrompt, { color: colors.mute }]}>
              What matters most in the next {focusDuration} minutes?
            </Text>
            <TextInput
              value={intention}
              onChangeText={setIntention}
              placeholder="e.g. Finish the introduction draft…"
              placeholderTextColor={colors.soft}
              style={[styles.intentionInput, { color: colors.ink }]}
              autoFocus
              multiline
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={handleBegin}
            />
          </View>
        )}

        <PillButton colors={colors} primary size="lg" style={styles.btn} onPress={handleBegin}>
          <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '600' }}>
            Begin {focusDuration}-minute focus
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
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 1.8, textTransform: 'uppercase' },
  skipText: { fontSize: 13, fontWeight: '500' },
  headline: { fontSize: 30, fontWeight: '400', letterSpacing: -0.5, lineHeight: 34 },
  breatheWrap: {
    alignItems: 'center', justifyContent: 'center',
    height: 190, marginVertical: 4,
  },
  breatheRing: {
    position: 'absolute',
    width: 130, height: 130, borderRadius: 65, borderWidth: 1.5,
  },
  breatheCore: {
    width: 76, height: 76, borderRadius: 38, borderWidth: 1.5,
  },
  phaseLabel: {
    position: 'absolute', bottom: 10,
    fontSize: 15, letterSpacing: -0.2,
  },
  intentionCard: { borderRadius: 14, padding: 16, gap: 10 },
  intentionPrompt: { fontSize: 12, fontWeight: '500', letterSpacing: 0.3 },
  intentionInput: { fontSize: 17, fontWeight: '500', lineHeight: 24, minHeight: 60 },
  btn: { width: '100%', marginTop: 4 },
});
