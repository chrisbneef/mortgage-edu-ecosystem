import { useParams } from 'react-router-dom';
import { CollectionList } from '@/components/content/CollectionList';
import { byTrack } from '@/content/registry';
import { TRACKS, TRACK_SLUGS, type TrackSlug } from '@/content/taxonomies';
import { NotFound } from './NotFound';

export function TrackPage() {
  const { track } = useParams();
  if (!track || !(TRACK_SLUGS as string[]).includes(track)) return <NotFound />;
  const slug = track as TrackSlug;
  const meta = TRACKS.find((t) => t.slug === slug)!;

  return (
    <CollectionList
      eyebrow="Loan track"
      title={meta.label}
      description={meta.blurb}
      entries={byTrack(slug)}
      from={`track:${slug}`}
    />
  );
}
