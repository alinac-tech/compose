import React, { useRef } from 'react'
import { useGame } from '../../context/GameContext'
import './SettingsPage.css'

export default function SettingsPage() {
  const { state, exportData, importData, dispatch } = useGame()
  const fileRef = useRef()

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => importData(ev.target.result)
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleReset = () => {
    if (window.confirm('Are you certain? This will erase ALL progress permanently.')) {
      localStorage.removeItem('rpg-quest-state')
      window.location.reload()
    }
  }

  const handleRestoreHP = () => {
    dispatch({ type: 'RESTORE_HP', amount: 50 })
  }

  const handleRestoreMP = () => {
    dispatch({ type: 'RESTORE_MP', amount: 30 })
  }

  const addDebugXP = () => {
    const quest = { difficulty: 'hard', category: 'health', bonusCompleted: [] }
    dispatch({ type: 'COMPLETE_QUEST', payload: { questId: 'debug', xpGained: 100, goldGained: 50, statGain: 1, bonusCompleted: [] } })
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2 className="settings-title">⚙️ Codex Settings</h2>
      </div>

      <div className="settings-grid">
        {/* Data management */}
        <div className="settings-section">
          <h3 className="settings-section-title">📦 Data Management</h3>
          <div className="settings-desc">
            Export your progress as a JSON file for backup, or import a previously saved file.
          </div>
          <div className="settings-actions">
            <button className="settings-btn primary" onClick={exportData}>
              ⬇ Export Save File
            </button>
            <button className="settings-btn secondary" onClick={() => fileRef.current?.click()}>
              ⬆ Import Save File
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
          </div>
        </div>

        {/* Character info */}
        <div className="settings-section">
          <h3 className="settings-section-title">👤 Character Info</h3>
          <div className="settings-info-grid">
            <div className="info-row">
              <span>Name</span><strong>{state.character.name}</strong>
            </div>
            <div className="info-row">
              <span>Title</span><strong>{state.character.title}</strong>
            </div>
            <div className="info-row">
              <span>Class</span><strong>{state.character.class}</strong>
            </div>
            <div className="info-row">
              <span>Level</span><strong>{state.character.level}</strong>
            </div>
            <div className="info-row">
              <span>Total XP</span><strong>{state.character.xp}</strong>
            </div>
          </div>
        </div>

        {/* Recovery options */}
        <div className="settings-section">
          <h3 className="settings-section-title">🧪 Recovery Potions</h3>
          <div className="settings-desc">
            Restore vitality when you need a boost.
          </div>
          <div className="settings-actions">
            <button className="settings-btn health" onClick={handleRestoreHP}>
              ❤️ Restore 50 HP
            </button>
            <button className="settings-btn mana" onClick={handleRestoreMP}>
              💧 Restore 30 MP
            </button>
          </div>
        </div>

        {/* Reset */}
        <div className="settings-section danger">
          <h3 className="settings-section-title danger-title">⚠️ Danger Zone</h3>
          <div className="settings-desc">
            These actions are permanent and cannot be undone.
          </div>
          <div className="settings-actions">
            <button className="settings-btn danger" onClick={handleReset}>
              💀 Reset All Progress
            </button>
          </div>
        </div>
      </div>

      {/* Credits */}
      <div className="settings-credits">
        <div className="credits-inner">
          <div className="credits-title">The Quest Codex</div>
          <div className="credits-sub">A Fantasy RPG Task Manager</div>
          <div className="credits-lore">
            <em>&quot;May your quests be plentiful and your rewards legendary.&quot;</em>
          </div>
        </div>
      </div>
    </div>
  )
}
