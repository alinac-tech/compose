import React from 'react'
import { GameProvider, useGame } from './context/GameContext'
import CharacterCreation from './components/CharacterCreation/CharacterCreation'
import BookLayout from './components/Book/BookLayout'
import DustParticles from './components/Shared/DustParticles'

function AppInner() {
  const { state } = useGame()

  if (!state.character.created) {
    return <CharacterCreation />
  }

  return (
    <>
      <DustParticles />
      <BookLayout />
    </>
  )
}

export default function App() {
  return (
    <GameProvider>
      <AppInner />
    </GameProvider>
  )
}
