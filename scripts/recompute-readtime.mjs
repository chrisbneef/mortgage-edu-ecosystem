/**
 * Recompute estReadMin from the actual body word count for every lesson.
 *   node scripts/recompute-readtime.mjs
 * Uses a targeted line edit (not a gray-matter re-stringify) so the frontmatter
 * formatting stays clean. ~225 words/minute. Leaves podcast estListenMin alone.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { toPlainText } from './podcast/lib/content.mjs';

const WPM = 225;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : p.endsWith('.mdx') ? [p] : [];
  });
}

let changed = 0;
for (const file of walk('src/content/items')) {
  const raw = fs.readFileSync(file, 'utf8');
  const { content } = matter(raw);
  const words = toPlainText(content).split(/\s+/).filter(Boolean).length;
  const min = Math.max(1, Math.round(words / WPM));
  if (/^estReadMin:\s*\d+/m.test(raw)) {
    const next = raw.replace(/^estReadMin:\s*\d+/m, `estReadMin: ${min}`);
    if (next !== raw) {
      fs.writeFileSync(file, next);
      changed++;
    }
  }
}
console.log(`Recomputed estReadMin in ${changed} file(s).`);
