import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

// ============================================================
// CONSTANTS
// ============================================================
export const CATEGORIES = {
  health: { label: 'Health', color: '#c0392b', icon: '❤️', stat: 'vitality' },
  intelligence: { label: 'Intelligence', color: '#2980b9', icon: '📚', stat: 'wisdom' },
  money: { label: 'Money', color: '#f39c12', icon: '💰', stat: 'fortune' },
  relationships: { label: 'Relationships', color: '#8e44ad', icon: '💜', stat: 'charisma' }
}

export const DIFFICULTIES = {
  trivial: { label: 'Trivial', xp: 10, stars: 0.5, symbol: '½★' },
  easy: { label: 'Easy', xp: 25, stars: 1, symbol: '★' },
  medium: { label: 'Medium', xp: 50, stars: 2, symbol: '★★' },
  hard: { label: 'Hard', xp: 100, stars: 3, symbol: '★★★' },
  epic: { label: 'Epic', xp: 200, stars: 4, symbol: '★★★★' },
  legendary: { label: 'Legendary', xp: 500, stars: 5, symbol: '★★★★★' }
}

export const CLASSES = {
  warrior: { label: 'Warrior', desc: 'Stalwart defender and relentless achiever', bonus: 'health', bonusPct: 20, icon: '⚔️' },
  scholar: { label: 'Scholar', desc: 'Seeker of wisdom and arcane knowledge', bonus: 'intelligence', bonusPct: 20, icon: '📖' },
  merchant: { label: 'Merchant', desc: 'Master of trade and fortune', bonus: 'money', bonusPct: 20, icon: '🏪' },
  diplomat: { label: 'Diplomat', desc: 'Weaver of bonds and social architect', bonus: 'relationships', bonusPct: 20, icon: '🤝' },
  adventurer: { label: 'Adventurer', desc: 'Jack of all trades, master of adventure', bonus: 'all', bonusPct: 5, icon: '🗺️' }
}

export const REWARD_TIERS = {
  common: { label: 'Common', color: '#8b7355', chance: 0.5, glow: 'rgba(139,115,85,0.6)' },
  uncommon: { label: 'Uncommon', color: '#27ae60', chance: 0.3, glow: 'rgba(39,174,96,0.6)' },
  rare: { label: 'Rare', color: '#3498db', chance: 0.15, glow: 'rgba(52,152,219,0.6)' },
  epic: { label: 'Epic', color: '#9b59b6', chance: 0.04, glow: 'rgba(155,89,182,0.6)' },
  legendary: { label: 'Legendary', color: '#f39c12', chance: 0.01, glow: 'rgba(243,156,18,0.6)' }
}

export const TALENT_PATHS = {
  discipline: { label: 'Path of Discipline', desc: '+5% recurring quest XP', icon: '📜', effect: 'recurringXP', value: 0.05 },
  ambition: { label: 'Path of Ambition', desc: '+10% Hard+ quest XP', icon: '🦅', effect: 'hardXP', value: 0.10 },
  fortune: { label: 'Path of Fortune', desc: '+15% gold & better rewards', icon: '🎲', effect: 'goldBonus', value: 0.15 },
  wisdom: { label: 'Path of Wisdom', desc: '-10% MP costs', icon: '🔮', effect: 'mpCost', value: 0.10 },
  resilience: { label: 'Path of Resilience', desc: '+20 max HP, reduced fail penalties', icon: '🛡️', effect: 'hpBonus', value: 20 }
}

