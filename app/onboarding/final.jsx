import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';
import { PillButton, ArrowIcon } from '../../src/components';
import { FONT_DISPLAY } from '../../src/constants/tokens';

const { width, height } = Dimensions.get('window');

export default function OnboardingFinal() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [name, setName] = useState('');

  const handleStart = () => {
    completeOnboarding(name.trim() || 'Maya');
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.plum }]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="glow" cx="0.5" cy="0.4">
            <Stop offset="0%" stopColor={colors.focus} stopOpacity="1" />
            <Stop offset="60%" stopColor={colors.focus} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={colors.focus} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={width / 2} cy={height * 0.38} r={280} fill="url(#glow)" />
        <Circle cx={width / 2} cy={height * 0.38} r={90} fill={colors.focusSoft} />
        <Circle cx={width / 2} cy={height * 0.38} r={60} fill={colors.focus} />
      </Svg>

      <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
        <View style={styles.textWrap}>
          <Text style={[styles.eyebrow, { color: colors.focusSoft }]}>You're all set</Text>
          <Text style={[styles.headline, { color: colors.bg, fontFamily: FONT_DISPLAY }]}>
            Take a breath.{'\n'}
            <Text style={{ fontStyle: 'italic', color: colors.focusSoft }}>Begin.</Text>
          </Text>
        </View>

        <View style={[styles.nameCard, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
          <Text style={[styles.nameLabel, { color: colors.focusSoft }]}>What should we call you?</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={`${colors.bg}60`}
            style={[styles.nameInput, { color: colors.bg }]}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleStart}
          />
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <PillButton
          colors={{ ...colors, ink: colors.bg, bg: colors.plum }}
          primary size="lg" style={styles.btn}
          onPress={handleStart}
        >
          <Text style={{ color: colors.plum, fontSize: 16, fontWeight: '600' }}>
            Start focusing
          </Text>
          <ArrowIcon size={16} color={colors.plum} />
        </PillButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', alignItems: 'center' },
  textWrap: { alignItems: 'center', marginTop: height * 0.22 },
  eyebrow: {
    fontSize: 11, fontWeight: '600', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14,
  },
  headline: {
    fontSize: 44, fontWeight: '400', lineHeight: 48, letterSpacing: -0.8, textAlign: 'center',
  },
  nameCard: {
    marginTop: 40, borderRadius: 20, padding: 18, width: '100%',
  },
  nameLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  nameInput: { fontSize: 20, fontWeight: '500', letterSpacing: -0.3 },
  footer: { paddingHorizontal: 28 },
  btn: { width: '100%' },
});
