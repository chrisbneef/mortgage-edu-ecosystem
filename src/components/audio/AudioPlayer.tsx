import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';
import { trackEvent, postToNative } from '@/native/bridge';
import { cn } from '@/lib/utils';

/**
 * A SINGLE shared <audio> element lives in this provider so playback survives
 * client-side navigation and only one stream ever plays. iOS WKWebView requires
 * `playsinline` and a user gesture to start — play() is always called from a tap.
 */
interface AudioState {
  currentId: string | null;
  playing: boolean;
  position: number;
  duration: number;
  toggle: (id: string, src: string) => void;
  seek: (sec: number) => void;
}

const AudioCtx = createContext<AudioState | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = useCallback(
    (id: string, src: string) => {
      const el = ref.current;
      if (!el) return;
      if (currentId === id && playing) {
        el.pause();
        return;
      }
      if (currentId !== id) {
        el.src = src;
        setCurrentId(id);
      }
      void el.play().catch(() => setPlaying(false));
    },
    [currentId, playing],
  );

  const seek = useCallback((sec: number) => {
    if (ref.current) ref.current.currentTime = sec;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onPlay = () => {
      setPlaying(true);
      if (currentId) postToNative({ type: 'audio', action: 'play', id: currentId });
    };
    const onPause = () => {
      setPlaying(false);
      if (currentId) postToNative({ type: 'audio', action: 'pause', id: currentId });
    };
    const onTime = () => setPosition(el.currentTime);
    const onMeta = () => setDuration(el.duration || 0);
    const onEnded = () => {
      setPlaying(false);
      if (currentId) postToNative({ type: 'audio', action: 'ended', id: currentId });
    };
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onMeta);
    el.addEventListener('ended', onEnded);
    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onMeta);
      el.removeEventListener('ended', onEnded);
    };
  }, [currentId]);

  return (
    <AudioCtx.Provider value={{ currentId, playing, position, duration, toggle, seek }}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={ref} playsInline preload="none" />
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio(): AudioState {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}

function fmt(sec: number): string {
  if (!Number.isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Inline play control + scrubber for a single podcast episode. */
export function AudioControls({ id, src, durationSec }: { id: string; src: string; durationSec: number }) {
  const { currentId, playing, position, duration, toggle, seek } = useAudio();
  const active = currentId === id;
  const total = active && duration ? duration : durationSec;
  const pos = active ? position : 0;

  const ratio = total ? pos / total : 0;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card">
      <button
        aria-label={active && playing ? 'Pause' : 'Play'}
        onClick={() => {
          toggle(id, src);
          trackEvent('audio_toggle', { id });
        }}
        className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-card-hover transition-transform active:scale-95"
      >
        {active && playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-0.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-primary">
            {active && playing ? 'Now playing' : 'Episode'}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {fmt(pos)} / {fmt(total)}
          </span>
        </div>
        <div className="relative">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/12">
            <div className="h-full rounded-full bg-primary" style={{ width: `${ratio * 100}%` }} />
          </div>
          <input
            type="range"
            min={0}
            max={total || 1}
            value={pos}
            onChange={(e) => seek(Number(e.target.value))}
            className={cn(
              'absolute inset-0 h-1.5 w-full cursor-pointer opacity-0',
              !active && 'pointer-events-none',
            )}
            aria-label="Seek"
          />
        </div>
      </div>
    </div>
  );
}
