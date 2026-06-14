import { build } from 'esbuild';
import path from 'node:path';
import type { Plugin } from 'vite';

/**
 * Bundles src/theme/bootstrap-entry.ts into a minified IIFE and injects it as an
 * inline <script> in <head>, so the URL-param theme is applied before first paint
 * (no FOUC). The bootstrap shares engine.ts with the React side — single source of
 * truth, generated here so the two can never drift.
 */
export function themeBootstrap(): Plugin {
  const entry = path.resolve(process.cwd(), 'src/theme/bootstrap-entry.ts');

  async function compile(): Promise<string> {
    const result = await build({
      entryPoints: [entry],
      bundle: true,
      format: 'iife',
      minify: true,
      platform: 'browser',
      target: 'es2020',
      write: false,
    });
    return result.outputFiles[0].text;
  }

  return {
    name: 'pam-theme-bootstrap',
    async transformIndexHtml(html) {
      const code = await compile();
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: { type: 'module' },
            children: code,
            injectTo: 'head-prepend',
          },
        ],
      };
    },
  };
}
