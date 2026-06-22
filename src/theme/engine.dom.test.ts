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
      { search: '?primary=2563eb&theme=light', hash: '' },
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
    expect(primary).toMatch(/^\d{1,3} \d{1,3}% \d{1,3}%$/);
    expect(primary).not.toContain(';');
    expect(primary).not.toContain('}');
    expect(document.documentElement.getAttribute('style') ?? '').not.toContain('display');
  });

  it('adds the dark class for theme=dark and removes it for the light themes', () => {
    applyThemeFromLocation(document.documentElement, { search: '?theme=dark', hash: '' }, window.sessionStorage);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    applyThemeFromLocation(document.documentElement, { search: '?theme=hybrid', hash: '' }, window.sessionStorage);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('hybrid');
  });

  it('recovers theme + primary from sessionStorage when params drop on a later page', () => {
    applyThemeFromLocation(
      document.documentElement,
      { search: '?primary=10b981&theme=dark', hash: '' },
      window.sessionStorage,
    );
    const first = document.documentElement.style.getPropertyValue('--primary');
    // Second navigation has no params at all — must still match.
    applyThemeFromLocation(document.documentElement, { search: '', hash: '#/glossary' }, window.sessionStorage);
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe(first);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
