/**
 * Apple Health export.xml parser
 * Parses the XML exported from Apple Health and extracts key metrics.
 */

// Metric type identifiers used in Apple Health export
export const METRIC_TYPES = {
  STEPS: 'HKQuantityTypeIdentifierStepCount',
  HEART_RATE: 'HKQuantityTypeIdentifierHeartRate',
  RESTING_HEART_RATE: 'HKQuantityTypeIdentifierRestingHeartRate',
  ACTIVE_ENERGY: 'HKQuantityTypeIdentifierActiveEnergyBurned',
  BASAL_ENERGY: 'HKQuantityTypeIdentifierBasalEnergyBurned',
  DISTANCE_WALKING: 'HKQuantityTypeIdentifierDistanceWalkingRunning',
  FLIGHTS_CLIMBED: 'HKQuantityTypeIdentifierFlightsClimbed',
  EXERCISE_TIME: 'HKQuantityTypeIdentifierAppleExerciseTime',
  STAND_HOURS: 'HKCategoryTypeIdentifierAppleStandHour',
  SLEEP: 'HKCategoryTypeIdentifierSleepAnalysis',
  BLOOD_OXYGEN: 'HKQuantityTypeIdentifierOxygenSaturation',
  RESPIRATORY_RATE: 'HKQuantityTypeIdentifierRespiratoryRate',
  BODY_MASS: 'HKQuantityTypeIdentifierBodyMass',
  HEIGHT: 'HKQuantityTypeIdentifierHeight',
  WALKING_SPEED: 'HKQuantityTypeIdentifierWalkingSpeed',
};

// Human-readable labels for metrics
export const METRIC_LABELS = {
  [METRIC_TYPES.STEPS]: 'Adım Sayısı',
  [METRIC_TYPES.HEART_RATE]: 'Kalp Atışı',
  [METRIC_TYPES.RESTING_HEART_RATE]: 'Dinlenme Kalp Atışı',
  [METRIC_TYPES.ACTIVE_ENERGY]: 'Aktif Kalori',
  [METRIC_TYPES.BASAL_ENERGY]: 'Bazal Kalori',
  [METRIC_TYPES.DISTANCE_WALKING]: 'Yürüme/Koşma Mesafesi',
  [METRIC_TYPES.FLIGHTS_CLIMBED]: 'Çıkılan Kat',
  [METRIC_TYPES.EXERCISE_TIME]: 'Egzersiz Süresi',
  [METRIC_TYPES.SLEEP]: 'Uyku',
  [METRIC_TYPES.BLOOD_OXYGEN]: 'Kan Oksijeni',
  [METRIC_TYPES.RESPIRATORY_RATE]: 'Solunum Hızı',
  [METRIC_TYPES.BODY_MASS]: 'Vücut Ağırlığı',
  [METRIC_TYPES.WALKING_SPEED]: 'Yürüme Hızı',
};

export const METRIC_UNITS = {
  [METRIC_TYPES.STEPS]: 'adım',
  [METRIC_TYPES.HEART_RATE]: 'bpm',
  [METRIC_TYPES.RESTING_HEART_RATE]: 'bpm',
  [METRIC_TYPES.ACTIVE_ENERGY]: 'kcal',
  [METRIC_TYPES.BASAL_ENERGY]: 'kcal',
  [METRIC_TYPES.DISTANCE_WALKING]: 'km',
  [METRIC_TYPES.FLIGHTS_CLIMBED]: 'kat',
  [METRIC_TYPES.EXERCISE_TIME]: 'dk',
  [METRIC_TYPES.SLEEP]: 'saat',
  [METRIC_TYPES.BLOOD_OXYGEN]: '%',
  [METRIC_TYPES.RESPIRATORY_RATE]: '/dk',
  [METRIC_TYPES.BODY_MASS]: 'kg',
  [METRIC_TYPES.WALKING_SPEED]: 'km/s',
};

