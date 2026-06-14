/**
 * Theme engine — SINGLE SOURCE OF TRUTH.
 *
 * Dependency-free on purpose: this module is imported by the React ThemeProvider
 * AND bundled (via esbuild) into the inline <script> in index.html that runs
 * before first paint. Keeping it free of imports keeps that inline script tiny
 * and guarantees the two execution points can never drift.
 *
 * Security: URL hex params flow into CSS here. We validate-by-shape (strict
 * allowlist regex, reject-don't-strip) and only ever write self-computed numeric
 * "H S% L%" strings via CSSOM setProperty. The raw param string is never echoed.
 */

export type ThemeMode = 'light' | 'dark';

export interface ThemeInputs {
  primary: string; // #rrggbb
  accent: string;
  bg: string;
  text: string;
  mode: ThemeMode;
}

/** The query-string keys the native app codes against. Locked contract. */
export const THEME_PARAM_KEYS = ['primary', 'accent', 'bg', 'text', 'mode'] as const;

export const DEFAULT_THEME_INPUTS: ThemeInputs = {
  primary: '#2563eb',
  accent: '#f59e0b',
  bg: '#ffffff',
  text: '#111827',
  mode: 'light',
};

/** Full shadcn/ui token set we emit. Every one must be present or components render unstyled. */
export const COLOR_TOKENS = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
] as const;

export type ColorToken = (typeof COLOR_TOKENS)[number];
export type Palette = Record<ColorToken, string>;

const HEX_RE = /^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const SESSION_KEY = 'pam.theme.inputs';

// ---------------------------------------------------------------------------
// validation
// ---------------------------------------------------------------------------

/** Validate-by-shape. Reject (return null) on anything not a clean 3/6-digit hex. */
export function parseHex(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  if (raw.length > 7) return null; // length guard before regex
  if (!HEX_RE.test(raw)) return null; // reject, never strip
  let h = raw[0] === '#' ? raw.slice(1) : raw;
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return '#' + h.toLowerCase();
}

function parseMode(raw: string | null | undefined): ThemeMode | null {
  return raw === 'light' || raw === 'dark' ? raw : null;
}

// ---------------------------------------------------------------------------
// color math (rgb / hsl / WCAG) — small + dependency-free
// ---------------------------------------------------------------------------

interface Rgb {
  r: number;
  g: number;
  b: number;
} // 0..255
interface Hsl {
  h: number;
  s: number;
  l: number;
} // 0..360, 0..100, 0..100

function hexToRgb(hex: string): Rgb {
  const h = hex.slice(1);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return n < lo ? lo : n > hi ? hi : n;
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn),
    min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s: s * 100, l: l * 100 };
}

/** "H S% L%" — the shadcn channel-string format. Always integers, always clamped. */
function hslString(c: Hsl): string {
  return `${Math.round(clamp(c.h, 0, 360))} ${Math.round(clamp(c.s, 0, 100))}% ${Math.round(
    clamp(c.l, 0, 100),
  )}%`;
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function channelLuminance(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }: Rgb): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a),
    lb = relativeLuminance(b);
  const hi = Math.max(la, lb),
    lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const BLACK: Rgb = { r: 10, g: 10, b: 10 };

/** Pick black or white text for a background by max WCAG contrast. */
function readableForeground(bg: Rgb): Rgb {
  return contrastRatio(bg, WHITE) >= contrastRatio(bg, BLACK) ? WHITE : BLACK;
}

/** Nudge a color's lightness (in HSL) until it clears 4.5:1 against `fg`, or bounds hit. */
function ensureContrast(color: Rgb, fg: Rgb, target = 4.5): Rgb {
  if (contrastRatio(color, fg) >= target) return color;
  const hsl = rgbToHsl(color);
  // Move away from the foreground: if fg is light, darken; if dark, lighten.
  const fgIsLight = relativeLuminance(fg) > 0.5;
  const step = fgIsLight ? -2 : 2;
  let best = color;
  for (let i = 0; i < 50; i++) {
    hsl.l = clamp(hsl.l + step, 0, 100);
    const candidate = hslToRgb(hsl);
    best = candidate;
    if (contrastRatio(candidate, fg) >= target) break;
    if (hsl.l <= 0 || hsl.l >= 100) break;
  }
  return best;
}

function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = s / 100,
    ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

// ---------------------------------------------------------------------------
// palette derivation
// ---------------------------------------------------------------------------

