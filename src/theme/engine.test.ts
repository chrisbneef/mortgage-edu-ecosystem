import { describe, it, expect } from 'vitest';
import {
  parseHex,
  parseThemeInputs,
  buildPalette,
  backgroundHex,
  DEFAULT_THEME_INPUTS,
  combinedSearch,
} from './engine';

describe("parseHex — validate, reject-don't-strip", () => {
  it('accepts 3 and 6 digit hex, normalizes to #rrggbb lowercase', () => {
    expect(parseHex('#FFF')).toBe('#ffffff');
    expect(parseHex('2563EB')).toBe('#2563eb');
    expect(parseHex('#2563eb')).toBe('#2563eb');
  });

  it('rejects (returns null) anything not clean hex — never strips', () => {
    for (const bad of [
      'red',
      'f00;}body{display:none}',
      '#12',
      '#1234',
      'rgb(0,0,0)',
      'url(x)',
      'var(--x)',
      '#2563eb ',
      '#fffffff',
      '0'.repeat(10_000),
      '',
    ]) {
      expect(parseHex(bad)).toBeNull();
    }
  });
});

describe('parseThemeInputs — primary + theme only', () => {
  it('uses defaults when params absent', () => {
    expect(parseThemeInputs(new URLSearchParams())).toEqual(DEFAULT_THEME_INPUTS);
  });

  it('reads primary and theme; falls back per field on bad input', () => {
    const inputs = parseThemeInputs(new URLSearchParams('primary=10b981&theme=dark'));
    expect(inputs).toEqual({ primary: '#10b981', theme: 'dark' });

    const bad = parseThemeInputs(new URLSearchParams('primary=NOTHEX&theme=neon'));
    expect(bad).toEqual(DEFAULT_THEME_INPUTS); // both invalid -> defaults
  });

  it('accepts the hybrid theme', () => {
    expect(parseThemeInputs(new URLSearchParams('theme=hybrid')).theme).toBe('hybrid');
  });

  it('ignores legacy accent/bg/text params', () => {
    const inputs = parseThemeInputs(new URLSearchParams('primary=2563eb&accent=f00&bg=000&text=fff'));
    expect(inputs).toEqual({ primary: '#2563eb', theme: 'light' });
  });
});

describe('buildPalette — only emits safe numeric "H S% L%" strings', () => {
  it('every token is a clean H S% L% triple for each theme', () => {
    for (const theme of ['light', 'hybrid', 'dark'] as const) {
      const palette = buildPalette({ primary: '#2563eb', theme });
      for (const value of Object.values(palette)) {
        expect(value).toMatch(/^\d{1,3} \d{1,3}% \d{1,3}%$/);
      }
    }
  });

  it('dark and light themes produce different backgrounds', () => {
    const light = buildPalette({ primary: '#2563eb', theme: 'light' }).background;
    const dark = buildPalette({ primary: '#2563eb', theme: 'dark' }).background;
    expect(light).not.toBe(dark);
  });
});

describe('backgroundHex', () => {
  it('returns white for light and a dark hex for dark', () => {
    expect(backgroundHex({ primary: '#2563eb', theme: 'light' })).toBe('#ffffff');
    expect(backgroundHex({ primary: '#2563eb', theme: 'dark' })).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('combinedSearch — merges location.search and hash query', () => {
  it('hash query takes precedence over the leading search', () => {
    const params = combinedSearch({ search: '?primary=111111', hash: '#/g/x?primary=222222&theme=dark' });
    expect(params.get('primary')).toBe('222222');
    expect(params.get('theme')).toBe('dark');
  });
});
