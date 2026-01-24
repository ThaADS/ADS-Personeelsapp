'use client';

import { useMemo } from 'react';

interface DataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  tertiaryValue?: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  tertiaryLabel?: string;
  showArea?: boolean;
}

export function LineChart({
  data,
  height = 200,
  primaryColor = '#8b5cf6',
  secondaryColor = '#ec4899',
  tertiaryColor = '#06b6d4',
  primaryLabel = 'Uren',
  secondaryLabel = 'Verlof',
  tertiaryLabel = 'Ziekte',
  showArea = true,
}: LineChartProps) {
  const { maxValue, points, secondaryPoints, tertiaryPoints } = useMemo(() => {
    const allValues = data.flatMap((d) => [d.value, d.secondaryValue || 0, d.tertiaryValue || 0]);
    const max = Math.max(...allValues, 1);
    const chartHeight = height - 40;
    const chartWidth = 100;
    const padding = 2;

    const getPoints = (values: number[]) => {
      return values.map((value, index) => {
        const x = padding + (index / (values.length - 1 || 1)) * (chartWidth - padding * 2);
        const y = chartHeight - (value / max) * chartHeight;
        return { x, y, value };
      });
    };

    return {
      maxValue: max,
      points: getPoints(data.map((d) => d.value)),
      secondaryPoints: getPoints(data.map((d) => d.secondaryValue || 0)),
      tertiaryPoints: getPoints(data.map((d) => d.tertiaryValue || 0)),
    };
  }, [data, height]);

  const chartHeight = height - 40;

  const createPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  const createAreaPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    const linePath = createPath(pts);
    return `${linePath} L ${pts[pts.length - 1].x} ${chartHeight} L ${pts[0].x} ${chartHeight} Z`;
  };

  const hasSecondary = data.some((d) => (d.secondaryValue || 0) > 0);
  const hasTertiary = data.some((d) => (d.tertiaryValue || 0) > 0);

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: primaryColor }} />
          <span className="text-gray-600 dark:text-gray-400">{primaryLabel}</span>
        </div>
        {hasSecondary && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: secondaryColor }} />
            <span className="text-gray-600 dark:text-gray-400">{secondaryLabel}</span>
          </div>
        )}
        {hasTertiary && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: tertiaryColor }} />
            <span className="text-gray-600 dark:text-gray-400">{tertiaryLabel}</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="relative" style={{ height }}>
        <svg viewBox={`0 0 100 ${height}`} className="w-full h-full" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent) => (
            <line
              key={percent}
              x1="0"
              y1={chartHeight - (percent / 100) * chartHeight}
              x2="100"
              y2={chartHeight - (percent / 100) * chartHeight}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={0.2}
            />
          ))}

          {/* Areas */}
          {showArea && (
            <>
              <path d={createAreaPath(points)} fill={primaryColor} fillOpacity={0.1} />
              {hasSecondary && <path d={createAreaPath(secondaryPoints)} fill={secondaryColor} fillOpacity={0.1} />}
              {hasTertiary && <path d={createAreaPath(tertiaryPoints)} fill={tertiaryColor} fillOpacity={0.1} />}
            </>
          )}

          {/* Lines */}
          <path d={createPath(points)} fill="none" stroke={primaryColor} strokeWidth={0.8} strokeLinecap="round" />
          {hasSecondary && (
            <path
              d={createPath(secondaryPoints)}
              fill="none"
              stroke={secondaryColor}
              strokeWidth={0.8}
              strokeLinecap="round"
            />
          )}
          {hasTertiary && (
            <path
              d={createPath(tertiaryPoints)}
              fill="none"
              stroke={tertiaryColor}
              strokeWidth={0.8}
              strokeLinecap="round"
            />
          )}

          {/* Data points */}
          {points.map((point, index) => (
            <circle key={`primary-${index}`} cx={point.x} cy={point.y} r={1.2} fill={primaryColor}>
              <title>{`${data[index].label}: ${point.value} ${primaryLabel.toLowerCase()}`}</title>
            </circle>
          ))}
          {hasSecondary &&
            secondaryPoints.map((point, index) => (
              <circle key={`secondary-${index}`} cx={point.x} cy={point.y} r={1.2} fill={secondaryColor}>
                <title>{`${data[index].label}: ${point.value} ${secondaryLabel.toLowerCase()}`}</title>
              </circle>
            ))}
          {hasTertiary &&
            tertiaryPoints.map((point, index) => (
              <circle key={`tertiary-${index}`} cx={point.x} cy={point.y} r={1.2} fill={tertiaryColor}>
                <title>{`${data[index].label}: ${point.value} ${tertiaryLabel.toLowerCase()}`}</title>
              </circle>
            ))}

          {/* X-axis labels */}
          {data.map((item, index) => {
            const x = 2 + (index / (data.length - 1 || 1)) * 96;
            return (
              <text
                key={index}
                x={x}
                y={height - 5}
                textAnchor="middle"
                className="fill-gray-500 dark:fill-gray-400"
                style={{ fontSize: '3.5px' }}
              >
                {item.label}
              </text>
            );
          })}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 pointer-events-none -ml-8 w-6 text-right">
          <span>{Math.round(maxValue)}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
      </div>
    </div>
  );
}
