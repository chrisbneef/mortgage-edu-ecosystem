import { Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/nav/AppShell';
import { HubPage } from './HubPage';
import { JourneyPage } from './JourneyPage';
import { TrackPage } from './TrackPage';
import { PodcastsPage } from './PodcastsPage';
import { GlossaryIndexPage, GlossaryTermPage } from './GlossaryPage';
import { SearchPage } from './SearchPage';
import { ContentDetailPage } from './ContentDetailPage';
import { NotFound } from './NotFound';

/**
 * Route map. One canonical id-based detail route (/g/:id) is the deep-link target;
 * every other route is a browse "doorway" that links into it carrying ?from= context.
 */
export function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HubPage />} />
        <Route path="/journey/:category" element={<JourneyPage />} />
        <Route path="/track/:track" element={<TrackPage />} />
        <Route path="/podcasts" element={<PodcastsPage />} />
        <Route path="/glossary" element={<GlossaryIndexPage />} />
        <Route path="/glossary/:term" element={<GlossaryTermPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/g/:id" element={<ContentDetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
