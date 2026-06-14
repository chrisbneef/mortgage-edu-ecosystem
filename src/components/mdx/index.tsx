import { MDXProvider } from '@mdx-js/react';
import { Info, AlertTriangle, Lightbulb } from 'lucide-react';
import type { ReactNode } from 'react';
import { ThemedLink } from '@/lib/navigation';
import { getTerm } from '@/content/glossary';
import { cn } from '@/lib/utils';

/** Highlighted callout box used inside guides. */
export function Callout({
  type = 'info',
  children,
}: {
  type?: 'info' | 'warning' | 'tip';
  children: ReactNode;
}) {
  const cfg = {
    info: { Icon: Info, cls: 'border-primary/30 bg-primary/5' },
    warning: { Icon: AlertTriangle, cls: 'border-destructive/30 bg-destructive/5' },
    tip: { Icon: Lightbulb, cls: 'border-accent/40 bg-accent/10' },
  }[type];
  return (
    <div className={cn('my-4 flex gap-3 rounded-lg border p-4 text-sm', cfg.cls)}>
      <cfg.Icon className="mt-0.5 size-5 shrink-0 text-foreground/70" />
      <div className="[&>p]:m-0 [&>p+p]:mt-2">{children}</div>
    </div>
  );
}

/** Compliance disclaimer rendered in a muted, clearly-marked block. */
export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <p className="my-4 rounded-md bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

/** Inline glossary term that links to its definition. */
export function GlossaryTerm({ slug, children }: { slug: string; children: ReactNode }) {
  const term = getTerm(slug);
  return (
    <ThemedLink
      to={`/glossary/${slug}`}
      className="underline decoration-dotted underline-offset-2 hover:text-primary"
      title={term?.definition}
    >
      {children}
    </ThemedLink>
  );
}

const mdxComponents = {
  Callout,
  Disclaimer,
  GlossaryTerm,
  h1: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="mb-3 mt-6 font-display text-2xl font-semibold tracking-tight first:mt-0" {...p} />
  ),
  h2: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mb-2 mt-8 scroll-mt-20 font-display text-xl font-semibold tracking-tight" {...p} />
  ),
  h3: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mb-2 mt-6 font-display text-lg font-semibold" {...p} />
  ),
  p: (p: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="my-3 leading-relaxed text-foreground/90" {...p} />
  ),
  ul: (p: React.HTMLAttributes<HTMLUListElement>) => <ul className="my-3 ml-5 list-disc space-y-1.5" {...p} />,
  ol: (p: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="my-3 ml-5 list-decimal space-y-1.5" {...p} />
  ),
  a: (p: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-primary underline underline-offset-2" {...p} />
  ),
  strong: (p: React.HTMLAttributes<HTMLElement>) => <strong className="font-semibold" {...p} />,
  blockquote: (p: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="my-4 border-l-2 border-primary/40 pl-4 italic text-muted-foreground" {...p} />
  ),
};

export function MdxContent({ children }: { children: ReactNode }) {
  return <MDXProvider components={mdxComponents}>{children}</MDXProvider>;
}
