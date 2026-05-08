import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';
import {
  TargetIcon, LeafIcon, MoonIcon, BellIcon, WaveIcon, ZapIcon,
  SunIcon, HeartIcon, ShieldIcon, ChevRightIcon, MicIcon,
} from '../../src/components';
import { FONT_DISPLAY, PALETTES, PALETTE_IDS } from '../../src/constants/tokens';

function SettingRow({ Icon, label, sub, right, color, isLast, colors }) {
  return (
    <View style={[
      styles.row,
      { borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth, borderBottomColor: colors.line },
    ]}>
      {Icon && (
        <View style={[styles.rowIcon, { backgroundColor: `${color}18` }]}>
          <Icon size={17} color={color} />
        </View>
      )}
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.ink }]}>{label}</Text>
        {sub && <Text style={[styles.rowSub, { color: colors.mute }]}>{sub}</Text>}
      </View>
      {right}
    </View>
  );
}

function Section({ title, children, colors }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mute }]}>{title}</Text>
      <View style={[styles.sectionBody, {
        backgroundColor: colors.surface,
        shadowColor: colors.ink,
      }]}>
        {children}
      </View>
    </View>
  );
}

function DurationRow({ Icon, label, sub, value, onMinus, onPlus, color, isLast, colors }) {
  return (
    <SettingRow
      Icon={Icon} label={label} sub={sub} color={color} isLast={isLast} colors={colors}
      right={
        <View style={styles.stepperInline}>
          <TouchableOpacity onPress={onMinus} style={[styles.stepBtn, { backgroundColor: colors.bg }]}>
            <Text style={[styles.stepLabel, { color: colors.ink }]}>−</Text>
          </TouchableOpacity>
          <Text style={[styles.stepValue, { color: colors.ink }]}>{value}m</Text>
          <TouchableOpacity onPress={onPlus} style={[styles.stepBtn, { backgroundColor: colors.bg }]}>
            <Text style={[styles.stepLabel, { color: colors.ink }]}>+</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
}

export default function SettingsScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const darkMode = useAppStore((s) => s.darkMode);
  const palette = useAppStore((s) => s.palette);
  const focusDuration = useAppStore((s) => s.focusDuration);
  const shortBreakDuration = useAppStore((s) => s.shortBreakDuration);
  const longBreakDuration = useAppStore((s) => s.longBreakDuration);
  const notifications = useAppStore((s) => s.notifications);
  const haptics = useAppStore((s) => s.haptics);
  const ambientSound = useAppStore((s) => s.ambientSound);

  const setDarkMode = useAppStore((s) => s.setDarkMode);
  const setPalette = useAppStore((s) => s.setPalette);
  const setFocusDuration = useAppStore((s) => s.setFocusDuration);
  const setShortBreakDuration = useAppStore((s) => s.setShortBreakDuration);
  const setLongBreakDuration = useAppStore((s) => s.setLongBreakDuration);
  const setNotifications = useAppStore((s) => s.setNotifications);
  const setHaptics = useAppStore((s) => s.setHaptics);
  const openAIKey = useAppStore((s) => s.openAIKey);
  const setOpenAIKey = useAppStore((s) => s.setOpenAIKey);
  const [showKey, setShowKey] = useState(false);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={[styles.eyebrow, { color: colors.mute }]}>Tune the experience</Text>
        <Text style={[styles.title, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Section title="Timer durations" colors={colors}>
          <DurationRow
            Icon={TargetIcon} color={colors.focus} label="Focus" sub="Time to do deep work"
            value={focusDuration}
            onMinus={() => setFocusDuration(Math.max(5, focusDuration - 5))}
            onPlus={() => setFocusDuration(Math.min(60, focusDuration + 5))}
            colors={colors}
          />
          <DurationRow
            Icon={LeafIcon} color={colors.breakC} label="Short break" sub="Between sessions"
            value={shortBreakDuration}
            onMinus={() => setShortBreakDuration(Math.max(1, shortBreakDuration - 1))}
            onPlus={() => setShortBreakDuration(Math.min(30, shortBreakDuration + 5))}
            colors={colors}
          />
          <DurationRow
            Icon={MoonIcon} color={colors.plum} label="Long break" sub="Every 4 sessions"
            value={longBreakDuration}
            onMinus={() => setLongBreakDuration(Math.max(5, longBreakDuration - 5))}
            onPlus={() => setLongBreakDuration(Math.min(60, longBreakDuration + 5))}
            colors={colors}
            isLast
          />
        </Section>

        <Section title="Sound & notifications" colors={colors}>
          <SettingRow
            Icon={BellIcon} color={colors.focus} label="Notifications" sub="Session start & end"
            colors={colors}
            right={
              <Switch
                value={notifications} onValueChange={setNotifications}
                trackColor={{ false: colors.line, true: colors.focus }}
                thumbColor="#fff"
              />
            }
          />
          <SettingRow
            Icon={WaveIcon} color={colors.breakC} label="Ambient sounds"
            colors={colors}
            right={
              <TouchableOpacity onPress={() => router.push('/modal/ambient')}
                style={styles.rowAction}>
                <Text style={[styles.rowActionText, { color: colors.mute }]}>
                  {ambientSound === 'none' ? 'Off' : ambientSound}
                </Text>
                <ChevRightIcon size={14} color={colors.soft} />
              </TouchableOpacity>
            }
          />
          <SettingRow
            Icon={ZapIcon} color={colors.plum} label="Haptic feedback"
            colors={colors}
            isLast
            right={
              <Switch
                value={haptics} onValueChange={setHaptics}
                trackColor={{ false: colors.line, true: colors.focus }}
                thumbColor="#fff"
              />
            }
          />
        </Section>

        <Section title="Appearance" colors={colors}>
          <SettingRow
            Icon={darkMode ? MoonIcon : SunIcon} color={colors.focus} label="Theme"
            colors={colors}
            right={
              <View style={[styles.themePicker, { backgroundColor: colors.bg }]}>
                {['Light', 'Dark', 'Auto'].map((mode, i) => {
                  const isActive = (mode === 'Light' && !darkMode) || (mode === 'Dark' && darkMode);
                  return (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => setDarkMode(mode === 'Dark')}
                      style={[
                        styles.themeOption,
                        isActive && [styles.themeOptionActive, { backgroundColor: colors.surface }],
                      ]}
                    >
                      <Text style={[
                        styles.themeOptionText,
                        { color: isActive ? colors.ink : colors.mute },
                      ]}>{mode}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            }
          />
          <SettingRow
            Icon={HeartIcon} color={colors.plum} label="Color palette"
            colors={colors}
            isLast
            right={
              <View style={styles.swatches}>
                {PALETTE_IDS.map((id) => {
                  const p = PALETTES[id];
                  const isActive = id === palette;
                  return (
                    <TouchableOpacity
                      key={id}
                      onPress={() => setPalette(id)}
                      style={[
                        styles.swatch,
                        {
                          backgroundColor: p.light.focus,
                          borderWidth: isActive ? 2 : 0,
                          borderColor: isActive ? colors.ink : 'transparent',
                          transform: [{ scale: isActive ? 1.15 : 1 }],
                        },
                      ]}
                    />
                  );
                })}
              </View>
            }
          />
        </Section>

        <Section title="AI & Voice" colors={colors}>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <View style={[styles.rowIcon, { backgroundColor: `${colors.focus}18` }]}>
              <MicIcon size={17} color={colors.focus} />
            </View>
            <View style={styles.apiKeyWrap}>
              <Text style={[styles.rowLabel, { color: colors.ink }]}>OpenAI API Key</Text>
              <TextInput
                value={openAIKey}
                onChangeText={setOpenAIKey}
                placeholder="sk-…"
                placeholderTextColor={colors.soft}
                secureTextEntry={!showKey}
                style={[styles.apiKeyInput, { color: colors.ink }]}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
              />
            </View>
            <TouchableOpacity onPress={() => setShowKey((v) => !v)} style={styles.showKeyBtn}>
              <Text style={[styles.showKeyText, { color: colors.mute }]}>{showKey ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
        </Section>

        <Section title="Focus mode" colors={colors}>
          <SettingRow
            Icon={ShieldIcon} color={colors.focus} label="Block distractions"
            sub="Mute notifications during focus"
            colors={colors}
            isLast
            right={
              <Switch
                value={true}
                trackColor={{ false: colors.line, true: colors.focus }}
                thumbColor="#fff"
              />
            }
          />
        </Section>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 14 },
  eyebrow: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  title: { fontSize: 32, fontWeight: '400', letterSpacing: -0.7, lineHeight: 34 },
  content: { paddingHorizontal: 20, paddingBottom: 32, gap: 0 },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 11, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase',
    paddingHorizontal: 4, paddingBottom: 8,
  },
  sectionBody: {
    borderRadius: 16, overflow: 'hidden',
    shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, paddingLeft: 16,
  },
  rowIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowText: { flex: 1, minWidth: 0 },
  rowLabel: { fontSize: 14.5, fontWeight: '550' },
  rowSub: { fontSize: 12, marginTop: 2 },
  rowAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowActionText: { fontSize: 13 },
  stepperInline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { fontSize: 18, fontWeight: '400', lineHeight: 22 },
  stepValue: { fontSize: 14, fontWeight: '600', minWidth: 40, textAlign: 'center' },
  themePicker: { flexDirection: 'row', borderRadius: 100, padding: 3 },
  themeOption: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 100 },
  themeOptionActive: { shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  themeOptionText: { fontSize: 11, fontWeight: '600' },
  swatches: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  swatch: { width: 20, height: 20, borderRadius: 10 },
  apiKeyWrap: { flex: 1, minWidth: 0 },
  apiKeyInput: { fontSize: 13, fontFamily: 'monospace', marginTop: 4, letterSpacing: 0.4 },
  showKeyBtn: { paddingHorizontal: 4, paddingVertical: 2 },
  showKeyText: { fontSize: 12, fontWeight: '600' },
});
