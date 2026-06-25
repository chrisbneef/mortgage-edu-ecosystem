import { CollectionList } from '@/components/content/CollectionList';
import { withAudio } from '@/content/registry';

export function PodcastsPage() {
  return (
    <CollectionList
      eyebrow="Listen"
      title="Podcasts"
      description="Two-host audio deep dives on every part of the process."
      entries={withAudio()}
      from="podcasts"
    />
  );
}
