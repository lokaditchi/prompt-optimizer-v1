import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import './ThemeToggle.css'

export function ThemeToggle() {
  const { theme, setTheme } = useSettingsStore()

  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Theme preference">
      <button
        className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
        onClick={() => setTheme('light')}
        aria-label="Light theme"
        role="radio"
        aria-checked={theme === 'light'}
      >
        <Sun size={14} />
      </button>
      <button
        className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
        onClick={() => setTheme('system')}
        aria-label="System theme"
        role="radio"
        aria-checked={theme === 'system'}
      >
        <Monitor size={14} />
      </button>
      <button
        className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
        onClick={() => setTheme('dark')}
        aria-label="Dark theme"
        role="radio"
        aria-checked={theme === 'dark'}
      >
        <Moon size={14} />
      </button>
    </div>
  )
}
