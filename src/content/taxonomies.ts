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

export const CONTENT_TYPES = ['guide', 'podcast'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export function journeyLabel(slug: string): string {
  return JOURNEY_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
export function trackLabel(slug: string): string {
  return TRACKS.find((t) => t.slug === slug)?.label ?? slug;
}