export const ACHIEVEMENTS = [
  { id: 'first_steps', label: 'First Steps', desc: 'Complete your first quest', icon: '👣', check: (s) => s.stats.totalCompleted >= 1 },
  { id: 'apprentice', label: 'Apprentice', desc: 'Reach Level 5', icon: '📜', check: (s) => s.character.level >= 5 },
  { id: 'journeyman', label: 'Journeyman', desc: 'Reach Level 10', icon: '⚔️', check: (s) => s.character.level >= 10 },
  { id: 'expert', label: 'Expert Adventurer', desc: 'Reach Level 25', icon: '🌟', check: (s) => s.character.level >= 25 },
  { id: 'master', label: 'Master', desc: 'Reach Level 50', icon: '👑', check: (s) => s.character.level >= 50 },
  { id: 'grandmaster', label: 'Grandmaster', desc: 'Reach Level 100', icon: '🏆', check: (s) => s.character.level >= 100 },
  { id: 'health_master', label: 'Health Champion', desc: 'Complete 50 Health quests', icon: '❤️', check: (s) => (s.stats.categoryStats?.health || 0) >= 50 },
  { id: 'intel_master', label: 'Arcane Scholar', desc: 'Complete 50 Intelligence quests', icon: '📚', check: (s) => (s.stats.categoryStats?.intelligence || 0) >= 50 },
  { id: 'money_master', label: 'Merchant Prince', desc: 'Complete 50 Money quests', icon: '💰', check: (s) => (s.stats.categoryStats?.money || 0) >= 50 },
  { id: 'relations_master', label: 'Social Weaver', desc: 'Complete 50 Relationships quests', icon: '💜', check: (s) => (s.stats.categoryStats?.relationships || 0) >= 50 },
  { id: 'renaissance', label: 'Renaissance Soul', desc: '50 quests in all categories', icon: '🌈', check: (s) => Object.values(s.stats.categoryStats || {}).every(v => v >= 50) },
  { id: 'streak_7', label: 'Week Warrior', desc: '7-day streak', icon: '🔥', check: (s) => s.streak.longest >= 7 },
  { id: 'streak_30', label: 'Month Champion', desc: '30-day streak', icon: '🌙', check: (s) => s.streak.longest >= 30 },
  { id: 'streak_100', label: 'Century Crusader', desc: '100-day streak', icon: '⚡', check: (s) => s.streak.longest >= 100 },
  { id: 'streak_365', label: 'Year Guardian', desc: '365-day streak', icon: '🏅', check: (s) => s.streak.longest >= 365 },
  { id: 'dragon_slayer', label: 'Dragon Slayer', desc: 'Complete a Legendary quest', icon: '🐉', check: (s) => s.stats.legendaryCompleted >= 1 },
  { id: 'speed_runner', label: 'Speed Runner', desc: 'Complete 10 quests in one day', icon: '💨', check: (s) => s.stats.maxQuestsInDay >= 10 },
  { id: 'perfectionist', label: 'Perfectionist', desc: 'Complete all bonus objectives in 5 quests', icon: '✨', check: (s) => s.stats.perfectQuests >= 5 }
]

const DEFAULT_REWARDS = [
  { id: 'r1', title: 'Tea Break', desc: 'A warm cup of your favourite brew', tier: 'common', cooldownHours: 2, seasonal: false, available: true },
  { id: 'r2', title: 'Episode of a Show', desc: 'Watch one episode of your current series', tier: 'common', cooldownHours: 4, seasonal: false, available: true },
  { id: 'r3', title: 'Favourite Snack', desc: 'Enjoy a delicious treat', tier: 'uncommon', cooldownHours: 24, seasonal: false, available: true },
  { id: 'r4', title: 'Gaming Session', desc: 'An hour of your favourite game', tier: 'uncommon', cooldownHours: 48, seasonal: false, available: true },
  { id: 'r5', title: 'Dinner Out', desc: 'A meal at your favourite restaurant', tier: 'rare', cooldownHours: 168, seasonal: false, available: true },
  { id: 'r6', title: 'New Book', desc: 'Purchase a book from your wishlist', tier: 'rare', cooldownHours: 168, seasonal: false, available: true },
  { id: 'r7', title: 'Weekend Adventure', desc: 'Plan a fun day trip or outing', tier: 'epic', cooldownHours: 720, seasonal: false, available: true },
  { id: 'r8', title: 'Major Purchase', desc: 'Buy something from your wishlist', tier: 'legendary', cooldownHours: 2160, seasonal: false, available: true }
]

// ============================================================
// HELPER FUNCTIONS
// ============================================================
export function xpForLevel(n) {
  return n * n * 50 + n * 50
}

