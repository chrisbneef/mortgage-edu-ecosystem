import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { ThemedLink } from '@/lib/navigation';
import { Input } from '@/components/ui/input';
import { GLOSSARY, getTerm, searchGlossary } from '@/content/glossary';
import { getById } from '@/content/registry';
import { NotFound } from './NotFound';

export function GlossaryIndexPage() {
  const [q, setQ] = useState('');
  const results = useMemo(() => searchGlossary(q), [q]);

  return (
    <div className="space-y-5 pt-2">
      <header className="pt-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Reference</p>
        <h1 className="mt-1 font-display text-[1.75rem] font-semibold tracking-tight">Glossary</h1>
        <p className="mt-1.5 text-muted-foreground">Plain-English definitions for industry jargon.</p>
      </header>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-primary" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search terms…"
          className="rounded-xl pl-10"
          autoFocus
        />
      </div>

      <div className="stagger space-y-2.5">
        {results.map((g) => (
          <ThemedLink
            key={g.slug}
            to={`/glossary/${g.slug}`}
            className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover active:scale-[0.99]"
          >
            <span className="mt-0.5 font-display text-sm font-bold text-primary">
              {g.term.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block font-display font-semibold">{g.term}</span>
              <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{g.definition}</span>
            </span>
          </ThemedLink>
        ))}
        {results.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No matching terms.</p>
        )}
      </div>
    </div>
  );
}

export function GlossaryTermPage() {
  const { term } = useParams();
  const entry = term ? getTerm(term) : undefined;
  if (!entry) return <NotFound />;
  const guide = entry.definedIn ? getById(entry.definedIn) : undefined;

  return (
    <div className="space-y-5 pt-2">
      <ThemedLink
        to="/glossary"
        className="inline-flex items-center gap-1 pt-3 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Glossary
      </ThemedLink>
      <header>
        <h1 className="font-display text-[2.25rem] font-semibold tracking-tight">{entry.term}</h1>
        <div className="mt-3 h-px w-16 bg-primary" />
      </header>
      <p className="text-pretty text-lg leading-relaxed text-foreground/90">{entry.definition}</p>
      {guide && (
        <ThemedLink
          to={`/g/${guide.id}`}
          className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
        >
          <span>
            <span className="block text-xs uppercase tracking-wide text-muted-foreground">Learn more</span>
            <span className="mt-0.5 block font-display font-semibold text-primary">{guide.title}</span>
          </span>
          <ArrowLeft className="size-4 rotate-180 text-primary transition-transform group-hover:translate-x-0.5" />
        </ThemedLink>
      )}
      <p className="text-xs text-muted-foreground">{GLOSSARY.length} terms in the glossary.</p>
    </div>
  );
}
