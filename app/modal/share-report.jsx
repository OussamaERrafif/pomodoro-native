import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';
import { FONT_DISPLAY } from '../../src/constants/tokens';
import { computeStreak, getWeekData } from '../../src/utils/time';
import { computeFocusScore, scoreLabel } from '../../src/utils/focusScore';
import { getTotalPomodoros, ACHIEVEMENTS } from '../../src/utils/achievements';
import { computeXP, getLevelInfo } from '../../src/utils/xp';

const MOOD_LABELS = ['', 'Drained', 'Foggy', 'Okay', 'Sharp', 'Flowing'];

export default function ShareReportModal() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cardRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  const sessionHistory = useAppStore((s) => s.sessionHistory);
  const moodHistory = useAppStore((s) => s.moodHistory);
  const todaySessions = useAppStore((s) => s.todaySessions);
  const focusGoal = useAppStore((s) => s.focusGoal);
  const unlockedAchievements = useAppStore((s) => s.unlockedAchievements);
  const userName = useAppStore((s) => s.userName);
  const tasks = useAppStore((s) => s.tasks);

  const weekData = getWeekData(sessionHistory);
  const weekTotal = weekData.reduce((s, d) => s + d.value, 0);
  const totalMinutes = weekTotal * 25;
  const streak = computeStreak(sessionHistory);
  const totalPomodoros = getTotalPomodoros(sessionHistory);
  const todayKey = new Date().toISOString().split('T')[0];
  const todayMood = moodHistory[todayKey]?.value ?? null;
  const { total: score } = computeFocusScore({ todaySessions, focusGoal, todayMood, sessionHistory });
  const label = scoreLabel(score);
  const xp = computeXP(sessionHistory, unlockedAchievements);
  const levelInfo = getLevelInfo(xp);

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const topTag = (() => {
    const totals = {};
    tasks.forEach((t) => { totals[t.tag] = (totals[t.tag] || 0) + t.done; });
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] ?? null;
  })();

  const maxBar = Math.max(...weekData.map((d) => d.value), 1);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (cardRef.current && isAvailable) {
        const uri = await cardRef.current.capture();
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your focus report' });
      } else {
        // Fallback: share as text
        await Share.share({
          message: `📊 My weekly focus report\n\n⏱ ${timeStr} focused · ${weekTotal} sessions\n🔥 ${streak}-day streak · Score ${score} (${label})\n${levelInfo.icon} Level ${levelInfo.level} ${levelInfo.title}\n\nTracked with Pomodoro Focus`,
        });
      }
    } catch {
      // user cancelled or error — do nothing
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={[styles.overlay, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={[styles.closeText, { color: colors.mute }]}>Close</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.ink }]}>Weekly Report</Text>
        <View style={{ width: 52 }} />
      </View>

      <View style={styles.cardWrap}>
        <ViewShot ref={cardRef} options={{ format: 'png', quality: 1 }} style={{ borderRadius: 24, overflow: 'hidden' }}>
          <View style={[styles.card, { backgroundColor: colors.plum }]}>
            {/* Card header */}
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.cardEyebrow}>WEEKLY FOCUS REPORT</Text>
                <Text style={[styles.cardName, { fontFamily: FONT_DISPLAY }]}>{userName}'s week</Text>
              </View>
              <View style={styles.scoreCircle}>
                <Text style={[styles.scoreNum, { fontFamily: FONT_DISPLAY }]}>{score}</Text>
                <Text style={styles.scoreLabel}>{label}</Text>
              </View>
            </View>

            {/* Big stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { fontFamily: FONT_DISPLAY }]}>{timeStr}</Text>
                <Text style={styles.statLabel}>focused</Text>
              </View>
              <View style={[styles.statDiv]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { fontFamily: FONT_DISPLAY }]}>{weekTotal}</Text>
                <Text style={styles.statLabel}>sessions</Text>
              </View>
              <View style={[styles.statDiv]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { fontFamily: FONT_DISPLAY }]}>{streak}🔥</Text>
                <Text style={styles.statLabel}>streak</Text>
              </View>
            </View>

            {/* Mini bar chart */}
            <View style={styles.chartRow}>
              {weekData.map((d, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View style={[
                      styles.barFill,
                      { height: `${(d.value / maxBar) * 100}%`, opacity: d.value > 0 ? 1 : 0.2 },
                    ]} />
                  </View>
                  <Text style={styles.barLabel}>{days[i]}</Text>
                </View>
              ))}
            </View>

            {/* Bottom badges */}
            <View style={styles.badgesRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeIcon}>{levelInfo.icon}</Text>
                <Text style={styles.badgeText}>Lv {levelInfo.level} {levelInfo.title}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeIcon}>🏆</Text>
                <Text style={styles.badgeText}>{unlockedAchievements.length} badges</Text>
              </View>
              {topTag && (
                <View style={styles.badge}>
                  <Text style={styles.badgeIcon}>🎯</Text>
                  <Text style={styles.badgeText}>{topTag}</Text>
                </View>
              )}
            </View>

            {/* Watermark */}
            <Text style={styles.watermark}>Pomodoro Focus</Text>
          </View>
        </ViewShot>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={[styles.hint, { color: colors.mute }]}>
          Share your weekly card or screenshot it
        </Text>
        <TouchableOpacity
          onPress={handleShare}
          disabled={sharing}
          style={[styles.shareBtn, { backgroundColor: colors.focus }]}
          activeOpacity={0.8}
        >
          {sharing
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.shareBtnText}>Share report</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  closeBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  closeText: { fontSize: 15 },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  cardWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  card: {
    width: '100%', borderRadius: 24, padding: 24, gap: 20,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardEyebrow: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.8,
    color: 'rgba(255,255,255,0.65)', marginBottom: 4,
  },
  cardName: { fontSize: 26, fontWeight: '400', color: '#fff', letterSpacing: -0.5 },
  scoreCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  scoreNum: { fontSize: 22, fontWeight: '400', color: '#fff', lineHeight: 24 },
  scoreLabel: { fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: 0.4 },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statNum: { fontSize: 22, fontWeight: '400', color: '#fff', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  statDiv: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },
  chartRow: {
    flexDirection: 'row', gap: 6, height: 64, alignItems: 'flex-end',
  },
  barCol: { flex: 1, alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 4 },
  barLabel: { fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  badgesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 100,
    paddingVertical: 5, paddingHorizontal: 10,
  },
  badgeIcon: { fontSize: 13 },
  badgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  watermark: {
    fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '600',
    letterSpacing: 1, textAlign: 'right',
  },
  footer: { paddingHorizontal: 24, gap: 10, alignItems: 'center' },
  hint: { fontSize: 13 },
  shareBtn: {
    width: '100%', paddingVertical: 16, borderRadius: 16,
    alignItems: 'center',
  },
  shareBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
