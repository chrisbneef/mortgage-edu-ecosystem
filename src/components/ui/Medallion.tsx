import type { ReactNode } from 'react';

/**
 * Circular medallion that echoes the host apps' badge motif, but segmented into
 * `segments` arcs (one per homebuyer-journey stage). Stroke uses the themed primary,
 * the track uses a faint primary tint — so it recolors with whatever host wraps it.
 */
export function Medallion({
  segments = 5,
  size = 132,
  stroke = 7,
  children,
}: {
  segments?: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gap = 7; // px gap between segments
  const seg = c / segments - gap;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--primary) / 0.12)"
          strokeWidth={stroke}
        />
        {Array.from({ length: segments }).map((_, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${seg} ${c - seg}`}
            strokeDashoffset={-(i * (c / segments))}
            className="origin-center"
            style={{
              animation: 'rise 0.6s cubic-bezier(0.16,1,0.3,1) both',
              animationDelay: `${0.1 + i * 0.07}s`,
            }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
