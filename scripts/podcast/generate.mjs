/**
 * Podcast audio generation pipeline.
 *
 *   node --env-file=.env scripts/podcast/generate.mjs [flags]
 *
 * Flags:
 *   --dry-run        generate + print the 2-host script only (no paid TTS, no upload)
 *   --only <q>       only lessons whose id, niche, phase, or category matches <q>
 *   --limit <n>      cap the number of lessons processed
 *   --force          regenerate even if the lesson already has audio / is in the manifest
 *
 * Per lesson: clean text -> Gemini 2-host script -> multi-speaker TTS (PCM) -> MP3 ->
 * Vercel Blob -> write audio.src + durationSec into the lesson's frontmatter.
 */
import fs from 'node:fs';
import { CONCURRENCY, MANIFEST_PATH } from './config.mjs';
import { discoverLessons, writeAudioFrontmatter } from './lib/content.mjs';
import { generateScript } from './lib/gemini.mjs';
import { synthesize } from './lib/tts.mjs';
import { pcmToMp3, pcmDurationSec } from './lib/audio.mjs';
import { uploadMp3 } from './lib/blob.mjs';

function parseArgs(argv) {
  const args = { dryRun: false, only: null, limit: Infinity, force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--force') args.force = true;
    else if (a === '--only') args.only = argv[++i];
    else if (a === '--limit') args.limit = Number(argv[++i]);
  }
  return args;
}

function loadManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch {
    return {};
  }
}
function saveManifest(m) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 2) + '\n');
}

function matchesOnly(lesson, q) {
  if (!q) return true;
  return (
    lesson.id === q ||
    lesson.id.includes(q) ||
    lesson.niches.includes(q) ||
    lesson.phases.includes(q) ||
    lesson.journeyCategory === q
  );
}

/** Run an async fn over items with a fixed concurrency. */
async function pool(items, n, fn) {
  let i = 0;
  const workers = Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifest = loadManifest();

  let lessons = discoverLessons().filter((l) => matchesOnly(l, args.only));
  if (!args.force) lessons = lessons.filter((l) => !l.hasAudio && !manifest[l.id]);
  lessons = lessons.slice(0, args.limit);

  console.log(`${lessons.length} lesson(s) to process${args.dryRun ? ' (dry run)' : ''}.`);
  if (lessons.length === 0) return;

  let done = 0;
  let failed = 0;

  await pool(lessons, args.dryRun ? 1 : CONCURRENCY, async (lesson) => {
    try {
      const script = await generateScript(lesson);

      if (args.dryRun) {
        console.log(`\n=== ${lesson.id} — ${lesson.title} (${script.length} lines) ===`);
        for (const line of script) console.log(`${line.speaker}: ${line.text}`);
        done++;
        return;
      }

      const pcm = await synthesize(script);
      const durationSec = Math.round(pcmDurationSec(pcm));
      const mp3 = await pcmToMp3(pcm);
      const url = await uploadMp3(lesson.id, mp3);
      writeAudioFrontmatter(lesson.file, { src: url, durationSec });

      manifest[lesson.id] = {
        url,
        durationSec,
        lines: script.length,
        bytes: mp3.length,
        at: new Date().toISOString(),
      };
      saveManifest(manifest);
      done++;
      console.log(`✓ ${lesson.id}  ${durationSec}s  ${(mp3.length / 1024).toFixed(0)}KB  ${url}`);
    } catch (err) {
      failed++;
      console.error(`✗ ${lesson.id}: ${err.message}`);
    }
  });

  console.log(`\nDone. ${done} ok, ${failed} failed.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
