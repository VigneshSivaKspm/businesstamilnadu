import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { districtService } from '@/services';
import type { District } from '@/types';

/**
 * Abstract statewide network: every district headquarters plotted from its
 * real coordinates and linked to its nearest neighbours. Reads as Tamil Nadu
 * without resorting to tourism imagery.
 */
const BOUNDS = { minLat: 7.9, maxLat: 13.45, minLng: 76.35, maxLng: 80.45 };
const WIDTH = 400;
const HEIGHT = 520;
const PAD = 28;

const project = (d: Pick<District, 'latitude' | 'longitude'>) => ({
  x: PAD + ((d.longitude - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * (WIDTH - PAD * 2),
  y: PAD + ((BOUNDS.maxLat - d.latitude) / (BOUNDS.maxLat - BOUNDS.minLat)) * (HEIGHT - PAD * 2),
});

const LABELLED = new Set(['chennai', 'coimbatore', 'madurai', 'tiruchirappalli', 'salem', 'vellore']);
const PULSING = new Set(['chennai', 'coimbatore', 'madurai']);

export function StateNetworkMap({ className }: { className?: string }) {
  const { nodes, edges } = useMemo(() => {
    const all = districtService.getAll().map((d) => ({ district: d, ...project(d) }));
    const seen = new Set<string>();
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number; strong: boolean }> = [];
    for (const node of all) {
      const nearest = all
        .filter((o) => o !== node)
        .map((o) => ({ o, dist: Math.hypot(o.x - node.x, o.y - node.y) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3);
      for (const { o } of nearest) {
        const key = [node.district.slug, o.district.slug].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        lines.push({
          x1: node.x,
          y1: node.y,
          x2: o.x,
          y2: o.y,
          strong: node.district.featured && o.district.featured,
        });
      }
    }
    return { nodes: all, edges: lines };
  }, []);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={className} role="img" aria-labelledby="tn-map-title">
      <title id="tn-map-title">Network of all 38 districts of Tamil Nadu</title>
      <defs>
        <radialGradient id="map-glow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#3b74f5" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#3b74f5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={WIDTH * 0.55} cy={HEIGHT * 0.48} rx={WIDTH * 0.48} ry={HEIGHT * 0.46} fill="url(#map-glow)" />

      <g strokeLinecap="round">
        {edges.map((e, i) => (
          <line
            key={i}
            {...e}
            stroke={e.strong ? '#e0a93b' : '#97abd3'}
            strokeOpacity={e.strong ? 0.55 : 0.22}
            strokeWidth={e.strong ? 1.2 : 0.8}
          />
        ))}
      </g>

      {nodes.map(({ district, x, y }) => {
        const labelled = LABELLED.has(district.slug);
        const featured = district.featured;
        const labelLeft = x > WIDTH * 0.62;
        return (
          <Link key={district.slug} to={`/district/${district.slug}`} aria-label={`Businesses in ${district.name}`} className="group outline-none">
            {PULSING.has(district.slug) && (
              <circle cx={x} cy={y} r={4} fill="#e0a93b" className="animate-pulse-ring origin-center [transform-box:fill-box]" />
            )}
            <circle cx={x} cy={y} r={12} fill="transparent" />
            <circle
              cx={x}
              cy={y}
              r={featured ? 4.2 : 2.6}
              fill={featured ? '#e0a93b' : '#c4d0e8'}
              className="transition-[r] duration-200 group-hover:[r:6] group-focus-visible:[r:6]"
            />
            {featured && <circle cx={x} cy={y} r={8} fill="none" stroke="#e0a93b" strokeOpacity={0.35} />}
            <text
              x={labelLeft ? x - 12 : x + 12}
              y={y + 4}
              textAnchor={labelLeft ? 'end' : 'start'}
              className={
                labelled
                  ? 'fill-white/80 text-[11px] font-semibold tracking-wide group-hover:fill-white'
                  : 'fill-white/0 text-[10px] font-medium group-hover:fill-white/90 group-focus-visible:fill-white/90'
              }
            >
              {district.name}
            </text>
          </Link>
        );
      })}
    </svg>
  );
}
