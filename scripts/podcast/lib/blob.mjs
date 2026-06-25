import { createHash } from 'node:crypto';
import { put } from '@vercel/blob';
import { BLOB_PREFIX } from '../config.mjs';

/**
 * Upload an MP3 to Vercel Blob and return its public URL. The filename embeds a short
 * content hash (`<id>-<hash>.mp3`), so regenerating an episode with new audio (e.g. a new
 * voice) produces a NEW url that side-steps the long Blob cache, while an unchanged re-run
 * lands on the same url. Blob serves files with a 30-day cache, so a stable-on-overwrite
 * name would otherwise keep serving stale audio.
 */
export async function uploadMp3(id, mp3) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error('Set BLOB_READ_WRITE_TOKEN in .env (Vercel Blob store token)');
  const hash = createHash('sha256').update(mp3).digest('hex').slice(0, 8);
  const result = await put(`${BLOB_PREFIX}/${id}-${hash}.mp3`, mp3, {
    access: 'public',
    contentType: 'audio/mpeg',
    token,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return result.url;
}
