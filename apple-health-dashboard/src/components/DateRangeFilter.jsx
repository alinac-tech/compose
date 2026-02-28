import React from 'react';

const PRESETS = [
  { label: '7G', days: 7 },
  { label: '30G', days: 30 },
  { label: '90G', days: 90 },
  { label: '180G', days: 180 },
  { label: '1Y', days: 365 },
  { label: 'Tümü', days: null },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().substring(0, 10);
}

export default function DateRangeFilter({ dateRange, onChange }) {
  const activePreset = PRESETS.find((p) => {
    if (p.days === null) return !dateRange.start && !dateRange.end;
    return dateRange.start === daysAgo(p.days) && !dateRange.end;
  });

  const handlePreset = (preset) => {
    if (preset.days === null) {
      onChange({ start: null, end: null });
    } else {
      onChange({ start: daysAgo(preset.days), end: null });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-1 bg-gray-900 rounded-lg p-1 border border-gray-800">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => handlePreset(p)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
              activePreset?.label === p.label
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <input
          type="date"
          value={dateRange.start || ''}
          onChange={(e) => onChange({ ...dateRange, start: e.target.value || null })}
          className="bg-gray-900 border border-gray-800 rounded-md px-2 py-1 text-gray-300 text-xs"
        />
        <span>—</span>
        <input
          type="date"
          value={dateRange.end || ''}
          onChange={(e) => onChange({ ...dateRange, end: e.target.value || null })}
          className="bg-gray-900 border border-gray-800 rounded-md px-2 py-1 text-gray-300 text-xs"
        />
      </div>
    </div>
  );
}
