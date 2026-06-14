import { z } from 'zod';
import { JOURNEY_SLUGS, TRACK_SLUGS, CONTENT_TYPES } from './taxonomies';

/**
 * The frontmatter contract for every guide/podcast. Validated at load time so a
 * malformed content file fails loudly in dev rather than rendering broken.
 * `journeyCategory` is single; `tracks` is many — this is the multi-taxonomy core.
 */
export const ContentFrontmatterSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'id must be kebab-case'),
  title: z.string().min(1),
  summary: z.string().min(1),
  contentType: z.enum(CONTENT_TYPES),

  journeyCategory: z.enum(JOURNEY_SLUGS as [string, ...string[]]),
  journeyOrder: z.number().default(100),
  tracks: z.array(z.enum(TRACK_SLUGS as [string, ...string[]])).default([]),

  tags: z.array(z.string()).default([]),
  glossaryTerms: z.array(z.string()).default([]),

  audio: z
    .object({
      src: z.string().url(),
      durationSec: z.number().positive(),
    })
    .optional(),

  estReadMin: z.number().positive().optional(),
  estListenMin: z.number().positive().optional(),

  disclosures: z.array(z.string()).default([]),
  disclaimer: z.string().optional(),
  lastReviewed: z.string().optional(),
  reviewedBy: z.string().optional(),

  status: z.enum(['draft', 'published', 'archived']).default('published'),
  featured: z.boolean().default(false),
  relatedIds: z.array(z.string()).default([]),
});

export type ContentFrontmatter = z.infer<typeof ContentFrontmatterSchema>;

export interface ContentEntry extends ContentFrontmatter {
  /** Lazy loader for the MDX body component. */
  load: () => Promise<{ default: React.ComponentType }>;
}
