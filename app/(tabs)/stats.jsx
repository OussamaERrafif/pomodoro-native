import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';
import { BarChart, FlameIcon, SparkleIcon } from '../../src/components';
import { FONT_DISPLAY } from '../../src/constants/tokens';
import { getWeekData, fmtHM, computeStreak } from '../../src/utils/time';
import { computeFocusScore, scoreLabel } from '../../src/utils/focusScore';
import { generateWeeklySummary } from '../../src/utils/openai';
import { ACHIEVEMENTS, getTotalPomodoros } from '../../src/utils/achievements';
import { getBestWeekday, getMoodCorrelation, getDistractionPeakTime, getTagInsight } from '../../src/utils/analytics';
import { computeXP, getLevelInfo } from '../../src/utils/xp';
import { computeBurnoutRisk } from '../../src/utils/burnout';

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
  const router = useRouter();

  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const sessionHistory = useAppStore((s) => s.sessionHistory);
  const moodHistory = useAppStore((s) => s.moodHistory);
  const todaySessions = useAppStore((s) => s.todaySessions);
  const focusGoal = useAppStore((s) => s.focusGoal);
  const tasks = useAppStore((s) => s.tasks);
  const openAIKey = useAppStore((s) => s.openAIKey);
  const aiEnabled = useAppStore((s) => s.aiEnabled);
  const sessionNotes = useAppStore((s) => s.sessionNotes);
  const unlockedAchievements = useAppStore((s) => s.unlockedAchievements);
  const newlyUnlocked = useAppStore((s) => s.newlyUnlocked);
  const clearNewlyUnlocked = useAppStore((s) => s.clearNewlyUnlocked);

  // Toast for newly unlocked achievements
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [toastText, setToastText] = useState('');
  useEffect(() => {
    if (newlyUnlocked.length === 0) return;
    const a = ACHIEVEMENTS.find((x) => x.id === newlyUnlocked[0]);
    if (a) setToastText(`${a.icon}  ${a.title} unlocked!`);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => clearNewlyUnlocked());
  }, [newlyUnlocked]);

  const weekData = getWeekData(sessionHistory);
  const weekTotal = weekData.reduce((s, d) => s + d.value, 0);
  const totalMinutes = weekTotal * 25;
  const streak = computeStreak(sessionHistory);
  const goalPct = Math.round((todaySessions / Math.max(focusGoal, 1)) * 100);

  const distractionLog = useAppStore((s) => s.distractionLog);

  const todayKey = new Date().toISOString().split('T')[0];

  const handleGenerateSummary = async () => {
    if (!openAIKey) { setAiError('Add your OpenAI API key in Settings first.'); return; }
    setAiError('');
    setAiSummary('');
    setAiLoading(true);
    try {
      const weekData2 = getWeekData(sessionHistory);
      const weekTotal2 = weekData2.reduce((s, d) => s + d.value, 0);
      const bestDay = Math.max(...weekData2.map((d) => d.value));
      const activeDays2 = weekData2.filter((d) => d.value > 0).length;
      const topTagEntry = Object.entries(
        tasks.reduce((acc, t) => { acc[t.tag] = (acc[t.tag] || 0) + t.done; return acc; }, {})
      ).sort((a, b) => b[1] - a[1])[0];
      const { total: score2 } = computeFocusScore({ todaySessions, focusGoal, todayMood: moodHistory[todayKey]?.value || null, sessionHistory });
      const summary = await generateWeeklySummary({
        weekTotal: weekTotal2,
        focusGoal,
        todaySessions,
        bestDay,
        focusScore: score2,
        scoreLabel: scoreLabel(score2),
        topCategory: topTagEntry?.[0],
        distractionCount: distractionLog.filter((d) => d.timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000).length,
        activeDays: activeDays2,
      }, openAIKey);
      setAiSummary(summary);
    } catch (e) {
      setAiError(e.message || 'Something went wrong.');
    } finally {
      setAiLoading(false);
    }
  };
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

  const totalPomodoros = getTotalPomodoros(sessionHistory);

  const xp = computeXP(sessionHistory, unlockedAchievements);
  const levelInfo = getLevelInfo(xp);

  const burnout = computeBurnoutRisk({ sessionHistory, moodHistory, distractionLog, sessionNotes });

  const bestWeekday = getBestWeekday(sessionHistory);
  const moodCorrelation = getMoodCorrelation(sessionHistory, moodHistory);
  const distractionPeak = getDistractionPeakTime(distractionLog);
  const tagInsight = getTagInsight(tasks);

  // Build insight chips — only show ones with enough data
  const insights = [];
  if (bestWeekday.hasData && bestWeekday.avg > 0) {
    insights.push({
      icon: '📅',
      text: `${bestWeekday.dayName} is your most focused day`,
      sub: `avg ${bestWeekday.avg.toFixed(1)} sessions`,
    });
  }
  if (moodCorrelation.highMoodAvg != null && moodCorrelation.lowMoodAvg != null) {
    const ratio = moodCorrelation.lowMoodAvg > 0
      ? (moodCorrelation.highMoodAvg / moodCorrelation.lowMoodAvg).toFixed(1)
      : null;
    insights.push({
      icon: '😊',
      text: ratio
        ? `High-mood days produce ${ratio}× more sessions`
        : `You average ${moodCorrelation.highMoodAvg} sessions on great days`,
      sub: `from ${moodCorrelation.highCount + moodCorrelation.lowCount} tracked days`,
    });
  }
  if (distractionPeak) {
    insights.push({
      icon: '⚡',
      text: `Most distractions happen in the ${distractionPeak.label.toLowerCase()}`,
      sub: `${distractionPeak.count} of ${distractionLog.length} total`,
    });
  }
  if (tagInsight) {
    const pct = Math.round(tagInsight.rate * 100);
    insights.push({
      icon: '🎯',
      text: `${tagInsight.tag} is your most active category`,
      sub: `${tagInsight.done} sessions · ${pct}% completion`,
    });
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.mute }]}>Your rhythm</Text>
          <Text style={[styles.title, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>Insights</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/modal/share-report')}
          style={[styles.shareHeaderBtn, { backgroundColor: `${colors.focus}14` }]}
          activeOpacity={0.75}
        >
          <Text style={[styles.shareHeaderText, { color: colors.focus }]}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Achievement toast */}
      <Animated.View style={[styles.toast, { opacity: toastOpacity, backgroundColor: colors.ink }]}>
        <Text style={[styles.toastText, { color: colors.bg }]}>{toastText}</Text>
      </Animated.View>

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

        {/* Burnout risk card — only shown when medium/high */}
        {burnout.risk !== 'low' && (
          <View style={[styles.card, {
            backgroundColor: burnout.risk === 'high' ? `${colors.warm || '#E57373'}18` : `${colors.warm || colors.breakC}12`,
            borderWidth: 1,
            borderColor: burnout.risk === 'high' ? `${colors.warm || '#E57373'}50` : `${colors.warm || colors.breakC}30`,
          }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.ink }]}>
                {burnout.risk === 'high' ? '🛑  Recovery needed' : '⚠️  Watch your pace'}
              </Text>
              <View style={[styles.burnoutBadge, {
                backgroundColor: burnout.risk === 'high' ? `${colors.warm || '#E57373'}30` : `${colors.warm || colors.breakC}25`,
              }]}>
                <Text style={[styles.burnoutBadgeText, { color: colors.ink }]}>
                  {burnout.risk === 'high' ? 'High risk' : 'Medium risk'}
                </Text>
              </View>
            </View>
            <View style={{ gap: 6, marginTop: 4 }}>
              {burnout.signals.map((s, i) => (
                <View key={i} style={styles.burnoutSignalRow}>
                  <Text style={[styles.burnoutSignalDot, { color: burnout.risk === 'high' ? colors.warm || '#E57373' : colors.mute }]}>●</Text>
                  <Text style={[styles.burnoutSignalText, { color: colors.ink }]}>{s.text}</Text>
                </View>
              ))}
            </View>
            {burnout.suggestions.length > 0 && (
              <View style={[styles.burnoutSuggestionsBox, { backgroundColor: `${colors.surface}`, borderColor: colors.line, marginTop: 10 }]}>
                <Text style={[styles.burnoutSuggestionsLabel, { color: colors.mute }]}>WHAT TO DO</Text>
                {burnout.suggestions.map((s, i) => (
                  <Text key={i} style={[styles.burnoutSuggestionText, { color: colors.ink }]}>→  {s}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* XP Level card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.xpRow}>
            <Text style={styles.xpIcon}>{levelInfo.icon}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.xpTopRow}>
                <Text style={[styles.xpTitle, { color: colors.ink }]}>
                  Level {levelInfo.level} · {levelInfo.title}
                </Text>
                <Text style={[styles.xpCount, { color: colors.mute }]}>{xp} XP</Text>
              </View>
              <View style={[styles.xpTrack, { backgroundColor: `${colors.focus}20` }]}>
                <View style={[styles.xpFill, { width: `${levelInfo.progress * 100}%`, backgroundColor: colors.focus }]} />
              </View>
              <Text style={[styles.xpSub, { color: colors.mute }]}>
                {levelInfo.xpToNext > 0
                  ? `${levelInfo.xpToNext} XP to ${levelInfo.nextTitle}`
                  : 'Max level reached'}
              </Text>
            </View>
          </View>
        </View>

        {/* AI Weekly Insight */}
        {aiEnabled && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <SparkleIcon size={14} color={colors.focus} />
                <Text style={[styles.cardTitle, { color: colors.ink }]}>Weekly insight</Text>
              </View>
              {!aiSummary && (
                <TouchableOpacity
                  onPress={handleGenerateSummary}
                  disabled={aiLoading}
                  style={[styles.aiGenBtn, { backgroundColor: `${colors.focus}18` }]}
                >
                  {aiLoading
                    ? <ActivityIndicator size="small" color={colors.focus} />
                    : <Text style={[styles.aiGenText, { color: colors.focus }]}>Generate</Text>}
                </TouchableOpacity>
              )}
              {aiSummary && (
                <TouchableOpacity onPress={() => { setAiSummary(''); setAiError(''); }}
                  style={[styles.aiGenBtn, { backgroundColor: `${colors.focus}18` }]}>
                  <Text style={[styles.aiGenText, { color: colors.focus }]}>Refresh</Text>
                </TouchableOpacity>
              )}
            </View>
            {aiError ? (
              <Text style={[styles.aiError, { color: colors.warm || '#E57373' }]}>{aiError}</Text>
            ) : aiSummary ? (
              <Text style={[styles.aiSummaryText, { color: colors.ink }]}>{aiSummary}</Text>
            ) : (
              <Text style={[styles.aiPrompt, { color: colors.mute }]}>
                Get a personalised read on your week — patterns, wins, and one thing to try.
              </Text>
            )}
          </View>
        )}

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

        {/* Achievements */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.ink }]}>Achievements</Text>
            <Text style={[styles.cardSub, { color: colors.mute }]}>
              {unlockedAchievements.length}/{ACHIEVEMENTS.length}
            </Text>
          </View>
          <View style={styles.achGrid}>
            {ACHIEVEMENTS.map((a) => {
              const unlocked = unlockedAchievements.includes(a.id);
              return (
                <View
                  key={a.id}
                  style={[
                    styles.achItem,
                    {
                      backgroundColor: unlocked ? `${colors.focus}14` : `${colors.ink}06`,
                      borderColor: unlocked ? `${colors.focus}40` : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.achIcon, { opacity: unlocked ? 1 : 0.25 }]}>{a.icon}</Text>
                  <Text
                    style={[styles.achTitle, { color: unlocked ? colors.ink : colors.mute }]}
                    numberOfLines={1}
                  >
                    {a.title}
                  </Text>
                  <Text style={[styles.achDesc, { color: colors.mute }]} numberOfLines={2}>
                    {a.desc}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={[styles.achProgressTrack, { backgroundColor: `${colors.focus}20` }]}>
            <View
              style={[
                styles.achProgressFill,
                {
                  width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%`,
                  backgroundColor: colors.focus,
                },
              ]}
            />
          </View>
          <Text style={[styles.achProgressLabel, { color: colors.mute }]}>
            {totalPomodoros} total sessions · {unlockedAchievements.length} badge{unlockedAchievements.length !== 1 ? 's' : ''} earned
          </Text>
        </View>

        {/* Focus Patterns */}
        {insights.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.ink }]}>Focus patterns</Text>
              <Text style={[styles.cardSub, { color: colors.mute }]}>{insights.length} insight{insights.length !== 1 ? 's' : ''}</Text>
            </View>
            <View style={{ gap: 8, marginTop: 6 }}>
              {insights.map((item, i) => (
                <View key={i} style={[styles.insightRow, { backgroundColor: `${colors.focus}0D` }]}>
                  <Text style={styles.insightIcon}>{item.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.insightText, { color: colors.ink }]}>{item.text}</Text>
                    <Text style={[styles.insightSub, { color: colors.mute }]}>{item.sub}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

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

        {/* Session Notes Journal */}
        {sessionNotes.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.ink }]}>Session journal</Text>
              <Text style={[styles.cardSub, { color: colors.mute }]}>{sessionNotes.length} note{sessionNotes.length !== 1 ? 's' : ''}</Text>
            </View>
            <View style={{ gap: 10, marginTop: 6 }}>
              {sessionNotes.slice(0, 5).map((n) => {
                const RATING_ICONS = { great: '🔥', solid: '👍', okay: '😌', hard: '😓' };
                const d = new Date(n.ts);
                const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                const timeStr = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
                return (
                  <View key={n.id} style={[styles.noteRow, { borderColor: colors.line }]}>
                    <View style={styles.noteTop}>
                      <Text style={[styles.noteTask, { color: colors.ink }]} numberOfLines={1}>
                        {n.rating ? `${RATING_ICONS[n.rating]}  ` : ''}{n.taskTitle || 'Free session'}
                      </Text>
                      <Text style={[styles.noteDate, { color: colors.mute }]}>{dateStr} · {timeStr}</Text>
                    </View>
                    {n.completed ? (
                      <Text style={[styles.noteBody, { color: colors.mute }]} numberOfLines={2}>
                        ✓ {n.completed}
                      </Text>
                    ) : null}
                    {n.blockers ? (
                      <Text style={[styles.noteBody, { color: colors.mute }]} numberOfLines={1}>
                        ⚠ {n.blockers}
                      </Text>
                    ) : null}
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
  header: { paddingHorizontal: 24, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  shareHeaderBtn: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 100, marginBottom: 4 },
  shareHeaderText: { fontSize: 13, fontWeight: '600' },
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
  aiGenBtn: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 100 },
  aiGenText: { fontSize: 12, fontWeight: '600' },
  aiSummaryText: { fontSize: 13.5, lineHeight: 20, marginTop: 8 },
  aiPrompt: { fontSize: 13, lineHeight: 18, marginTop: 6 },
  aiError: { fontSize: 13, marginTop: 6 },
  // Achievements
  achGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 14,
  },
  achItem: {
    width: '47%', borderRadius: 14, padding: 12, borderWidth: 1, gap: 3,
  },
  achIcon: { fontSize: 22, marginBottom: 2 },
  achTitle: { fontSize: 12, fontWeight: '700' },
  achDesc: { fontSize: 11, lineHeight: 15 },
  // Focus patterns
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 12 },
  insightIcon: { fontSize: 20 },
  insightText: { fontSize: 13, fontWeight: '600', lineHeight: 17 },
  insightSub: { fontSize: 11, marginTop: 2 },
  achProgressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  achProgressFill: { height: '100%', borderRadius: 3 },
  achProgressLabel: { fontSize: 11, marginTop: 7 },
  // Session journal
  noteRow: { borderTopWidth: 1, paddingTop: 10, gap: 3 },
  noteTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  noteTask: { fontSize: 13, fontWeight: '600', flex: 1 },
  noteDate: { fontSize: 11 },
  noteBody: { fontSize: 12, lineHeight: 17 },
  // Burnout
  burnoutBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  burnoutBadgeText: { fontSize: 11, fontWeight: '700' },
  burnoutSignalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  burnoutSignalDot: { fontSize: 8, lineHeight: 18 },
  burnoutSignalText: { fontSize: 13, lineHeight: 18, flex: 1 },
  burnoutSuggestionsBox: { borderRadius: 12, padding: 12, borderWidth: 1, gap: 6 },
  burnoutSuggestionsLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4, marginBottom: 2 },
  burnoutSuggestionText: { fontSize: 13, lineHeight: 18 },
  // XP Level
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  xpIcon: { fontSize: 36 },
  xpTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  xpTitle: { fontSize: 14, fontWeight: '700' },
  xpCount: { fontSize: 12, fontWeight: '600' },
  xpTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 4 },
  xpSub: { fontSize: 11, marginTop: 6 },
  // Toast
  toast: {
    position: 'absolute', alignSelf: 'center', top: 80, zIndex: 100,
    paddingVertical: 10, paddingHorizontal: 20, borderRadius: 100,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, elevation: 8,
  },
  toastText: { fontSize: 14, fontWeight: '600' },
});
