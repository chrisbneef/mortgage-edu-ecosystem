import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Medallion } from '@/components/ui/Medallion';
import { ContentCard } from '@/components/content/ContentCard';
import { byPhase } from '@/content/registry';
import { PHASES, PHASE_SLUGS, type PhaseSlug } from '@/content/taxonomies';
import { SCOPE_PARAM_KEY } from '@/lib/scope';
import { NotFound } from './NotFound';

/**
 * A single customer-lifecycle phase as a STANDALONE, embeddable page. It self-roots:
 * if it isn't already scoped to itself, we add scope=phase:<slug> so this page is the
 * root — no link back to the master hub, the Home tab points here, and everything
 * navigated from here (lessons, utility tabs) stays inside the phase. The native app
 * can simply open /#/phase/<slug> and get a fully contained experience.
 */
export function PhasePage() {
  const { phase } = useParams();
  const [params] = useSearchParams();

  if (!phase || !(PHASE_SLUGS as string[]).includes(phase)) return <NotFound />;
  const slug = phase as PhaseSlug;

  // Self-root: ensure the sticky scope param is set so the whole session stays contained.
  if (params.get(SCOPE_PARAM_KEY) !== `phase:${slug}`) {
    const next = new URLSearchParams(params);
    next.set(SCOPE_PARAM_KEY, `phase:${slug}`);
    return <Navigate to={`/phase/${slug}?${next.toString()}`} replace />;
  }

  const meta = PHASES.find((p) => p.slug === slug)!;
  const lessons = byPhase(slug);

  return (
    <div className="stagger space-y-7 pt-2">
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
