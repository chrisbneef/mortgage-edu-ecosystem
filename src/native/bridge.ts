/**
 * Thin abstraction over the native WebView bridge. Feature-detects iOS WKWebView,
 * Android, and React Native channels; no-ops in a plain browser. Used for analytics,
 * audio events, and syncing native chrome (status bar color) to the theme.
 */
type NativeEvent =
  | { type: 'ready' }
  | { type: 'navigate'; path: string }
  | { type: 'analytics'; name: string; props?: Record<string, unknown> }
  | { type: 'audio'; action: 'play' | 'pause' | 'ended' | 'progress'; id: string; positionSec?: number }
  | { type: 'theme'; bg: string; mode: string };

interface IOSBridge {
  webkit?: { messageHandlers?: Record<string, { postMessage(msg: unknown): void }> };
}
interface AndroidBridge {
  AndroidBridge?: { postMessage(msg: string): void };
}
interface RNBridge {
  ReactNativeWebView?: { postMessage(msg: string): void };
}

type BridgeWindow = Window & IOSBridge & AndroidBridge & RNBridge;

export function postToNative(event: NativeEvent): void {
  if (typeof window === 'undefined') return;
  const w = window as BridgeWindow;
  const payload = JSON.stringify(event);
  try {
    const handler = w.webkit?.messageHandlers?.pam;
    if (handler) return handler.postMessage(event);
    if (w.AndroidBridge) return w.AndroidBridge.postMessage(payload);
    if (w.ReactNativeWebView) return w.ReactNativeWebView.postMessage(payload);
  } catch {
    /* bridge unavailable — non-fatal */
  }
}

/** Keep the native status bar / browser chrome in sync with the themed background. */
export function syncNativeChrome(bgHex: string, theme: string): void {
  if (typeof document !== 'undefined') {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', bgHex);
  }
  postToNative({ type: 'theme', bg: bgHex, mode: theme });
}

export function trackEvent(name: string, props?: Record<string, unknown>): void {
  postToNative({ type: 'analytics', name, props });
}

/**
 * Lets native trigger an in-WebView back navigation (Android hardware back button).
 * Native calls window.__webBack(); returns true if web history handled it.
 */
export function installBackBridge(): void {
  if (typeof window === 'undefined') return;
  (window as unknown as { __webBack?: () => boolean }).__webBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return true;
    }
    return false;
  };
}
