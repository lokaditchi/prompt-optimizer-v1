import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Play, Copy, MessageSquare, History, SlidersHorizontal, Plus, ChevronDown } from 'lucide-react'
import { usePromptStore } from '@/store/promptStore'
import { detectPlaceholders } from '@/lib/placeholderEngine'
import { copyToClipboard } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Tooltip } from '@/components/ui/Tooltip'
import './PromptComposer.css'

export function PromptComposer() {
  const navigate = useNavigate()
  const prompts = usePromptStore(state => state.prompts)
  const activePromptId = usePromptStore(state => state.activePromptId)
  const allVersions = usePromptStore(state => state.versions)

  const activePrompt = prompts.find(p => p.id === activePromptId) || null
  const activeVersion = activePrompt ? allVersions.find(v => v.id === activePrompt.currentVersionId) || null : null
  const versions = activePromptId ? allVersions.filter(v => v.promptId === activePromptId).sort((a, b) => b.versionNumber - a.versionNumber) : []
  
  const createPrompt = usePromptStore(state => state.createPrompt)
  const setActivePrompt = usePromptStore(state => state.setActivePrompt)
  const createVersion = usePromptStore(state => state.createVersion)
  const updatePrompt = usePromptStore(state => state.updatePrompt)
  const restoreVersion = usePromptStore(state => state.restoreVersion)

  // Local state for edits
  const [content, setContent] = useState('')
  const [systemMessage, setSystemMessage] = useState('')
  const [showSystemMsg, setShowSystemMsg] = useState(false)
  const [promptName, setPromptName] = useState('')
  const [showRightPanel, setShowRightPanel] = useState(true)

  // Sync with active version
  useEffect(() => {
    if (activeVersion && activePrompt) {
      setContent(activeVersion.content)
      setSystemMessage(activeVersion.systemMessage || '')
      setPromptName(activePrompt.name)
      setShowSystemMsg(!!activeVersion.systemMessage)
    } else if (prompts.length === 0) {
      createPrompt('My First Prompt', 'A new prompt')
    } else if (!activePromptId && prompts.length > 0) {
      setActivePrompt(prompts[0].id)
    }
  }, [activePromptId, activeVersion?.id]) // Only depend on IDs changing

  const handleSaveVersion = () => {
    if (!activePromptId || !activeVersion) return
    const note = prompt('Enter a note for this version:', 'Updated prompt')
    if (note) {
      const placeholders = detectPlaceholders(content)
      createVersion(
        activePromptId,
        content,
        systemMessage,
        placeholders,
        activeVersion.parameters,
        note
      )
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromptName(e.target.value)
    if (activePromptId) {
      updatePrompt(activePromptId, { name: e.target.value })
    }
  }

  const handleCopy = () => {
    copyToClipboard(content)
  }

  const detectedPlaceholders = detectPlaceholders(content)

  return (
    <div className="prompt-composer page-container animate-fade-in">
      <div className="composer-header">
        <div className="prompt-selector-wrapper">
          <select 
            className="prompt-selector"
            value={activePromptId || ''}
            onChange={(e) => setActivePrompt(e.target.value)}
          >
            {prompts.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown size={16} className="selector-icon" />
        </div>
        
        <Button 
          variant="secondary" 
          size="sm" 
          icon={<Plus size={16} />}
          onClick={() => createPrompt('New Prompt', 'Enter a description...')}
        >
          New
        </Button>
      </div>

      <div className="composer-layout">
        <div className="composer-main">
          <input 
            className="prompt-name-input"
            value={promptName}
            onChange={handleNameChange}
            placeholder="Prompt Name"
            aria-label="Prompt name"
          />

          <div className="editor-container">
            <div className="editor-toolbar">
              <button 
                className={`toolbar-btn ${showSystemMsg ? 'active' : ''}`}
                onClick={() => setShowSystemMsg(!showSystemMsg)}
                aria-pressed={showSystemMsg}
              >
                <MessageSquare size={16} />
                <span>System Message</span>
              </button>
            </div>

            {showSystemMsg && (
              <textarea
                className="system-message-input"
                placeholder="Enter system instructions (e.g., 'You are a helpful coding assistant.')"
                value={systemMessage}
                onChange={(e) => setSystemMessage(e.target.value)}
                aria-label="System message"
              />
            )}

            <div className="content-editor-wrapper">
              <textarea
                className="content-editor"
                placeholder="Write your prompt here... Use {{variable}} for placeholders."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                aria-label="Prompt content"
              />
            </div>
            
            <div className="editor-footer">
              <div className="stats">
                <span>{content.length} chars</span>
                <span>{content.split(/\s+/).filter(Boolean).length} words</span>
                <span>~{Math.ceil(content.length / 4)} tokens</span>
              </div>
              {detectedPlaceholders.length > 0 && (
                <div className="placeholder-badge">
                  {detectedPlaceholders.length} placeholder(s) detected
                </div>
              )}
            </div>
          </div>

          <div className="composer-actions">
            <Button 
              variant="primary" 
              icon={<Play size={16} />}
              onClick={() => navigate('/test')}
            >
              Test Prompt
            </Button>
            <Button 
              variant="secondary" 
              icon={<Save size={16} />}
              onClick={handleSaveVersion}
              disabled={content === activeVersion?.content && systemMessage === activeVersion?.systemMessage}
            >
              Save Version
            </Button>
            <Button 
              variant="ghost" 
              icon={<Copy size={16} />}
              onClick={handleCopy}
            >
              Copy
            </Button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={`composer-sidebar ${showRightPanel ? 'open' : 'closed'}`}>
          <div className="sidebar-section">
            <h3 className="section-title">
              <History size={16} />
              Version History
            </h3>
            <div className="version-list">
              {versions.map(v => (
                <div key={v.id} className={`version-item ${v.id === activeVersion?.id ? 'active' : ''}`}>
                  <div className="version-info">
                    <span className="version-number">v{v.versionNumber}</span>
                    <span className="version-date">{new Date(v.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="version-note">{v.changeNote}</p>
                  {v.id !== activeVersion?.id && (
                    <button 
                      className="restore-btn"
                      onClick={() => restoreVersion(v.id)}
                    >
                      Restore
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
