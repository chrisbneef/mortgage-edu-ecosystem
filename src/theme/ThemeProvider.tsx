import { createContext, useContext, useLayoutEffect, useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  applyPalette,
  backgroundHex,
  buildPalette,
  parseThemeInputs,
  type Palette,
  type ThemeInputs,
} from './engine';
import { syncNativeChrome } from '@/native/bridge';

interface ThemeContextValue {
  inputs: ThemeInputs;
  palette: Palette;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Re-applies the theme on every client-side navigation using the SAME engine as the
 * pre-paint inline bootstrap. Theme params are read from the (hash) query string with
 * a sessionStorage fallback, so the theme is identical on every page and never reverts.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [searchParams] = useSearchParams();

  const inputs = useMemo(
    () => parseThemeInputs(searchParams, safeStorage()),
    [searchParams],
  );
  const palette = useMemo(() => buildPalette(inputs), [inputs]);

  // useLayoutEffect = applied before the browser paints the new route.
  useLayoutEffect(() => {
    applyPalette(palette, inputs.theme, document.documentElement);
    syncNativeChrome(backgroundHex(inputs), inputs.theme);
  }, [palette, inputs]);

  const value = useMemo(() => ({ inputs, palette }), [inputs, palette]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

function safeStorage(): Storage | undefined {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}
