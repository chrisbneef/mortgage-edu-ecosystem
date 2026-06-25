import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';
import { TEXT_MODEL, HOSTS, TARGET_MINUTES } from '../config.mjs';

const SKILL_PATH = new URL('../scriptwriter-skill.md', import.meta.url);

let client;
function ai() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('Set GEMINI_API_KEY (or GOOGLE_API_KEY) in .env');
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

const A = HOSTS.a.name; // Charon
const B = HOSTS.b.name; // Aoede

/**
 * Audio-director system prompt: produce a NotebookLM-style "Deep Dive" transcript with
 * performance cues. The em dashes, ellipses, and [tags] are TTS directing cues (not article
 * text), so they are intentional here.
 */
/** The persona/style comes from the editable skill file; we append only the pipeline contract. */
function systemInstruction() {
  const skill = fs.readFileSync(SKILL_PATH, 'utf8');
  return `${skill}

## Pipeline contract (additional, overrides any conflict above)
- Label EVERY spoken line with exactly "${A}:" or "${B}:" at the start of the line. Use no other
  markers. A single leading "#### TRANSCRIPT" line is fine; everything after it must be labeled dialogue.
- Output ONLY the dialogue (and the optional header). No title, no intro, no narration.
- Open with a hook, not "welcome to the show." Aim for about ${TARGET_MINUTES} minutes spoken, and end
  on a practical takeaway.
- Stay accurate to the source material. Do NOT invent specific interest rates, numbers, or guarantees;
  keep claims general where the source is general. This is educational, not advice.`;
}

const LABEL_RE = new RegExp(`^\\s*(${A}|${B})\\s*:`, 'm');
const SPLIT_RE = new RegExp(`^\\s*(${A}|${B})\\s*:`, 'm');

/** Generate a validated 2-host Deep Dive script for a lesson. Retries on malformed output. */
export async function generateScript(lesson, { retries = 3 } = {}) {
  const prompt = `Source material to turn into the Deep Dive.

Title: ${lesson.title}
Summary: ${lesson.summary}

${lesson.text}`;

  let lastErr;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await ai().models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
        config: { systemInstruction: systemInstruction(), temperature: 1.0 },
      });
      const text = (res.text || '').trim();
      if (!LABEL_RE.test(text)) throw new Error('no speaker labels found');

      // Split on speaker labels; keep the inline tags / punctuation in the text.
      const parts = text.split(SPLIT_RE);
      const lines = [];
      for (let i = 1; i < parts.length; i += 2) {
        const speaker = parts[i];
        const t = (parts[i + 1] || '').replace(/\s+/g, ' ').trim();
        if (t) lines.push({ speaker, text: t });
      }
      if (lines.length < 2) throw new Error('too few dialogue lines');
      return lines;
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(`script generation failed: ${lastErr?.message || lastErr}`);
}
