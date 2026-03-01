import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useGame, CATEGORIES, DIFFICULTIES } from '../../context/GameContext'
import './StatisticsPage.css'

export default function StatisticsPage() {
  const { state } = useGame()
  const { stats, quests, streak } = state

  // Build heatmap data (last 52 weeks)
  const heatmapData = useMemo(() => {
    const today = new Date()
    const weeks = []
    for (let w = 51; w >= 0; w--) {
      const week = []
      for (let d = 6; d >= 0; d--) {
        const date = new Date(today)
        date.setDate(today.getDate() - (w * 7 + d))
        const key = date.toISOString().split('T')[0]
        const count = stats.dailyActivity[key] || 0
        week.push({ date: key, count })
      }
      weeks.push(week)
    }
    return weeks
  }, [stats.dailyActivity])

  // Category stats
  const catData = useMemo(() => {
    const total = Object.values(stats.categoryStats || {}).reduce((s, v) => s + v, 0) || 1
    return Object.entries(CATEGORIES).map(([key, cat]) => ({
      key,
      label: cat.label,
      icon: cat.icon,
      color: cat.color,
      count: stats.categoryStats?.[key] || 0,
      pct: Math.round(((stats.categoryStats?.[key] || 0) / total) * 100)
    }))
  }, [stats.categoryStats])

  // Difficulty breakdown
  const diffData = useMemo(() => {
    const counts = {}
    quests.filter(q => q.state === 'completed').forEach(q => {
      counts[q.difficulty] = (counts[q.difficulty] || 0) + 1
    })
    const maxCount = Math.max(1, ...Object.values(counts))
    return Object.entries(DIFFICULTIES).map(([key, diff]) => ({
      key,
      label: diff.label,
      symbol: diff.symbol,
      count: counts[key] || 0,
      pct: Math.round(((counts[key] || 0) / maxCount) * 100)
    })).reverse()
  }, [quests])

  const maxActivity = Math.max(1, ...Object.values(stats.dailyActivity || {}))

  const getHeatColor = (count) => {
    if (count === 0) return 'rgba(0,0,0,0.06)'
    const intensity = count / maxActivity
    if (intensity < 0.25) return 'rgba(212,175,55,0.25)'
    if (intensity < 0.5) return 'rgba(212,175,55,0.5)'
    if (intensity < 0.75) return 'rgba(212,175,55,0.75)'
    return 'rgba(212,175,55,1)'
  }

  return (
    <div className="statistics-page">
      <div className="stats-header">
        <h2 className="stats-title">
          <span className="gold-text">⚜</span>
          Chronicles & Records
          <span className="gold-text">⚜</span>
        </h2>
      </div>

      {/* Summary cards */}
      <div className="summary-cards">
        <SummaryCard icon="✅" label="Quests Completed" value={stats.totalCompleted} color="#27ae60" />
        <SummaryCard icon="🔥" label="Current Streak" value={`${streak?.current || 0} days`} color="#ff8c00" />
        <SummaryCard icon="🏆" label="Longest Streak" value={`${streak?.longest || 0} days`} color="#f39c12" />
        <SummaryCard icon="💰" label="Gold Earned" value={state.character.gold} color="#d4af37" />
        <SummaryCard icon="⚡" label="Max Quests/Day" value={stats.maxQuestsInDay} color="#9b59b6" />
        <SummaryCard icon="🐉" label="Legendary Quests" value={stats.legendaryCompleted} color="#c0392b" />
      </div>

      {/* Activity heatmap */}
      <div className="stats-section">
        <h3 className="section-label">Activity Heatmap — Past Year</h3>
        <div className="heatmap-container">
          <div className="heatmap-grid">
            {heatmapData.map((week, wi) => (
              <div key={wi} className="heatmap-week">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className="heatmap-cell"
                    style={{ background: getHeatColor(day.count) }}
                    title={`${day.date}: ${day.count} quest${day.count !== 1 ? 's' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="heatmap-legend">
            <span>Less</span>
            <div className="legend-cells">
              {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
                <div key={i} className="legend-cell" style={{ background: v === 0 ? 'rgba(0,0,0,0.06)' : `rgba(212,175,55,${v})` }} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="stats-row">
        <div className="stats-section half">
          <h3 className="section-label">Category Distribution</h3>
          <div className="category-bars">
            {catData.map(cat => (
              <div key={cat.key} className="cat-bar-row">
                <span className="cat-bar-icon">{cat.icon}</span>
                <span className="cat-bar-label">{cat.label}</span>
                <div className="cat-bar-track">
                  <motion.div
                    className="cat-bar-fill"
                    style={{ background: cat.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <span className="cat-bar-count">{cat.count}</span>
                <span className="cat-bar-pct">{cat.pct}%</span>
              </div>
            ))}
          </div>

          {/* Pie-like compass rose */}
          <div className="compass-rose">
            {catData.map((cat, i) => {
              const angle = (i / catData.length) * 360
              const radius = 60 + cat.pct * 0.4
              return (
                <div
                  key={cat.key}
                  className="rose-spoke"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '50% 100%'
                  }}
                >
                  <div className="rose-tip" style={{
                    height: `${radius}px`,
                    background: cat.color,
                    opacity: 0.7
                  }} />
                </div>
              )
            })}
            <div className="rose-center">⚜</div>
          </div>
        </div>

        {/* Difficulty breakdown */}
        <div className="stats-section half">
          <h3 className="section-label">Difficulty Breakdown</h3>
          <div className="diff-bars">
            {diffData.map(diff => (
              <div key={diff.key} className="diff-bar-row">
                <span className="diff-bar-symbol">{diff.symbol}</span>
                <span className="diff-bar-label">{diff.label}</span>
                <div className="diff-bar-track">
                  <motion.div
                    className="diff-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${diff.pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <span className="diff-bar-count">{diff.count}</span>
              </div>
            ))}
          </div>

          {/* Personal records */}
          <div className="records-box">
            <h4 className="records-title">Personal Records</h4>
            <div className="record-entry">
              <span>🔥 Longest Streak</span>
              <strong>{streak?.longest || 0} days</strong>
            </div>
            <div className="record-entry">
              <span>⚡ Best Day</span>
              <strong>{stats.maxQuestsInDay} quests</strong>
            </div>
            <div className="record-entry">
              <span>✨ Perfect Quests</span>
              <strong>{stats.perfectQuests}</strong>
            </div>
            <div className="record-entry">
              <span>🏆 Achievements</span>
              <strong>{Object.keys(state.achievements).length}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ icon, label, value, color }) {
  return (
    <motion.div
      className="summary-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <div className="summary-icon" style={{ color }}>{icon}</div>
      <div className="summary-value" style={{ color }}>{value}</div>
      <div className="summary-label">{label}</div>
    </motion.div>
  )
}
