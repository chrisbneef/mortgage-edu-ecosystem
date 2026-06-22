# Mortgage Education Ecosystem

A mobile-first homebuyer & mortgage **education library**, built to embed inside a native mobile
app's WebView. The host app opens the WebView with hex colors in the URL and the entire UI themes
to match — so the same library feels native inside any branded app.

```
https://<deployed-url>/?primary=4a9d4f&theme=light    # green host, light theme
https://<deployed-url>/?primary=1e2d4f&theme=dark     # navy host, dark theme
```

Theme options: `light` (white background), `hybrid` (neutral gray background with white cards),
`dark` (near-black brand-tinted). Everything else is derived from the primary color; no separate accent.

## Stack

Vite · React · TypeScript · Tailwind · MDX content · react-router (HashRouter). Static build, no
backend, deployable to any CDN (Vercel).

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + static build to dist/
npm run test       # vitest (theme engine + DOM theming tests)
```

## How it works

- **URL-param theming** (`src/theme/`) — 2 params (`primary` + `theme`) drive a full derived palette
  applied before first paint (no flash). Strictly validated; auto-derives accent, background, text,
  and WCAG-readable contrast. Single source of truth shared by the inline bootstrap and React.
- **Multi-taxonomy content** (`src/content/`) — MDX guides + podcasts organized by both the
  5-stage homebuyer journey and loan-type tracks (First-Time, VA, FHA, USDA, Investor). Add a
  lesson by dropping an `.mdx` file under `src/content/items/`.
- See [CLAUDE.md](./CLAUDE.md) for full conventions.

## Theming contract for the native app

Append the theme params to the WebView URL. They persist across navigation, so deep links keep the
colors: `/#/g/<id>?primary=1e2d4f&theme=dark`. Param names are locked, see `THEME_PARAM_KEYS`.

> Educational content only — not financial advice or a commitment to lend.
