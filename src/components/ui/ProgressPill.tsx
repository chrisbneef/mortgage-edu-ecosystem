import { cn } from '@/lib/utils';

/** Thin progress pill echoing the hosts' "Loan Progress" bar. value 0..1. */
export function ProgressPill({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-primary/12', className)}>
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
