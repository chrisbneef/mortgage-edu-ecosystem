import { forwardRef, useCallback } from 'react';
import {
  Link,
  useNavigate,
  useSearchParams,
  type LinkProps,
  type NavigateOptions,
  type To,
} from 'react-router-dom';
import { THEME_PARAM_KEYS } from '@/theme/engine';

/**
 * THE navigation primitives for this app. Every internal link/navigation MUST go
 * through these so the theme params ride along on every page (hard requirement).
 * Do NOT use react-router's <Link>/useNavigate or raw <a> directly in app code.
 */

/** Current theme params, extracted from the (hash) query string. */
export function useThemeParams(): URLSearchParams {
  const [searchParams] = useSearchParams();
  const theme = new URLSearchParams();
  for (const key of THEME_PARAM_KEYS) {
    const v = searchParams.get(key);
    if (v != null) theme.set(key, v);
  }
  return theme;
}

function mergeThemeInto(to: To, theme: URLSearchParams): To {
  if (theme.toString() === '') return to;

  if (typeof to === 'string') {
    const [path, hash] = to.split('#');
    const [pathname, existing] = path.split('?');
    const merged = new URLSearchParams(existing);
    theme.forEach((v, k) => {
      if (!merged.has(k)) merged.set(k, v);
    });
    const qs = merged.toString();
    return `${pathname}${qs ? `?${qs}` : ''}${hash ? `#${hash}` : ''}`;
  }

  const merged = new URLSearchParams(to.search ?? '');
  theme.forEach((v, k) => {
    if (!merged.has(k)) merged.set(k, v);
  });
  return { ...to, search: merged.toString() };
}

/** Drop-in replacement for react-router <Link> that preserves theme params. */
export const ThemedLink = forwardRef<HTMLAnchorElement, LinkProps>(function ThemedLink(
  { to, ...rest },
  ref,
) {
  const theme = useThemeParams();
  return <Link ref={ref} to={mergeThemeInto(to, theme)} {...rest} />;
});

/** Drop-in replacement for useNavigate that preserves theme params. */
export function useThemedNavigate() {
  const navigate = useNavigate();
  const theme = useThemeParams();
  return useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === 'number') return navigate(to);
      return navigate(mergeThemeInto(to, theme), options);
    },
    [navigate, theme],
  );
}
