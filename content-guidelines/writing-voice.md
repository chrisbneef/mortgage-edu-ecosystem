# Writing Voice & Style Guide

> **Status:** Starter template — edit to match your brand. Replace bracketed placeholders.

The education library exists to make the home-buying process feel approachable. Every guide and
podcast should sound like a **knowledgeable friend in the business**, not a bank disclosure or a
sales pitch.

## Who we're writing for

- First-time and repeat homebuyers, often anxious and overwhelmed by jargon.
- People at every stage of the journey — from "just dreaming" to "closing next week."
- Mobile readers, skimming on a phone in short sessions.

## Voice principles

1. **Plain English first.** Explain every industry term the first time it appears. Use the
   `<GlossaryTerm slug="...">` component so readers can tap for a definition.
2. **Warm, calm, and reassuring.** Reduce anxiety. Acknowledge that this is a big decision.
3. **Confident, never pushy.** Educate; don't sell. No pressure language ("act now," "don't miss out").
4. **Concrete over abstract.** Use real numbers, simple examples, and rules of thumb.
5. **Honest about trade-offs.** Show pros *and* cons. Trust is the product.

## Tone by context

| Context | Tone |
|---------|------|
| Guide intros | Welcoming, sets expectations ("Here's what we'll cover") |
| Step-by-step sections | Clear, instructional, second person ("you") |
| Money/risk topics | Careful, neutral, never alarmist |
| Disclaimers | Plain and matter-of-fact (see `compliance.md`) |

## Mechanics

- **Reading level:** aim for ~8th grade. Short sentences. One idea per sentence.
- **Paragraphs:** 2–4 sentences max — they're read on phones.
- **Person:** address the reader as "you." Refer to the lender as "your lender."
- **Numbers:** use numerals for figures ("3% down," "$1,890/mo"). Round for readability.
- **Headings:** sentence case, scannable. Long guides are chunked by `##` headings (these become
  deep-linkable sections in the app).

## Formatting → MDX components

Authors have these building blocks (see [`src/components/mdx/`](../src/components/mdx/index.tsx)):

- `<Callout type="info|tip|warning">` — highlight a key point or caution.
- `<GlossaryTerm slug="apr">APR</GlossaryTerm>` — link a jargon term to its definition.
- `<Disclaimer>` — inline compliance disclaimer (also see the frontmatter `disclaimer` field).

## Do / Don't

| Do | Don't |
|----|-------|
| "Your credit score affects your rate." | "Optimize your FICO to leverage rate arbitrage." |
| "FHA loans allow as little as 3.5% down." | "FHA is the best loan — apply today!" |
| Define PMI the first time you use it. | Assume the reader knows acronyms. |
| Show what could go wrong, plainly. | Hide risks or over-promise outcomes. |

## Before / after example

> **Before:** "Borrowers must satisfy DTI thresholds to qualify for conforming financing."
>
> **After:** "Lenders look at your <GlossaryTerm slug=\"dti\">debt-to-income ratio</GlossaryTerm> —
> how much of your monthly income already goes to debts. Most loans want that under about 43%."
