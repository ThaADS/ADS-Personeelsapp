'use client';

import { useMemo } from 'react';

interface DataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  showSecondary?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
}

export function BarChart({
  data,
  height = 200,
  showSecondary = false,
  primaryColor = '#8b5cf6',
  secondaryColor = '#ec4899',
  primaryLabel = 'Uren',
  secondaryLabel = 'Overuren',
}: BarChartProps) {
  const { maxValue, barWidth, gap } = useMemo(() => {
    const allValues = data.flatMap((d) => [d.value, d.secondaryValue || 0]);
    const max = Math.max(...allValues, 1);
    const width = Math.floor(100 / data.length);
    return {
      maxValue: max,
      barWidth: width - 1,
      gap: 1,
    };
  }, [data]);

  const chartHeight = height - 40; // Leave space for labels

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: primaryColor }} />
          <span className="text-gray-600 dark:text-gray-400">{primaryLabel}</span>
        </div>
        {showSecondary && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: secondaryColor }} />
            <span className="text-gray-600 dark:text-gray-400">{secondaryLabel}</span>
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

          {/* Bars */}
          {data.map((item, index) => {
            const x = index * (barWidth + gap) + gap / 2;
            const primaryHeight = (item.value / maxValue) * chartHeight;
            const secondaryHeight = showSecondary ? ((item.secondaryValue || 0) / maxValue) * chartHeight : 0;

            return (
              <g key={index}>
                {/* Primary bar */}
                <rect
                  x={x}
                  y={chartHeight - primaryHeight}
                  width={showSecondary ? barWidth / 2 - 0.2 : barWidth}
                  height={primaryHeight}
                  fill={primaryColor}
                  rx={0.5}
                  className="transition-all duration-300 hover:opacity-80"
                >
                  <title>{`${item.label}: ${item.value} ${primaryLabel.toLowerCase()}`}</title>
                </rect>

                {/* Secondary bar */}
                {showSecondary && (
                  <rect
                    x={x + barWidth / 2 + 0.2}
                    y={chartHeight - secondaryHeight}
                    width={barWidth / 2 - 0.2}
                    height={secondaryHeight}
                    fill={secondaryColor}
                    rx={0.5}
                    className="transition-all duration-300 hover:opacity-80"
                  >
                    <title>{`${item.label}: ${item.secondaryValue || 0} ${secondaryLabel.toLowerCase()}`}</title>
                  </rect>
                )}
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.map((item, index) => {
            const x = index * (barWidth + gap) + barWidth / 2 + gap / 2;
            return (
              <text
                key={index}
                x={x}
                y={height - 5}
                textAnchor="middle"
                className="fill-gray-500 dark:fill-gray-400"
                style={{ fontSize: '3px' }}
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
