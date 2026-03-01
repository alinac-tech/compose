import React from 'react'
import { motion } from 'framer-motion'
import { useGame, CLASSES, xpToNextLevel, getMaxHP, getMaxMP } from '../../context/GameContext'
import './CharacterSheet.css'

const STAT_CONFIG = {
  vitality: { icon: '❤️', label: 'Vitality', color: '#c0392b', desc: 'Affects max HP' },
  wisdom: { icon: '📚', label: 'Wisdom', color: '#2980b9', desc: 'Affects max MP' },
  fortune: { icon: '💰', label: 'Fortune', color: '#f39c12', desc: 'Affects gold & rewards' },
  charisma: { icon: '💜', label: 'Charisma', color: '#8e44ad', desc: 'Affects reputation' }
}

export default function CharacterSheet() {
  const { state } = useGame()
  const char = state.character
  const cls = CLASSES[char.class]
  const xpInfo = xpToNextLevel(char.xp)
  const maxHP = getMaxHP(char)
  const maxMP = getMaxMP(char)

  const hpPct = Math.min(100, (char.hp / maxHP) * 100)
  const mpPct = Math.min(100, (char.mp / maxMP) * 100)

  return (
    <div className="char-sheet">
      <div className="sheet-left">
        {/* Portrait area */}
        <div className="portrait-card">
          <div className="portrait-frame">
            <div className="portrait-icon">{cls?.icon || '⚔️'}</div>
            <div className="portrait-glow" />
          </div>
          <div className="portrait-info">
            <h2 className="char-name">{char.name}</h2>
            <div className="char-title-display">{char.title}</div>
            <div className="char-class-badge">
              <span className="class-label">{cls?.label || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Level & XP */}
        <div className="xp-card">
          <div className="level-display">
            <span className="level-num">{char.level}</span>
            <span className="level-word">LEVEL</span>
          </div>
          <div className="xp-bar-wrap">
            <div className="xp-bar-label">
              <span>Experience</span>
              <span className="xp-numbers">{char.xp - xpInfo.currentLevelXP} / {xpInfo.nextLevelXP - xpInfo.currentLevelXP}</span>
            </div>
            <div className="xp-bar-bg">
              <motion.div
                className="xp-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${xpInfo.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
              <div className="xp-bar-shimmer" />
            </div>
            <div className="xp-to-next">{xpInfo.needed} XP to Level {char.level + 1}</div>
          </div>
        </div>

        {/* HP / MP */}
        <div className="vitals-card">
          <VitalBar icon="❤️" label="HP" value={Math.round(char.hp)} max={maxHP} pct={hpPct} color="#c0392b" />
          <VitalBar icon="💧" label="MP" value={Math.round(char.mp)} max={maxMP} pct={mpPct} color="#3498db" />
          <div className="gold-row">
            <span className="gold-icon">💰</span>
            <span className="gold-label">Gold</span>
            <span className="gold-amount">{char.gold}</span>
          </div>
        </div>

        {/* Streak */}
        <div className="streak-card">
          <div className="streak-fire">🔥</div>
          <div className="streak-info">
            <div className="streak-current">{state.streak?.current || 0}</div>
            <div className="streak-label">Day Streak</div>
          </div>
          <div className="streak-longest">
            <div className="streak-longest-num">{state.streak?.longest || 0}</div>
            <div className="streak-longest-label">Best</div>
          </div>
        </div>
      </div>

      <div className="sheet-right">
        {/* Primary Stats */}
        <div className="stats-section">
          <h3 className="section-header">
            <span className="section-ornament">⋆</span>
            Primary Stats
            <span className="section-ornament">⋆</span>
          </h3>
          <div className="stats-grid">
            {Object.entries(STAT_CONFIG).map(([key, cfg]) => (
              <StatBlock key={key} statKey={key} cfg={cfg} value={char.stats[key]} />
            ))}
          </div>
        </div>

        {/* Combat Stats */}
        <div className="derived-section">
          <h3 className="section-header">
            <span className="section-ornament">⋆</span>
            Derived Stats
            <span className="section-ornament">⋆</span>
          </h3>
          <div className="derived-grid">
            <DerivedStat icon="⚔️" label="Strength" value={Math.round(char.stats.vitality * 1.5)} />
            <DerivedStat icon="🛡️" label="Defence" value={Math.round(char.stats.vitality * 0.8 + char.level * 2)} />
            <DerivedStat icon="✨" label="Magic" value={Math.round(char.stats.wisdom * 1.4)} />
            <DerivedStat icon="🎯" label="Luck" value={Math.round(char.stats.fortune * 0.6 + char.stats.charisma * 0.4)} />
            <DerivedStat icon="👥" label="Reputation" value={Math.round(char.stats.charisma * 2 + state.stats.totalCompleted * 0.5)} />
            <DerivedStat icon="💎" label="Talent Pts" value={char.talentPoints || 0} highlight />
          </div>
        </div>

        {/* Quest stats */}
        <div className="quest-stats-section">
          <h3 className="section-header">
            <span className="section-ornament">⋆</span>
            Quest Records
            <span className="section-ornament">⋆</span>
          </h3>
          <div className="record-grid">
            <RecordItem icon="✅" label="Completed" value={state.stats.totalCompleted} color="#27ae60" />
            <RecordItem icon="❌" label="Failed" value={state.stats.totalFailed} color="#e74c3c" />
            <RecordItem icon="🚶" label="Abandoned" value={state.stats.totalAbandoned} color="#95a5a6" />
            <RecordItem icon="🐉" label="Legendary" value={state.stats.legendaryCompleted} color="#f39c12" />
            {Object.entries(state.stats.categoryStats || {}).map(([cat, count]) => (
              <RecordItem key={cat} icon={['❤️','📚','💰','💜'][['health','intelligence','money','relationships'].indexOf(cat)]} label={cat.charAt(0).toUpperCase()+cat.slice(1)} value={count} />
            ))}
          </div>
        </div>

        {/* Class bonus */}
        {cls && (
          <div className="class-bonus-card">
            <div className="class-bonus-icon">{cls.icon}</div>
            <div className="class-bonus-info">
              <div className="class-bonus-name">{cls.label}</div>
              <div className="class-bonus-desc">{cls.desc}</div>
              <div className="class-bonus-effect">
                {cls.bonus === 'all' ? `+${cls.bonusPct}% XP on all quests` : `+${cls.bonusPct}% XP on ${cls.bonus} quests`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function VitalBar({ icon, label, value, max, pct, color }) {
  return (
    <div className="vital-bar">
      <div className="vital-header">
        <span className="vital-icon">{icon}</span>
        <span className="vital-label">{label}</span>
        <span className="vital-value">{value} / {max}</span>
      </div>
      <div className="vital-track">
        <motion.div
          className="vital-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

function StatBlock({ statKey, cfg, value }) {
  return (
    <motion.div
      className="stat-block"
      whileHover={{ scale: 1.02 }}
    >
      <div className="stat-icon" style={{ color: cfg.color }}>{cfg.icon}</div>
      <div className="stat-name">{cfg.label}</div>
      <div className="stat-track">
        <motion.div
          className="stat-fill"
          style={{ background: cfg.color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="stat-value">{value}/100</div>
      <div className="stat-desc">{cfg.desc}</div>
    </motion.div>
  )
}

function DerivedStat({ icon, label, value, highlight }) {
  return (
    <div className={`derived-stat ${highlight ? 'highlight' : ''}`}>
      <span className="derived-icon">{icon}</span>
      <span className="derived-label">{label}</span>
      <span className="derived-value">{value}</span>
    </div>
  )
}

function RecordItem({ icon, label, value, color }) {
  return (
    <div className="record-item">
      <span className="record-icon">{icon}</span>
      <span className="record-label">{label}</span>
      <span className="record-value" style={{ color: color || 'var(--gold-dark)' }}>{value}</span>
    </div>
  )
}
