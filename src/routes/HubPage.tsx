import { ChevronRight, BookMarked, Headphones, Sparkles } from 'lucide-react';
import { ThemedLink } from '@/lib/navigation';
import { Medallion } from '@/components/ui/Medallion';
import { IconTile } from '@/components/ui/IconTile';
import { ProgressPill } from '@/components/ui/ProgressPill';
import { ContentCard } from '@/components/content/ContentCard';
import { JOURNEY_CATEGORIES, TRACKS } from '@/content/taxonomies';
import { featured, byJourney, published } from '@/content/registry';

export function HubPage() {
  const featuredItems = featured();
  const total = published().length;
  const maxStage = Math.max(1, ...JOURNEY_CATEGORIES.map((c) => byJourney(c.slug).length));

  return (
    <div className="stagger space-y-9 pt-2">
      {/* Hero — medallion echoes the host app's badge; everything tints to the primary. */}
      <header className="flex flex-col items-center pt-4 text-center">
        <Medallion segments={JOURNEY_CATEGORIES.length}>
          <span className="font-display text-3xl font-semibold leading-none text-foreground">{total}</span>
          <span className="mt-1 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Lessons
          </span>
        </Medallion>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Education</p>
        <h1 className="mt-1.5 text-balance font-display text-[2rem] font-semibold leading-[1.1]">
          Your path home, explained
        </h1>
        <p className="mt-2 max-w-xs text-pretty text-muted-foreground">
          Plain-English guides and podcasts — from first thoughts to keys in hand.
        </p>
      </header>

      {/* Find your path — loan-type tracks (horizontal snap, like the host's tiles) */}
      <section>
        <SectionHeading title="Find your path" />
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TRACKS.map((t) => (
            <ThemedLink
              key={t.slug}
              to={`/track/${t.slug}`}
              className="group w-[10.5rem] shrink-0 snap-start rounded-2xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover active:scale-[0.98]"
            >
              <span className="font-display text-lg font-semibold leading-snug">{t.label}</span>
              <span className="mt-1.5 block text-xs leading-snug text-muted-foreground">{t.blurb}</span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Explore <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </ThemedLink>
          ))}
        </div>
      </section>

      {/* Browse by stage — 5 journey categories with content-volume pills */}
      <section>
        <SectionHeading title="Browse by stage" />
        <div className="space-y-2.5">
          {JOURNEY_CATEGORIES.map((c, i) => {
            const count = byJourney(c.slug).length;
            return (
              <ThemedLink
                key={c.slug}
                to={`/journey/${c.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover active:scale-[0.99]"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-medium">{c.label}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{count}</span>
                  </span>
                  <ProgressPill value={count / maxStage} className="mt-2" />
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </ThemedLink>
            );
          })}
        </div>
      </section>

      {/* Quick actions — mirrors the host's 2-up action tiles */}
      <section className="grid grid-cols-2 gap-3">
        <IconTile to="/podcasts" Icon={Headphones} label="Podcasts" sublabel="Listen on the go" />
        <IconTile to="/glossary" Icon={BookMarked} label="Glossary" sublabel="Jargon, decoded" />
      </section>

      {featuredItems.length > 0 && (
        <section>
          <SectionHeading title="Featured" icon />
          <div className="grid gap-3 sm:grid-cols-2">
            {featuredItems.map((e) => (
              <ContentCard key={e.id} entry={e} from="featured" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeading({ title, icon }: { title: string; icon?: boolean }) {
  return (
    <h2 className="mb-3 flex items-center gap-1.5 font-display text-lg font-semibold">
      {icon && <Sparkles className="size-4 text-primary" />}
      {title}
    </h2>
  );
}
