import type { LucideIcon } from 'lucide-react';
import { ThemedLink } from '@/lib/navigation';
import { cn } from '@/lib/utils';

/**
 * Tappable icon tile mirroring the host apps' 2-up action tiles (outline icon on top,
 * label below, thin border, soft shadow, tactile press). Primary-tinted icon chip.
 */
export function IconTile({
  to,
  Icon,
  label,
  sublabel,
  className,
}: {
  to: string;
  Icon: LucideIcon;
  label: string;
  sublabel?: string;
  className?: string;
}) {
  return (
    <ThemedLink
      to={to}
      className={cn(
        'group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card',
        'transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover active:scale-[0.98]',
        className,
      )}
    >
      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <span className="leading-tight">
        <span className="block font-medium">{label}</span>
        {sublabel && <span className="mt-0.5 block text-xs text-muted-foreground">{sublabel}</span>}
      </span>
    </ThemedLink>
  );
}
