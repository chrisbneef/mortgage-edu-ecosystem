import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import path from 'node:path';
import { themeBootstrap } from './vite-plugin-theme-bootstrap';
import { mdxMeta } from './vite-plugin-mdx-meta';

export default defineConfig({
  // Relative base so the static build works in a WebView regardless of host path.
  base: './',
  plugins: [
    mdxMeta(),
    {
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkFrontmatter, [remarkMdxFrontmatter, { name: 'frontmatter' }], remarkGfm],
        rehypePlugins: [rehypeSlug],
      }),
    },
    react(),
    themeBootstrap(),
  ],
  resolve: {
    alias: { '@': path.resolve(process.cwd(), 'src') },
  },
});
