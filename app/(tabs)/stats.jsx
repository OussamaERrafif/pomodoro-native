import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';
import { BarChart, FlameIcon } from '../../src/components';
import { FONT_DISPLAY } from '../../src/constants/tokens';
import { getWeekData, fmtHM } from '../../src/utils/time';
import { computeFocusScore, scoreLabel } from '../../src/utils/focusScore';

const MOODS = ['Drained', 'Foggy', 'Okay', 'Sharp', 'Flowing'];

const ARC_SIZE = 160;
const ARC_STROKE = 12;
const ARC_R = (ARC_SIZE - ARC_STROKE) / 2;
const ARC_CX = ARC_SIZE / 2;
const ARC_CY = ARC_SIZE / 2;
// Arc spans 240° starting from 150° (bottom-left), going clockwise to 30° (bottom-right)
const START_DEG = 150;
const SWEEP_DEG = 240;

function polarToXY(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, startDeg, sweepDeg) {
  const start = polarToXY(cx, cy, r, startDeg);
  const end = polarToXY(cx, cy, r, startDeg + sweepDeg);
  const largeArc = sweepDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function FocusScoreCard({ score, label, sessionPts, moodPts, consistencyPts, colors }) {
  const fillSweep = (score / 100) * SWEEP_DEG;
  const trackPath = arcPath(ARC_CX, ARC_CY, ARC_R, START_DEG, SWEEP_DEG);
  const fillPath = fillSweep > 0
    ? arcPath(ARC_CX, ARC_CY, ARC_R, START_DEG, Math.max(fillSweep, 4))
    : null;

  return (
    <View style={[scoreStyles.card, { backgroundColor: colors.surface, shadowColor: colors.ink }]}>
      <View style={scoreStyles.top}>
        <View style={scoreStyles.arcWrap}>
          <Svg width={ARC_SIZE} height={ARC_SIZE}>
            <Path d={trackPath} fill="none" stroke={`${colors.focus}20`} strokeWidth={ARC_STROKE} strokeLinecap="round" />
            {fillPath && (
              <Path d={fillPath} fill="none" stroke={colors.focus} strokeWidth={ARC_STROKE} strokeLinecap="round" />
            )}
          </Svg>
          <View style={scoreStyles.arcCenter}>
            <Text style={[scoreStyles.scoreNum, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
              {score}
            </Text>
            <Text style={[scoreStyles.scoreLabel, { color: colors.focus }]}>{label}</Text>
          </View>
        </View>

        <View style={scoreStyles.breakdown}>
          <Text style={[scoreStyles.breakTitle, { color: colors.mute }]}>BREAKDOWN</Text>
          <ScoreRow label="Sessions" pts={sessionPts} max={40} color={colors.focus} inkColor={colors.ink} muteColor={colors.mute} />
          <ScoreRow label="Mood" pts={moodPts} max={30} color={colors.breakC} inkColor={colors.ink} muteColor={colors.mute} />
          <ScoreRow label="Consistency" pts={consistencyPts} max={30} color={colors.plum} inkColor={colors.ink} muteColor={colors.mute} />
        </View>
      </View>
    </View>
  );
}

function ScoreRow({ label, pts, max, color, inkColor, muteColor }) {
  return (
    <View style={scoreStyles.scoreRow}>
      <Text style={[scoreStyles.rowLabel, { color: inkColor }]}>{label}</Text>
      <View style={[scoreStyles.rowTrack, { backgroundColor: `${color}20` }]}>
        <View style={[scoreStyles.rowFill, { width: `${(pts / max) * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[scoreStyles.rowPts, { color: muteColor }]}>{pts}<Text style={{ fontSize: 10 }}>/{max}</Text></Text>
    </View>
  );
}

const scoreStyles = StyleSheet.create({
  card: {
    borderRadius: 22, padding: 18,
    shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  arcWrap: { width: ARC_SIZE, height: ARC_SIZE, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  arcCenter: { position: 'absolute', alignItems: 'center' },
  scoreNum: { fontSize: 42, fontWeight: '400', letterSpacing: -1, lineHeight: 46 },
  scoreLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.4, marginTop: 2 },
  breakdown: { flex: 1, gap: 10 },
  breakTitle: { fontSize: 10, fontWeight: '600', letterSpacing: 1.8, marginBottom: 2 },
  scoreRow: { gap: 4 },
  rowLabel: { fontSize: 12, fontWeight: '500' },
  rowTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  rowFill: { height: '100%', borderRadius: 3 },
  rowPts: { fontSize: 11, fontWeight: '600' },
});

export default function StatsScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  const sessionHistory = useAppStore((s) => s.sessionHistory);
  const moodHistory = useAppStore((s) => s.moodHistory);
  const todaySessions = useAppStore((s) => s.todaySessions);
  const focusGoal = useAppStore((s) => s.focusGoal);
  const tasks = useAppStore((s) => s.tasks);

  const weekData = getWeekData(sessionHistory);
  const weekTotal = weekData.reduce((s, d) => s + d.value, 0);
  const totalMinutes = weekTotal * 25;
  const streak = Math.min(todaySessions, 10);
  const goalPct = Math.round((todaySessions / Math.max(focusGoal, 1)) * 100);

  const distractionLog = useAppStore((s) => s.distractionLog);

  const todayKey = new Date().toISOString().split('T')[0];
  const todayMood = moodHistory[todayKey]?.value || null;
  const { total: score, sessionPts, moodPts, consistencyPts } = computeFocusScore({
    todaySessions, focusGoal, todayMood, sessionHistory,
  });
  const label = scoreLabel(score);

  // Distraction breakdown — count by reason, last 7 days
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentDistractions = distractionLog.filter((d) => d.timestamp >= sevenDaysAgo);
  const distractionCounts = {};
  recentDistractions.forEach(({ reason }) => {
    distractionCounts[reason] = (distractionCounts[reason] || 0) + 1;
  });
  const distractionEntries = Object.entries(distractionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCount = distractionEntries[0]?.[1] || 1;

  // Category breakdown
  const tagTotals = {};
  const tagColors = {};
  tasks.forEach((t) => {
    tagTotals[t.tag] = (tagTotals[t.tag] || 0) + t.done;
    if (t.tagColorKey) tagColors[t.tag] = colors[t.tagColorKey] || colors.focus;
    else if (t.tagColor) tagColors[t.tag] = t.tagColor;
  });
  const tagEntries = Object.entries(tagTotals).filter(([, v]) => v > 0);
  const totalTagSessions = tagEntries.reduce((s, [, v]) => s + v, 0) || 1;

  // Mood for this week
  const today = new Date();
  const moodWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    return moodHistory[key]?.value || null;
  });

  const moodColors = [colors.focus, colors.focusSoft, colors.warm, colors.breakSoft, colors.breakC];

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={[styles.eyebrow, { color: colors.mute }]}>Your rhythm</Text>
        <Text style={[styles.title, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>Insights</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Focus Score */}
        <FocusScoreCard
          score={score}
          label={label}
          sessionPts={sessionPts}
          moodPts={moodPts}
          consistencyPts={consistencyPts}
          colors={colors}
        />

        {/* Today hero */}
        <View style={[styles.heroCard, { backgroundColor: colors.plum }]}>
          <Text style={styles.heroEyebrow}>TODAY</Text>
          <View style={styles.heroTime}>
            <Text style={[styles.heroNum, { fontFamily: FONT_DISPLAY }]}>
              {Math.floor(todaySessions * 25 / 60)}h {(todaySessions * 25) % 60 < 10 ? '0' : ''}{(todaySessions * 25) % 60}
            </Text>
            <Text style={styles.heroUnit}>focused</Text>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Sessions</Text>
              <Text style={[styles.heroStatNum, { fontFamily: FONT_DISPLAY }]}>{todaySessions}</Text>
            </View>
            <View style={[styles.heroDiv, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Streak</Text>
              <View style={styles.heroStatRow}>
                <Text style={[styles.heroStatNum, { fontFamily: FONT_DISPLAY }]}>{streak}</Text>
                <FlameIcon size={16} color="#fff" filled />
              </View>
            </View>
            <View style={[styles.heroDiv, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Goal</Text>
              <Text style={[styles.heroStatNum, { fontFamily: FONT_DISPLAY }]}>{goalPct}%</Text>
            </View>
          </View>
        </View>

        {/* Week chart */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.ink }]}>This week</Text>
            <Text style={[styles.cardSub, { color: colors.mute }]}>
              {weekTotal} sessions · {fmtHM(totalMinutes)}
            </Text>
          </View>
          <BarChart data={weekData} colors={colors} height={130} accentColor={colors.focus} />
        </View>

        {/* Where it went */}
        {tagEntries.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.ink }]}>Where it went</Text>
            {/* Stacked bar */}
            <View style={styles.stackedBar}>
              {tagEntries.map(([tag, val], i) => (
                <View key={tag} style={[styles.stackSegment, {
                  flex: val,
                  backgroundColor: tagColors[tag] || colors.focus,
                }]} />
              ))}
            </View>
            <View style={styles.tagList}>
              {tagEntries.map(([tag, val]) => (
                <View key={tag} style={styles.tagRow}>
                  <View style={[styles.tagDot, { backgroundColor: tagColors[tag] || colors.focus }]} />
                  <Text style={[styles.tagName, { color: colors.ink }]}>{tag}</Text>
                  <Text style={[styles.tagPct, { color: colors.mute }]}>
                    {Math.round((val / totalTagSessions) * 100)}%
                  </Text>
                  <Text style={[styles.tagVal, { color: colors.ink }]}>{val}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Mood */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.ink }]}>How you felt</Text>
            <Text style={[styles.cardSub, { color: colors.mute }]}>Avg this week</Text>
          </View>
          <View style={styles.moodRow}>
            {moodWeek.map((v, i) => {
              const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
              return (
                <View key={i} style={styles.moodCol}>
                  <View style={[
                    styles.moodDot,
                    { backgroundColor: v ? moodColors[v - 1] : colors.line },
                  ]} />
                  <Text style={[styles.moodLabel, { color: colors.mute }]}>{days[i]}</Text>
                </View>
              );
            })}
          </View>
        </View>
        {/* Distractions */}
        {distractionEntries.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.ink }]}>What distracted you</Text>
              <Text style={[styles.cardSub, { color: colors.mute }]}>
                {recentDistractions.length} this week
              </Text>
            </View>
            <View style={{ gap: 10, marginTop: 8 }}>
              {distractionEntries.map(([reason, count]) => {
                const EMOJI_MAP = {
                  phone: '📱', social: '💬', thoughts: '🌀', noise: '🔊',
                  hunger: '🍵', urgent: '⚡', fatigue: '😴', other: '✏️',
                };
                const emoji = EMOJI_MAP[reason] || '✏️';
                const label = reason.charAt(0).toUpperCase() + reason.slice(1);
                return (
                  <View key={reason} style={{ gap: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={[styles.tagName, { color: colors.ink }]}>
                        {emoji}  {label}
                      </Text>
                      <Text style={[styles.tagVal, { color: colors.mute }]}>{count}×</Text>
                    </View>
                    <View style={[styles.stackedBar, { marginBottom: 0, marginTop: 0, height: 6 }]}>
                      <View style={{
                        width: `${(count / maxCount) * 100}%`,
                        height: '100%',
                        backgroundColor: colors.warm || colors.focus,
                        borderRadius: 3,
                      }} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 14 },
  eyebrow: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  title: { fontSize: 32, fontWeight: '400', letterSpacing: -0.7, lineHeight: 34 },
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 14 },
  heroCard: {
    borderRadius: 22, padding: 20, overflow: 'hidden',
  },
  heroEyebrow: {
    fontSize: 11, fontWeight: '600', letterSpacing: 1.8, textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.8)', marginBottom: 6,
  },
  heroTime: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 14 },
  heroNum: { fontSize: 56, fontWeight: '400', letterSpacing: -1.5, lineHeight: 60, color: '#fff' },
  heroUnit: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  heroStats: { flexDirection: 'row', gap: 18 },
  heroStat: { gap: 2 },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  heroStatNum: { fontSize: 22, fontWeight: '400', color: '#fff' },
  heroStatRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroDiv: { width: 1 },
  card: {
    borderRadius: 22, padding: 18,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  cardSub: { fontSize: 12 },
  stackedBar: { height: 10, flexDirection: 'row', borderRadius: 5, overflow: 'hidden', marginBottom: 14, marginTop: 12 },
  stackSegment: {},
  tagList: { gap: 8 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tagDot: { width: 8, height: 8, borderRadius: 4 },
  tagName: { flex: 1, fontSize: 13 },
  tagPct: { fontSize: 13 },
  tagVal: { fontSize: 13, fontWeight: '600', minWidth: 24, textAlign: 'right' },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 },
  moodCol: { flex: 1, alignItems: 'center', gap: 6 },
  moodDot: { width: 22, height: 22, borderRadius: 11 },
  moodLabel: { fontSize: 10 },
});
