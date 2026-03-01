import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame, CLASSES } from '../../context/GameContext'
import './CharacterCreation.css'

const STEP_INTRO = 0
const STEP_NAME = 1
const STEP_CLASS = 2
const STEP_CONFIRM = 3

export default function CharacterCreation() {
  const { dispatch } = useGame()
  const [step, setStep] = useState(STEP_INTRO)
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [inkEffect, setInkEffect] = useState(false)

  const handleNext = () => {
    setInkEffect(true)
    setTimeout(() => setInkEffect(false), 600)
    setStep(s => s + 1)
  }

  const handleCreate = () => {
    const baseStats = { vitality: 10, wisdom: 10, fortune: 10, charisma: 10 }
    dispatch({
      type: 'CREATE_CHARACTER',
      payload: {
        name: name.trim() || 'Unknown Hero',
        title: title.trim() || 'The Wanderer',
        class: selectedClass,
        stats: baseStats
      }
    })
  }

  const cls = CLASSES[selectedClass]

  return (
    <div className="creation-backdrop">
      <div className="creation-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="dust-particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }} />
        ))}
      </div>

      <motion.div
        className="creation-book"
        initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="book-spine" />
        <div className="book-cover">
          <div className="cover-ornament top-left">✦</div>
          <div className="cover-ornament top-right">✦</div>
          <div className="cover-ornament bottom-left">✦</div>
          <div className="cover-ornament bottom-right">✦</div>

          <div className={`page-content ${inkEffect ? 'ink-wipe' : ''}`}>
            <AnimatePresence mode="wait">
              {step === STEP_INTRO && (
                <motion.div
                  key="intro"
                  className="creation-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="gothic-header">The Quest Codex</div>
                  <div className="runic-divider">⋆ ✦ ⋆ ✦ ⋆</div>
                  <div className="intro-illumination">📜</div>
                  <p className="intro-text">
                    Before thee lies an ancient tome of boundless power — a chronicle of deeds
                    both great and small, victories hard-won, and glory eternal.
                  </p>
                  <p className="intro-text">
                    To bind this Codex to thy will, thou must first inscribe thy name
                    upon its sacred pages and declare thy path.
                  </p>
                  <p className="intro-flavour">
                    <em>"Every legend begins with a single step..."</em>
                  </p>
                  <button className="ink-button primary" onClick={handleNext}>
                    <span className="button-glow" />
                    Begin Your Legend
                  </button>
                </motion.div>
              )}

              {step === STEP_NAME && (
                <motion.div
                  key="name"
                  className="creation-step"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="step-header">Who Are You?</h2>
                  <div className="runic-divider">⋆ ✦ ⋆</div>
                  <p className="step-desc">Inscribe thy name and title upon the contract scroll</p>

                  <div className="parchment-field">
                    <label className="field-label">Name</label>
                    <div className="quill-input-wrap">
                      <input
                        className="quill-input"
                        type="text"
                        placeholder="Enter your name..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                        maxLength={30}
                        autoFocus
                      />
                      <span className="quill-cursor">✒</span>
                    </div>
                  </div>

                  <div className="parchment-field">
                    <label className="field-label">Title <span className="optional">(optional)</span></label>
                    <div className="quill-input-wrap">
                      <input
                        className="quill-input"
                        type="text"
                        placeholder="e.g. The Brave, Keeper of Scrolls..."
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        maxLength={40}
                      />
                      <span className="quill-cursor">✒</span>
                    </div>
                  </div>

                  <div className="step-nav">
                    <button className="ink-button secondary" onClick={() => setStep(s => s - 1)}>← Back</button>
                    <button
                      className="ink-button primary"
                      onClick={handleNext}
                      disabled={!name.trim()}
                    >
                      Proceed →
                    </button>
                  </div>
                </motion.div>
              )}

              {step === STEP_CLASS && (
                <motion.div
                  key="class"
                  className="creation-step"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="step-header">Choose Your Path</h2>
                  <div className="runic-divider">⋆ ✦ ⋆</div>
                  <p className="step-desc">Each path grants unique advantages to your journey</p>

                  <div className="class-grid">
                    {Object.entries(CLASSES).map(([key, cls]) => (
                      <motion.button
                        key={key}
                        className={`class-card ${selectedClass === key ? 'selected' : ''}`}
                        onClick={() => setSelectedClass(key)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span className="class-icon">{cls.icon}</span>
                        <span className="class-name">{cls.label}</span>
                        <span className="class-bonus">
                          {cls.bonus === 'all' ? `+${cls.bonusPct}% all XP` : `+${cls.bonusPct}% ${cls.bonus} XP`}
                        </span>
                        <span className="class-desc">{cls.desc}</span>
                      </motion.button>
                    ))}
                  </div>

                  <div className="step-nav">
                    <button className="ink-button secondary" onClick={() => setStep(s => s - 1)}>← Back</button>
                    <button
                      className="ink-button primary"
                      onClick={handleNext}
                      disabled={!selectedClass}
                    >
                      Confirm Path →
                    </button>
                  </div>
                </motion.div>
              )}

              {step === STEP_CONFIRM && (
                <motion.div
                  key="confirm"
                  className="creation-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="step-header">Your Legend Awaits</h2>
                  <div className="runic-divider">⋆ ✦ ⋆ ✦ ⋆</div>

                  <div className="character-preview">
                    <div className="preview-icon">{cls?.icon || '⚔️'}</div>
                    <div className="preview-name">{name || 'Unknown Hero'}</div>
                    <div className="preview-title">{title || 'The Wanderer'}</div>
                    <div className="preview-class">{cls?.label || 'Adventurer'}</div>
                    <div className="preview-class-desc">{cls?.desc}</div>
                    <div className="preview-bonus">
                      {cls?.bonus === 'all'
                        ? `+${cls.bonusPct}% XP on all quests`
                        : `+${cls?.bonusPct}% XP on ${cls?.bonus} quests`}
                    </div>
                  </div>

                  <div className="starting-stats">
                    <div className="stat-row"><span>❤️ Vitality</span><span>10</span></div>
                    <div className="stat-row"><span>📚 Wisdom</span><span>10</span></div>
                    <div className="stat-row"><span>💰 Fortune</span><span>10</span></div>
                    <div className="stat-row"><span>💜 Charisma</span><span>10</span></div>
                  </div>

                  <div className="signature-line">
                    <span className="signature-script">✒ {name || 'Unknown Hero'}</span>
                  </div>

                  <div className="step-nav">
                    <button className="ink-button secondary" onClick={() => setStep(s => s - 1)}>← Back</button>
                    <motion.button
                      className="ink-button primary sign-button"
                      onClick={handleCreate}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ✒ Sign and Begin
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