export const METRIC_COLORS = {
  [METRIC_TYPES.STEPS]: '#f97316',
  [METRIC_TYPES.HEART_RATE]: '#ef4444',
  [METRIC_TYPES.RESTING_HEART_RATE]: '#f87171',
  [METRIC_TYPES.ACTIVE_ENERGY]: '#a855f7',
  [METRIC_TYPES.BASAL_ENERGY]: '#c084fc',
  [METRIC_TYPES.DISTANCE_WALKING]: '#22c55e',
  [METRIC_TYPES.FLIGHTS_CLIMBED]: '#84cc16',
  [METRIC_TYPES.EXERCISE_TIME]: '#06b6d4',
  [METRIC_TYPES.SLEEP]: '#6366f1',
  [METRIC_TYPES.BLOOD_OXYGEN]: '#38bdf8',
  [METRIC_TYPES.RESPIRATORY_RATE]: '#fb923c',
  [METRIC_TYPES.BODY_MASS]: '#e879f9',
  [METRIC_TYPES.WALKING_SPEED]: '#34d399',
};

function formatDate(dateStr) {
  // Apple Health format: "2023-01-15 08:32:00 +0300"
  return dateStr ? dateStr.substring(0, 10) : null;
}

function parseRecords(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const records = doc.querySelectorAll('Record');
  const workouts = doc.querySelectorAll('Workout');

  const rawData = {};

  records.forEach((record) => {
    const type = record.getAttribute('type');
    const value = parseFloat(record.getAttribute('value'));
    const unit = record.getAttribute('unit');
    const startDate = formatDate(record.getAttribute('startDate'));
    const endDate = formatDate(record.getAttribute('endDate'));

    if (!type || !startDate || isNaN(value)) return;
    if (!rawData[type]) rawData[type] = [];

    rawData[type].push({ date: startDate, endDate, value, unit });
  });

  // Parse sleep analysis separately (categorical)
  const sleepRaw = doc.querySelectorAll(`Record[type="${METRIC_TYPES.SLEEP}"]`);
  const sleepByDate = {};
  sleepRaw.forEach((r) => {
    const value = r.getAttribute('value');
    const startDate = r.getAttribute('startDate');
    const endDate = r.getAttribute('endDate');
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    // Only count "asleep" states
    if (value && (value.includes('Asleep') || value === 'HKCategoryValueSleepAnalysisAsleep')) {
      const durationHours = (end - start) / (1000 * 60 * 60);
      const dateKey = formatDate(startDate);
      sleepByDate[dateKey] = (sleepByDate[dateKey] || 0) + durationHours;
    }
  });

  rawData[METRIC_TYPES.SLEEP] = Object.entries(sleepByDate).map(([date, value]) => ({
    date,
    value: Math.round(value * 10) / 10,
    unit: 'hr',
  }));

  return rawData;
}

