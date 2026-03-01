import React from 'react'
import { motion } from 'framer-motion'
import { useGame, ACHIEVEMENTS } from '../../context/GameContext'
import './AchievementsPage.css'

export default function AchievementsPage() {
  const { state } = useGame()
  const unlockedCount = Object.keys(state.achievements).length

  return (
    <div className="achievements-page">
      <div className="achievements-header">
        <div className="hall-emblem">🏆</div>
        <h2 className="hall-title">Hall of Achievements</h2>
        <div className="hall-subtitle">
          Trophy Room — <span className="gold-text">{unlockedCount}</span> / {ACHIEVEMENTS.length} Unlocked
        </div>
      </div>

      <div className="progress-banner">
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="progress-label">{Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}% Complete</div>
      </div>

      <div className="trophy-grid">
        {ACHIEVEMENTS.map((ach, i) => {
          const isUnlocked = !!state.achievements[ach.id]
          const unlockedAt = state.achievements[ach.id]
          return (
            <motion.div
              key={ach.id}
              className={`trophy-item ${isUnlocked ? 'unlocked' : 'locked'}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              whileHover={{ scale: isUnlocked ? 1.05 : 1.02, y: -4 }}
            >
              <div className="trophy-icon-wrap">
                <span className={`trophy-icon ${isUnlocked ? '' : 'locked-icon'}`}>
                  {isUnlocked ? ach.icon : '🔒'}
                </span>
                {isUnlocked && <div className="trophy-glow" />}
              </div>
              <div className="trophy-info">
                <div className="trophy-name">{isUnlocked ? ach.label : '???'}</div>
                <div className="trophy-desc">
                  {isUnlocked ? ach.desc : 'Keep adventuring to unlock...'}
                </div>
                {isUnlocked && unlockedAt && (
                  <div className="trophy-date">
                    {new Date(unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
              {isUnlocked && <div className="trophy-unlocked-badge">✓</div>}
            </motion.div>
          )
        })}
      </div>

      <div className="hall-footer">
        <div className="hall-lore">
          <em>&quot;These deeds shall be remembered for all eternity, inscribed upon the walls of the Grand Hall...&quot;</em>
        </div>
      </div>
    </div>
  )
}
