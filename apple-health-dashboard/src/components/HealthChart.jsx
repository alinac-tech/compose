import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Brush,
} from 'recharts';

function formatAxisDate(dateStr) {
  if (!dateStr) return '';
  const [, month, day] = dateStr.split('-');
  return `${day}/${month}`;
}

function formatTooltipDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${day} ${months[parseInt(month) - 1]} ${year}`;
}

const CustomTooltip = ({ active, payload, label, unit, color }) => {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0]?.value;
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm shadow-xl"
      style={{ background: '#1e2130', border: `1px solid ${color}40` }}
    >
      <div className="text-gray-400 text-xs mb-1">{formatTooltipDate(label)}</div>
      <div className="font-bold text-white">
        {val?.toLocaleString('tr-TR')}
        <span className="text-gray-400 font-normal ml-1">{unit}</span>
      </div>
    </div>
  );
};

export default function HealthChart({ data, label, unit, color, dateRange }) {
  const filteredData = useMemo(() => {
    if (!data || !data.length) return [];
    let d = [...data];
    if (dateRange?.start) d = d.filter((r) => r.date >= dateRange.start);
    if (dateRange?.end) d = d.filter((r) => r.date <= dateRange.end);
    return d;
  }, [data, dateRange]);

  const avg = useMemo(() => {
    if (!filteredData.length) return null;
    const sum = filteredData.reduce((a, b) => a + b.value, 0);
    return Math.round((sum / filteredData.length) * 10) / 10;
  }, [filteredData]);

  if (!filteredData.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-600">
        Bu tarih aralığında veri yok
      </div>
    );
  }

  const tickCount = Math.min(8, filteredData.length);
  const step = Math.max(1, Math.floor(filteredData.length / tickCount));
  const ticks = filteredData
    .filter((_, i) => i % step === 0)
    .map((d) => d.date);

  const values = filteredData.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = (maxVal - minVal) * 0.1 || 1;

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 px-1">
        <h2 className="text-lg font-semibold text-white">{label}</h2>
        <span className="text-sm text-gray-500">
          {filteredData.length} gün • Ort:{' '}
          <span className="text-gray-300">
            {avg?.toLocaleString('tr-TR')} {unit}
          </span>
        </span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tickFormatter={formatAxisDate}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[minVal - padding, maxVal + padding]}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v) => v.toLocaleString('tr-TR')}
          />
          <Tooltip
            content={<CustomTooltip unit={unit} color={color} />}
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          {avg !== null && (
            <ReferenceLine
              y={avg}
              stroke={color}
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{ value: `Ort`, fill: color, fontSize: 10, position: 'insideTopRight' }}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${label})`}
            dot={filteredData.length < 30 ? { fill: color, r: 3, strokeWidth: 0 } : false}
            activeDot={{ fill: color, r: 4, strokeWidth: 0 }}
          />
          {filteredData.length > 60 && (
            <Brush
              dataKey="date"
              height={20}
              stroke={color}
              strokeOpacity={0.4}
              fill="#0f1117"
              travellerWidth={6}
              tickFormatter={formatAxisDate}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
