import fs from 'node:fs';
import matter from 'gray-matter';
import type { Plugin } from 'vite';

/**
 * Serves ONLY the frontmatter of an .mdx file when imported with `?meta`. This lets
 * registry.ts eager-load frontmatter (tiny index) while the MDX bodies stay
 * code-split (lazy), with no eager/lazy module conflict.
 *
 *   import.meta.glob('./items/**\/*.mdx', { eager: true, query: '?meta', import: 'default' })
 *
 * We resolve `<file>.mdx?meta` to a VIRTUAL id that is \0-prefixed AND does not end in
 * `.mdx`, so the @mdx-js plugin — which matches by extension and ignores the query —
 * never processes it.
 */
const PREFIX = '\0mdx-meta:';

export function mdxMeta(): Plugin {
  return {
    name: 'pam-mdx-meta',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (!source.includes('.mdx?meta')) return null;
      const clean = source.replace(/\?meta$/, '');
      const resolved = await this.resolve(clean, importer, { skipSelf: true });
      const absMdx = resolved?.id.split('?')[0];
      if (!absMdx) return null;
      // Strip the .mdx extension from the visible id so no extension-based plugin matches it.
      return PREFIX + absMdx.replace(/\.mdx$/, '');
    },
    load(id) {
      if (!id.startsWith(PREFIX)) return null;
      const file = id.slice(PREFIX.length) + '.mdx';
      const { data } = matter(fs.readFileSync(file, 'utf-8'));
      return `export default ${JSON.stringify(data)};`;
    },
  };
}
