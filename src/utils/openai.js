const WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions';
const CHAT_URL = 'https://api.openai.com/v1/chat/completions';

const BREAKDOWN_SYSTEM = `You are a productivity assistant. A user describes a large goal or project.
Break it into 2–5 concrete, action-oriented focus tasks suitable for 25-minute Pomodoro sessions.
Return a JSON object with a single key "tasks" — an array where each element has:
  - "title": string — concise, action-oriented (e.g. "Draft introduction", "Research competitors")
  - "tag": one of "Work", "Reading", "Design", "Personal", "Wellness"
  - "total": integer 1–4 — estimated 25-minute pomodoros needed
Respond ONLY with valid JSON. No markdown, no explanation.`;

export async function breakdownGoal(goal, apiKey) {
  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: BREAKDOWN_SYSTEM },
        { role: 'user', content: goal },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `GPT-4o failed (${res.status})`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? '{"tasks":[]}';
  const parsed = JSON.parse(content);
  return Array.isArray(parsed.tasks) ? parsed.tasks : [];
}

const SUMMARY_SYSTEM = `You are a warm, direct productivity coach. Write a 2–3 sentence insight about the user's week — highlight one win, spot a pattern, and give one actionable suggestion. Be specific to the numbers. No markdown, no bullet points.`;

export async function generateWeeklySummary(stats, apiKey) {
  const prompt = `My week: ${stats.weekTotal} sessions completed (goal ${stats.focusGoal}/day). Today: ${stats.todaySessions} sessions. Focus score: ${stats.focusScore}/100 (${stats.scoreLabel}). Active days: ${stats.activeDays}/7. Top category: ${stats.topCategory || 'none'}. Distractions logged: ${stats.distractionCount}.`;
  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 120,
      messages: [
        { role: 'system', content: SUMMARY_SYSTEM },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `GPT-4o failed (${res.status})`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

export async function transcribeAudio(uri, apiKey) {
  const ext = uri.split('.').pop()?.toLowerCase() || 'm4a';
  const mimeMap = { m4a: 'audio/mp4', mp4: 'audio/mp4', mp3: 'audio/mpeg', wav: 'audio/wav', '3gp': 'audio/3gpp' };
  const type = mimeMap[ext] || 'audio/mp4';

  const form = new FormData();
  form.append('file', { uri, name: `audio.${ext}`, type });
  form.append('model', 'whisper-1');

  const res = await fetch(WHISPER_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `Whisper failed (${res.status})`);
  }

  return (await res.json()).text?.trim() ?? '';
}

const AUTO_TAG_SYSTEM = `Classify the following task title into exactly one of these tags: Work, Reading, Design, Personal, Wellness.
Reply with only the tag name — nothing else.`;

export async function autoTagTask(title, apiKey) {
  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 5,
      messages: [
        { role: 'system', content: AUTO_TAG_SYSTEM },
        { role: 'user', content: title },
      ],
    }),
  });
  if (!res.ok) throw new Error('Auto-tag failed');
  const data = await res.json();
  const tag = data.choices?.[0]?.message?.content?.trim();
  const VALID = ['Work', 'Reading', 'Design', 'Personal', 'Wellness'];
  return VALID.includes(tag) ? tag : null;
}

const COACH_SYSTEM = (ctx) => `You are a warm, insightful focus coach inside a Pomodoro productivity app. You know this user well:

- Name: ${ctx.userName}
- Streak: ${ctx.streak} day${ctx.streak !== 1 ? 's' : ''}
- Today: ${ctx.todaySessions} sessions completed (daily goal: ${ctx.focusGoal})
- This week: ${ctx.weekTotal} sessions across ${ctx.activeDays} active days
- Focus score today: ${ctx.focusScore}/100 (${ctx.scoreLabel})
- Active tasks: ${ctx.taskSummary || 'none'}
- Top distractions this week: ${ctx.topDistractions || 'none logged'}
- Recent mood: ${ctx.recentMood || 'not logged today'}

Keep replies concise (2–4 sentences max). Be direct, warm, and specific to their data. No bullet points. No markdown. If they ask for a plan or task breakdown, think step by step but keep it short.`;

export async function chatWithCoach(messages, context, apiKey) {
  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 180,
      messages: [
        { role: 'system', content: COACH_SYSTEM(context) },
        ...messages,
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `GPT-4o failed (${res.status})`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

const DAY_PLAN_SYSTEM = `You are a focused productivity planner. Given the user's tasks and current state, create a realistic plan for the rest of their day.
Return a JSON object with key "plan" — an array in priority order, each item has:
  - "taskTitle": string — exact task name from the list
  - "sessions": integer 1–4 — how many 25-min sessions to schedule now
  - "reason": string — one short phrase, max 8 words, explaining why this is prioritized
Keep the total sessions within the available count. Respond ONLY with valid JSON.`;

export async function planMyDay({ tasks, sessionsLeft, energyLevel, moodValue }, apiKey) {
  const pending = tasks
    .filter((t) => !t.complete)
    .map((t) => `"${t.title}" (${t.tag}, ${t.total - t.done} sessions left)`)
    .join('; ');
  const energyLabels = { 1: 'Low', 2: 'Medium', 3: 'High' };
  const moodLabels = ['', 'Drained', 'Foggy', 'Okay', 'Sharp', 'Flowing'];
  const prompt = `Sessions available today: ${sessionsLeft}. Energy: ${energyLabels[energyLevel] || 'Unknown'}. Mood: ${moodLabels[moodValue] || 'Unknown'}. Pending tasks: ${pending || 'none'}.`;

  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      max_tokens: 300,
      messages: [
        { role: 'system', content: DAY_PLAN_SYSTEM },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `GPT-4o failed (${res.status})`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? '{"plan":[]}';
  const parsed = JSON.parse(content);
  return Array.isArray(parsed.plan) ? parsed.plan : [];
}

const SYSTEM_PROMPT = `You are a productivity assistant. Extract every distinct task from the user's message.
Return a JSON object with a single key "tasks" — an array where each element has:
  - "title": string — concise, action-oriented (e.g. "Review Q3 slides", "Read chapter 4")
  - "tag": one of "Work", "Reading", "Design", "Personal", "Wellness"
  - "total": integer 1–8 — estimated 25-minute pomodoros needed
Respond ONLY with valid JSON. No markdown, no explanation.`;

export async function parseTasksWithAI(transcript, apiKey) {
  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: transcript },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `GPT-4o failed (${res.status})`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? '{"tasks":[]}';
  const parsed = JSON.parse(content);
  return Array.isArray(parsed.tasks) ? parsed.tasks : [];
}
