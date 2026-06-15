import { Suspense, lazy, useEffect, useMemo, type ComponentType } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock, BookOpen, Headphones } from 'lucide-react';
import { ThemedLink } from '@/lib/navigation';
import { useScope } from '@/lib/scope';
import { MdxContent } from '@/components/mdx';
import { AudioControls } from '@/components/audio/AudioPlayer';
import { getById, neighbours } from '@/content/registry';
import { journeyLabel, trackLabel } from '@/content/taxonomies';
import { formatMinutes } from '@/lib/utils';
import { trackEvent } from '@/native/bridge';
import { NotFound } from './NotFound';

function parseFrom(raw: string | null): { kind: 'track' | 'journey'; slug: string } | undefined {
  if (!raw) return undefined;
  const [kind, slug] = raw.split(':');
  if ((kind === 'track' || kind === 'journey') && slug) return { kind, slug };
  return undefined;
}

export function ContentDetailPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const scope = useScope();
  const entry = id ? getById(id) : undefined;
  // Fall back to the embedded scope so back/next stay in-category even on a direct deep-link.
  const from = parseFrom(params.get('from')) ?? (scope ? { kind: scope.kind, slug: scope.slug } : undefined);

  useEffect(() => {
    if (entry) trackEvent('content_view', { id: entry.id, type: entry.contentType });
  }, [entry]);

  const Body = useMemo<ComponentType | null>(() => {
    if (!entry) return null;
    return lazy(entry.load as () => Promise<{ default: ComponentType }>);
  }, [entry]);

  if (!entry || !Body) return <NotFound />;
  const { prev, next } = neighbours(entry, from);
  const isPodcast = entry.contentType === 'podcast';
  const TypeIcon = isPodcast ? Headphones : BookOpen;
  const minutes = isPodcast ? entry.estListenMin : entry.estReadMin;
  const fromQs = from ? `?from=${from.kind}:${from.slug}` : '';
  const backTo = from ? (from.kind === 'track' ? `/track/${from.slug}` : `/journey/${from.slug}`) : '/';
  const backLabel = from
    ? from.kind === 'track'
      ? trackLabel(from.slug)
      : journeyLabel(from.slug)
    : 'Education';

  return (
    <article className="space-y-6 pt-2">
      <ThemedLink
        to={backTo}
        className="inline-flex items-center gap-1 pt-3 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" /> {backLabel}
      </ThemedLink>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wide text-primary">
            <TypeIcon className="size-3.5" strokeWidth={2} />
            {isPodcast ? 'Podcast' : 'Guide'}
          </span>
          <span className="text-muted-foreground">{journeyLabel(entry.journeyCategory)}</span>
          {minutes ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="size-3" /> {formatMinutes(minutes)}
            </span>
          ) : null}
        </div>
        <h1 className="text-balance font-display text-[2.1rem] font-semibold leading-[1.08]">
          {entry.title}
        </h1>
        <p className="text-pretty text-lg leading-relaxed text-muted-foreground">{entry.summary}</p>
        <div className="h-px w-16 bg-primary" />
      </header>

      {entry.audio && (
        <AudioControls id={entry.id} src={entry.audio.src} durationSec={entry.audio.durationSec} />
      )}

      <div className="prose-content">
        <Suspense fallback={<DetailSkeleton />}>
          <MdxContent>
            <Body />
          </MdxContent>
        </Suspense>
      </div>

      {entry.disclaimer && (
        <p className="rounded-xl bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          {entry.disclaimer}
        </p>
      )}

      {entry.tracks.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Also in</span>
          {entry.tracks.map((t) => (
            <ThemedLink
              key={t}
              to={`/track/${t}`}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium shadow-card transition-colors hover:border-primary/40 hover:text-primary"
            >
              {trackLabel(t)}
              <ArrowUpRight className="size-3" />
            </ThemedLink>
          ))}
        </div>
      )}

      <nav className="grid grid-cols-2 gap-3 border-t border-border pt-5">
        {prev ? (
          <ThemedLink
            to={`/g/${prev.id}${fromQs}`}
            className="group flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
          >
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowLeft className="size-3" /> Previous
            </span>
            <span className="line-clamp-2 text-sm font-medium">{prev.title}</span>
          </ThemedLink>
        ) : (
          <span />
        )}
        {next ? (
          <ThemedLink
            to={`/g/${next.id}${fromQs}`}
            className="group flex flex-col items-end gap-1 rounded-2xl border border-border bg-card p-4 text-right shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
          >
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              Next <ArrowRight className="size-3" />
            </span>
            <span className="line-clamp-2 text-sm font-medium">{next.title}</span>
          </ThemedLink>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-3 py-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-4 animate-pulse rounded bg-muted" style={{ width: `${90 - i * 8}%` }} />
      ))}
    </div>
  );
}
