import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store';
import { XIcon, SendIcon, SparkleIcon } from '../../src/components';
import { FONT_DISPLAY } from '../../src/constants/tokens';
import { chatWithCoach } from '../../src/utils/openai';
import { computeStreak, getWeekData } from '../../src/utils/time';
import { computeFocusScore, scoreLabel } from '../../src/utils/focusScore';

const SUGGESTED = [
  "Why have I been unproductive this week?",
  "Plan my next 2 hours.",
  "How do I recover from burnout?",
  "What should I focus on right now?",
];

const MOODS = ['Drained', 'Foggy', 'Okay', 'Sharp', 'Flowing'];

export default function CoachModal() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const userName = useAppStore((s) => s.userName);
  const sessionHistory = useAppStore((s) => s.sessionHistory);
  const moodHistory = useAppStore((s) => s.moodHistory);
  const todaySessions = useAppStore((s) => s.todaySessions);
  const focusGoal = useAppStore((s) => s.focusGoal);
  const tasks = useAppStore((s) => s.tasks);
  const distractionLog = useAppStore((s) => s.distractionLog);
  const openAIKey = useAppStore((s) => s.openAIKey);

  const todayKey = new Date().toISOString().split('T')[0];
  const streak = computeStreak(sessionHistory);
  const weekData = getWeekData(sessionHistory);
  const weekTotal = weekData.reduce((s, d) => s + d.value, 0);
  const activeDays = weekData.filter((d) => d.value > 0).length;
  const todayMood = moodHistory[todayKey]?.value ?? null;
  const { total: focusScore } = computeFocusScore({ todaySessions, focusGoal, todayMood, sessionHistory });

  const activeTasks = tasks.filter((t) => !t.complete).slice(0, 4);
  const taskSummary = activeTasks.map((t) => `"${t.title}" (${t.tag})`).join(', ');

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentDistractions = distractionLog.filter((d) => d.timestamp >= sevenDaysAgo);
  const distractionCounts = {};
  recentDistractions.forEach(({ reason }) => {
    distractionCounts[reason] = (distractionCounts[reason] || 0) + 1;
  });
  const topDistractions = Object.entries(distractionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([r, c]) => `${r} (${c}×)`)
    .join(', ');

  const context = {
    userName,
    streak,
    todaySessions,
    focusGoal,
    weekTotal,
    activeDays,
    focusScore,
    scoreLabel: scoreLabel(focusScore),
    taskSummary,
    topDistractions,
    recentMood: todayMood ? MOODS[todayMood - 1] : null,
  };

  const send = useCallback(async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    if (!openAIKey) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: userText },
        { role: 'assistant', content: 'Add your OpenAI API key in Settings to use the Focus Coach.' },
      ]);
      setInput('');
      return;
    }

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const reply = await chatWithCoach(newMessages, context, openAIKey);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Something went wrong: ${e.message}` },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [input, messages, openAIKey, context]);

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14, borderBottomColor: colors.line }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.coachBadge, { backgroundColor: `${colors.focus}18` }]}>
            <SparkleIcon size={14} color={colors.focus} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>Focus Coach</Text>
            <Text style={[styles.headerSub, { color: colors.mute }]}>
              {streak > 0 ? `${streak}-day streak · ` : ''}Score {focusScore}/100
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <XIcon size={20} color={colors.mute} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingBottom: 16 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        {messages.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
              Hey {userName} 👋
            </Text>
            <Text style={[styles.emptyBody, { color: colors.mute }]}>
              Ask me anything about your focus, tasks, or how to make the most of your time today.
            </Text>
            <View style={styles.suggestions}>
              {SUGGESTED.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => send(s)}
                  activeOpacity={0.7}
                  style={[styles.suggestion, { backgroundColor: colors.surface, borderColor: colors.line }]}
                >
                  <Text style={[styles.suggestionText, { color: colors.ink }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          messages.map((m, i) => (
            <View
              key={i}
              style={[
                styles.bubble,
                m.role === 'user'
                  ? [styles.bubbleUser, { backgroundColor: colors.focus }]
                  : [styles.bubbleAssistant, { backgroundColor: colors.surface }],
              ]}
            >
              <Text style={[
                styles.bubbleText,
                { color: m.role === 'user' ? '#fff' : colors.ink },
              ]}>
                {m.content}
              </Text>
            </View>
          ))
        )}

        {loading && (
          <View style={[styles.bubble, styles.bubbleAssistant, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="small" color={colors.focus} />
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={[
        styles.inputRow,
        {
          borderTopColor: colors.line,
          paddingBottom: insets.bottom + 12,
          backgroundColor: colors.bg,
        },
      ]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.ink }]}
          placeholder="Ask your coach…"
          placeholderTextColor={colors.mute}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send()}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity
          onPress={() => send()}
          disabled={!input.trim() || loading}
          activeOpacity={0.75}
          style={[
            styles.sendBtn,
            {
              backgroundColor: input.trim() && !loading ? colors.focus : `${colors.focus}40`,
            },
          ]}
        >
          <SendIcon size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 20, paddingBottom: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  coachBadge: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '400', letterSpacing: -0.3 },
  headerSub: { fontSize: 11, marginTop: 1 },
  messages: { flex: 1 },
  messagesContent: { padding: 20, gap: 10 },
  empty: { gap: 12, paddingTop: 12 },
  emptyTitle: { fontSize: 26, fontWeight: '400', letterSpacing: -0.5 },
  emptyBody: { fontSize: 14, lineHeight: 20 },
  suggestions: { gap: 8, marginTop: 8 },
  suggestion: {
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16,
    borderWidth: 1,
  },
  suggestionText: { fontSize: 14, lineHeight: 19 },
  bubble: {
    maxWidth: '82%', borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14,
  },
  bubbleUser: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleAssistant: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  inputRow: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12,
    borderTopWidth: 1, alignItems: 'flex-end',
  },
  input: {
    flex: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, maxHeight: 100,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
});
