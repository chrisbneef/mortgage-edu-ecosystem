import { useParams } from 'react-router-dom';
import { CollectionList } from '@/components/content/CollectionList';
import { byJourney } from '@/content/registry';
import { JOURNEY_CATEGORIES, JOURNEY_SLUGS, type JourneyCategorySlug } from '@/content/taxonomies';
import { NotFound } from './NotFound';

export function JourneyPage() {
  const { category } = useParams();
  if (!category || !(JOURNEY_SLUGS as string[]).includes(category)) return <NotFound />;
  const slug = category as JourneyCategorySlug;
  const meta = JOURNEY_CATEGORIES.find((c) => c.slug === slug)!;

  return (
    <CollectionList
      eyebrow={`Stage ${meta.order} of ${JOURNEY_CATEGORIES.length}`}
      title={meta.label}
      entries={byJourney(slug)}
      from={`journey:${slug}`}
    />
  );
}
