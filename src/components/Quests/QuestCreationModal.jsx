import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame, CATEGORIES, DIFFICULTIES } from '../../context/GameContext'
import './QuestCreationModal.css'

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'No recurrence' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]

export default function QuestCreationModal({ onClose, editQuest = null }) {
  const { dispatch } = useGame()
  const [form, setForm] = useState({
    title: editQuest?.title || '',
    description: editQuest?.description || '',
    category: editQuest?.category || 'health',
    difficulty: editQuest?.difficulty || 'medium',
    dueDate: editQuest?.dueDate || '',
    recurrence: editQuest?.recurrence || 'none',
    bonusObjectives: editQuest?.bonusObjectives || [],
    prerequisite: editQuest?.prerequisite || ''
  })
  const [newBonus, setNewBonus] = useState('')
  const [isSigning, setIsSigning] = useState(false)

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const addBonus = () => {
    if (!newBonus.trim()) return
    update('bonusObjectives', [...form.bonusObjectives, newBonus.trim()])
    setNewBonus('')
  }

  const removeBonus = (i) => {
    update('bonusObjectives', form.bonusObjectives.filter((_, idx) => idx !== i))
  }

  const handleSubmit = () => {
    if (!form.title.trim()) return
    setIsSigning(true)
    setTimeout(() => {
      if (editQuest) {
        dispatch({ type: 'UPDATE_QUEST', payload: { id: editQuest.id, ...form } })
      } else {
        dispatch({ type: 'ADD_QUEST', payload: form })
      }
      onClose()
    }, 800)
  }

  const diff = DIFFICULTIES[form.difficulty]
  const cat = CATEGORIES[form.category]

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
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="quest-contract"
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Quill cursor style indicator */}
        {isSigning && (
          <motion.div
            className="signing-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="signing-animation">
              <span className="signing-quill">✒</span>
              <span className="signing-text">Signing the contract...</span>
            </div>
          </motion.div>
        )}

        <div className="contract-header">
          <div className="contract-emblem">⚜</div>
          <h2 className="contract-title">Quest Contract</h2>
          <p className="contract-subtitle">By signing this document, you pledge your honour to undertake this quest</p>
          <button className="contract-close" onClick={onClose}>✕</button>
        </div>

        <div className="contract-body">
          {/* Title */}
          <div className="contract-field full-width">
            <label className="contract-label">Quest Title <span className="required">*</span></label>
            <div className="contract-input-wrap">
              <input
                className="contract-input title-input"
                type="text"
                placeholder="Describe thy quest in a few words..."
                value={form.title}
                onChange={e => update('title', e.target.value)}
                maxLength={80}
                autoFocus
              />
            </div>
          </div>

          {/* Description */}
          <div className="contract-field full-width">
            <label className="contract-label">Flavour Description <span className="optional">(optional)</span></label>
            <textarea
              className="contract-textarea"
              placeholder="The tale of this quest... (flavour text, details, notes)"
              value={form.description}
              onChange={e => update('description', e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="contract-row">
            {/* Category */}
            <div className="contract-field">
              <label className="contract-label">Category</label>
              <div className="category-grid">
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    className={`cat-select-btn ${form.category === key ? 'selected' : ''}`}
                    style={{ '--cat-color': cat.color }}
                    onClick={() => update('category', key)}
                    type="button"
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="contract-field">
              <label className="contract-label">Difficulty</label>
              <div className="diff-select-list">
                {Object.entries(DIFFICULTIES).map(([key, diff]) => (
                  <button
                    key={key}
                    className={`diff-select-btn ${form.difficulty === key ? 'selected' : ''}`}
                    style={{ '--diff-color': diffColors[key] }}
                    onClick={() => update('difficulty', key)}
                    type="button"
                  >
                    <span className="diff-symbol" style={{ color: diffColors[key] }}>{diff.symbol}</span>
                    <span className="diff-label">{diff.label}</span>
                    <span className="diff-xp">+{diff.xp} XP</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="contract-row">
            {/* Due Date */}
            <div className="contract-field">
              <label className="contract-label">Due Date <span className="optional">(optional)</span></label>
              <input
                className="contract-input"
                type="date"
                value={form.dueDate}
                onChange={e => update('dueDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Recurrence */}
            <div className="contract-field">
              <label className="contract-label">Recurrence</label>
              <select
                className="contract-select"
                value={form.recurrence}
                onChange={e => update('recurrence', e.target.value)}
              >
                {RECURRENCE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bonus Objectives */}
          <div className="contract-field full-width">
            <label className="contract-label">Bonus Objectives <span className="optional">(+25% XP each)</span></label>
            <div className="bonus-input-row">
              <input
                className="contract-input"
                type="text"
                placeholder="Add a bonus objective..."
                value={newBonus}
                onChange={e => setNewBonus(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addBonus()}
                maxLength={80}
              />
              <button className="add-bonus-btn" onClick={addBonus} type="button">
                + Add
              </button>
            </div>
            {form.bonusObjectives.length > 0 && (
              <div className="bonus-list">
                {form.bonusObjectives.map((obj, i) => (
                  <div key={i} className="bonus-tag">
                    <span>✦ {obj}</span>
                    <button onClick={() => removeBonus(i)} type="button">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="contract-preview">
            <div className="preview-line">
              <span style={{ color: cat?.color }}>{cat?.icon} {cat?.label}</span>
              <span style={{ color: diffColors[form.difficulty] }}>{diff?.symbol} {diff?.label}</span>
              <span className="preview-xp">~{diff?.xp || 50} XP base</span>
              {form.bonusObjectives.length > 0 && (
                <span className="preview-bonus-xp">+{Math.round(diff?.xp * form.bonusObjectives.length * 0.25)} bonus possible</span>
              )}
            </div>
          </div>
        </div>

        <div className="contract-footer">
          <div className="contract-seal">
            <div className="wax-seal" style={{ background: cat?.color }}>
              <span>{cat?.icon}</span>
            </div>
          </div>
          <div className="contract-actions">
            <button className="contract-btn cancel" onClick={onClose}>
              ✕ Cancel
            </button>
            <motion.button
              className="contract-btn sign"
              onClick={handleSubmit}
              disabled={!form.title.trim() || isSigning}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              ✒ Sign and Accept Quest
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
