import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame, REWARD_TIERS } from '../../context/GameContext'
import './RewardModal.css'

const CHEST_STATES = {
  idle: 'idle',
  shaking: 'shaking',
  open: 'open',
  reveal: 'reveal'
}

export default function RewardModal() {
  const { state, dispatch } = useGame()
  const { pendingReward } = state
  const [chestState, setChestState] = useState(CHEST_STATES.idle)
  const [textIndex, setTextIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')

  const tier = pendingReward ? REWARD_TIERS[pendingReward.tier] : null
  const hasReward = pendingReward?.reward !== null

  useEffect(() => {
    if (!pendingReward) return

    // Auto-open sequence
    const t1 = setTimeout(() => setChestState(CHEST_STATES.shaking), 500)
    const t2 = setTimeout(() => setChestState(CHEST_STATES.open), 1800)
    const t3 = setTimeout(() => setChestState(CHEST_STATES.reveal), 2200)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [pendingReward])

  // Typewriter effect for reward text
  const fullText = pendingReward?.reward?.title || (hasReward ? '' : 'The Fates were not generous...')
  useEffect(() => {
    if (chestState !== CHEST_STATES.reveal) return
    setDisplayText('')
    setTextIndex(0)
  }, [chestState])

  useEffect(() => {
    if (chestState !== CHEST_STATES.reveal) return
    if (textIndex >= fullText.length) return
    const timer = setTimeout(() => {
      setDisplayText(prev => prev + fullText[textIndex])
      setTextIndex(i => i + 1)
    }, 50)
    return () => clearTimeout(timer)
  }, [textIndex, chestState, fullText])

  const handleClaim = () => {
    if (pendingReward?.reward) {
      dispatch({ type: 'CLAIM_REWARD', id: pendingReward.reward.id })
    }
    dispatch({ type: 'CLEAR_PENDING_REWARD' })
  }

  if (!pendingReward) return null

  const tierColor = tier?.color || '#8b7355'
  const tierGlow = tier?.glow || 'rgba(139,115,85,0.4)'

  const chestEmoji = hasReward
    ? (chestState === CHEST_STATES.open || chestState === CHEST_STATES.reveal ? '📭' : '📦')
    : '📦'

  return (
    <motion.div
      className="reward-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Particles for reward */}
      {chestState === CHEST_STATES.reveal && hasReward && (
        <div className="reward-particles">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="reward-particle"
              style={{ background: tierColor }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                x: (Math.random() - 0.5) * 400,
                y: -(Math.random() * 300 + 50),
                scale: [0, Math.random() + 0.5, 0],
                rotate: Math.random() * 360
              }}
              transition={{ duration: 2, delay: Math.random() * 0.5 }}
            />
          ))}
        </div>
      )}

      <motion.div
        className="reward-panel"
        initial={{ scale: 0.7, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          '--tier-color': tierColor,
          '--tier-glow': tierGlow
        }}
      >
        <div className="reward-header-text">
          {hasReward ? '⚔️ The Fates Smile Upon You!' : '🎲 The Dice Have Spoken...'}
        </div>

        {/* Chest */}
        <motion.div
          className={`chest-container ${chestState}`}
          animate={
            chestState === CHEST_STATES.shaking
              ? { x: [-3, 3, -4, 4, -2, 2, 0] }
              : {}
          }
          transition={
            chestState === CHEST_STATES.shaking
              ? { duration: 0.6, times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1] }
              : {}
          }
        >
          <motion.div
            className="chest-emoji"
            animate={
              chestState === CHEST_STATES.open || chestState === CHEST_STATES.reveal
                ? { scale: [1, 1.3, 1], filter: [`drop-shadow(0 0 0px ${tierColor})`, `drop-shadow(0 0 20px ${tierColor})`, `drop-shadow(0 0 10px ${tierColor})`] }
                : {}
            }
            transition={{ duration: 0.4 }}
          >
            {chestEmoji}
          </motion.div>

          {(chestState === CHEST_STATES.open || chestState === CHEST_STATES.reveal) && hasReward && (
            <motion.div
              className="chest-glow"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ background: `radial-gradient(circle, ${tierGlow} 0%, transparent 70%)` }}
            />
          )}
        </motion.div>

        {/* Reveal content */}
        <AnimatePresence>
          {chestState === CHEST_STATES.reveal && (
            <motion.div
              className="reward-reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {hasReward ? (
                <>
                  <motion.div
                    className="tier-banner"
                    style={{ background: tierColor }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    ✦ {tier?.label?.toUpperCase()} REWARD ✦
                  </motion.div>

                  <div className="reward-name-reveal">{displayText}<span className="cursor-blink">{textIndex < fullText.length ? '|' : ''}</span></div>

                  {pendingReward?.reward?.desc && (
                    <motion.div
                      className="reward-desc-reveal"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {pendingReward.reward.desc}
                    </motion.div>
                  )}

                  <motion.div
                    className="reward-xp-note"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    +{pendingReward.xp} XP earned
                  </motion.div>
                </>
              ) : (
                <>
                  <div className="no-reward-text">{displayText}</div>
                  <div className="no-reward-sub">
                    <em>&quot;The fates were not generous... but your XP is eternal.&quot;</em>
                  </div>
                  <div className="reward-xp-note">+{pendingReward.xp} XP earned</div>
                </>
              )}

              <motion.button
                className="claim-btn"
                style={{ '--tier-color': tierColor }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: textIndex >= fullText.length ? 0.2 : 1.5 }}
                onClick={handleClaim}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {hasReward ? '🎁 Claim Reward' : '→ Continue'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
