import { useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ThemedLink } from '@/lib/navigation';
import { useScope } from '@/lib/scope';
import { Medallion } from '@/components/ui/Medallion';
import { ContentCard } from '@/components/content/ContentCard';
import { byPhase } from '@/content/registry';
import { PHASES, PHASE_SLUGS, type PhaseSlug } from '@/content/taxonomies';
import { NotFound } from './NotFound';

/**
 * A single customer-lifecycle phase as a self-contained, embeddable mini-hub.
 * Reachable from the master hub (with a "← All topics" escape) or embedded standalone
 * via scope=phase:<slug> (this page is the root; no escape; Home tab points here).
 */
export function PhasePage() {
  const { phase } = useParams();
  const scope = useScope();

  if (!phase || !(PHASE_SLUGS as string[]).includes(phase)) return <NotFound />;
  const slug = phase as PhaseSlug;
  const meta = PHASES.find((p) => p.slug === slug)!;
  const lessons = byPhase(slug);

  const isRoot = scope?.kind === 'phase' && scope.slug === slug;

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
          <span className="font-display text-2xl font-semibold leading-none">{meta.order}</span>
          <span className="mt-0.5 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Phase
          </span>
        </Medallion>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{meta.tagline}</p>
        <h1 className="mt-1.5 text-balance font-display text-[1.95rem] font-semibold leading-[1.1]">
          {meta.label}
        </h1>
        <p className="mt-2.5 max-w-md text-pretty text-muted-foreground">{meta.description}</p>
      </header>

      {lessons.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Content for this phase is on the way.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {lessons.map((e) => (
            <ContentCard key={e.id} entry={e} from={`phase:${slug}`} />
          ))}
        </div>
      )}
    </div>
  );
}
