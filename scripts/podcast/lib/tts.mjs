import { GoogleGenAI } from '@google/genai';
import {
  TTS_MODEL,
  HOSTS,
  TTS_CHAR_BUDGET,
  STYLE_PROMPT,
  SAMPLE_RATE,
  BYTES_PER_SAMPLE,
} from '../config.mjs';

// Inline bracketed cues (e.g. [laughs], [listing quickly]) steer the SCRIPT but the multi-speaker
// TTS can choke on or mis-read them, so we strip them before synthesis. Delivery is carried by the
// style preamble, the word choice, and the punctuation (ellipses, em dashes, periods).
function forSpeech(text) {
  return text
    .replace(/\[[^\]]*\]/g, ' ') // bracketed cues
    .replace(/\*/g, '') // markdown emphasis
    .replace(/\s*—\s*/g, ', ') // em dashes (incl. mid-word cutoffs) -> comma; raw ones choke the TTS
    .replace(/\s+([,.?!;:])/g, '$1') // tidy space before punctuation
    .replace(/,\s*([.?!])/g, '$1') // drop a comma that lands right before end punctuation
    .replace(/\s{2,}/g, ' ')
    .replace(/(^[\s,]+|[\s,]+$)/g, '')
    .trim();
}

let client;
function ai() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('Set GEMINI_API_KEY (or GOOGLE_API_KEY) in .env');
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

const speakerVoiceConfigs = [
  { speaker: HOSTS.a.name, voiceConfig: { prebuiltVoiceConfig: { voiceName: HOSTS.a.voice } } },
  { speaker: HOSTS.b.name, voiceConfig: { prebuiltVoiceConfig: { voiceName: HOSTS.b.voice } } },
];

/** Split script lines into transcript chunks that stay under the per-call char budget. */
function chunkLines(lines) {
  const chunks = [];
  let cur = [];
  let len = 0;
  for (const l of lines) {
    const piece = `${l.speaker}: ${l.text}\n`;
    if (len + piece.length > TTS_CHAR_BUDGET && cur.length) {
      chunks.push(cur);
      cur = [];
      len = 0;
    }
    cur.push(l);
    len += piece.length;
  }
  if (cur.length) chunks.push(cur);
  return chunks;
}

async function synthChunk(lines) {
  const dialogue = lines
    .map((l) => `${l.speaker}: ${forSpeech(l.text)}`)
    .filter((l) => !/:\s*$/.test(l))
    .join('\n');
  const transcript = `${STYLE_PROMPT}\n\n${dialogue}`;
  const res = await ai().models.generateContent({
    model: TTS_MODEL,
    contents: [{ parts: [{ text: transcript }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: { multiSpeakerVoiceConfig: { speakerVoiceConfigs } },
    },
  });
  const b64 = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!b64) throw new Error('TTS returned no audio data');
  return Buffer.from(b64, 'base64'); // raw PCM (s16le, 24kHz, mono)
}

/** Synthesize a full script to a single PCM buffer (chunking long scripts as needed). */
export async function synthesize(lines) {
  const chunks = chunkLines(lines);
  const buffers = [];
  for (const chunk of chunks) {
    let lastErr;
    let pcm;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        pcm = await synthChunk(chunk);
        break;
      } catch (err) {
        lastErr = err;
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
    if (!pcm) throw new Error(`TTS failed: ${lastErr?.message || lastErr}`);
    buffers.push(pcm);
  }
  const out = Buffer.concat(buffers);

  // Guard against silent truncation (TTS occasionally returns a partial render).
  const words = lines.reduce((s, l) => s + forSpeech(l.text).split(/\s+/).filter(Boolean).length, 0);
  const expectedSec = words / 2.6; // ~155 words/min
  const actualSec = out.length / (SAMPLE_RATE * BYTES_PER_SAMPLE);
  if (expectedSec > 25 && actualSec < expectedSec * 0.4) {
    throw new Error(`TTS output looks truncated: ${actualSec.toFixed(0)}s for ~${words} words`);
  }
  return out;
}
