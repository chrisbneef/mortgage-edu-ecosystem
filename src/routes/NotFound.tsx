import { ThemedLink } from '@/lib/navigation';
import { Button } from '@/components/ui/button';

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="font-display text-6xl font-semibold text-primary/30">404</span>
      <h1 className="font-display text-2xl font-semibold">Not found</h1>
      <p className="text-muted-foreground">We couldn’t find that page.</p>
      <ThemedLink to="/">
        <Button>Back to Education</Button>
      </ThemedLink>
    </div>
  );
}
