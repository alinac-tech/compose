import React from 'react'
import { motion } from 'framer-motion'
import { useGame, TALENT_PATHS } from '../../context/GameContext'
import './TalentTree.css'

export default function TalentTree() {
  const { state, dispatch } = useGame()
  const char = state.character
  const talentPoints = char.talentPoints || 0

  const spendPoint = (path) => {
    if (talentPoints <= 0) return
    dispatch({ type: 'SPEND_TALENT_POINT', path })
  }

  return (
    <div className="talent-page">
      <div className="talent-header">
        <h2 className="talent-title">
          <span className="ornament-gold">✦</span>
          Talent Codex
          <span className="ornament-gold">✦</span>
        </h2>
        <div className="talent-points-display">
          <span className="points-icon">💎</span>
          <span className="points-count">{talentPoints}</span>
          <span className="points-label">Talent Points Available</span>
        </div>
        <p className="talent-desc">
          Spend talent points to unlock powerful bonuses. Earn 1 point every level up,
          and 1 additional point every 5 levels.
        </p>
      </div>

      {talentPoints > 0 && (
        <motion.div
          className="points-notice"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✨ You have {talentPoints} unspent talent point{talentPoints !== 1 ? 's' : ''}! Invest wisely.
        </motion.div>
      )}

      <div className="talent-paths">
        {Object.entries(TALENT_PATHS).map(([key, path]) => (
          <TalentPathCard
            key={key}
            pathKey={key}
            path={path}
            rank={char.talents?.[key] || 0}
            canSpend={talentPoints > 0}
            onSpend={() => spendPoint(key)}
          />
        ))}
      </div>

      <div className="talent-footer">
        <div className="talent-lore">
          <span className="lore-icon">📜</span>
          <p>
            <em>&quot;Each talent is a step on the path to greatness. Choose not what is easiest,
            but what serves your destiny...&quot;</em>
          </p>
        </div>
      </div>
    </div>
  )
}

function TalentPathCard({ pathKey, path, rank, canSpend, onSpend }) {
  const maxRank = 5
  const pathColors = {
    discipline: '#6b4c35',
    ambition: '#c0392b',
    fortune: '#f39c12',
    wisdom: '#2980b9',
    resilience: '#27ae60'
  }
  const color = pathColors[pathKey] || '#6b4c35'

  return (
    <motion.div
      className={`talent-card ${rank > 0 ? 'has-ranks' : ''} ${canSpend ? 'can-spend' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <div className="talent-card-header" style={{ borderColor: color }}>
        <div className="talent-path-icon">{path.icon}</div>
        <div className="talent-path-info">
          <h3 className="talent-path-name">{path.label}</h3>
          <p className="talent-path-desc">{path.desc}</p>
        </div>
        <div className="talent-rank-display" style={{ color }}>
          <span className="rank-num">{rank}</span>
          <span className="rank-max">/{maxRank}</span>
        </div>
      </div>

      {/* Rank pips */}
      <div className="talent-pips">
        {[...Array(maxRank)].map((_, i) => (
          <div
            key={i}
            className={`pip ${i < rank ? 'filled' : ''}`}
            style={{ background: i < rank ? color : undefined }}
          />
        ))}
      </div>

      {/* Current effect */}
      <div className="talent-effect">
        {rank > 0 ? (
          <div className="effect-active">
            <span className="effect-icon">✓</span>
            <span>Active: {getEffectDescription(pathKey, rank)}</span>
          </div>
        ) : (
          <div className="effect-inactive">Not yet unlocked</div>
        )}
      </div>

      {/* Spend button */}
      {rank < maxRank && (
        <motion.button
          className={`spend-btn ${canSpend ? 'active' : 'disabled'}`}
          style={canSpend ? { borderColor: color, color } : {}}
          onClick={onSpend}
          disabled={!canSpend}
          whileHover={canSpend ? { scale: 1.03 } : {}}
          whileTap={canSpend ? { scale: 0.97 } : {}}
        >
          {canSpend ? `✦ Invest Point → Rank ${rank + 1}` : 'No points available'}
        </motion.button>
      )}

      {rank >= maxRank && (
        <div className="mastered-badge">
          ⭐ MASTERED
        </div>
      )}
    </motion.div>
  )
}

function getEffectDescription(path, rank) {
  const effects = {
    discipline: `+${rank * 5}% XP on recurring quests`,
    ambition: `+${rank * 10}% XP on Hard+ quests`,
    fortune: `+${rank * 15}% gold & +${rank * 3}% reward chance`,
    wisdom: `-${rank * 10}% MP costs`,
    resilience: `+${rank * 20} max HP & reduced fail penalties`
  }
  return effects[path] || `Rank ${rank}`
}
