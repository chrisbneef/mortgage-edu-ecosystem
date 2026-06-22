import { Compass, Headphones, BookMarked, Search, Home } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { ThemedLink } from '@/lib/navigation';
import { useScope } from '@/lib/scope';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const scope = useScope();

  // When embedded as a scoped category, the Home tab roots in that category instead
  // of the master hub; utility tabs (Podcasts/Glossary/Search) stay global.
  const home = scope
    ? {
        to: scope.rootPath,
        label: 'Home',
        Icon: Home,
        match: (p: string) => p === scope.rootPath || p.startsWith('/g/'),
      }
    : {
        to: '/',
        label: 'Learn',
        Icon: Compass,
        match: (p: string) =>
          p === '/' ||
          p.startsWith('/phase') ||
          p.startsWith('/niche') ||
          p.startsWith('/journey') ||
          p.startsWith('/track') ||
          p.startsWith('/g/'),
      };

  const tabs = [
    home,
    { to: '/podcasts', label: 'Podcasts', Icon: Headphones, match: (p: string) => p.startsWith('/podcasts') },
    { to: '/glossary', label: 'Glossary', Icon: BookMarked, match: (p: string) => p.startsWith('/glossary') },
    { to: '/search', label: 'Search', Icon: Search, match: (p: string) => p.startsWith('/search') },
  ];

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <main className="flex-1 px-4 pb-28 pt-safe">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/85 pb-safe backdrop-blur-xl"
        aria-label="Primary"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-4 px-2 pt-1.5">
          {tabs.map(({ to, label, Icon, match }) => {
            const active = match(pathname);
            return (
              <ThemedLink
                key={label}
                to={to}
                aria-current={active ? 'page' : undefined}
                className="flex flex-col items-center gap-1 py-1.5"
              >
                <span
                  className={cn(
                    'grid h-8 w-14 place-items-center rounded-full transition-all duration-200',
                    active ? 'bg-primary/12 text-primary' : 'text-muted-foreground',
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                </span>
                <span
                  className={cn(
                    'text-[0.7rem] font-medium transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {label}
                </span>
              </ThemedLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
