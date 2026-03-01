import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../../context/GameContext'
import Navigation from '../Navigation/Navigation'
import QuestBoard from '../Quests/QuestBoard'
import CharacterSheet from '../Character/CharacterSheet'
import TalentTree from '../Talents/TalentTree'
import AchievementsPage from '../Achievements/AchievementsPage'
import RewardsPage from '../Rewards/RewardsPage'
import StatisticsPage from '../Statistics/StatisticsPage'
import SettingsPage from '../Settings/SettingsPage'
import LevelUpModal from '../Animations/LevelUpModal'
import RewardModal from '../Animations/RewardModal'
import XPFloats from '../Animations/XPFloats'
import './BookLayout.css'

const TABS = [
  { id: 'quests', label: 'Quests', icon: '📜' },
  { id: 'character', label: 'Character', icon: '⚔️' },
  { id: 'talents', label: 'Talents', icon: '✨' },
  { id: 'achievements', label: 'Achievements', icon: '🏆' },
  { id: 'rewards', label: 'Rewards', icon: '🎁' },
  { id: 'statistics', label: 'Statistics', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
]

export default function BookLayout() {
  const { state } = useGame()
  const [activeTab, setActiveTab] = useState('quests')
  const [questView, setQuestView] = useState('active') // 'active' | 'log'

  const renderContent = () => {
    switch (activeTab) {
      case 'quests': return <QuestBoard questView={questView} setQuestView={setQuestView} />
      case 'character': return <CharacterSheet />
      case 'talents': return <TalentTree />
      case 'achievements': return <AchievementsPage />
      case 'rewards': return <RewardsPage />
      case 'statistics': return <StatisticsPage />
      case 'settings': return <SettingsPage />
      default: return null
    }
  }

  return (
    <div className="book-world">
      <XPFloats />
      <AnimatePresence>
        {state.pendingLevelUp && <LevelUpModal />}
      </AnimatePresence>
      <AnimatePresence>
        {state.pendingReward && <RewardModal />}
      </AnimatePresence>

      <div className="book-container">
        <div className="book-header">
          <div className="header-ornament">
            <span className="ornament-line" />
            <span className="header-emblem">⚜</span>
            <span className="ornament-line" />
          </div>
          <div className="header-title-block">
            <h1 className="book-title">The Quest Codex</h1>
            <div className="character-banner">
              <span className="character-name-header">{state.character.name}</span>
              <span className="character-sep">—</span>
              <span className="character-title-header">{state.character.title}</span>
              <span className="character-sep">·</span>
              <span className="character-level-header">Level {state.character.level}</span>
            </div>
          </div>
          <div className="header-stats-bar">
            <StatPill icon="❤️" value={Math.round(state.character.hp)} max={100 + state.character.stats.vitality * 5} color="var(--health-red)" label="HP" />
            <StatPill icon="💧" value={Math.round(state.character.mp)} max={50 + state.character.stats.wisdom * 3} color="var(--magic-glow)" label="MP" />
            <span className="gold-display">💰 {state.character.gold} gold</span>
            <span className="streak-display">🔥 {state.streak?.current || 0} day{state.streak?.current !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <Navigation tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="book-pages">
          <div className="book-gutter" />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="page-spread"
              initial={{ opacity: 0, rotateY: -5 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 5 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="book-footer">
          <div className="footer-rule">
            <span className="rule-line" />
            <span className="footer-text">
              ✦ &quot;Per aspera ad astra&quot; — Through hardship to the stars ✦
            </span>
            <span className="rule-line" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatPill({ icon, value, max, color, label }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="stat-pill">
      <span className="pill-icon">{icon}</span>
      <span className="pill-label">{label}</span>
      <div className="pill-bar">
        <div className="pill-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="pill-value">{value}/{max}</span>
    </div>
  )
}
