import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame, REWARD_TIERS } from '../../context/GameContext'
import './RewardsPage.css'

export default function RewardsPage() {
  const { state, dispatch } = useGame()
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('all')
  const [editReward, setEditReward] = useState(null)

  const filtered = state.rewards.filter(r => filter === 'all' || r.tier === filter)

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_REWARD', id })
  }

  const handleToggleAvailable = (reward) => {
    dispatch({ type: 'UPDATE_REWARD', payload: { ...reward, available: !reward.available } })
  }

  return (
    <div className="rewards-page">
      <div className="rewards-header">
        <h2 className="rewards-title">
          <span className="gold-text">✦</span>
          Reward Vault
          <span className="gold-text">✦</span>
        </h2>
        <p className="rewards-desc">
          Your collection of well-earned treats. Rewards are granted by the Fates upon quest completion.
        </p>
      </div>

      <div className="rewards-controls">
        <div className="tier-filters">
          <button
            className={`tier-filter ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {Object.entries(REWARD_TIERS).map(([key, tier]) => (
            <button
              key={key}
              className={`tier-filter ${filter === key ? 'active' : ''}`}
              style={{ '--tier-color': tier.color }}
              onClick={() => setFilter(key)}
            >
              <span className="tier-dot" style={{ background: tier.color }} />
              {tier.label}
            </button>
          ))}
        </div>
        <button className="add-reward-btn" onClick={() => { setEditReward(null); setShowAdd(true) }}>
          + Add Reward
        </button>
      </div>

      <div className="rewards-grid">
        <AnimatePresence>
          {filtered.map(reward => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onDelete={() => handleDelete(reward.id)}
              onToggle={() => handleToggleAvailable(reward)}
              onEdit={() => { setEditReward(reward); setShowAdd(true) }}
            />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="empty-rewards">
            <span>🎁</span>
            <p>No rewards in this tier. Add one!</p>
          </div>
        )}
      </div>

      {/* Tier info */}
      <div className="tier-info-grid">
        <h3 className="tier-info-title">Reward Tier Chances</h3>
        {Object.entries(REWARD_TIERS).map(([key, tier]) => (
          <div key={key} className="tier-info-row">
            <span className="tier-dot" style={{ background: tier.color }} />
            <span className="tier-name" style={{ color: tier.color }}>{tier.label}</span>
            <span className="tier-chance">{Math.round(tier.chance * 100)}% of rewards</span>
            <div className="tier-bar-bg">
              <div className="tier-bar-fill" style={{ width: `${tier.chance * 100}%`, background: tier.color }} />
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <AddRewardModal
          editReward={editReward}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}

function RewardCard({ reward, onDelete, onToggle, onEdit }) {
  const tier = REWARD_TIERS[reward.tier]
  const isOnCooldown = reward.lastClaimed && reward.cooldownHours > 0 &&
    (new Date() - new Date(reward.lastClaimed)) < reward.cooldownHours * 3600 * 1000

  const cooldownRemaining = isOnCooldown
    ? Math.ceil((reward.cooldownHours * 3600 * 1000 - (new Date() - new Date(reward.lastClaimed))) / 3600000)
    : 0

  return (
    <motion.div
      className={`reward-card tier-${reward.tier} ${!reward.available ? 'unavailable' : ''} ${isOnCooldown ? 'cooldown' : ''}`}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
    >
      <div className="reward-tier-bar" style={{ background: tier?.color }} />
      <div className="reward-body">
        <div className="reward-header-row">
          <span className="reward-tier-badge" style={{ color: tier?.color, borderColor: tier?.color }}>
            {tier?.label}
          </span>
          {isOnCooldown && (
            <span className="cooldown-badge">⏳ {cooldownRemaining}h</span>
          )}
          {!reward.available && (
            <span className="unavailable-badge">Unavailable</span>
          )}
        </div>
        <h4 className="reward-name">{reward.title}</h4>
        {reward.desc && <p className="reward-desc">{reward.desc}</p>}
        <div className="reward-meta">
          {reward.cooldownHours > 0 && (
            <span className="reward-cooldown">⏱ {reward.cooldownHours}h cooldown</span>
          )}
          {reward.seasonal && <span className="reward-seasonal">🌸 Seasonal</span>}
          {reward.lastClaimed && (
            <span className="reward-last">Last: {new Date(reward.lastClaimed).toLocaleDateString()}</span>
          )}
        </div>
      </div>
      <div className="reward-actions">
        <button className="reward-action-btn" onClick={onToggle} title="Toggle availability">
          {reward.available ? '✓' : '✗'}
        </button>
        <button className="reward-action-btn edit" onClick={onEdit} title="Edit">✏</button>
        <button className="reward-action-btn delete" onClick={onDelete} title="Delete">🗑</button>
      </div>
    </motion.div>
  )
}

function AddRewardModal({ editReward, onClose }) {
  const { dispatch } = useGame()
  const [form, setForm] = useState({
    title: editReward?.title || '',
    desc: editReward?.desc || '',
    tier: editReward?.tier || 'common',
    cooldownHours: editReward?.cooldownHours ?? 24,
    seasonal: editReward?.seasonal || false,
    available: editReward?.available ?? true
  })

  const handleSave = () => {
    if (!form.title.trim()) return
    if (editReward) {
      dispatch({ type: 'UPDATE_REWARD', payload: { id: editReward.id, ...form } })
    } else {
      dispatch({ type: 'ADD_REWARD', payload: form })
    }
    onClose()
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
        className="reward-modal"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
      >
        <div className="modal-header">
          <h3>{editReward ? 'Edit Reward' : 'Add New Reward'}</h3>
          <button className="contract-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="field-group">
            <label>Reward Name *</label>
            <input className="modal-input" type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="What's your reward?" maxLength={60} autoFocus />
          </div>
          <div className="field-group">
            <label>Description (optional)</label>
            <textarea className="modal-input" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Details about this reward..." rows={2} maxLength={200} />
          </div>
          <div className="field-row">
            <div className="field-group">
              <label>Tier</label>
              <select className="modal-input" value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
                {Object.entries(REWARD_TIERS).map(([k, t]) => (
                  <option key={k} value={k}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>Cooldown (hours)</label>
              <input className="modal-input" type="number" value={form.cooldownHours} onChange={e => setForm(f => ({ ...f, cooldownHours: Number(e.target.value) }))} min={0} max={8760} />
            </div>
          </div>
          <div className="field-row">
            <label className="checkbox-label">
              <input type="checkbox" checked={form.seasonal} onChange={e => setForm(f => ({ ...f, seasonal: e.target.checked }))} />
              Seasonal reward
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} />
              Available
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="contract-btn cancel" onClick={onClose}>Cancel</button>
          <button className="contract-btn sign" onClick={handleSave} disabled={!form.title.trim()}>
            {editReward ? '✓ Save Changes' : '+ Add Reward'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
