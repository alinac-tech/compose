import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame, CATEGORIES, DIFFICULTIES, moonsRemaining } from '../../context/GameContext'
import './QuestCard.css'

export default function QuestCard({ quest }) {
  const { state, dispatch, completeQuest, calculateQuestXP } = useGame()
  const [expanded, setExpanded] = useState(false)
  const [bonusChecked, setBonusChecked] = useState(quest.bonusCompleted || [])
  const [confirmAction, setConfirmAction] = useState(null)

  const cat = CATEGORIES[quest.category]
  const diff = DIFFICULTIES[quest.difficulty]
  const isOverdue = quest.dueDate && new Date(quest.dueDate) < new Date()
  const moons = moonsRemaining(quest.dueDate)
  const xpPreview = calculateQuestXP({ ...quest, bonusCompleted: bonusChecked })

  const handleStart = () => {
    dispatch({ type: 'START_QUEST', id: quest.id })
  }

  const handleComplete = () => {
    completeQuest(quest.id, bonusChecked)
  }

  const handleFail = () => {
    dispatch({ type: 'FAIL_QUEST', id: quest.id })
    setConfirmAction(null)
  }

  const handleAbandon = () => {
    dispatch({ type: 'ABANDON_QUEST', id: quest.id })
    setConfirmAction(null)
  }

  const toggleBonus = (idx) => {
    setBonusChecked(prev => {
      const next = prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
      dispatch({ type: 'TOGGLE_BONUS_OBJECTIVE', payload: { questId: quest.id, objectiveIdx: idx } })
      return next
    })
  }

  const diffColors = {
    trivial: '#888',
    easy: '#27ae60',
    medium: '#f39c12',
    hard: '#e67e22',
    epic: '#9b59b6',
    legendary: '#c0392b'
  }

  return (
    <motion.div
      className={`quest-card cat-${quest.category} diff-${quest.difficulty} state-${quest.state}`}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4, boxShadow: `0 12px 32px rgba(0,0,0,0.25), 0 0 0 1px ${cat?.color}40` }}
      transition={{ duration: 0.2 }}
    >
      {/* Urgent seal for overdue */}
      {isOverdue && (
        <div className="urgent-seal">
          <span className="seal-text">URGENT</span>
        </div>
      )}

      {/* In-progress ribbon */}
      {quest.state === 'in_progress' && (
        <div className="in-progress-ribbon">In Progress</div>
      )}

      <div className="card-inner" onClick={() => setExpanded(e => !e)}>
        {/* Category stripe */}
        <div className="cat-stripe" style={{ background: cat?.color }} />

        <div className="card-header">
          <span className="cat-badge" style={{ background: cat?.color }}>
            {cat?.icon} {cat?.label}
          </span>
          <div className="diff-badge" style={{ color: diffColors[quest.difficulty] }}>
            {diff?.symbol}
          </div>
        </div>

        <h3 className="quest-title">{quest.title}</h3>

        {quest.description && !expanded && (
          <p className="quest-desc-preview">{quest.description.slice(0, 80)}{quest.description.length > 80 ? '…' : ''}</p>
        )}

        <div className="card-footer-info">
          <span className="xp-preview">+{xpPreview} XP</span>
          {moons && (
            <span className={`moons-badge ${isOverdue ? 'overdue' : ''}`}>
              🌙 {moons}
            </span>
          )}
          {quest.recurrence && quest.recurrence !== 'none' && (
            <span className="recurrence-badge">🔄 {quest.recurrence}</span>
          )}
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="card-expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {quest.description && (
              <p className="quest-desc-full">{quest.description}</p>
            )}

            {quest.bonusObjectives?.length > 0 && (
              <div className="bonus-objectives">
                <div className="bonus-header">✦ Bonus Objectives (+25% XP each)</div>
                {quest.bonusObjectives.map((obj, i) => (
                  <label key={i} className="bonus-item" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={bonusChecked.includes(i)}
                      onChange={() => toggleBonus(i)}
                    />
                    <span className={bonusChecked.includes(i) ? 'bonus-done' : ''}>{obj}</span>
                  </label>
                ))}
              </div>
            )}

            {quest.prerequisite && (
              <div className="prereq-note">
                📎 Part of quest chain: <em>{quest.prerequisite}</em>
              </div>
            )}

            {/* Action buttons */}
            <div className="card-actions" onClick={e => e.stopPropagation()}>
              {quest.state === 'available' && (
                <>
                  <motion.button
                    className="action-btn start-btn"
                    onClick={handleStart}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ⚔️ Accept Quest
                  </motion.button>
                  <button className="action-btn abandon-btn" onClick={() => setConfirmAction('abandon')}>
                    🚶 Decline
                  </button>
                </>
              )}

              {quest.state === 'in_progress' && (
                <>
                  <motion.button
                    className="action-btn complete-btn"
                    onClick={handleComplete}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ✅ Complete (+{xpPreview} XP)
                  </motion.button>
                  <button className="action-btn fail-btn" onClick={() => setConfirmAction('fail')}>
                    💀 Failed
                  </button>
                  <button className="action-btn abandon-btn" onClick={() => setConfirmAction('abandon')}>
                    🚶 Abandon
                  </button>
                </>
              )}

              <button
                className="action-btn edit-btn"
                onClick={() => dispatch({ type: 'DELETE_QUEST', id: quest.id })}
              >
                🗑 Delete
              </button>
            </div>

            {/* Confirm dialog */}
            <AnimatePresence>
              {confirmAction && (
                <motion.div
                  className="confirm-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="confirm-box">
                    <p>
                      {confirmAction === 'fail'
                        ? '💀 Mark this quest as failed? You will lose HP.'
                        : '🚶 Abandon this quest? It cannot be undone.'}
                    </p>
                    <div className="confirm-btns">
                      <button className="action-btn confirm-yes"
                        onClick={confirmAction === 'fail' ? handleFail : handleAbandon}>
                        Confirm
                      </button>
                      <button className="action-btn confirm-no" onClick={() => setConfirmAction(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand indicator */}
      <div className={`expand-chevron ${expanded ? 'open' : ''}`}>
        <span>▾</span>
      </div>
    </motion.div>
  )
}
