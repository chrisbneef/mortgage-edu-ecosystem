// Pipeline configuration. Models and voices are env-overridable so we can swap in a
// newer Gemini TTS id without code changes (confirm current ids at ai.google.dev).

export const TEXT_MODEL = process.env.PODCAST_TEXT_MODEL || 'gemini-2.5-pro';
export const TTS_MODEL = process.env.PODCAST_TTS_MODEL || 'gemini-2.5-flash-preview-tts';

// The two podcast hosts, styled after a NotebookLM "Deep Dive". The `name` is the speaker
// label used in BOTH the script and the multi-speaker TTS config (they must match), and it
// is also the prebuilt Gemini voice name.
export const HOSTS = {
  a: {
    name: process.env.PODCAST_HOST_A_NAME || 'Achird', // Character 1: warm analytical anchor
    voice: process.env.PODCAST_HOST_A_VOICE || 'Achird',
  },
  b: {
    name: process.env.PODCAST_HOST_B_NAME || 'Laomedeia', // Character 2: upbeat, sharp
    voice: process.env.PODCAST_HOST_B_VOICE || 'Laomedeia',
  },
};

// Natural-language performance direction prepended to the TTS transcript so the model
// delivers the labeled dialogue as an energetic deep dive (in addition to the inline
// [tags] the script itself carries).
export const STYLE_PROMPT =
  process.env.PODCAST_STYLE_PROMPT ||
  'Perform the following as an energetic, fast-paced "Deep Dive" podcast between two sharp industry professionals. Achird is warm, friendly, and analytical; he anchors and frames each concept. Laomedeia is upbeat, highly intelligent, and sharp, bringing the high-energy insights and the wow factors. Keep the momentum crisp with tight hand-offs. Honor the bracketed performance cues, and let the ellipses create natural, fluid pauses between speakers.';

export const TARGET_MINUTES = Number(process.env.PODCAST_TARGET_MIN || 4);
export const CONCURRENCY = Number(process.env.PODCAST_CONCURRENCY || 2);

export const CONTENT_DIR = 'src/content/items';
export const BLOB_PREFIX = process.env.PODCAST_BLOB_PREFIX || 'audio';
export const MANIFEST_PATH = 'scripts/podcast/manifest.json';

// Gemini TTS output format: signed 16-bit PCM, mono.
export const SAMPLE_RATE = 24000;
export const CHANNELS = 1;
export const BYTES_PER_SAMPLE = 2;

// Rough char budget per TTS call before we split a long script into chunks.
export const TTS_CHAR_BUDGET = Number(process.env.PODCAST_TTS_CHAR_BUDGET || 4500);
