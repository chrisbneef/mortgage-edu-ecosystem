# Compliance Guidelines

> **Status:** Starter template — these are common mortgage-industry conventions, **not legal
> advice.** Your licensed compliance/legal team must review and finalize all language, disclosures,
> and license numbers before publishing. Replace every bracketed placeholder.

This document defines the disclosure language and content rules every guide and podcast must
follow. Reviewers check each lesson against this file and stamp `lastReviewed` and `reviewedBy` in
the lesson's frontmatter.

## Company identifiers (fill in)

- **Legal name:** [Company Legal Name]
- **NMLS ID:** [Company NMLS #] — and individual originator NMLS # where applicable
- **Licensed in:** [states] — note any state-specific requirements
- **Equal Housing Lender:** yes — include the Equal Housing logo/statement where required

## Required disclosures

These map to the frontmatter `disclosures: []` keys. Keep the canonical text here; reference by key
in each lesson.

| Key | When required | Text (finalize with legal) |
|-----|---------------|----------------------------|
| `equal-housing` | All content | "Equal Housing Opportunity. [Company] is an Equal Housing Lender." |
| `nmls` | All content / footer | "[Company Legal Name], NMLS #[ID]. [www.nmlsconsumeraccess.org]" |
| `not-a-commitment` | Any loan/program content | "This is not a commitment to lend. All loans subject to credit approval." |
| `rates-subject-to-change` | Any rate/APR/payment example | "Rates, terms, and payment examples are illustrative and subject to change without notice." |
| `not-advice` | All content | "Educational content only; not financial, legal, or tax advice." |

Every lesson should carry a short `disclaimer` in frontmatter (one or two of the above, condensed)
plus any `disclosures` keys that render fuller blocks.

## Language rules

**Always**
- State assumptions behind any number ("assuming a 700 credit score and 20% down…").
- Use "estimated," "example," or "illustrative" for any payment, rate, or APR figure.
- Distinguish **interest rate** from **APR** whenever either appears.
- Present pros and cons of any loan program neutrally.

**Never**
- Quote a specific live rate as if guaranteed, or imply a rate/approval is locked.
- Use "pre-approved," "guaranteed," "best," "lowest," or "no risk" as factual claims.
- Promise outcomes ("you will save," "you'll qualify") — use conditional language.
- Use urgency/pressure tactics ("act now," "limited time") — this is education, not advertising.
- Give individualized financial, tax, or legal advice — direct readers to a professional.

## Special topics

- **Trigger terms / advertising rules:** if a piece mentions a specific rate, payment amount, term,
  or "no down payment," additional Truth-in-Lending/Reg Z advertising disclosures may apply — flag
  for compliance review.
- **Government programs (FHA/VA/USDA):** state that the company is not affiliated with or endorsed
  by any government agency; programs have eligibility requirements.
- **State-specific:** maintain a per-state disclosure matrix as a separate `.md` here if needed.

## Review workflow

1. Author writes/updates the `.mdx` lesson following `writing-voice.md`.
2. Compliance reviewer checks against this document.
3. Reviewer sets frontmatter: `lastReviewed: YYYY-MM-DD`, `reviewedBy: "[name/team]"`, and the
   correct `disclosures` keys + `disclaimer`.
4. **Re-review cadence:** re-check published content every [6/12] months, or sooner if rules or
   programs change. Stale `lastReviewed` dates should be surfaced for re-review.
