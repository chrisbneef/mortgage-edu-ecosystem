import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { CONTENT_DIR } from '../config.mjs';

/** Recursively list every .mdx lesson under the content dir. */
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (p.endsWith('.mdx')) out.push(p);
  }
  return out;
}

/** Turn an MDX body into clean spoken-ready plain text (no JSX, no markdown syntax). */
export function toPlainText(body) {
  return body
    .replace(/^import .*$/gm, '') // import lines
    .replace(/<[^>]+>/g, '') // JSX/HTML tags (keeps inner text of <GlossaryTerm>…</GlossaryTerm>)
    .replace(/^#{1,6}\s+/gm, '') // markdown headings -> plain
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1') // italic
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links -> text
    .replace(/^\s*[-*]\s+/gm, '') // list bullets
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Discover all lessons with parsed frontmatter + cleaned text. */
export function discoverLessons() {
  return walk(CONTENT_DIR)
    .map((file) => {
      const raw = fs.readFileSync(file, 'utf8');
      const { data, content } = matter(raw);
      return {
        file,
        id: data.id,
        title: data.title,
        summary: data.summary,
        niches: data.niches || [],
        phases: data.phases || [],
        journeyCategory: data.journeyCategory,
        hasAudio: Boolean(data.audio && data.audio.src),
        text: toPlainText(content),
      };
    })
    .filter((l) => l.id && l.text)
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** Write the audio block + estListenMin back into a lesson's frontmatter, body preserved. */
export function writeAudioFrontmatter(file, { src, durationSec }) {
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = matter(raw);
  parsed.data.audio = { src, durationSec };
  parsed.data.estListenMin = Math.max(1, Math.round(durationSec / 60));
  const next = matter.stringify(parsed.content, parsed.data);
  fs.writeFileSync(file, next);
}
