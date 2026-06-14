# Content Guidelines

Reference documents that govern **how** content for the education library is written and what
**compliance** language it must carry. These are guidance/source-of-truth docs for authors and
reviewers — they are **not** shipped to the app or imported by the build (the app's user-facing
content lives as `.mdx` files under [`src/content/items/`](../src/content/items/)).

## Files

| File | Purpose |
|------|---------|
| [`writing-voice.md`](./writing-voice.md) | Tone, style, reading level, and formatting conventions for all guides & podcasts. |
| [`compliance.md`](./compliance.md) | Required disclosures, rate/APR language rules, prohibited claims, and the review workflow. |

## How these connect to the app

The content schema ([`src/content/schema.ts`](../src/content/schema.ts)) already has fields that
these docs feed:

- `disclosures: []` — keys for required disclosure blocks (defined in `compliance.md`).
- `disclaimer` — the per-lesson disclaimer string.
- `lastReviewed` / `reviewedBy` — compliance review tracking.

Authors write to the **voice** guide; reviewers check against the **compliance** guide and stamp
`lastReviewed` / `reviewedBy` in the lesson's frontmatter.

> Drop additional `.md` references in this folder as needed (e.g. brand guidelines, SEO notes,
> a per-state disclosure matrix).
