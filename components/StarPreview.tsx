'use client';

import { useId } from 'react';
import type { StarConfig } from '@/types/star';
import { buildStarPaths, buildInnerPolygonPath } from '@/lib/star-geometry';

const VIEWBOX_SIZE = 500;
const CX = VIEWBOX_SIZE / 2;
const CY = VIEWBOX_SIZE / 2;

interface StarPreviewProps {
  config: StarConfig;
  className?: string;
  style?: React.CSSProperties;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

function dashArray(dash: StarConfig['strokeDash']): string | undefined {
  if (dash === 'dashed') return '12,8';
  if (dash === 'dotted') return '2,8';
  return undefined;
}

export default function StarPreview({ config, className, style, svgRef }: StarPreviewProps) {
  const id = useId().replace(/:/g, '_');
  const gradId = `grad_${id}`;
  const filterId = `filter_${id}`;
  const hasFilter = config.glowRadius > 0 || config.shadowBlur > 0;

  const paths = buildStarPaths(CX, CY, config);
  const innerPath = config.showInnerPolygon ? buildInnerPolygonPath(CX, CY, config) : null;

  // Determine fill attribute
  function getFill(index: number): string {
    if (config.fillType === 'none') return 'none';
    if (config.fillType === 'solid') return config.fillColor;

    // For concentric, each ring gets its own gradient stop color
    if (config.starType === 'concentric') {
      const stops = config.gradientColors;
      return stops[index % stops.length] ?? config.fillColor;
    }
    return `url(#${gradId})`;
  }

  // Gradient angle
  function gradientCoords() {
    const dir = config.gradientDirection;
    if (dir === 'to-bottom') return { x1: '0%', y1: '0%', x2: '0%', y2: '100%' };
    if (dir === 'to-right') return { x1: '0%', y1: '50%', x2: '100%', y2: '50%' };
    if (dir === 'to-bottom-right') return { x1: '0%', y1: '0%', x2: '100%', y2: '100%' };
    if (dir === 'to-top-right') return { x1: '0%', y1: '100%', x2: '100%', y2: '0%' };
    return { x1: '0%', y1: '0%', x2: '100%', y2: '100%' };
  }

  const isOverlapping = ['3-triangles', '3-rhombuses', '3-squares'].includes(config.starType);
  const isMultiPath = isOverlapping || config.starType === 'compound' || config.starType === 'concentric' || config.starType === 'mandala';

  const strokeProps = {
    stroke: config.strokeWidth > 0 ? config.strokeColor : 'none',
    strokeWidth: config.strokeWidth,
    strokeDasharray: dashArray(config.strokeDash),
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Nine-pointed star preview"
      role="img"
    >
      <defs>
        {/* Gradient */}
        {config.fillType === 'linear-gradient' && (
          <linearGradient id={gradId} {...gradientCoords()} gradientUnits="objectBoundingBox">
            {config.gradientColors.map((color, i) => (
              <stop
                key={i}
                offset={`${(i / (config.gradientColors.length - 1)) * 100}%`}
                stopColor={color}
              />
            ))}
          </linearGradient>
        )}
        {config.fillType === 'radial-gradient' && (
          <radialGradient id={gradId} cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            {config.gradientColors.map((color, i) => (
              <stop
                key={i}
                offset={`${(i / (config.gradientColors.length - 1)) * 100}%`}
                stopColor={color}
              />
            ))}
          </radialGradient>
        )}

        {/* Glow / Shadow filter */}
        {hasFilter && (
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            {config.glowRadius > 0 && (
              <>
                <feGaussianBlur in="SourceGraphic" stdDeviation={config.glowRadius} result="blur" />
                <feFlood floodColor={config.glowColor} result="glowColor" />
                <feComposite in="glowColor" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </>
            )}
            {config.shadowBlur > 0 && config.glowRadius === 0 && (
              <feDropShadow
                dx={config.shadowOffsetX}
                dy={config.shadowOffsetY}
                stdDeviation={config.shadowBlur}
                floodColor={config.shadowColor}
              />
            )}
          </filter>
        )}
      </defs>

      {/* Background */}
      {config.bgColor !== 'transparent' && (
        <rect width={VIEWBOX_SIZE} height={VIEWBOX_SIZE} fill={config.bgColor} />
      )}

      {/* Star paths */}
      <g
        fillRule={isOverlapping ? config.fillRule : 'nonzero'}
        opacity={config.fillOpacity}
        filter={hasFilter ? `url(#${filterId})` : undefined}
      >
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill={getFill(i)}
            {...strokeProps}
          />
        ))}
      </g>

      {/* Inner polygon overlay */}
      {innerPath && (
        <path
          d={innerPath}
          fill={config.innerPolygonColor}
          stroke="none"
        />
      )}
    </svg>
  );
}
