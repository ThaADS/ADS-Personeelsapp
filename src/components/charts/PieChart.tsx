'use client';

import { useMemo } from 'react';

interface DataPoint {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: DataPoint[];
  size?: number;
  showLegend?: boolean;
}

export function PieChart({ data, size = 200, showLegend = true }: PieChartProps) {
  const { paths, total } = useMemo(() => {
    const totalValue = data.reduce((sum, d) => sum + d.value, 0);
    if (totalValue === 0) return { paths: [], total: 0 };

    const radius = 45;
    const centerX = 50;
    const centerY = 50;
    let startAngle = -90; // Start from top

    const calculatedPaths = data.map((item) => {
      const percentage = item.value / totalValue;
      const angle = percentage * 360;
      const endAngle = startAngle + angle;

      // Calculate path
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      const result = {
        path,
        color: item.color,
        label: item.label,
        value: item.value,
        percentage,
      };

      startAngle = endAngle;
      return result;
    });

    return { paths: calculatedPaths, total: totalValue };
  }, [data]);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: size }}>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Geen gegevens beschikbaar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      {/* Pie Chart */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-0">
          {paths.map((item, index) => (
            <path
              key={index}
              d={item.path}
              fill={item.color}
              className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              stroke="white"
              strokeWidth={0.5}
            >
              <title>{`${item.label}: ${item.value} dagen (${Math.round(item.percentage * 100)}%)`}</title>
            </path>
          ))}

          {/* Center circle for donut effect */}
          <circle cx="50" cy="50" r="25" className="fill-white dark:fill-slate-800" />

          {/* Center text */}
          <text
            x="50"
            y="47"
            textAnchor="middle"
            className="fill-gray-900 dark:fill-white font-bold"
            style={{ fontSize: '10px' }}
          >
            {Math.round(total)}
          </text>
          <text
            x="50"
            y="57"
            textAnchor="middle"
            className="fill-gray-500 dark:fill-gray-400"
            style={{ fontSize: '5px' }}
          >
            dagen
          </text>
        </svg>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-col gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}d</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
