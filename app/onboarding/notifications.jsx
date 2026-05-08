import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';

const isExpoGo = Constants.appOwnership === 'expo';
import { PillButton, BellIcon } from '../../src/components';
import { FONT_DISPLAY } from '../../src/constants/tokens';
import Svg, { Circle } from 'react-native-svg';

export default function OnboardingNotifications() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setNotifications = useAppStore((s) => s.setNotifications);

  const requestAndContinue = async () => {
    if (!isExpoGo) {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        setNotifications(status === 'granted');
      } catch (_) {
        setNotifications(false);
      }
    } else {
      setNotifications(false);
    }
    router.push('/onboarding/final');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top + 12 }]}>
      <View style={styles.topRow}>
        <Text style={[styles.step, { color: colors.mute }]}>Step 3 of 3</Text>
        <TouchableOpacity onPress={() => { setNotifications(false); router.push('/onboarding/final'); }}>
          <Text style={[styles.skip, { color: colors.ink }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.center}>
        {/* Bell illustration */}
        <View style={styles.bellWrap}>
          <Svg width={200} height={200} viewBox="0 0 200 200">
            <Circle cx="100" cy="100" r="100" fill={colors.focusSoft} fillOpacity={0.2} />
          </Svg>
          <View style={[styles.bellInner, { backgroundColor: colors.surface, shadowColor: colors.focus }]}>
            <BellIcon size={56} color={colors.focus} strokeWidth={1.8} />
          </View>
          <View style={[styles.pingDot, { backgroundColor: colors.focus }]} />
        </View>

        <Text style={[styles.headline, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
          A gentle nudge{'\n'}when it matters
        </Text>
        <Text style={[styles.body, { color: colors.mute }]}>
          We'll only ping you when a session ends or a break is over. No streak shaming, no spam.
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <PillButton colors={colors} primary size="lg" style={styles.btn} onPress={requestAndContinue}>
          <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '600' }}>Allow notifications</Text>
        </PillButton>
        <PillButton colors={colors} ghost size="lg" style={styles.btn}
          onPress={() => { setNotifications(false); router.push('/onboarding/final'); }}>
          <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '600' }}>Maybe later</Text>
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
  center: { flex: 1, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center' },
  bellWrap: { position: 'relative', width: 200, height: 200, marginBottom: 32, alignItems: 'center', justifyContent: 'center' },
  bellInner: {
    position: 'absolute',
    top: 30, left: 30, right: 30, bottom: 30,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  pingDot: {
    position: 'absolute',
    top: 28, right: 22,
    width: 14, height: 14,
    borderRadius: 7,
  },
  headline: {
    fontSize: 32, fontWeight: '400', letterSpacing: -0.6, lineHeight: 36,
    textAlign: 'center', marginBottom: 12,
  },
  body: {
    fontSize: 14.5, lineHeight: 22, textAlign: 'center', maxWidth: 280,
  },
  footer: { paddingHorizontal: 28, gap: 12, paddingTop: 8 },
  btn: { width: '100%' },
});
