import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';
import {
  ChevLeftIcon, RainIcon, CafeIcon, WaveIcon, LeafIcon, FireIcon, PlayIcon, PauseIcon,
} from '../../src/components';
import { FONT_DISPLAY } from '../../src/constants/tokens';

const { width } = Dimensions.get('window');

const SOUNDS = [
  { id: 'rain',   label: 'Rain',        sub: 'Soft afternoon shower',           Icon: RainIcon,  colorKey: 'breakC' },
  { id: 'cafe',   label: 'Café',        sub: 'Distant chatter, espresso machine', Icon: CafeIcon,  colorKey: 'focus' },
  { id: 'white',  label: 'White noise', sub: 'Steady, neutral hum',             Icon: WaveIcon,  colorKey: 'plum' },
  { id: 'forest', label: 'Forest',      sub: 'Birds, leaves, faraway brook',    Icon: LeafIcon,  colorKey: 'breakC' },
  { id: 'fire',   label: 'Fireplace',   sub: 'Crackling embers',                Icon: FireIcon,  colorKey: 'focus' },
  { id: 'brown',  label: 'Brown noise', sub: 'Deep, low-frequency calm',        Icon: WaveIcon,  colorKey: 'plum' },
];

export default function AmbientModal() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const ambientSound = useAppStore((s) => s.ambientSound);
  const setAmbientSound = useAppStore((s) => s.setAmbientSound);

  const [playing, setPlaying] = useState(ambientSound !== 'none' ? ambientSound : null);

  const currentSound = SOUNDS.find((s) => s.id === playing);

  const handleSelect = (id) => {
    if (playing === id) {
      setPlaying(null);
      setAmbientSound('none');
    } else {
      setPlaying(id);
      setAmbientSound(id);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}
          style={[styles.backBtn, { backgroundColor: colors.surface, shadowColor: colors.ink }]}>
          <ChevLeftIcon size={18} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.headerEyebrow, { color: colors.mute }]}>Ambient sounds</Text>
          <Text style={[styles.headerTitle, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
            Pick a backdrop
          </Text>
        </View>
      </View>

      {/* Now playing */}
      {currentSound && (
        <View style={[styles.nowPlaying, { backgroundColor: colors.breakC }]}>
          <Svg width={120} height={120} style={[StyleSheet.absoluteFill, { right: -20, bottom: -30 }]}
            opacity={0.2}>
            <Path d="M 0 60 Q 30 30 60 60 T 120 60" fill="none" stroke="#fff" strokeWidth="3" />
            <Path d="M 0 80 Q 30 50 60 80 T 120 80" fill="none" stroke="#fff" strokeWidth="3" />
          </Svg>
          <Text style={styles.npEyebrow}>NOW PLAYING</Text>
          <Text style={[styles.npTitle, { fontFamily: FONT_DISPLAY }]}>{currentSound.label}</Text>
          <Text style={styles.npSub}>{currentSound.sub}</Text>
          <View style={styles.npControls}>
            <View style={styles.npBar}>
              <View style={[styles.npFill, { width: '55%' }]} />
            </View>
            <TouchableOpacity onPress={() => handleSelect(currentSound.id)}
              style={[styles.npBtn, { backgroundColor: '#fff' }]}>
              <PauseIcon size={16} color={colors.breakC} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <Text style={[styles.listLabel, { color: colors.mute }]}>ALL SOUNDS</Text>
        {SOUNDS.map((sound) => {
          const { Icon } = sound;
          const tint = colors[sound.colorKey];
          const isPlaying = playing === sound.id;

          return (
            <TouchableOpacity
              key={sound.id}
              onPress={() => handleSelect(sound.id)}
              activeOpacity={0.8}
              style={[
                styles.soundCard,
                {
                  backgroundColor: colors.surface,
                  borderWidth: isPlaying ? 1.5 : 0,
                  borderColor: isPlaying ? tint : 'transparent',
                  shadowColor: colors.ink,
                },
              ]}
            >
              <View style={[styles.soundIcon, { backgroundColor: `${tint}20` }]}>
                <Icon size={20} color={tint} />
              </View>
              <View style={styles.soundText}>
                <Text style={[styles.soundLabel, { color: colors.ink }]}>{sound.label}</Text>
                <Text style={[styles.soundSub, { color: colors.mute }]}>{sound.sub}</Text>
              </View>
              {isPlaying ? (
                <View style={styles.waveform}>
                  {[10, 16, 12, 20, 8].map((h, j) => (
                    <View key={j} style={[styles.waveBar, { height: h, backgroundColor: tint }]} />
                  ))}
                </View>
              ) : (
                <View style={[styles.playBtn, { backgroundColor: colors.bg }]}>
                  <PlayIcon size={14} color={colors.ink} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20, paddingBottom: 14 },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  headerText: { flex: 1 },
  headerEyebrow: { fontSize: 12, fontWeight: '500' },
  headerTitle: { fontSize: 22, fontWeight: '400', letterSpacing: -0.3 },
  nowPlaying: {
    marginHorizontal: 20, borderRadius: 22, padding: 20, overflow: 'hidden', marginBottom: 12,
  },
  npEyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 1.8, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  npTitle: { fontSize: 28, fontWeight: '400', color: '#fff', letterSpacing: -0.3, marginBottom: 4 },
  npSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 14 },
  npControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  npBar: {
    flex: 1, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  npFill: { height: '100%', backgroundColor: '#fff', borderRadius: 2 },
  npBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 8 },
  listLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 1.8, textTransform: 'uppercase',
    paddingHorizontal: 4, paddingBottom: 10,
  },
  soundCard: {
    borderRadius: 16, padding: 12, paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  soundIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  soundText: { flex: 1 },
  soundLabel: { fontSize: 14, fontWeight: '600' },
  soundSub: { fontSize: 12, marginTop: 2 },
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  waveBar: { width: 3, borderRadius: 2 },
  playBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
