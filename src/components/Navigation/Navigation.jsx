import React from 'react'
import { motion } from 'framer-motion'
import './Navigation.css'

export default function Navigation({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="tab-navigation">
      <div className="tab-list">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {activeTab === tab.id && (
              <motion.div
                className="tab-indicator"
                layoutId="tab-indicator"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="tab-edge-left" />
      <div className="tab-edge-right" />
    </nav>
  )
}
