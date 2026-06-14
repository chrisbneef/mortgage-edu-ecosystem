import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { AudioProvider } from '@/components/audio/AudioPlayer';
import { AppRoutes } from '@/routes/router';

/**
 * HashRouter is used for zero-config static/WebView routing — deep links like
 * /#/g/:id resolve without any server rewrite rules. ThemeProvider lives inside
 * the router so it can read the (hash) query params on every navigation.
 */
export default function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <AudioProvider>
          <AppRoutes />
        </AudioProvider>
      </ThemeProvider>
    </HashRouter>
  );
}
