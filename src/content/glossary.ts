/** Glossary of mortgage/homebuyer jargon. `definedIn` cross-links to a canonical guide id. */
export interface GlossaryTerm {
  term: string;
  slug: string;
  definition: string;
  definedIn?: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'APR',
    slug: 'apr',
    definition:
      'Annual Percentage Rate — the yearly cost of a loan including interest plus most fees, expressed as a percentage. A truer cost comparison than the interest rate alone.',
    definedIn: 'rates-apr-explained',
  },
  {
    term: 'DTI',
    slug: 'dti',
    definition:
      'Debt-to-Income ratio — your total monthly debt payments divided by your gross monthly income. Lenders use it to gauge how much mortgage you can afford.',
    definedIn: 'budgeting-101',
  },
  {
    term: 'PITI',
    slug: 'piti',
    definition:
      'Principal, Interest, Taxes, and Insurance — the four components of a typical monthly mortgage payment.',
  },
  {
    term: 'PMI',
    slug: 'pmi',
    definition:
      'Private Mortgage Insurance — usually required on conventional loans when the down payment is under 20%. Protects the lender, not you, and can often be removed later.',
    definedIn: 'the-down-payment',
  },
  {
    term: 'Escrow',
    slug: 'escrow',
    definition:
      'An account your lender uses to hold and pay property taxes and insurance on your behalf, bundled into your monthly payment.',
  },
  {
    term: 'Closing Disclosure',
    slug: 'closing-disclosure',
    definition:
      'A five-page form detailing your final loan terms, projected monthly payments, and closing costs. You must receive it at least 3 business days before closing.',
    definedIn: 'closing-day-explained',
  },
  {
    term: 'FICO',
    slug: 'fico',
    definition:
      'The most widely used credit score model. Ranges from 300–850; higher scores generally unlock better mortgage rates.',
    definedIn: 'credit-health',
  },
];

const BY_SLUG = new Map(GLOSSARY.map((g) => [g.slug, g]));
export function getTerm(slug: string): GlossaryTerm | undefined {
  return BY_SLUG.get(slug);
}

export function searchGlossary(query: string): GlossaryTerm[] {
  const q = query.trim().toLowerCase();
  if (!q) return GLOSSARY;
  return GLOSSARY.filter(
    (g) => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q),
  );
}
