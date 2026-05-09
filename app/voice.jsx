import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
  Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAudioRecorder, RecordingPresets, setAudioModeAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { useTheme } from '../src/hooks/useTheme';
import { useAppStore } from '../src/store';

import {
  ChevLeftIcon, MicIcon, PlusIcon, CheckIcon, XIcon,
  ArrowIcon, PillButton, TomatoDots,
} from '../src/components';
import { FONT_DISPLAY } from '../src/constants/tokens';
import { transcribeAudio, parseTasksWithAI } from '../src/utils/openai';
const TAG_KEYWORDS = {
  Work: ['work', 'meeting', 'email', 'report', 'review', 'call', 'project', 'narrative', 'reply', 'inbox', 'deadline', 'presentation', 'q3', 'q4'],
  Reading: ['read', 'chapter', 'book', 'article', 'paper', 'deep work'],
  Design: ['design', 'sketch', 'wireframe', 'prototype', 'figma', 'ui', 'ux', 'mood board'],
  Wellness: ['workout', 'exercise', 'meditate', 'walk', 'run', 'gym', 'yoga', 'stretch'],
  Personal: ['personal', 'family', 'friend', 'shop', 'errand', 'clean', 'cook'],
};

const TAG_COLOR_KEYS = {
  Work: 'focus',
  Reading: 'breakC',
  Design: 'plum',
  Wellness: 'breakC',
  Personal: 'plum',
};

function guessTag(title) {
  const lower = title.toLowerCase();
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return tag;
  }
  return 'Work';
}

function parseTasks(text) {
  const raw = text
    .split(/[,.\n]|\band\b/i)
    .map((s) => s.replace(/^[\s–—-]+|[\s–—-]+$/g, '').trim())
    .filter((s) => s.length > 2);
  return raw.map((title) => {
    const tag = guessTag(title);
    const capitalized = title.charAt(0).toUpperCase() + title.slice(1);
    return {
      id: Math.random().toString(36).slice(2),
      title: capitalized,
      tag,
      tagColorKey: TAG_COLOR_KEYS[tag] || 'focus',
      total: 2,
    };
  });
}

function aiTasksToDrafts(aiTasks) {
  return aiTasks.map((t) => ({
    id: Math.random().toString(36).slice(2),
    title: t.title,
    tag: TAG_COLOR_KEYS[t.tag] ? t.tag : 'Work',
    tagColorKey: TAG_COLOR_KEYS[t.tag] || 'focus',
    total: Math.max(1, Math.min(8, Number(t.total) || 2)),
  }));
}