function aggregateByDay(records, aggregation = 'sum') {
  const byDate = {};
  records.forEach(({ date, value }) => {
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(value);
  });

  return Object.entries(byDate)
    .map(([date, values]) => {
      let agg;
      if (aggregation === 'sum') {
        agg = values.reduce((a, b) => a + b, 0);
      } else if (aggregation === 'avg') {
        agg = values.reduce((a, b) => a + b, 0) / values.length;
      } else if (aggregation === 'max') {
        agg = Math.max(...values);
      } else if (aggregation === 'min') {
        agg = Math.min(...values);
      }
      return { date, value: Math.round(agg * 10) / 10 };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Which metrics to sum vs average
const AGGREGATION_MAP = {
  [METRIC_TYPES.STEPS]: 'sum',
  [METRIC_TYPES.HEART_RATE]: 'avg',
  [METRIC_TYPES.RESTING_HEART_RATE]: 'avg',
  [METRIC_TYPES.ACTIVE_ENERGY]: 'sum',
  [METRIC_TYPES.BASAL_ENERGY]: 'sum',
  [METRIC_TYPES.DISTANCE_WALKING]: 'sum',
  [METRIC_TYPES.FLIGHTS_CLIMBED]: 'sum',
  [METRIC_TYPES.EXERCISE_TIME]: 'sum',
  [METRIC_TYPES.SLEEP]: 'sum',
  [METRIC_TYPES.BLOOD_OXYGEN]: 'avg',
  [METRIC_TYPES.RESPIRATORY_RATE]: 'avg',
  [METRIC_TYPES.BODY_MASS]: 'avg',
  [METRIC_TYPES.WALKING_SPEED]: 'avg',
};

function computeStats(data) {
  if (!data || data.length === 0) return null;
  const values = data.map((d) => d.value);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const latest = data[data.length - 1]?.value ?? null;
  const prev7 = data.slice(-14, -7);
  const curr7 = data.slice(-7);
  const prev7avg = prev7.length ? prev7.reduce((a, b) => a + b.value, 0) / prev7.length : null;
  const curr7avg = curr7.length ? curr7.reduce((a, b) => a + b.value, 0) / curr7.length : null;
  const trend = prev7avg !== null && curr7avg !== null ? ((curr7avg - prev7avg) / prev7avg) * 100 : null;

  return {
    avg: Math.round(avg * 10) / 10,
    max: Math.round(max * 10) / 10,
    min: Math.round(min * 10) / 10,
    latest: Math.round(latest * 10) / 10,
    total: Math.round(sum * 10) / 10,
    trend: trend !== null ? Math.round(trend * 10) / 10 : null,
  };
}

export function parseHealthXML(xmlString) {
  const rawData = parseRecords(xmlString);
  const result = {};

  for (const [type, records] of Object.entries(rawData)) {
    if (!records || records.length === 0) continue;
    const agg = AGGREGATION_MAP[type] || 'sum';
    const daily = aggregateByDay(records, agg);
    if (daily.length === 0) continue;
    result[type] = {
      daily,
      stats: computeStats(daily),
      label: METRIC_LABELS[type] || type.replace('HKQuantityTypeIdentifier', ''),
      unit: METRIC_UNITS[type] || '',
      color: METRIC_COLORS[type] || '#60a5fa',
    };
  }

  return result;
}

/**
 * Generate demo data for preview without a real Apple Health export
 */
export function generateDemoData() {
  const days = 180;
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  function makeSeries(base, variance, minVal = 0) {
    const data = [];
    let current = base;
    const d = new Date(startDate);
    for (let i = 0; i < days; i++) {
      const dateStr = d.toISOString().substring(0, 10);
      current = Math.max(minVal, current + (Math.random() - 0.48) * variance);
      data.push({ date: dateStr, value: Math.round(current * 10) / 10 });
      d.setDate(d.getDate() + 1);
    }
    return data;
  }

  const metrics = {
    [METRIC_TYPES.STEPS]: makeSeries(8000, 3000, 1000),
    [METRIC_TYPES.HEART_RATE]: makeSeries(72, 8, 50),
    [METRIC_TYPES.RESTING_HEART_RATE]: makeSeries(62, 4, 45),
    [METRIC_TYPES.ACTIVE_ENERGY]: makeSeries(450, 150, 50),
    [METRIC_TYPES.DISTANCE_WALKING]: makeSeries(6.5, 2.5, 0.5),
    [METRIC_TYPES.EXERCISE_TIME]: makeSeries(35, 20, 0),
    [METRIC_TYPES.SLEEP]: makeSeries(7.2, 1.2, 3),
    [METRIC_TYPES.BLOOD_OXYGEN]: makeSeries(98, 1.5, 93),
    [METRIC_TYPES.FLIGHTS_CLIMBED]: makeSeries(8, 6, 0),
    [METRIC_TYPES.BODY_MASS]: makeSeries(75, 0.5, 50),
  };

  const result = {};
  for (const [type, daily] of Object.entries(metrics)) {
    result[type] = {
      daily,
      stats: computeStats(daily),
      label: METRIC_LABELS[type],
      unit: METRIC_UNITS[type],
      color: METRIC_COLORS[type],
    };
  }
  return result;
}
