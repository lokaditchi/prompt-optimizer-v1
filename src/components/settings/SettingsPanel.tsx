import React, { useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { Shield, Palette, Database } from 'lucide-react'
import { ApiKeyConfig } from './ApiKeyConfig'
import { ThemeToggle } from './ThemeToggle'
import './SettingsPanel.css'

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState('api')

  const tabs = [
    { id: 'api', label: 'API Configuration', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data Management', icon: Database },
  ]

  return (
    <div className="page-container animate-fade-in">
      <div className="settings-header">
        <h2>Settings</h2>
        <p className="text-muted">Manage your API keys, preferences, and local data.</p>
      </div>

      <div className="settings-content">
        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
          className="settings-tabs"
        />

        <div className="settings-tab-content">
          {activeTab === 'api' && (
            <div className="animate-slide-up">
              <ApiKeyConfig />
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-section animate-slide-up">
              <h3>Theme</h3>
              <p className="text-muted mb-4">Choose your preferred appearance for PromptForge.</p>
              <div className="setting-row">
                <span>Color Scheme</span>
                <ThemeToggle />
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="settings-section animate-slide-up">
              <h3>Local Storage</h3>
              <p className="text-muted mb-4">PromptForge stores all your prompts, history, and settings locally in your browser.</p>
              
              <div className="data-actions">
                <div className="data-action-card">
                  <h4>Export Data</h4>
                  <p className="text-sm text-muted">Download all your prompts and history as a JSON file backup.</p>
                  <button className="btn btn-secondary mt-2" onClick={() => alert('Not implemented in MVP')}>
                    Export All Data
                  </button>
                </div>
                
                <div className="data-action-card danger-zone">
                  <h4>Clear Data</h4>
                  <p className="text-sm text-muted">Permanently delete all prompts, history, and settings from this browser.</p>
                  <button className="btn btn-danger mt-2" onClick={() => alert('Not implemented in MVP')}>
                    Clear Local Storage
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
