/**
 * Inline theme bootstrap entry.
 *
 * This file is bundled (esbuild, IIFE) by vite-plugin-theme-bootstrap and injected
 * inline into <head> in index.html. It runs BEFORE React mounts and before first
 * paint, so the themed CSS variables exist on :root immediately — no flash of the
 * default theme. It shares the exact same engine code as the React ThemeProvider.
 */
import { applyThemeFromLocation } from './engine';

try {
  applyThemeFromLocation(document.documentElement, window.location, window.sessionStorage);
} catch {
  // Never let theming break the app; defaults in CSS will apply.
}
