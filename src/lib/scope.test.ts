import { describe, it, expect } from 'vitest';
import { parseScope } from './scope';

describe('parseScope', () => {
  it('returns null when no scope param', () => {
    expect(parseScope(new URLSearchParams())).toBeNull();
  });

  it('parses a valid journey-category scope', () => {
    const s = parseScope(new URLSearchParams('scope=preparation'));
    expect(s).toEqual({
      kind: 'journey',
      slug: 'preparation',
      rootPath: '/journey/preparation',
      label: 'Preparation & Financial Foundation',
    });
  });

  it('parses a valid track scope', () => {
    const s = parseScope(new URLSearchParams('scope=track:va'));
    expect(s).toMatchObject({ kind: 'track', slug: 'va', rootPath: '/track/va' });
  });

  it('rejects unknown category / track (falls back to unscoped)', () => {
    expect(parseScope(new URLSearchParams('scope=not-a-category'))).toBeNull();
    expect(parseScope(new URLSearchParams('scope=track:nope'))).toBeNull();
  });
});
