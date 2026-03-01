import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame, CATEGORIES, DIFFICULTIES } from '../../context/GameContext'
import QuestCard from './QuestCard'
import QuestCreationModal from './QuestCreationModal'
import './QuestBoard.css'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'health', label: '❤️ Health' },
  { id: 'intelligence', label: '📚 Intelligence' },
  { id: 'money', label: '💰 Money' },
  { id: 'relationships', label: '💜 Relationships' }
]

export default function QuestBoard({ questView, setQuestView }) {
  const { state } = useGame()
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created')

  const activeQuests = useMemo(() => {
    return state.quests.filter(q =>
      q.state === 'available' || q.state === 'in_progress'
    ).filter(q => filter === 'all' || q.category === filter)
      .sort((a, b) => {
        if (sortBy === 'created') return new Date(b.createdAt) - new Date(a.createdAt)
        if (sortBy === 'difficulty') {
          const order = ['legendary', 'epic', 'hard', 'medium', 'easy', 'trivial']
          return order.indexOf(a.difficulty) - order.indexOf(b.difficulty)
        }
        if (sortBy === 'due') {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate) - new Date(b.dueDate)
        }
        return 0
      })
  }, [state.quests, filter, sortBy])

  const logQuests = useMemo(() => {
    return state.quests.filter(q =>
      q.state === 'completed' || q.state === 'failed' || q.state === 'abandoned'
    ).sort((a, b) => {
      const dateA = new Date(a.completedAt || a.failedAt || a.abandonedAt || a.createdAt)
      const dateB = new Date(b.completedAt || b.failedAt || b.abandonedAt || b.createdAt)
      return dateB - dateA
    })
  }, [state.quests])

  return (
    <div className="quest-board">
      {/* View toggle */}
      <div className="board-header">
        <div className="view-toggle">
          <button
            className={`view-btn ${questView === 'active' ? 'active' : ''}`}
            onClick={() => setQuestView('active')}
          >
            📜 Active Quests
            <span className="quest-count">{activeQuests.length}</span>
          </button>
          <button
            className={`view-btn ${questView === 'log' ? 'active' : ''}`}
            onClick={() => setQuestView('log')}
          >
            📖 Quest Log
            <span className="quest-count">{logQuests.length}</span>
          </button>
        </div>

        {questView === 'active' && (
          <motion.button
            className="create-quest-btn"
            onClick={() => setShowCreate(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            ✒ Accept New Quest
          </motion.button>
        )}
      </div>

      {/* Filters (active view only) */}
      {questView === 'active' && (
        <div className="board-controls">
          <div className="filter-bar">
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={`filter-btn ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="sort-bar">
            <label className="sort-label">Sort:</label>
            <select
              className="sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="created">Newest</option>
              <option value="difficulty">Difficulty</option>
              <option value="due">Due Date</option>
            </select>
          </div>
        </div>
      )}

      {/* Quest grid */}
      <AnimatePresence mode="wait">
        {questView === 'active' ? (
          <motion.div
            key="active"
            className="quest-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {activeQuests.length === 0 ? (
              <EmptyState filter={filter} onAdd={() => setShowCreate(true)} />
            ) : (
              activeQuests.map(quest => (
                <QuestCard key={quest.id} quest={quest} />
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="log"
            className="quest-log"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {logQuests.length === 0 ? (
              <div className="empty-log">
                <span className="empty-log-icon">📖</span>
                <p>No completed quests yet — your legend awaits!</p>
              </div>
            ) : (
              logQuests.map(quest => (
                <QuestLogEntry key={quest.id} quest={quest} />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showCreate && (
        <QuestCreationModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  )
}

function EmptyState({ filter, onAdd }) {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="empty-tavern-board">
        <span className="empty-icon">⚔️</span>
        <h3>The Notice Board Awaits</h3>
        <p>
          {filter !== 'all'
            ? `No active ${CATEGORIES[filter]?.label || ''} quests found.`
            : 'No quests are posted on the board.'}
        </p>
        <p className="empty-sub">Accept a new quest to begin your adventure!</p>
        <button className="create-quest-btn" onClick={onAdd}>
          ✒ Accept New Quest
        </button>
      </div>
    </motion.div>
  )
}

function QuestLogEntry({ quest }) {
  const stateConfig = {
    completed: { icon: '✅', label: 'Completed', color: '#27ae60' },
    failed: { icon: '❌', label: 'Failed', color: '#e74c3c' },
    abandoned: { icon: '🚶', label: 'Abandoned', color: '#95a5a6' }
  }
  const config = stateConfig[quest.state] || stateConfig.completed
  const date = quest.completedAt || quest.failedAt || quest.abandonedAt
  const dateStr = date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
  const diff = DIFFICULTIES[quest.difficulty]
  const cat = CATEGORIES[quest.category]

  return (
    <motion.div
      className={`log-entry log-${quest.state}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      layout
    >
      <div className="log-state-icon">{config.icon}</div>
      <div className="log-content">
        <div className="log-title">
          <span className="log-quest-title">{quest.title}</span>
          <span className="log-diff" style={{ color: '#d4af37' }}>{diff?.symbol}</span>
        </div>
        <div className="log-meta">
          <span className="log-cat" style={{ color: cat?.color }}>{cat?.icon} {cat?.label}</span>
          <span className="log-date">{dateStr}</span>
          {quest.state === 'completed' && (
            <span className="log-xp">+{DIFFICULTIES[quest.difficulty]?.xp || 50} XP</span>
          )}
        </div>
        {quest.description && (
          <div className="log-desc">{quest.description}</div>
        )}
      </div>
    </motion.div>
  )
}
