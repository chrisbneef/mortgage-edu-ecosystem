import type { ComponentType } from 'react';
import { ContentFrontmatterSchema, type ContentEntry } from './schema';
import {
  JOURNEY_SLUGS,
  TRACK_SLUGS,
  PHASE_SLUGS,
  NICHE_SLUGS,
  type JourneyCategorySlug,
  type TrackSlug,
  type PhaseSlug,
  type NicheSlug,
} from './taxonomies';

/**
 * Builds a typed in-memory index from MDX frontmatter.
 *  - frontmatter is loaded EAGERLY (tiny) so every browse view can filter/sort instantly
 *  - MDX bodies are loaded LAZILY (code-split per file) so the initial WebView bundle stays small
 */

type MdxModule = { default: ComponentType };

// Eager-load ONLY frontmatter (via the ?meta plugin, a distinct module id) so the MDX
// component bodies stay code-split (lazy) with no eager/lazy conflict.
const eagerFrontmatter = import.meta.glob<unknown>('./items/**/*.mdx', {
  eager: true,
  query: '?meta',
  import: 'default',
});
const lazy = import.meta.glob<MdxModule>('./items/**/*.mdx');

function buildIndex(): ContentEntry[] {
  const entries: ContentEntry[] = [];
  const seen = new Set<string>();

  for (const [path, frontmatter] of Object.entries(eagerFrontmatter)) {
    const parsed = ContentFrontmatterSchema.safeParse(frontmatter);
    if (!parsed.success) {
      // Fail loudly in dev; skip the broken file in prod so one bad file can't blank the app.
      console.error(`[content] Invalid frontmatter in ${path}:\n`, parsed.error.flatten().fieldErrors);
      if (import.meta.env.DEV) throw new Error(`Invalid content frontmatter: ${path}`);
      continue;
    }
    const fm = parsed.data;
    if (seen.has(fm.id)) throw new Error(`[content] Duplicate id "${fm.id}" (${path})`);
    seen.add(fm.id);

    const loader = lazy[path];
    entries.push({ ...fm, load: () => loader() as Promise<{ default: ComponentType }> });
  }
  return entries.filter((e) => e.status !== 'archived');
}

export const ALL_CONTENT: ContentEntry[] = buildIndex();

const BY_ID = new Map(ALL_CONTENT.map((e) => [e.id, e]));

export function getById(id: string): ContentEntry | undefined {
  return BY_ID.get(id);
}

export function published(entries = ALL_CONTENT): ContentEntry[] {
  return entries.filter((e) => e.status === 'published');
}

export function byJourney(category: JourneyCategorySlug): ContentEntry[] {
  return published()
    .filter((e) => e.journeyCategory === category)
    .sort((a, b) => a.journeyOrder - b.journeyOrder);
}

export function byTrack(track: TrackSlug): ContentEntry[] {
  return published()
    .filter((e) => e.tracks.includes(track))
    .sort((a, b) => a.journeyOrder - b.journeyOrder);
}

export function byType(contentType: 'guide' | 'podcast'): ContentEntry[] {
  return published().filter((e) => e.contentType === contentType);
}

/** Fallback mapping when a lesson has no explicit `phases` — derived from its category. */
const JOURNEY_TO_PHASES: Record<string, PhaseSlug[]> = {
  preparation: ['dream', 'pre-approved'],
  'mortgage-process': ['pre-approved'],
  'property-search': ['dream', 'pre-approved'],
  'closing-beyond': ['under-contract', 'post-closing'],
  'tools-resources': ['dream', 'pre-approved', 'under-contract', 'post-closing'],
};

/** The lifecycle phases a lesson belongs to — explicit if tagged, else derived from category. */
export function effectivePhases(e: ContentEntry): PhaseSlug[] {
  return e.phases.length ? (e.phases as PhaseSlug[]) : JOURNEY_TO_PHASES[e.journeyCategory] ?? [];
}

export function byPhase(phase: PhaseSlug): ContentEntry[] {
  return published()
    .filter((e) => effectivePhases(e).includes(phase))
    .sort((a, b) => a.journeyOrder - b.journeyOrder);
}

export function byNiche(niche: NicheSlug): ContentEntry[] {
  return published()
    .filter((e) => e.niches.includes(niche))
    .sort((a, b) => a.journeyOrder - b.journeyOrder);
}

export function featured(): ContentEntry[] {
  return published().filter((e) => e.featured);
}

/** Ordered neighbours within a browse context (niche, phase, track, or journey). */
export function neighbours(
  entry: ContentEntry,
  from?: { kind: 'track' | 'journey' | 'phase' | 'niche'; slug: string },
): { prev?: ContentEntry; next?: ContentEntry } {
  let list: ContentEntry[];
  if (from?.kind === 'track' && (TRACK_SLUGS as string[]).includes(from.slug)) {
    list = byTrack(from.slug as TrackSlug);
  } else if (from?.kind === 'journey' && (JOURNEY_SLUGS as string[]).includes(from.slug)) {
    list = byJourney(from.slug as JourneyCategorySlug);
  } else if (from?.kind === 'phase' && (PHASE_SLUGS as string[]).includes(from.slug)) {
    list = byPhase(from.slug as PhaseSlug);
  } else if (from?.kind === 'niche' && (NICHE_SLUGS as string[]).includes(from.slug)) {
    list = byNiche(from.slug as NicheSlug);
  } else {
    list = byJourney(entry.journeyCategory as JourneyCategorySlug);
  }
  const i = list.findIndex((e) => e.id === entry.id);
  if (i === -1) return {};
  return { prev: list[i - 1], next: list[i + 1] };
}