export function levelFromXP(totalXP) {
  let level = 1
  while (xpForLevel(level + 1) <= totalXP) {
    level++
    if (level >= 999) break
  }
  return level
}

export function xpToNextLevel(totalXP) {
  const level = levelFromXP(totalXP)
  const currentLevelXP = xpForLevel(level)
  const nextLevelXP = xpForLevel(level + 1)
  const progress = ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
  return { level, currentLevelXP, nextLevelXP, totalXP, progress: Math.min(progress, 100), needed: nextLevelXP - totalXP }
}

export function getMaxHP(character) {
  const resilience = character.talents?.resilience || 0
  return 100 + (character.stats.vitality * 5) + (resilience * 20)
}

export function getMaxMP(character) {
  return 50 + (character.stats.wisdom * 3)
}

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

function moonsRemaining(dueDate) {
  if (!dueDate) return null
  const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return `${Math.abs(diff)} moons overdue`
  if (diff === 0) return 'Due tonight'
  if (diff === 1) return '1 moon remaining'
  return `${diff} moons remaining`
}

export { moonsRemaining }

// ============================================================
// INITIAL STATE
// ============================================================
const initialCharacter = {
  name: '',
  title: '',
  class: '',
  stats: { vitality: 10, wisdom: 10, fortune: 10, charisma: 10 },
  level: 1,
  xp: 0,
  hp: 150,
  mp: 80,
  gold: 0,
  talents: { discipline: 0, ambition: 0, fortune: 0, wisdom: 0, resilience: 0 },
  talentPoints: 0,
  created: false
}

const initialStreak = {
  current: 0,
  longest: 0,
  lastDate: null
}

const initialStats = {
  totalCompleted: 0,
  totalFailed: 0,
  totalAbandoned: 0,
  categoryStats: { health: 0, intelligence: 0, money: 0, relationships: 0 },
  dailyActivity: {},
  legendaryCompleted: 0,
  maxQuestsInDay: 0,
  perfectQuests: 0,
  firstQuestToday: null
}

const getInitialState = () => {
  try {
    const saved = localStorage.getItem('rpg-quest-state')
    if (saved) return JSON.parse(saved)
  } catch (e) { /* ignore */ }

  return {
    character: initialCharacter,
    quests: [],
    rewards: DEFAULT_REWARDS,
    achievements: {},
    streak: initialStreak,
    stats: initialStats,
    notifications: [],
    pendingLevelUp: null,
    pendingReward: null,
    xpFloats: []
  }
}

