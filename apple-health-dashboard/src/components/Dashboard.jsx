import React, { useState, useMemo } from 'react';
import MetricCard from './MetricCard';
import HealthChart from './HealthChart';
import DateRangeFilter from './DateRangeFilter';
import { METRIC_TYPES } from '../utils/healthParser';

// Preferred display order
const METRIC_ORDER = [
  METRIC_TYPES.STEPS,
  METRIC_TYPES.HEART_RATE,
  METRIC_TYPES.RESTING_HEART_RATE,
  METRIC_TYPES.ACTIVE_ENERGY,
  METRIC_TYPES.DISTANCE_WALKING,
  METRIC_TYPES.EXERCISE_TIME,
  METRIC_TYPES.SLEEP,
  METRIC_TYPES.BLOOD_OXYGEN,
  METRIC_TYPES.FLIGHTS_CLIMBED,
  METRIC_TYPES.BODY_MASS,
  METRIC_TYPES.RESPIRATORY_RATE,
  METRIC_TYPES.BASAL_ENERGY,
  METRIC_TYPES.WALKING_SPEED,
];

export default function Dashboard({ healthData, fileName, onReset, isDemo }) {
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // Sort metrics by preferred order, then alphabetical for unknowns
  const sortedMetrics = useMemo(() => {
    const keys = Object.keys(healthData);
    return keys.sort((a, b) => {
      const ai = METRIC_ORDER.indexOf(a);
      const bi = METRIC_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [healthData]);

  const activeMetric = selectedMetric || sortedMetrics[0];
  const activeData = healthData[activeMetric];

  // Summary counts
  const totalDays = useMemo(() => {
    const allDates = new Set();
    Object.values(healthData).forEach((m) => m.daily?.forEach((d) => allDates.add(d.date)));
    return allDates.size;
  }, [healthData]);

  const dateRangeLabel = useMemo(() => {
    const allDates = [];
    Object.values(healthData).forEach((m) => m.daily?.forEach((d) => allDates.push(d.date)));
    if (!allDates.length) return '';
    allDates.sort();
    const first = allDates[0];
    const last = allDates[allDates.length - 1];
    const fmt = (s) => {
      const [y, m, d] = s.split('-');
      const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      return `${d} ${months[parseInt(m) - 1]} ${y}`;
    };
    return `${fmt(first)} – ${fmt(last)}`;
  }, [healthData]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0f1117] z-10 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="text-xl">🍎</span>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Apple Health Dashboard</h1>
            {isDemo ? (
              <span className="text-xs text-orange-400">Demo veriler</span>
            ) : (
              <span className="text-xs text-gray-500 truncate max-w-xs block">{fileName}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
            <span><span className="text-gray-300 font-medium">{sortedMetrics.length}</span> metrik</span>
            <span><span className="text-gray-300 font-medium">{totalDays}</span> gün</span>
            <span className="text-gray-600">{dateRangeLabel}</span>
          </div>
          <button
            onClick={onReset}
            className="text-xs text-gray-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-gray-800 hover:border-gray-600"
          >
            ← Geri
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: metric cards */}
        <aside className="w-72 flex-shrink-0 border-r border-gray-800 overflow-y-auto p-3 space-y-2">
          <div className="text-xs text-gray-600 px-1 py-1 font-medium uppercase tracking-wider">
            Metrikler
          </div>
          {sortedMetrics.map((type) => {
            const m = healthData[type];
            return (
              <MetricCard
                key={type}
                label={m.label}
                unit={m.unit}
                color={m.color}
                stats={m.stats}
                isSelected={activeMetric === type}
                onClick={() => setSelectedMetric(type)}
              />
            );
          })}
        </aside>

        {/* Main content: chart */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Date filter bar */}
          <div className="border-b border-gray-800 px-6 py-3 flex items-center gap-4 flex-wrap">
            <DateRangeFilter dateRange={dateRange} onChange={setDateRange} />
          </div>

          {/* Chart area */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeData && (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Son Değer', value: activeData.stats?.latest, suffix: activeData.unit },
                    { label: 'Ortalama', value: activeData.stats?.avg, suffix: activeData.unit },
                    { label: 'En Yüksek', value: activeData.stats?.max, suffix: activeData.unit },
                    { label: 'En Düşük', value: activeData.stats?.min, suffix: activeData.unit },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                      <div className="text-xs text-gray-500 mb-1">{s.label}</div>
                      <div className="text-xl font-bold text-white">
                        {s.value?.toLocaleString('tr-TR')}
                        <span className="text-sm text-gray-400 font-normal ml-1">{s.suffix}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Main chart */}
                <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                  <HealthChart
                    data={activeData.daily}
                    label={activeData.label}
                    unit={activeData.unit}
                    color={activeData.color}
                    dateRange={dateRange}
                  />
                </div>

                {/* Mini charts grid for other metrics */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sortedMetrics
                    .filter((t) => t !== activeMetric)
                    .slice(0, 4)
                    .map((type) => {
                      const m = healthData[type];
                      return (
                        <div
                          key={type}
                          className="bg-gray-900 rounded-xl p-4 border border-gray-800 cursor-pointer hover:border-gray-700 transition-colors"
                          onClick={() => setSelectedMetric(type)}
                        >
                          <HealthChart
                            data={m.daily}
                            label={m.label}
                            unit={m.unit}
                            color={m.color}
                            dateRange={dateRange}
                          />
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
