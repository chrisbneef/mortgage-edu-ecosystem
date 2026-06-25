# Podcast Audio Pipeline

Generates a NotebookLM-style **two-host audio "deep dive"** for each lesson, using the Google Gemini
API (a model writes the script, Gemini multi-speaker TTS voices it), hosts the MP3 on Vercel Blob, and
writes the `audio.src` back into the lesson's frontmatter. Runs locally; it is not part of the web build.

## One-time setup

1. **Gemini API key** (paid/billing enabled): https://aistudio.google.com/apikey
2. **Vercel Blob store**: Vercel dashboard → Storage → Blob → create a store → copy the
   `BLOB_READ_WRITE_TOKEN`.
3. `cp .env.example .env` (in the repo root) and fill in both values. `.env` is gitignored.
4. Dependencies are already installed (`@google/genai`, `@vercel/blob`, `ffmpeg-static`).

## Run

```bash
# Free: generate + print one script, no TTS, no upload (sanity-check voice/prompt)
npm run podcast -- --only credit-health --dry-run

# One real episode (uses the paid API): makes the MP3, uploads, writes frontmatter
npm run podcast -- --only credit-health

# A whole niche or category at once
npm run podcast -- --only self-employed
npm run podcast -- --only mortgage-process

# Everything (resumable: already-done lessons are skipped via manifest.json)
npm run podcast

# Re-do something already generated
npm run podcast -- --only credit-health --force
```

Flags: `--dry-run`, `--only <id|niche|phase|category>`, `--limit <n>`, `--force`.

## How it works (per lesson)

1. Read the `.mdx`, strip JSX/markdown to plain text (`lib/content.mjs`).
2. Gemini writes a 2-host script as strict JSON `[{speaker, text}]` (`lib/gemini.mjs`).
3. Multi-speaker TTS → base64 PCM (s16le, 24 kHz, mono), chunked + concatenated if long (`lib/tts.mjs`).
4. PCM → MP3 via bundled ffmpeg; duration computed from PCM length (`lib/audio.mjs`).
5. Upload to Vercel Blob at `audio/<id>.mp3` → public URL (`lib/blob.mjs`).
6. Write `audio: { src, durationSec }` + `estListenMin` into the lesson's frontmatter; record in
   `manifest.json` for resume (`lib/content.mjs`, `generate.mjs`).

The app shows the inline player on every lesson with audio, and the Podcasts tab lists all of them.

## Notes

- **Cost is real** (TTS is priced by audio length). Run one episode first, then batch.
- **Model ids** are env-overridable (`PODCAST_TTS_MODEL`, `PODCAST_TEXT_MODEL`). If a newer TTS model
  is available, set it in `.env`; defaults target the verified `gemini-2.5-*-tts` line. Confirm current
  ids at https://ai.google.dev/gemini-api/docs/speech-generation.
- MP3s are **not** committed to git; only the Blob URLs land in frontmatter.
- After a batch, run `npm run build` and `npm run test`, then commit the frontmatter changes.
