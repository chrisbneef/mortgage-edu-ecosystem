import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Medallion } from '@/components/ui/Medallion';
import { ContentCard } from '@/components/content/ContentCard';
import { byNiche } from '@/content/registry';
import { NICHES, NICHE_SLUGS, type NicheSlug } from '@/content/taxonomies';
import { SCOPE_PARAM_KEY } from '@/lib/scope';
import { NotFound } from './NotFound';

/**
 * A borrower-audience niche as a STANDALONE, embeddable widget. Like the phase pages,
 * it self-roots: if it isn't already scoped to itself, we add scope=niche:<slug> so the
 * page becomes the root, with no link back to the master hub and the Home tab pointing
 * here. The native app just opens /#/niche/<slug> to drop in a fully contained widget.
 */
export function NichePage() {
  const { niche } = useParams();
  const [params] = useSearchParams();

  if (!niche || !(NICHE_SLUGS as string[]).includes(niche)) return <NotFound />;
  const slug = niche as NicheSlug;

  if (params.get(SCOPE_PARAM_KEY) !== `niche:${slug}`) {
    const next = new URLSearchParams(params);
    next.set(SCOPE_PARAM_KEY, `niche:${slug}`);
    return <Navigate to={`/niche/${slug}?${next.toString()}`} replace />;
  }

  const meta = NICHES.find((n) => n.slug === slug)!;
  const lessons = byNiche(slug);

  return (
    <div className="stagger space-y-7 pt-2">
      <header className="flex flex-col items-center pt-2 text-center">
        <Medallion segments={Math.max(lessons.length, 1)} size={104} stroke={6}>
          <span className="font-display text-2xl font-semibold leading-none">{lessons.length}</span>
          <span className="mt-0.5 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {lessons.length === 1 ? 'Article' : 'Articles'}
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
          Articles for this guide are on the way.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {lessons.map((e) => (
            <ContentCard key={e.id} entry={e} from={`niche:${slug}`} />
          ))}
        </div>
      )}
    </div>
  );
}
