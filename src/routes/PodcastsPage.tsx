import { CollectionList } from '@/components/content/CollectionList';
import { byType } from '@/content/registry';

export function PodcastsPage() {
  return (
    <CollectionList
      eyebrow="Listen"
      title="Podcasts"
      description="Short, plain-English episodes on every part of the process."
      entries={byType('podcast')}
      from="podcasts"
    />
  );
}
