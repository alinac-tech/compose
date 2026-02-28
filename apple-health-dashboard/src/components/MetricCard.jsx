import React from 'react';

const TrendArrow = ({ trend }) => {
  if (trend === null || trend === undefined) return null;
  const isPositive = trend > 0;
  const color = isPositive ? 'text-emerald-400' : 'text-red-400';
  return (
    <span className={`text-xs font-semibold flex items-center gap-0.5 ${color}`}>
      {isPositive ? '▲' : '▼'} {Math.abs(trend)}%
      <span className="text-gray-500 font-normal ml-1">son 7 gün</span>
    </span>
  );
};

export default function MetricCard({ label, unit, color, stats, onClick, isSelected }) {
  if (!stats) return null;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl p-4 transition-all duration-200 border cursor-pointer
        ${isSelected
          ? 'border-opacity-60 bg-opacity-20 scale-[1.02]'
          : 'border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-800'
        }`}
      style={{
        borderColor: isSelected ? color : undefined,
        backgroundColor: isSelected ? `${color}18` : undefined,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1 ml-2">
          <div className="text-xs text-gray-400 leading-tight">{label}</div>
        </div>
        {stats.trend !== null && <TrendArrow trend={stats.trend} />}
      </div>

      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl font-bold text-white tabular-nums">
          {stats.latest?.toLocaleString('tr-TR')}
        </span>
        <span className="text-sm text-gray-400">{unit}</span>
      </div>

      <div className="flex gap-3 text-xs text-gray-500">
        <span>Ort: <span className="text-gray-300">{stats.avg?.toLocaleString('tr-TR')}</span></span>
        <span>Max: <span className="text-gray-300">{stats.max?.toLocaleString('tr-TR')}</span></span>
        <span>Min: <span className="text-gray-300">{stats.min?.toLocaleString('tr-TR')}</span></span>
      </div>
    </button>
  );
}
