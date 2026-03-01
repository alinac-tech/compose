import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../../context/GameContext'
import './LevelUpModal.css'

const FLAVOUR_TEXT = [
  "The heavens acknowledge your growth. A new chapter unfolds...",
  "Power surges through your veins. The world trembles at your ascent.",
  "Ancient wisdom fills your mind. You are reborn, stronger than before.",
  "The stars themselves pause to witness your transformation.",
  "Your legend grows. Songs shall be sung of this day.",
  "Power and wisdom intertwine. You walk a more glorious path.",
  "The realm recognises your deeds. Glory eternal awaits.",
  "From the crucible of challenge, a greater hero emerges.",
  "Your resolve has shattered the ceiling of your former self.",
  "Courage, wisdom, fortune — they all bow before your progress."
]

export default function LevelUpModal() {
  const { state, dispatch } = useGame()
  const { pendingLevelUp } = state

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'CLEAR_LEVEL_UP' })
    }, 6000)
    return () => clearTimeout(timer)
  }, [dispatch])

  if (!pendingLevelUp) return null

  const flavour = FLAVOUR_TEXT[pendingLevelUp.to % FLAVOUR_TEXT.length]
  const isMultiLevel = pendingLevelUp.to - pendingLevelUp.from > 1

  return (
    <motion.div
      className="levelup-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => dispatch({ type: 'CLEAR_LEVEL_UP' })}
    >
      {/* Particle burst */}
      <div className="particle-field">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="gold-particle"
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: (Math.cos((i / 40) * Math.PI * 2) * 200) + (Math.random() - 0.5) * 100,
              y: (Math.sin((i / 40) * Math.PI * 2) * 200) + (Math.random() - 0.5) * 100,
              scale: [0, Math.random() * 1.5 + 0.5, 0]
            }}
            transition={{ duration: 2, delay: Math.random() * 0.5, ease: 'easeOut' }}
          />
        ))}
      </div>

      <motion.div
        className="levelup-panel"
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Glow rings */}
        {[1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="glow-ring"
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4 * i, opacity: 0 }}
            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatDelay: 2 }}
          />
        ))}

        <motion.div
          className="levelup-crown"
          animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        >
          👑
        </motion.div>

        <motion.div
          className="levelup-text"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
        >
          LEVEL UP!
        </motion.div>

        <motion.div
          className="levelup-number"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
        >
          {isMultiLevel ? `${pendingLevelUp.from} → ` : ''}{pendingLevelUp.to}
        </motion.div>

        <motion.div
          className="levelup-divider"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          ⋆ ✦ ⋆ ✦ ⋆ ✦ ⋆
        </motion.div>

        <motion.div
          className="stat-gains"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="stat-gain">❤️ +{pendingLevelUp.to - pendingLevelUp.from} Vitality</div>
          <div className="stat-gain">📚 +{pendingLevelUp.to - pendingLevelUp.from} Wisdom</div>
          <div className="stat-gain">💰 +{pendingLevelUp.to - pendingLevelUp.from} Fortune</div>
          <div className="stat-gain">💜 +{pendingLevelUp.to - pendingLevelUp.from} Charisma</div>
          <div className="stat-gain talent">💎 +{pendingLevelUp.to - pendingLevelUp.from} Talent Point{pendingLevelUp.to - pendingLevelUp.from > 1 ? 's' : ''}</div>
        </motion.div>

        <motion.p
          className="levelup-flavour"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <em>{flavour}</em>
        </motion.p>

        <motion.button
          className="levelup-continue"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          onClick={() => dispatch({ type: 'CLEAR_LEVEL_UP' })}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ✦ Continue Your Journey ✦
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
