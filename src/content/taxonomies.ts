/** The two taxonomies content is organized by, plus display metadata. */

export const JOURNEY_CATEGORIES = [
  { slug: 'preparation', label: 'Preparation & Financial Foundation', short: 'Prepare', order: 1 },
  { slug: 'mortgage-process', label: 'The Mortgage Process', short: 'Mortgage', order: 2 },
  { slug: 'property-search', label: 'The Property Search', short: 'Search', order: 3 },
  { slug: 'closing-beyond', label: 'Closing & Beyond', short: 'Closing', order: 4 },
  { slug: 'tools-resources', label: 'Tools & Resources', short: 'Tools', order: 5 },
] as const;

export type JourneyCategorySlug = (typeof JOURNEY_CATEGORIES)[number]['slug'];
export const JOURNEY_SLUGS = JOURNEY_CATEGORIES.map((c) => c.slug) as JourneyCategorySlug[];

export const TRACKS = [
  { slug: 'first-time', label: 'First-Time Homebuyer', blurb: 'Start here if this is your first home.' },
  { slug: 'va', label: 'VA Loan', blurb: 'Benefits for veterans and service members.' },
  { slug: 'fha', label: 'FHA Loan', blurb: 'Low down payment, flexible credit.' },
  { slug: 'usda', label: 'USDA Loan', blurb: 'Zero-down options for rural & suburban buyers.' },
  { slug: 'investor', label: 'Investor', blurb: 'Financing for rental & investment property.' },
] as const;

export type TrackSlug = (typeof TRACKS)[number]['slug'];
export const TRACK_SLUGS = TRACKS.map((t) => t.slug) as TrackSlug[];

/**
 * Customer-engagement lifecycle PHASES — the funnel a loan officer sees, and the
 * stages the native app transforms across. A cross-cutting tag: a single lesson can
 * apply to multiple phases. These are the primary embeddable "phase views."
 */
export const PHASES = [
  {
    slug: 'dream',
    label: 'The Dream',
    tagline: 'Before pre-approval',
    order: 1,
    description:
      'Where the journey really starts — picturing the home long before the loan. Buy vs. rent, neighborhoods, schools, and how much house you can imagine affording.',
  },
  {
    slug: 'pre-approved',
    label: 'Getting Ready',
    tagline: 'Ready for the process',
    order: 2,
    description:
      'You have a sense of what you qualify for — now get ready. The four questions that matter: what’s my payment, do I qualify, can I get a pre-approval letter, and how much cash to close.',
  },
  {
    slug: 'under-contract',
    label: 'Under Contract',
    tagline: 'Navigating the process',
    order: 3,
    description:
      'Offer accepted — the point of truth. Navigating conditions, documents, inspection, appraisal, and milestones to reach the closing table smoothly.',
  },
  {
    slug: 'post-closing',
    label: 'After Closing',
    tagline: 'Owning the home',
    order: 4,
    description:
      'Keys in hand. Protecting and growing your investment — maintenance, building equity, refinancing, and smart homeownership for the long haul.',
  },
] as const;

export type PhaseSlug = (typeof PHASES)[number]['slug'];
export const PHASE_SLUGS = PHASES.map((p) => p.slug) as PhaseSlug[];

export const CONTENT_TYPES = ['guide', 'podcast'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export function journeyLabel(slug: string): string {
  return JOURNEY_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
export function trackLabel(slug: string): string {
  return TRACKS.find((t) => t.slug === slug)?.label ?? slug;
}
export function phaseLabel(slug: string): string {
  return PHASES.find((p) => p.slug === slug)?.label ?? slug;
}
