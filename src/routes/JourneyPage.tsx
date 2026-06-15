import { useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ThemedLink } from '@/lib/navigation';
import { useScope } from '@/lib/scope';
import { Medallion } from '@/components/ui/Medallion';
import { ContentCard } from '@/components/content/ContentCard';
import { byJourney } from '@/content/registry';
import { JOURNEY_CATEGORIES, JOURNEY_SLUGS, type JourneyCategorySlug } from '@/content/taxonomies';
import { NotFound } from './NotFound';

/**
 * A single homebuyer-journey category as a self-contained mini-hub. Reachable two ways:
 *  - from the master hub (unscoped) — shows a "← All topics" escape back to master
 *  - embedded standalone (scope=<category>) — this page IS the root; no escape shown,
 *    and the bottom Home tab points here (see AppShell).
 */
export function JourneyPage() {
  const { category } = useParams();
  const scope = useScope();

  if (!category || !(JOURNEY_SLUGS as string[]).includes(category)) return <NotFound />;
  const slug = category as JourneyCategorySlug;
  const meta = JOURNEY_CATEGORIES.find((c) => c.slug === slug)!;
  const lessons = byJourney(slug);

  // Hide the master-hub escape when this category is the embedded root.
  const isRoot = scope?.kind === 'journey' && scope.slug === slug;

  return (
    <div className="stagger space-y-7 pt-2">
      {!isRoot && (
        <ThemedLink
          to="/"
          className="inline-flex items-center gap-1 pt-3 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" /> All topics
        </ThemedLink>
      )}

      <header className="flex flex-col items-center pt-2 text-center">
        <Medallion segments={Math.max(lessons.length, 1)} size={104} stroke={6}>
          <span className="font-display text-2xl font-semibold leading-none">{lessons.length}</span>
          <span className="mt-0.5 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {lessons.length === 1 ? 'Lesson' : 'Lessons'}
          </span>
        </Medallion>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Stage {meta.order} of {JOURNEY_CATEGORIES.length}
        </p>
        <h1 className="mt-1.5 text-balance font-display text-[1.85rem] font-semibold leading-[1.1]">
          {meta.label}
        </h1>
      </header>

      {lessons.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No content here yet. Check back soon.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {lessons.map((e) => (
            <ContentCard key={e.id} entry={e} from={`journey:${slug}`} />
          ))}
        </div>
      )}
    </div>
  );
}
