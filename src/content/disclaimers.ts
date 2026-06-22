import type { NicheSlug } from './taxonomies';
import type { ContentEntry } from './schema';

/**
 * One combined disclaimer per article, rendered once at the bottom of the detail page.
 * It joins any niche-specific notes (so the self-employed guide gets a self-employment
 * line, the reverse-mortgage guide gets the counseling line, and so on) with the general
 * education line. This replaces the old setup where an in-body <Disclaimer> and the
 * frontmatter disclaimer both rendered, stacking two disclaimers on every page.
 */
export const GENERAL_DISCLAIMER =
  'This is general education and should not determine what you qualify for. Programs, rates, and terms vary by lender and by your situation and can change. Talk to a licensed loan officer about your specific case.';

const NICHE_DISCLAIMERS: Record<NicheSlug, string> = {
  'first-time-buyer':
    'First-time buyer programs and down payment assistance vary by state, county, and lender, and the rules change.',
  'real-estate-investor':
    'Investment property financing, including DSCR loans, is underwritten on the property and varies by lender. This is not investment advice.',
  'veterans-va':
    'VA loan benefits, funding fees, and entitlement rules are set by the VA and can change; confirm your eligibility with the VA and your lender.',
  'self-employed':
    'How a lender counts self-employed, 1099, and business income depends on your tax returns, your business structure, and the loan program, and it is decided case by case.',
  'jumbo-luxury':
    'Jumbo loan limits and requirements vary by county and lender and change from year to year.',
  'credit-challenged':
    'Waiting periods after a bankruptcy, foreclosure, or short sale, and the credit needed to qualify, vary by loan program and lender and can change.',
  'government-fha-usda':
    'FHA and USDA program rules, mortgage insurance, loan limits, income limits, and eligible areas are set by the agencies and change. This is not a government agency and is not affiliated with HUD, FHA, USDA, or the VA.',
  'renovation-construction':
    'Renovation and construction loan rules, draw schedules, and contractor requirements vary by lender and program.',
  'reverse-mortgage':
    'A reverse mortgage is a major financial decision with real costs and trade-offs. HUD requires independent counseling before you apply; talk with a counselor and your family first.',
  'foreign-national':
    'This is not tax or immigration advice. Foreign-national lending and FIRPTA tax rules vary; consult a qualified tax professional, and an immigration attorney if needed.',
};

/** The single combined disclaimer for an article: its niche notes, then the general line. */
export function disclaimerFor(entry: ContentEntry): string {
  const parts: string[] = [];
  for (const niche of entry.niches as NicheSlug[]) {
    const note = NICHE_DISCLAIMERS[niche];
    if (note && !parts.includes(note)) parts.push(note);
  }
  parts.push(GENERAL_DISCLAIMER);
  return parts.join(' ');
}
