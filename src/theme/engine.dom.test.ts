// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { applyThemeFromLocation, COLOR_TOKENS } from './engine';

describe('applyThemeFromLocation — DOM write path', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('style');
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.className = '';
    window.sessionStorage.clear();
  });

  it('writes every color token to :root as a valid CSS custom property', () => {
    applyThemeFromLocation(
      document.documentElement,
      { search: '?primary=2563eb&bg=ffffff&text=111827', hash: '' },
      window.sessionStorage,
    );
    for (const token of COLOR_TOKENS) {
      const value = document.documentElement.style.getPropertyValue(`--${token}`);
      expect(value).toMatch(/^\d{1,3} \d{1,3}% \d{1,3}%$/);
    }
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('rejects CSS injection — hostile primary never reaches the DOM, falls back to default', () => {
    applyThemeFromLocation(
      document.documentElement,
      { search: '?primary=' + encodeURIComponent('red;}body{display:none}'), hash: '' },
      window.sessionStorage,
    );
    const primary = document.documentElement.style.getPropertyValue('--primary');
    expect(primary).toMatch(/^\d{1,3} \d{1,3}% \d{1,3}%$/); // numeric only — no breakout chars
    expect(primary).not.toContain(';');
    expect(primary).not.toContain('}');
    // The full inline style string contains no injected selectors.
    expect(document.documentElement.getAttribute('style') ?? '').not.toContain('display');
  });

  it('sets the dark class when a dark background is supplied', () => {
    applyThemeFromLocation(document.documentElement, { search: '?bg=0a0a0a', hash: '' }, window.sessionStorage);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('recovers theme from sessionStorage when params drop on a later page', () => {
    // First load carries the params (e.g. native deep-link).
    applyThemeFromLocation(document.documentElement, { search: '?primary=10b981', hash: '' }, window.sessionStorage);
    const first = document.documentElement.style.getPropertyValue('--primary');
    // Second navigation has no params at all — must still match.
    applyThemeFromLocation(document.documentElement, { search: '', hash: '#/glossary' }, window.sessionStorage);
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe(first);
  });
});
