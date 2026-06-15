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
import { SCOPE_PARAM_KEY } from '@/lib/scope';

/**
 * THE navigation primitives for this app. Every internal link/navigation MUST go
 * through these so the "sticky" params ride along on every page:
 *   - theme params  → the theme stays identical on every page (hard requirement)
 *   - scope param   → an embedded category stays rooted in that category
 * Do NOT use react-router's <Link>/useNavigate or raw <a> directly in app code.
 */
const STICKY_PARAM_KEYS = [...THEME_PARAM_KEYS, SCOPE_PARAM_KEY];

/** Current sticky (theme + scope) params, from the (hash) query string. */
export function useStickyParams(): URLSearchParams {
  const [searchParams] = useSearchParams();
  const sticky = new URLSearchParams();
  for (const key of STICKY_PARAM_KEYS) {
    const v = searchParams.get(key);
    if (v != null) sticky.set(key, v);
  }
  return sticky;
}

function mergeStickyInto(to: To, sticky: URLSearchParams): To {
  if (sticky.toString() === '') return to;

  if (typeof to === 'string') {
    const [path, hash] = to.split('#');
    const [pathname, existing] = path.split('?');
    const merged = new URLSearchParams(existing);
    sticky.forEach((v, k) => {
      if (!merged.has(k)) merged.set(k, v);
    });
    const qs = merged.toString();
    return `${pathname}${qs ? `?${qs}` : ''}${hash ? `#${hash}` : ''}`;
  }

  const merged = new URLSearchParams(to.search ?? '');
  sticky.forEach((v, k) => {
    if (!merged.has(k)) merged.set(k, v);
  });
  return { ...to, search: merged.toString() };
}

/** Drop-in replacement for react-router <Link> that preserves theme + scope params. */
export const ThemedLink = forwardRef<HTMLAnchorElement, LinkProps>(function ThemedLink(
  { to, ...rest },
  ref,
) {
  const sticky = useStickyParams();
  return <Link ref={ref} to={mergeStickyInto(to, sticky)} {...rest} />;
});

/** Drop-in replacement for useNavigate that preserves theme + scope params. */
export function useThemedNavigate() {
  const navigate = useNavigate();
  const sticky = useStickyParams();
  return useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === 'number') return navigate(to);
      return navigate(mergeStickyInto(to, sticky), options);
    },
    [navigate, sticky],
  );
}
