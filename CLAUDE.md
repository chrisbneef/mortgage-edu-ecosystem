# PAM Education Platform

Mobile-first homebuyer/mortgage education library. Ships as a **static SPA loaded inside a
native mobile app's WebView**. No backend, no auth, hostable on any CDN.

**Stack:** Vite + React + TypeScript + Tailwind + shadcn-style primitives + react-router (HashRouter).

## Run

```bash
npm run dev        # dev server at :5173
npm run build      # typecheck + static build to dist/
npm run test       # vitest (engine + DOM theming tests)
npm run typecheck  # tsc --noEmit
```

## The two core systems

### 1. URL-param theming (`src/theme/`)
The native app opens the WebView with hex colors in the URL and they drive the whole theme:
`?primary=2563eb&accent=f59e0b&bg=ffffff&text=111827&mode=light`. **These 5 param keys are a
locked contract** the native app codes against (`THEME_PARAM_KEYS` in `engine.ts`).

- `engine.ts` is the **single source of truth** — pure, dependency-free parse/validate/derive/apply.
  Used by BOTH the React `ThemeProvider` and the pre-paint inline bootstrap.
- `bootstrap-entry.ts` is bundled by `vite-plugin-theme-bootstrap.ts` into an inline `<script>`
  in `<head>` (head-prepend) so the theme applies **before first paint** — no flash. Never
  hand-write theme logic anywhere else; edit `engine.ts` and both paths update.
- **Security:** URL hex flows into CSS. We validate-by-shape (`parseHex`, reject-don't-strip) and
  only ever write self-computed numeric `"H S% L%"` strings via `setProperty`. Add tests in
  `engine.test.ts` / `engine.dom.test.ts` for any new param. Never echo a raw param into the DOM.
- **Contrast:** `buildPalette` auto-derives WCAG-readable foregrounds and nudges `primary`
  lightness until it clears 4.5:1, so buttons stay readable for any input palette.
- **Every page must keep the theme.** Three layers: (1) all nav uses `ThemedLink` /
  `useThemedNavigate` from `src/lib/navigation.tsx` — **never** use raw `<a>`, react-router
  `<Link>`, or `useNavigate` directly; (2) sessionStorage fallback in `parseThemeInputs`;
  (3) inline bootstrap sets `:root` once. Tailwind tokens are `hsl(var(--token))`.

### 2. Multi-taxonomy content (`src/content/`)
Guides + podcasts authored as MDX with frontmatter validated by Zod (`schema.ts`). Content is
organized by BOTH `journeyCategory` (one of 5) AND `tracks[]` (many loan types) — see
`taxonomies.ts`. `registry.ts` builds a typed index: frontmatter eager (tiny, via the `?meta`
plugin), MDX bodies lazy/code-split.

- **Add a guide/podcast:** drop an `.mdx` file under `src/content/items/<category>/` with valid
  frontmatter (copy an existing one). `id` must be unique kebab-case and is the permanent
  deep-link target. Dev build fails loudly on invalid frontmatter.
- **Routing:** `/g/:id` is the canonical detail route (the native deep-link target). All browse
  pages (`/journey/:category`, `/track/:track`, `/podcasts`, `/glossary`, `/search`) are filters
  that link into it carrying `?from=track:va` context for breadcrumbs/next-prev.
- MDX components available in content: `<Callout>`, `<Disclaimer>`, `<GlossaryTerm slug>` (see
  `src/components/mdx/`). Glossary lives in `src/content/glossary.ts`.

## WebView notes
- HashRouter → deep links like `/#/g/:id` work with zero server config.
- Native bridge in `src/native/bridge.ts` (analytics, audio events, `__webBack`, theme-color sync).
- Single shared `<audio>` element in `AudioProvider`; iOS needs a tap to start (no autoplay).
- Safe-area insets via `pt-safe` / `pb-safe` utilities.

## Status
Architecture complete; sample content only. Real guide/podcast content + compliance disclosures
are ported in later. Audio `src` points to a CDN — replace the example URLs with real files.