// ============================================================
// REDUCER
// ============================================================
function gameReducer(state, action) {
  switch (action.type) {
    case 'CREATE_CHARACTER': {
      const char = action.payload
      return {
        ...state,
        character: {
          ...initialCharacter,
          ...char,
          hp: 100 + char.stats.vitality * 5,
          mp: 50 + char.stats.wisdom * 3,
          created: true
        }
      }
    }

    case 'ADD_QUEST': {
      const quest = {
        ...action.payload,
        id: action.payload.id || crypto.randomUUID(),
        state: 'available',
        createdAt: new Date().toISOString(),
        completedAt: null,
        bonusCompleted: []
      }
      return { ...state, quests: [quest, ...state.quests] }
    }

    case 'UPDATE_QUEST': {
      return {
        ...state,
        quests: state.quests.map(q => q.id === action.payload.id ? { ...q, ...action.payload } : q)
      }
    }

    case 'DELETE_QUEST': {
      return { ...state, quests: state.quests.filter(q => q.id !== action.id) }
    }

    case 'START_QUEST': {
      return {
        ...state,
        quests: state.quests.map(q => q.id === action.id ? { ...q, state: 'in_progress', startedAt: new Date().toISOString() } : q)
      }
    }

    case 'COMPLETE_QUEST': {
      const { questId, xpGained, goldGained, statGain } = action.payload
      const quest = state.quests.find(q => q.id === questId)
      if (!quest) return state

      const today = getTodayString()
      const dailyActivity = {
        ...state.stats.dailyActivity,
        [today]: (state.stats.dailyActivity[today] || 0) + 1
      }
      const todayCount = dailyActivity[today]
      const maxQuestsInDay = Math.max(state.stats.maxQuestsInDay, todayCount)

      const allBonusCompleted = quest.bonusObjectives?.length > 0 &&
        (action.payload.bonusCompleted?.length || 0) >= quest.bonusObjectives.length

      const newChar = { ...state.character }
      newChar.xp = (newChar.xp || 0) + xpGained
      newChar.gold = (newChar.gold || 0) + goldGained
      if (statGain) {
        newChar.stats = { ...newChar.stats }
        const statKey = CATEGORIES[quest.category]?.stat
        if (statKey && newChar.stats[statKey] < 100) {
          newChar.stats[statKey] = Math.min(100, newChar.stats[statKey] + statGain)
        }
      }

      const prevLevel = levelFromXP(state.character.xp)
      const newLevel = levelFromXP(newChar.xp)
      let pendingLevelUp = state.pendingLevelUp
      if (newLevel > prevLevel) {
        newChar.level = newLevel
        newChar.talentPoints = (newChar.talentPoints || 0) + (newLevel - prevLevel)
        // +1 to all stats per level
        const statsKeys = ['vitality', 'wisdom', 'fortune', 'charisma']
        statsKeys.forEach(k => { newChar.stats[k] = Math.min(100, newChar.stats[k] + (newLevel - prevLevel)) })
        pendingLevelUp = { from: prevLevel, to: newLevel }
      }

      const categoryStats = {
        ...state.stats.categoryStats,
        [quest.category]: (state.stats.categoryStats[quest.category] || 0) + 1
      }

      return {
        ...state,
        character: newChar,
        quests: state.quests.map(q => q.id === questId
          ? { ...q, state: 'completed', completedAt: new Date().toISOString(), bonusCompleted: action.payload.bonusCompleted || [] }
          : q),
        stats: {
          ...state.stats,
          totalCompleted: state.stats.totalCompleted + 1,
          categoryStats,
          dailyActivity,
          maxQuestsInDay,
          legendaryCompleted: quest.difficulty === 'legendary'
            ? state.stats.legendaryCompleted + 1
            : state.stats.legendaryCompleted,
          perfectQuests: allBonusCompleted
            ? state.stats.perfectQuests + 1
            : state.stats.perfectQuests
        },
        pendingLevelUp
      }
    }

    case 'FAIL_QUEST': {
      const quest = state.quests.find(q => q.id === action.id)
      const hpLoss = quest ? DIFFICULTIES[quest.difficulty]?.xp * 0.1 : 5
      return {
        ...state,
        quests: state.quests.map(q => q.id === action.id ? { ...q, state: 'failed', failedAt: new Date().toISOString() } : q),
        character: {
          ...state.character,
          hp: Math.max(0, state.character.hp - hpLoss)
        },
        stats: { ...state.stats, totalFailed: state.stats.totalFailed + 1 }
      }
    }

    case 'ABANDON_QUEST': {
      return {
        ...state,
        quests: state.quests.map(q => q.id === action.id ? { ...q, state: 'abandoned', abandonedAt: new Date().toISOString() } : q),
        stats: { ...state.stats, totalAbandoned: state.stats.totalAbandoned + 1 }
      }
    }

    case 'UPDATE_STREAK': {
      const today = getTodayString()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      const lastDate = state.streak.lastDate

      let newCurrent = state.streak.current
      if (lastDate === today) {
        // Already counted today
        return state
      } else if (lastDate === yesterdayStr) {
        newCurrent = state.streak.current + 1
      } else if (!lastDate) {
        newCurrent = 1
      } else {
        newCurrent = 1 // streak broken
      }

      return {
        ...state,
        streak: {
          current: newCurrent,
          longest: Math.max(state.streak.longest, newCurrent),
          lastDate: today
        }
      }
    }

    case 'UNLOCK_ACHIEVEMENT': {
      if (state.achievements[action.id]) return state
      return {
        ...state,
        achievements: { ...state.achievements, [action.id]: new Date().toISOString() }
      }
    }

    case 'SET_PENDING_REWARD': {
      return { ...state, pendingReward: action.payload }
    }

    case 'CLEAR_PENDING_REWARD': {
      return { ...state, pendingReward: null }
    }

    case 'CLEAR_LEVEL_UP': {
      return { ...state, pendingLevelUp: null }
    }

    case 'ADD_XP_FLOAT': {
      const id = crypto.randomUUID()
      return {
        ...state,
        xpFloats: [...state.xpFloats, { id, ...action.payload }]
      }
    }

    case 'REMOVE_XP_FLOAT': {
      return { ...state, xpFloats: state.xpFloats.filter(f => f.id !== action.id) }
    }

    case 'SPEND_TALENT_POINT': {
      const path = action.path
      if ((state.character.talentPoints || 0) <= 0) return state
      return {
        ...state,
        character: {
          ...state.character,
          talentPoints: state.character.talentPoints - 1,
          talents: {
            ...state.character.talents,
            [path]: (state.character.talents[path] || 0) + 1
          }
        }
      }
    }

    case 'ADD_REWARD': {
      return { ...state, rewards: [...state.rewards, { ...action.payload, id: crypto.randomUUID() }] }
    }

    case 'UPDATE_REWARD': {
      return { ...state, rewards: state.rewards.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r) }
    }

    case 'DELETE_REWARD': {
      return { ...state, rewards: state.rewards.filter(r => r.id !== action.id) }
    }

    case 'CLAIM_REWARD': {
      return {
        ...state,
        rewards: state.rewards.map(r => r.id === action.id ? { ...r, lastClaimed: new Date().toISOString() } : r)
      }
    }

    case 'RESTORE_HP': {
      return {
        ...state,
        character: {
          ...state.character,
          hp: Math.min(getMaxHP(state.character), state.character.hp + action.amount)
        }
      }
    }

    case 'RESTORE_MP': {
      return {
        ...state,
        character: {
          ...state.character,
          mp: Math.min(getMaxMP(state.character), state.character.mp + action.amount)
        }
      }
    }

    case 'TOGGLE_BONUS_OBJECTIVE': {
      const { questId, objectiveIdx } = action.payload
      return {
        ...state,
        quests: state.quests.map(q => {
          if (q.id !== questId) return q
          const bonusCompleted = q.bonusCompleted ? [...q.bonusCompleted] : []
          const idx = bonusCompleted.indexOf(objectiveIdx)
          if (idx >= 0) bonusCompleted.splice(idx, 1)
          else bonusCompleted.push(objectiveIdx)
          return { ...q, bonusCompleted }
        })
      }
    }

    case 'IMPORT_DATA': {
      return { ...action.payload }
    }

    default:
      return state
  }
}

