import { useMemo, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ContentCard } from '@/components/content/ContentCard';
import { search } from '@/search';
import { getById } from '@/content/registry';

export function SearchPage() {
  const [q, setQ] = useState('');
  const results = useMemo(() => search(q).map(getById).filter(Boolean), [q]);

  return (
    <div className="space-y-5 pt-2">
      <header className="pt-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Find anything</p>
        <h1 className="mt-1 font-display text-[1.75rem] font-semibold tracking-tight">Search</h1>
      </header>

      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-primary" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search guides & podcasts…"
          className="rounded-xl pl-10"
          autoFocus
        />
      </div>

      {q.trim() === '' ? (
        <div className="grid place-items-center gap-3 py-14 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <SearchIcon className="size-6" strokeWidth={1.75} />
          </span>
          <p className="max-w-[15rem] text-sm text-muted-foreground">
            Search across every guide and podcast in the library.
          </p>
        </div>
      ) : results.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No results for “{q}”.</p>
      ) : (
        <div className="stagger grid gap-3 sm:grid-cols-2">
          {results.map((e) => (
            <ContentCard key={e!.id} entry={e!} from="search" />
          ))}
        </div>
      )}
    </div>
  );
}
