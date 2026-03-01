import React, { useMemo } from 'react'
import './DustParticles.css'

export default function DustParticles() {
  const particles = useMemo(() => (
    [...Array(15)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 8,
      opacity: Math.random() * 0.4 + 0.1
    }))
  ), [])

  return (
    <div className="dust-field" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="ambient-particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity
          }}
        />
      ))}
    </div>
  )
}
