const WHISPER_URL = 'https://api.openai.com/v1/audio/transcriptions';
const CHAT_URL = 'https://api.openai.com/v1/chat/completions';

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
