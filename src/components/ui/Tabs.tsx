import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import './Tabs.css'

export interface Tab {
  id: string
  label: string
  icon?: LucideIcon
}

export interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])
  
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index
    
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length
    }
    
    if (nextIndex !== index) {
      tabsRef.current[nextIndex]?.focus()
      onChange(tabs[nextIndex].id)
    }
  }

  return (
    <div className={`tabs-container ${className}`} role="tablist">
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon
        
        return (
          <button
            key={tab.id}
            ref={(el) => (tabsRef.current[index] = el as HTMLButtonElement | null) as any}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            className={`tab-button ${isActive ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {Icon && <Icon size={16} className="tab-icon" />}
            <span>{tab.label}</span>
            
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="tab-indicator"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