// ============================================================
// CONTEXT
// ============================================================
const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, getInitialState)

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rpg-quest-state', JSON.stringify(state))
    } catch (e) { /* ignore quota errors */ }
  }, [state])

  // Check achievements
  useEffect(() => {
    ACHIEVEMENTS.forEach(ach => {
      if (!state.achievements[ach.id] && ach.check(state)) {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', id: ach.id })
      }
    })
  }, [state.stats, state.character, state.streak])

  // Calculate XP for completing a quest
  const calculateQuestXP = useCallback((quest) => {
    const base = DIFFICULTIES[quest.difficulty]?.xp || 50
    const char = state.character
    let xp = base

    // Class bonus
    const cls = CLASSES[char.class]
    if (cls) {
      if (cls.bonus === 'all') xp *= (1 + cls.bonusPct / 100)
      else if (cls.bonus === quest.category) xp *= (1 + cls.bonusPct / 100)
    }

    // Streak bonus
    const streakBonus = Math.min(state.streak.current * 0.1, 1.0)
    xp *= (1 + streakBonus)

    // First quest of day
    const today = getTodayString()
    if (!state.stats.dailyActivity[today]) xp += 25

    // Category mastery bonus (every 10 in category)
    const catCount = state.stats.categoryStats[quest.category] || 0
    if (catCount > 0 && catCount % 10 === 9) xp += 50

    // Talent bonuses
    if (char.talents?.discipline && quest.recurrence !== 'none') xp *= (1 + char.talents.discipline * 0.05)
    if (char.talents?.ambition && ['hard', 'epic', 'legendary'].includes(quest.difficulty)) xp *= (1 + char.talents.ambition * 0.10)

    // Bonus objectives
    const bonusCount = quest.bonusCompleted?.length || 0
    xp *= (1 + bonusCount * 0.25)

    return Math.round(xp)
  }, [state])

  // Calculate reward chance
  const calculateRewardChance = useCallback((quest) => {
    const diffMods = { trivial: -0.20, easy: -0.10, medium: 0, hard: 0.10, epic: 0.20, legendary: 1 }
    if (quest.difficulty === 'legendary') return 1

    let chance = 0.70
    chance += (diffMods[quest.difficulty] || 0)
    chance += Math.min(state.streak.current * 0.01, 0.10)
    const fortuneBonus = Math.max(0, state.character.stats.fortune - 10) * 0.005
    chance += fortuneBonus
    if (state.character.talents?.fortune) chance += state.character.talents.fortune * 0.03

    return Math.min(chance, 0.99)
  }, [state])

  // Roll reward tier
  const rollRewardTier = useCallback(() => {
    const roll = Math.random()
    if (roll < 0.01) return 'legendary'
    if (roll < 0.05) return 'epic'
    if (roll < 0.20) return 'rare'
    if (roll < 0.50) return 'uncommon'
    return 'common'
  }, [])

  // Get available rewards by tier
  const getRewardForTier = useCallback((tier) => {
    const available = state.rewards.filter(r => {
      if (r.tier !== tier) return false
      if (!r.available) return false
      if (r.lastClaimed && r.cooldownHours > 0) {
        const cooldownMs = r.cooldownHours * 3600 * 1000
        if (new Date() - new Date(r.lastClaimed) < cooldownMs) return false
      }
      return true
    })
    if (available.length === 0) {
      // Fallback to any available reward
      const any = state.rewards.filter(r => r.available)
      if (any.length === 0) return null
      return any[Math.floor(Math.random() * any.length)]
    }
    return available[Math.floor(Math.random() * available.length)]
  }, [state.rewards])

  const completeQuest = useCallback((questId, bonusCompleted = []) => {
    const quest = state.quests.find(q => q.id === questId)
    if (!quest) return

    // Update bonus completed on quest first
    const questWithBonus = { ...quest, bonusCompleted }
    const xpGained = calculateQuestXP(questWithBonus)
    const goldGained = Math.round(xpGained * 0.5 * (1 + (state.character.talents?.fortune || 0) * 0.15))

    dispatch({
      type: 'COMPLETE_QUEST',
      payload: { questId, xpGained, goldGained, statGain: 1, bonusCompleted }
    })

    // Update streak
    dispatch({ type: 'UPDATE_STREAK' })

    // XP float
    dispatch({
      type: 'ADD_XP_FLOAT',
      payload: { text: `+${xpGained} XP`, x: window.innerWidth / 2 + (Math.random() - 0.5) * 200, y: window.innerHeight / 2 }
    })

    // Reward check
    const chance = calculateRewardChance(quest)
    if (Math.random() < chance) {
      const tier = rollRewardTier()
      const reward = getRewardForTier(tier)
      dispatch({ type: 'SET_PENDING_REWARD', payload: { tier, reward, xp: xpGained } })
    }
  }, [state, calculateQuestXP, calculateRewardChance, rollRewardTier, getRewardForTier])

  const exportData = useCallback(() => {
    const data = JSON.stringify(state, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quest-codex-${getTodayString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [state])

  const importData = useCallback((json) => {
    try {
      const data = JSON.parse(json)
      dispatch({ type: 'IMPORT_DATA', payload: data })
    } catch (e) {
      alert('Invalid save file')
    }
  }, [])

  return (
    <GameContext.Provider value={{
      state,
      dispatch,
      completeQuest,
      calculateQuestXP,
      calculateRewardChance,
      exportData,
      importData,
      moonsRemaining
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
