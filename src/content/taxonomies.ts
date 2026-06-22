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

/**
 * NICHES — borrower-audience segments, each a standalone embeddable widget the native
 * app can drop in for a specific kind of customer (a veteran, an investor, a senior
 * exploring a reverse mortgage). A cross-cutting tag; a lesson can serve several niches.
 */
export const NICHES = [
  {
    slug: 'first-time-buyer',
    label: 'First-Time Buyers',
    tagline: 'Your first home, start to finish',
    description: "New to all of this? Start here. Budgeting, credit, down payment help, and the steps from pre-approval to keys.",
  },
  {
    slug: 'real-estate-investor',
    label: 'Real Estate Investors',
    tagline: 'Rentals, flips, and DSCR',
    description: 'Financing that leans on the property, not just your paycheck. DSCR loans, fix-and-flip money, and building a rental portfolio.',
  },
  {
    slug: 'veterans-va',
    label: 'Veterans & VA Loans',
    tagline: 'The benefit you earned',
    description: 'Zero down, no monthly mortgage insurance, and rules built around military life. How to use your VA home-loan benefit well.',
  },
  {
    slug: 'self-employed',
    label: 'Self-Employed & 1099',
    tagline: 'Qualifying without a W-2',
    description: 'Run your own business or work gig and 1099 income? How bank-statement and other flexible loans get you approved.',
  },
  {
    slug: 'jumbo-luxury',
    label: 'Jumbo & Luxury',
    tagline: 'Financing above the limits',
    description: 'Buying above the conforming loan limit. How jumbo loans work, what lenders look for, and how to structure a large loan.',
  },
  {
    slug: 'credit-challenged',
    label: 'Rebuilding Credit',
    tagline: 'A path to yes',
    description: 'A bankruptcy, a foreclosure, or a thin file is not the end of the road. The waiting periods and the steps back to approval.',
  },
  {
    slug: 'government-fha-usda',
    label: 'FHA & USDA Loans',
    tagline: 'Low and no down payment',
    description: 'Government-backed loans built for low and moderate down payments, including the rural option that can mean zero down.',
  },
  {
    slug: 'renovation-construction',
    label: 'Renovation & Building',
    tagline: 'Buy and fix, or build new',
    description: 'Loans that roll the remodel into the mortgage, plus how construction financing works if you are building from the ground up.',
  },
  {
    slug: 'reverse-mortgage',
    label: 'Reverse Mortgages',
    tagline: 'Tapping equity at 62+',
    description: 'For homeowners 62 and older. How a reverse mortgage turns equity into cash flow, what it costs, and the honest trade-offs.',
  },
  {
    slug: 'foreign-national',
    label: 'Buying From Abroad',
    tagline: 'U.S. homes for non-residents',
    description: 'You do not need to be a citizen to own a U.S. home. What non-resident buyers need for documents, down payment, and approval.',
  },
] as const;

export type NicheSlug = (typeof NICHES)[number]['slug'];
export const NICHE_SLUGS = NICHES.map((n) => n.slug) as NicheSlug[];

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
export function nicheLabel(slug: string): string {
  return NICHES.find((n) => n.slug === slug)?.label ?? slug;
}