export default function VoiceScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addTasks = useAppStore((s) => s.addTasks);
  const haptics = useAppStore((s) => s.haptics);
  const openAIKey = useAppStore((s) => s.openAIKey);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [phase, setPhase] = useState('idle'); // 'idle' | 'recording' | 'loading' | 'review'
  const [loadingLabel, setLoadingLabel] = useState('');
  const [inputText, setInputText] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [removed, setRemoved] = useState(new Set());
  const [recordSeconds, setRecordSeconds] = useState(0);

  const inputRef = useRef(null);
  const recordTimerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);

  useEffect(() => {
    if (phase === 'recording') {
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      clearInterval(recordTimerRef.current);
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
    }
    return () => clearInterval(recordTimerRef.current);
  }, [phase]);

  const startRecording = async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission required', 'Allow microphone access to use voice input.');
        return;
      }
      await setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      setPhase('recording');
    } catch (err) {
      Alert.alert('Error', 'Could not start recording: ' + (err.message || 'unknown error'));
    }
  };

  const stopRecording = async () => {
    try {
      setPhase('loading');
      setLoadingLabel('Transcribing with Whisper…');

      await recorder.stop();
      await setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recorder.uri;

      const transcript = await transcribeAudio(uri, openAIKey);
      setInputText(transcript);

      setLoadingLabel('Parsing tasks with GPT-4o…');
      const aiTasks = await parseTasksWithAI(transcript, openAIKey);
      const draftList = aiTasksToDrafts(aiTasks);

      if (draftList.length === 0) {
        Alert.alert('No tasks found', 'Try speaking more clearly or listing tasks explicitly.');
        setPhase('idle');
        return;
      }

      setDrafts(draftList);
      setRemoved(new Set());
      setPhase('review');
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong. Try again.');
      setPhase('idle');
    }
  };

  const cancelRecording = async () => {
    try {
      if (recorder.isRecording) {
        await recorder.stop();
        await setAudioModeAsync({ allowsRecordingIOS: false });
      }
    } catch (_) {}
    setPhase('idle');
  };

  const handleParse = async () => {
    const text = inputText.trim();
    if (!text) return;
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    if (openAIKey) {
      setPhase('loading');
      setLoadingLabel('Parsing tasks with GPT-4o…');
      try {
        const aiTasks = await parseTasksWithAI(text, openAIKey);
        const draftList = aiTasksToDrafts(aiTasks);
        if (draftList.length === 0) {
          Alert.alert('No tasks found', 'Try listing tasks separated by commas.');
          setPhase('idle');
          return;
        }
        setDrafts(draftList);
        setRemoved(new Set());
        setPhase('review');
      } catch (err) {
        Alert.alert('Error', err.message || 'Something went wrong.');
        setPhase('idle');
      }
    } else {
      const parsed = parseTasks(text);
      if (parsed.length === 0) return;
      setDrafts(parsed);
      setRemoved(new Set());
      setPhase('review');
    }
  };

  const handleConfirm = () => {
    const toAdd = drafts.filter((d) => !removed.has(d.id));
    addTasks(toAdd.map((d) => ({ title: d.title, tag: d.tag, tagColorKey: d.tagColorKey, total: d.total })));
    if (haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  const handleRemove = (id) => {
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRemoved((prev) => new Set([...prev, id]));
  };

  const handleAdjustTotal = (id, delta) => {
    setDrafts((prev) =>
      prev.map((d) => d.id === id ? { ...d, total: Math.max(1, Math.min(8, d.total + delta)) } : d)
    );
  };

  const activeDrafts = drafts.filter((d) => !removed.has(d.id));
  const getTagColor = (tagColorKey) => colors[tagColorKey] || colors.focus;
  const mm = String(Math.floor(recordSeconds / 60)).padStart(2, '0');
  const ss = String(recordSeconds % 60).padStart(2, '0');

  // ── RECORDING PHASE ───────────────────────────────────────────
  if (phase === 'recording') {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <TouchableOpacity onPress={cancelRecording} activeOpacity={0.7}
            style={[styles.backBtn, { backgroundColor: colors.surface, shadowColor: colors.ink }]}>
            <XIcon size={18} color={colors.ink} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.headerSub, { color: colors.mute }]}>Voice input</Text>
            <Text style={[styles.headerTitle, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>Listening…</Text>
          </View>
        </View>

        <View style={styles.recordCenter}>
          <Text style={[styles.recordTimer, { color: colors.mute, fontFamily: FONT_DISPLAY }]}>
            {mm}:{ss}
          </Text>
          <View style={styles.recordMicWrap}>
            <Animated.View style={[
              styles.recordGlow,
              { backgroundColor: '#EF444420', transform: [{ scale: pulseAnim }] },
            ]} />
            <View style={[styles.recordMicCircle, { backgroundColor: '#EF4444', shadowColor: '#EF4444' }]}>
              <MicIcon size={48} color="#fff" />
            </View>
          </View>
          <Text style={[styles.recordHint, { color: colors.mute }]}>
            Speak your tasks, then tap Done
          </Text>
        </View>

        <View style={[styles.idleFooter, { paddingBottom: insets.bottom + 20 }]}>
          <PillButton colors={colors} primary size="lg" style={styles.fullBtn} onPress={stopRecording}>
            <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '600' }}>Done</Text>
            <ArrowIcon size={16} color={colors.bg} />
          </PillButton>
        </View>
      </View>
    );
  }

  // ── LOADING PHASE ─────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <View style={[styles.screen, styles.loadingCenter, { backgroundColor: colors.bg }]}>
        <View style={[styles.loadingCircle, { backgroundColor: colors.surface, shadowColor: colors.ink }]}>
          <ActivityIndicator size="large" color={colors.focus} />
        </View>
        <Text style={[styles.loadingLabel, { color: colors.ink }]}>{loadingLabel}</Text>
        <Text style={[styles.loadingSub, { color: colors.mute }]}>Powered by OpenAI</Text>
      </View>
    );
  }

  // ── IDLE PHASE ────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <KeyboardAvoidingView
        style={[styles.screen, { backgroundColor: colors.bg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}
            style={[styles.backBtn, { backgroundColor: colors.surface, shadowColor: colors.ink }]}>
            <ChevLeftIcon size={18} color={colors.ink} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.headerSub, { color: colors.mute }]}>Plan with voice</Text>
            <Text style={[styles.headerTitle, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>Just say it</Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.idleContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => {
              if (!openAIKey) {
                Alert.alert('API key required', 'Add your OpenAI key in Settings → AI & Voice to enable voice input.');
                return;
              }
              startRecording();
            }}
            activeOpacity={0.75}
            style={styles.micWrap}
          >
            <View style={[styles.micGlow, {
              backgroundColor: openAIKey ? `${colors.focus}22` : `${colors.line}44`,
            }]} />
            <View style={[styles.micCircle, {
              backgroundColor: openAIKey ? colors.focus : colors.line,
              shadowColor: colors.focus,
              shadowOpacity: openAIKey ? 0.3 : 0,
            }]}>
              <MicIcon size={44} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={[styles.headline, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
            Tell me what's{'\n'}on your plate.
          </Text>
          <Text style={[styles.subline, { color: colors.mute }]}>
            {openAIKey
              ? 'Tap the mic and speak — or type below.'
              : 'Add an OpenAI key in Settings to enable voice input.'}
          </Text>

          <View style={[styles.exampleCard, { backgroundColor: colors.surface, shadowColor: colors.ink }]}>
            <Text style={[styles.exampleLabel, { color: colors.focus }]}>TRY SAYING</Text>
            <Text style={[styles.exampleText, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
              "Outline the Q3 narrative, read chapter four of Deep Work, and reply to Lin's thread."
            </Text>
          </View>

          <View style={[styles.inputCard, { backgroundColor: colors.surface, shadowColor: colors.ink }]}>
            <Text style={[styles.inputLabel, { color: colors.mute }]}>TYPE YOUR TASKS</Text>
            <TextInput
              ref={inputRef}
              value={inputText}
              onChangeText={setInputText}
              placeholder="e.g. Review slides, email the team, read chapter 3…"
              placeholderTextColor={colors.soft}
              style={[styles.textArea, { color: colors.ink }]}
              multiline
              numberOfLines={4}
              returnKeyType="default"
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={[styles.idleFooter, { paddingBottom: insets.bottom + 20 }]}>
          <PillButton
            colors={colors}
            primary
            size="lg"
            style={styles.fullBtn}
            onPress={handleParse}
            disabled={!inputText.trim()}
          >
            <Text style={{ color: colors.bg, fontSize: 16, fontWeight: '600' }}>
              {openAIKey ? 'Parse with AI' : 'Parse tasks'}
            </Text>
            <ArrowIcon size={16} color={colors.bg} />
          </PillButton>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── REVIEW PHASE ─────────────────────────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => setPhase('idle')} activeOpacity={0.7}
          style={[styles.backBtn, { backgroundColor: colors.surface, shadowColor: colors.ink }]}>
          <ChevLeftIcon size={18} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.headerSub, { color: colors.mute }]}>
            Review · {activeDrafts.length} task{activeDrafts.length !== 1 ? 's' : ''}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.ink, fontFamily: FONT_DISPLAY }]}>
            Sound right?
          </Text>
        </View>
        <TouchableOpacity onPress={() => setPhase('idle')} activeOpacity={0.7}>
          <Text style={[styles.editAll, { color: colors.mute }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      {inputText ? (
        <View style={[styles.transcriptPill, { backgroundColor: colors.warm }]}>
          <MicIcon size={13} color={colors.plum} />
          <Text style={[styles.transcriptText, { color: colors.plum, fontFamily: FONT_DISPLAY }]}
            numberOfLines={2}>
            "{inputText}"
          </Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.reviewList} showsVerticalScrollIndicator={false}>
        <Text style={[styles.aiLabel, { color: colors.mute }]}>PARSED TASKS</Text>

        {drafts.map((draft) => {
          const isRemoved = removed.has(draft.id);
          const tint = getTagColor(draft.tagColorKey);
          return (
            <View key={draft.id} style={[
              styles.draftCard,
              { backgroundColor: colors.surface, shadowColor: colors.ink, opacity: isRemoved ? 0.4 : 1 },
            ]}>
              <View style={styles.draftTop}>
                <View style={[styles.draftCheck, { borderColor: colors.line }]}>
                  {!isRemoved && <CheckIcon size={12} color={colors.breakC} strokeWidth={2.5} />}
                </View>
                <Text style={[styles.draftTitle, {
                  color: isRemoved ? colors.mute : colors.ink,
                  textDecorationLine: isRemoved ? 'line-through' : 'none',
                }]} numberOfLines={2}>
                  {draft.title}
                </Text>
                <TouchableOpacity onPress={() => handleRemove(draft.id)} activeOpacity={0.7}
                  style={[styles.removeBtn, { backgroundColor: colors.bg }]}>
                  <XIcon size={13} color={colors.mute} />
                </TouchableOpacity>
              </View>

              {!isRemoved && (
                <View style={styles.draftMeta}>
                  <View style={[styles.tagChip, { backgroundColor: `${tint}18` }]}>
                    <View style={[styles.tagDot, { backgroundColor: tint }]} />
                    <Text style={[styles.tagChipText, { color: tint }]}>{draft.tag}</Text>
                  </View>
                  <View style={[styles.countChip, { backgroundColor: colors.bg }]}>
                    <TouchableOpacity onPress={() => handleAdjustTotal(draft.id, -1)} style={styles.countBtn}>
                      <Text style={[styles.countBtnText, { color: colors.mute }]}>−</Text>
                    </TouchableOpacity>
                    <TomatoDots done={draft.total} total={draft.total} colors={colors} size={6} />
                    <Text style={[styles.countNum, { color: colors.ink }]}>{draft.total * 25}m</Text>
                    <TouchableOpacity onPress={() => handleAdjustTotal(draft.id, 1)} style={styles.countBtn}>
                      <Text style={[styles.countBtnText, { color: colors.mute }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        <TouchableOpacity
          onPress={() => setPhase('idle')}
          activeOpacity={0.7}
          style={[styles.addMoreCard, { borderColor: colors.line }]}
        >
          <PlusIcon size={14} color={colors.mute} />
          <Text style={[styles.addMoreText, { color: colors.mute }]}>Add another task</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.reviewFooter, { paddingBottom: insets.bottom + 20 }]}>
        <PillButton colors={colors} ghost size="lg" style={styles.discardBtn} onPress={() => router.back()}>
          <Text style={{ color: colors.ink, fontSize: 15, fontWeight: '600' }}>Discard</Text>
        </PillButton>
        <PillButton colors={colors} primary size="lg" style={styles.confirmBtn}
          onPress={handleConfirm}
          disabled={activeDrafts.length === 0}>
          <Text style={{ color: colors.bg, fontSize: 15, fontWeight: '600' }}>
            Add {activeDrafts.length} task{activeDrafts.length !== 1 ? 's' : ''}
          </Text>
          <ArrowIcon size={15} color={colors.bg} />
        </PillButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingBottom: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    flexShrink: 0,
  },
  headerText: { flex: 1 },
  headerSub: { fontSize: 12, fontWeight: '500' },
  headerTitle: { fontSize: 22, fontWeight: '400', letterSpacing: -0.3 },
  editAll: { fontSize: 13, fontWeight: '600' },

  // ── RECORDING ──
  recordCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 },
  recordTimer: { fontSize: 52, fontWeight: '300', letterSpacing: 4 },
  recordMicWrap: {
    position: 'relative', width: 160, height: 160,
    alignItems: 'center', justifyContent: 'center',
  },
  recordGlow: { position: 'absolute', width: 160, height: 160, borderRadius: 80 },
  recordMicCircle: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 12,
  },
  recordHint: { fontSize: 15, fontWeight: '500' },

  // ── LOADING ──
  loadingCenter: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  loadingLabel: { fontSize: 17, fontWeight: '600' },
  loadingSub: { fontSize: 12 },

  // ── IDLE ──
  idleContent: { paddingHorizontal: 24, paddingBottom: 16, alignItems: 'center', gap: 20 },
  micWrap: {
    position: 'relative', width: 140, height: 140,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  micGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70 },
  micCircle: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 10,
  },
  headline: {
    fontSize: 32, fontWeight: '400', textAlign: 'center', letterSpacing: -0.6, lineHeight: 36,
  },
  subline: { fontSize: 14, textAlign: 'center', lineHeight: 20, maxWidth: 280 },
  exampleCard: {
    borderRadius: 16, padding: 16, width: '100%',
    shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  exampleLabel: {
    fontSize: 10, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6,
  },
  exampleText: { fontSize: 15, lineHeight: 22 },
  inputCard: {
    borderRadius: 16, padding: 14, width: '100%',
    shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  inputLabel: {
    fontSize: 10, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8,
  },
  textArea: { fontSize: 15, lineHeight: 22, minHeight: 100 },
  idleFooter: { paddingHorizontal: 24 },
  fullBtn: { width: '100%' },

  // ── REVIEW ──
  transcriptPill: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    marginHorizontal: 20, borderRadius: 14, padding: 12, marginBottom: 4,
  },
  transcriptText: { flex: 1, fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  reviewList: { paddingHorizontal: 20, paddingBottom: 16, gap: 10 },
  aiLabel: {
    fontSize: 10, fontWeight: '600', letterSpacing: 1.4,
    textTransform: 'uppercase', paddingHorizontal: 4, paddingBottom: 4,
  },
  draftCard: {
    borderRadius: 16, padding: 14, gap: 10,
    shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  draftTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  draftCheck: {
    width: 22, height: 22, borderRadius: 7, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  draftTitle: { flex: 1, fontSize: 14.5, fontWeight: '600', lineHeight: 20 },
  removeBtn: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  draftMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 32 },
  tagChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: 100,
  },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  tagChipText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
  countChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 4, paddingHorizontal: 8, borderRadius: 100,
  },
  countBtn: { padding: 2 },
  countBtnText: { fontSize: 15, lineHeight: 18, fontWeight: '500' },
  countNum: { fontSize: 11, fontWeight: '600' },
  addMoreCard: {
    borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed',
    padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  addMoreText: { fontSize: 13, fontWeight: '500' },
  reviewFooter: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 8 },
  discardBtn: { flex: 1 },
  confirmBtn: { flex: 2 },
});
