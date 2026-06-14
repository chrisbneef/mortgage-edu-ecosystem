import MiniSearch from 'minisearch';
import { ALL_CONTENT, published } from '@/content/registry';

/** Client-side full-text search over the content registry. Built once, memoized. */
let mini: MiniSearch | null = null;

function index(): MiniSearch {
  if (mini) return mini;
  mini = new MiniSearch({
    fields: ['title', 'summary', 'tags', 'glossaryTerms'],
    storeFields: ['id'],
    searchOptions: { boost: { title: 3, glossaryTerms: 2 }, prefix: true, fuzzy: 0.2 },
  });
  mini.addAll(
    published(ALL_CONTENT).map((e) => ({
      id: e.id,
      title: e.title,
      summary: e.summary,
      tags: e.tags.join(' '),
      glossaryTerms: e.glossaryTerms.join(' '),
    })),
  );
  return mini;
}

export function search(query: string): string[] {
  const q = query.trim();
  if (!q) return [];
  return index()
    .search(q)
    .map((r) => r.id as string);
}