/** Derive the full shadcn token palette from a few hex inputs. */
export function buildPalette(inputs: ThemeInputs): Palette {
  const dark = inputs.mode === 'dark';
  const bg = hexToRgb(inputs.bg);
  const text = hexToRgb(inputs.text);
  const primary = ensureContrast(hexToRgb(inputs.primary), readableForeground(hexToRgb(inputs.primary)));
  const accent = ensureContrast(hexToRgb(inputs.accent), readableForeground(hexToRgb(inputs.accent)));

  const toward = (c: Rgb, target: Rgb, t: number) => hslString(rgbToHsl(mix(c, target, t)));
  const hover = (c: Rgb) => {
    const hsl = rgbToHsl(c);
    hsl.l = clamp(hsl.l + (dark ? 8 : -8), 0, 100);
    return hsl;
  };

  const destructive: Rgb = hexToRgb(dark ? '#dc2626' : '#ef4444');

  return {
    background: hslString(rgbToHsl(bg)),
    foreground: hslString(rgbToHsl(text)),
    card: hslString(rgbToHsl(mix(bg, text, dark ? 0.04 : 0.0))),
    'card-foreground': hslString(rgbToHsl(text)),
    popover: hslString(rgbToHsl(bg)),
    'popover-foreground': hslString(rgbToHsl(text)),
    primary: hslString(rgbToHsl(primary)),
    'primary-foreground': hslString(rgbToHsl(readableForeground(primary))),
    secondary: toward(bg, text, dark ? 0.14 : 0.06),
    'secondary-foreground': hslString(rgbToHsl(text)),
    muted: toward(bg, text, dark ? 0.1 : 0.04),
    'muted-foreground': toward(text, bg, 0.45),
    accent: hslString(rgbToHsl(accent)),
    'accent-foreground': hslString(rgbToHsl(readableForeground(accent))),
    destructive: hslString(rgbToHsl(destructive)),
    'destructive-foreground': hslString(rgbToHsl(readableForeground(destructive))),
    border: toward(bg, text, dark ? 0.18 : 0.12),
    input: toward(bg, text, dark ? 0.18 : 0.12),
    ring: hslString(hover(primary)),
  };
}

// ---------------------------------------------------------------------------
// inputs parsing (URL + sessionStorage fallback) + apply
// ---------------------------------------------------------------------------

interface StorageLike {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

/**
 * Build ThemeInputs from URL params, with per-field fallback:
 *   valid URL param  ->  sessionStorage  ->  default.
 * Persists the resolved inputs to sessionStorage so internal navigations that
 * drop the query string still match the original theme.
 */
export function parseThemeInputs(params: URLSearchParams, storage?: StorageLike): ThemeInputs {
  let stored: Partial<ThemeInputs> = {};
  if (storage) {
    try {
      const raw = storage.getItem(SESSION_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch {
      /* ignore malformed storage */
    }
  }

  const pick = (key: keyof ThemeInputs): string => {
    const fromUrl = parseHex(params.get(key));
    if (fromUrl) return fromUrl;
    const fromStore = typeof stored[key] === 'string' ? parseHex(stored[key] as string) : null;
    if (fromStore) return fromStore;
    return DEFAULT_THEME_INPUTS[key];
  };

  const mode =
    parseMode(params.get('mode')) ??
    parseMode(stored.mode) ??
    inferMode(parseHex(params.get('bg')) ?? (stored.bg as string) ?? DEFAULT_THEME_INPUTS.bg);

  const inputs: ThemeInputs = {
    primary: pick('primary'),
    accent: pick('accent'),
    bg: pick('bg'),
    text: pick('text'),
    mode,
  };

  if (storage) {
    try {
      storage.setItem(SESSION_KEY, JSON.stringify(inputs));
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }
  return inputs;
}

/** Dark mode inferred from a dark background when no explicit mode is given. */
function inferMode(bgHex: string): ThemeMode {
  const norm = parseHex(bgHex);
  if (!norm) return DEFAULT_THEME_INPUTS.mode;
  return relativeLuminance(hexToRgb(norm)) < 0.4 ? 'dark' : 'light';
}

/** Write the palette to CSS custom properties via CSSOM. Never string-concatenated CSS. */
export function applyPalette(palette: Palette, mode: ThemeMode, el: HTMLElement): void {
  for (const token of COLOR_TOKENS) {
    el.style.setProperty(`--${token}`, palette[token]);
  }
  el.setAttribute('data-theme', mode);
  if (mode === 'dark') el.classList.add('dark');
  else el.classList.remove('dark');
}

/**
 * Theme params can arrive two ways under HashRouter:
 *   - native initial deep-link:   https://host/?primary=...#/route
 *   - in-app ThemedLink navigation: https://host/#/route?primary=...
 * Merge both, with the hash query taking precedence (it's the "current" nav state).
 */
export function combinedSearch(loc: { search: string; hash: string }): URLSearchParams {
  const merged = new URLSearchParams(loc.search);
  const qIndex = loc.hash.indexOf('?');
  if (qIndex !== -1) {
    const hashParams = new URLSearchParams(loc.hash.slice(qIndex + 1));
    hashParams.forEach((v, k) => merged.set(k, v));
  }
  return merged;
}

/** One-shot: read the current URL + storage, derive, and apply. Used by the bootstrap. */
export function applyThemeFromLocation(
  el: HTMLElement,
  loc: { search: string; hash: string },
  storage?: StorageLike,
): ThemeInputs {
  const inputs = parseThemeInputs(combinedSearch(loc), storage);
  applyPalette(buildPalette(inputs), inputs.mode, el);
  return inputs;
}
