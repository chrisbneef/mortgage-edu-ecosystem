import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  JOURNEY_SLUGS,
  TRACK_SLUGS,
  journeyLabel,
  trackLabel,
  type JourneyCategorySlug,
  type TrackSlug,
} from '@/content/taxonomies';

/**
 * "Scope" lets the native app embed ONE slice of the library as its own rooted
 * experience — e.g. the "credit repair" stage embeds the Preparation category and
 * back/home stays inside it, never escaping to the master hub.
 *
 * The native app sets it as a URL param (a locked contract, like the theme params):
 *   /#/journey/preparation?scope=preparation&primary=...
 *   /#/track/va?scope=track:va&primary=...        (future: scope by loan track)
 *
 * The param rides along on every internal link (see `lib/navigation.tsx`), so the
 * whole session stays scoped. Absent/invalid → unscoped (full master experience).
 */
export interface Scope {
  kind: 'journey' | 'track';
  slug: string;
  rootPath: string;
  label: string;
}

export const SCOPE_PARAM_KEY = 'scope';

export function parseScope(params: URLSearchParams): Scope | null {
  const raw = params.get(SCOPE_PARAM_KEY);
  if (!raw) return null;

  if (raw.startsWith('track:')) {
    const slug = raw.slice('track:'.length);
    if ((TRACK_SLUGS as string[]).includes(slug)) {
      return { kind: 'track', slug, rootPath: `/track/${slug}`, label: trackLabel(slug as TrackSlug) };
    }
    return null;
  }

  if ((JOURNEY_SLUGS as string[]).includes(raw)) {
    return {
      kind: 'journey',
      slug: raw,
      rootPath: `/journey/${raw}`,
      label: journeyLabel(raw as JourneyCategorySlug),
    };
  }
  return null;
}

export function useScope(): Scope | null {
  const [params] = useSearchParams();
  return useMemo(() => parseScope(params), [params]);
}
