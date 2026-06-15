import { ArrowLeft } from 'lucide-react';
import { ThemedLink } from '@/lib/navigation';
import { useScope } from '@/lib/scope';
import { ContentCard } from './ContentCard';
import type { ContentEntry } from '@/content/schema';

/** Shared layout for every browse/collection page (journey, track, type). */
export function CollectionList({
  title,
  eyebrow,
  description,
  entries,
  from,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  entries: ContentEntry[];
  from: string;
}) {
  const scope = useScope();
  return (
    <div className="stagger space-y-6 pt-2">
      <div>
        {/* No escape to the master hub when embedded as a scoped experience. */}
        {!scope && (
          <ThemedLink
            to="/"
            className="inline-flex items-center gap-1 pt-3 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" /> All topics
          </ThemedLink>
        )}

        <header className={scope ? 'pt-3' : 'mt-4'}>
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
          )}
          <h1 className="mt-1 text-balance font-display text-[1.75rem] font-semibold leading-tight">
            {title}
          </h1>
          {description && <p className="mt-2 text-pretty text-muted-foreground">{description}</p>}
          <p className="mt-3 text-xs text-muted-foreground">
            {entries.length} {entries.length === 1 ? 'lesson' : 'lessons'}
          </p>
        </header>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No content here yet. Check back soon.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {entries.map((e) => (
            <ContentCard key={e.id} entry={e} from={from} />
          ))}
        </div>
      )}
    </div>
  );
}
