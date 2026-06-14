import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Horizontal snap carousel with explicit affordances so users know there's more to
 * the side: prev/next arrows in the header + a scroll-position indicator bar below.
 * Both auto-hide when the content fits with no overflow. Everything tints to primary.
 */
export function Carousel({
  title,
  icon,
  children,
}: {
  title?: string;
  icon?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState({ left: false, right: false, thumbW: 100, thumbX: 0, overflow: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const max = scrollWidth - clientWidth;
    const overflow = max > 4;
    const thumbW = overflow ? Math.max((clientWidth / scrollWidth) * 100, 14) : 100;
    const thumbX = overflow && max > 0 ? (scrollLeft / max) * (100 - thumbW) : 0;
    setS({ left: scrollLeft > 4, right: scrollLeft < max - 4, thumbW, thumbX, overflow });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [update]);

  const nudge = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.75, behavior: 'smooth' });
  };

  return (
    <section>
      {(title || s.overflow) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && (
            <h2 className="flex items-center gap-1.5 font-display text-lg font-semibold">
              {icon && <Sparkles className="size-4 text-primary" />}
              {title}
            </h2>
          )}
          {s.overflow && (
            <div className="flex items-center gap-2">
              <Arrow dir="left" disabled={!s.left} onClick={() => nudge(-1)} />
              <Arrow dir="right" disabled={!s.right} onClick={() => nudge(1)} />
            </div>
          )}
        </div>
      )}

      <div
        ref={ref}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {s.overflow && (
        <div className="mx-auto mt-3 h-1 w-24 overflow-hidden rounded-full bg-primary/12">
          <div
            className="h-full rounded-full bg-primary/70"
            style={{ width: `${s.thumbW}%`, marginLeft: `${s.thumbX}%` }}
          />
        </div>
      )}
    </section>
  );
}

function Arrow({ dir, disabled, onClick }: { dir: 'left' | 'right'; disabled: boolean; onClick: () => void }) {
  const Icon = dir === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'left' ? 'Scroll left' : 'Scroll right'}
      className={cn(
        'grid size-8 place-items-center rounded-full border border-border bg-card text-foreground shadow-card transition-all',
        'hover:border-primary/40 hover:text-primary active:scale-95',
        'disabled:cursor-default disabled:opacity-30 disabled:shadow-none disabled:hover:border-border disabled:hover:text-foreground',
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
