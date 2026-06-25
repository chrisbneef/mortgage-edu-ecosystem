import { BookOpen, Headphones, ArrowUpRight, Clock } from 'lucide-react';
import { ThemedLink } from '@/lib/navigation';
import { formatMinutes } from '@/lib/utils';
import { journeyLabel } from '@/content/taxonomies';
import type { ContentEntry } from '@/content/schema';

/** Editorial card linking into the canonical /g/:id, carrying a `from` browse context. */
export function ContentCard({ entry, from }: { entry: ContentEntry; from?: string }) {
  const isPodcast = entry.contentType === 'podcast';
  const Icon = isPodcast ? Headphones : BookOpen;
  const minutes = isPodcast ? entry.estListenMin : entry.estReadMin;
  const to = from ? `/g/${entry.id}?from=${encodeURIComponent(from)}` : `/g/${entry.id}`;

  return (
    <ThemedLink
      to={to}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover active:scale-[0.99]"
    >
      {/* themed accent edge */}
      <span className="absolute inset-x-0 top-0 h-0.5 scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-primary">
          <Icon className="size-3.5" strokeWidth={2} />
          {isPodcast ? 'Podcast' : 'Guide'}
        </span>
        <div className="flex items-center gap-2">
          {entry.audio?.src && !isPodcast && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium text-primary"
              title="Audio overview available"
            >
              <Headphones className="size-3" /> Listen
            </span>
          )}
          <ArrowUpRight className="size-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
      </div>

      <h3 className="mt-2 font-display text-lg font-semibold leading-snug">{entry.title}</h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted-foreground">{entry.summary}</p>

      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span>{journeyLabel(entry.journeyCategory)}</span>
        {minutes ? (
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" /> {formatMinutes(minutes)}
          </span>
        ) : null}
      </div>
    </ThemedLink>
  );
}
