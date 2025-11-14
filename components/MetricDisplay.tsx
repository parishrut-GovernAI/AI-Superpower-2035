import React from 'react';

interface MetricDisplayProps {
  label: string;
  value: number | string;
  unit: string;
  max?: number;
  tooltipText?: string;
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({ label, value, unit, max, tooltipText }) => {
  const percentage = max && typeof value === 'number' ? (value / max) * 100 : 0;

  return (
    <div className="bg-gray-800/50 p-3 rounded-lg">
      <div className="flex justify-between items-baseline mb-1">
        <div className="relative group">
          <span className="text-sm font-medium text-gray-400 border-b border-dotted border-gray-500 cursor-help">{label}</span>
          {tooltipText && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 text-xs text-left text-white bg-gray-900 border border-gray-600 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10 pointer-events-none">
                {tooltipText}
            </div>
           )}
        </div>
        <span className="text-lg font-bold font-orbitron text-blue-400">
          {value}{unit}
        </span>
      </div>
      {max && (
        <div className="w-full bg-blue-900/50 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-250"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};