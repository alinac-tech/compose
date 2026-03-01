import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../../context/GameContext'

export default function XPFloats() {
  const { state, dispatch } = useGame()

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      <AnimatePresence>
        {state.xpFloats.map(float => (
          <XPFloat key={float.id} float={float} onDone={() => dispatch({ type: 'REMOVE_XP_FLOAT', id: float.id })} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function XPFloat({ float, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1800)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: float.x,
        top: float.y,
        transform: 'translate(-50%, -50%)',
        fontFamily: 'var(--font-header)',
        fontWeight: 700,
        fontSize: '1.6rem',
        color: '#ffd700',
        textShadow: '0 0 8px rgba(255,215,0,0.8), 2px 2px 0 rgba(0,0,0,0.5)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        zIndex: 9999
      }}
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 1, 0], y: -60, scale: [0.5, 1.2, 1, 0.9] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.8, ease: 'easeOut' }}
    >
      {float.text}
    </motion.div>
  )
}
