import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import ffmpegPath from 'ffmpeg-static';
import { SAMPLE_RATE, CHANNELS, BYTES_PER_SAMPLE } from '../config.mjs';

/** Seconds of audio in a raw PCM buffer. */
export function pcmDurationSec(pcm) {
  return pcm.length / (SAMPLE_RATE * CHANNELS * BYTES_PER_SAMPLE);
}

/** Encode raw PCM (s16le/24k/mono) to an MP3 buffer via the bundled ffmpeg binary. */
export function pcmToMp3(pcm) {
  return new Promise((resolve, reject) => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pod-'));
    const inPath = path.join(tmp, 'in.pcm');
    const outPath = path.join(tmp, 'out.mp3');
    fs.writeFileSync(inPath, pcm);

    const args = [
      '-y',
      '-f', 's16le',
      '-ar', String(SAMPLE_RATE),
      '-ac', String(CHANNELS),
      '-i', inPath,
      '-b:a', '96k',
      outPath,
    ];
    const proc = spawn(ffmpegPath, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', (d) => (stderr += d));
    proc.on('error', reject);
    proc.on('close', (code) => {
      try {
        if (code !== 0) return reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-400)}`));
        const mp3 = fs.readFileSync(outPath);
        resolve(mp3);
      } catch (e) {
        reject(e);
      } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
      }
    });
  });
}
