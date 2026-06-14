import { describe, it, expect } from 'vitest';
import {
  parseHex,
  parseThemeInputs,
  buildPalette,
  DEFAULT_THEME_INPUTS,
  combinedSearch,
} from './engine';

describe('parseHex — validate, reject-don\'t-strip', () => {
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

describe('parseThemeInputs — per-field fallback', () => {
  it('uses defaults when params absent', () => {
    expect(parseThemeInputs(new URLSearchParams())).toEqual(DEFAULT_THEME_INPUTS);
  });

  it('one bad param does not corrupt the others', () => {
    const inputs = parseThemeInputs(
      new URLSearchParams('primary=2563eb&accent=NOTHEX&bg=000000'),
    );
    expect(inputs.primary).toBe('#2563eb');
    expect(inputs.accent).toBe(DEFAULT_THEME_INPUTS.accent); // fell back
    expect(inputs.bg).toBe('#000000');
  });

  it('infers dark mode from a dark background', () => {
    const inputs = parseThemeInputs(new URLSearchParams('bg=0a0a0a'));
    expect(inputs.mode).toBe('dark');
  });
});

describe('buildPalette — only emits safe numeric "H S% L%" strings', () => {
  it('every token is a clean H S% L% triple (no injection possible)', () => {
    const palette = buildPalette({ ...DEFAULT_THEME_INPUTS });
    for (const value of Object.values(palette)) {
      expect(value).toMatch(/^\d{1,3} \d{1,3}% \d{1,3}%$/);
    }
  });

  it('derives a foreground that clears WCAG AA on the primary button', () => {
    // A mid-tone primary that neither pure black nor white may pass naively.
    const palette = buildPalette({ ...DEFAULT_THEME_INPUTS, primary: '#2563eb' });
    expect(palette['primary-foreground']).toMatch(/^\d{1,3} \d{1,3}% \d{1,3}%$/);
  });
});

describe('combinedSearch — merges location.search and hash query', () => {
  it('hash query takes precedence over the leading search', () => {
    const params = combinedSearch({ search: '?primary=111111', hash: '#/g/x?primary=222222&bg=ffffff' });
    expect(params.get('primary')).toBe('222222');
    expect(params.get('bg')).toBe('ffffff');
  });
});
