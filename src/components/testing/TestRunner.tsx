import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Play, Square, Settings as SettingsIcon, AlertCircle, Copy, Clock, Zap, DollarSign } from 'lucide-react'
import { useTestRunner } from '@/hooks/useTestRunner'
import { usePromptStore } from '@/store/promptStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useTestStore } from '@/store/testStore'
import { detectPlaceholders, resolvePlaceholders } from '@/lib/placeholderEngine'
import { formatCost, copyToClipboard } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import './TestRunner.css'

export function TestRunner() {
  const { runTest, cancelTest, isRunning, currentResponse, error, metrics } = useTestRunner()
  const apiKey = useSettingsStore(state => state.apiKey)
  const defaultModel = useSettingsStore(state => state.defaultModel)
  
  const prompts = usePromptStore(state => state.prompts)
  const allVersions = usePromptStore(state => state.versions)
  const activePromptId = usePromptStore(state => state.activePromptId)
  
  const activePrompt = prompts.find(p => p.id === activePromptId) || null
  const activeVersion = activePrompt ? allVersions.find(v => v.id === activePrompt.currentVersionId) || null : null
  
  const testRuns = useTestStore(state => state.testRuns)
  
  const [promptContent, setPromptContent] = useState('')
  const [systemMessage, setSystemMessage] = useState('')
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({})
  const [showResolved, setShowResolved] = useState(false)
  
  const responseEndRef = useRef<HTMLDivElement>(null)

  // Sync with active prompt
  useEffect(() => {
    if (activeVersion) {
      setPromptContent(activeVersion.content)
      setSystemMessage(activeVersion.systemMessage || '')
      
      // Initialize placeholder values
      const detected = detectPlaceholders(activeVersion.content)
      const initialValues: Record<string, string> = {}
      detected.forEach(p => {
        initialValues[p.key] = p.defaultValue || ''
      })
      setPlaceholderValues(initialValues)
    }
  }, [activeVersion])

  // Auto-scroll response
  useEffect(() => {
    if (isRunning && responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentResponse, isRunning])

  const handlePlaceholderChange = (key: string, value: string) => {
    setPlaceholderValues(prev => ({ ...prev, [key]: value }))
  }

  const handleRun = () => {
    if (!promptContent) return
    const resolved = resolvePlaceholders(promptContent, placeholderValues)
    runTest(resolved, systemMessage, activeVersion?.parameters)
  }

  const detectedPlaceholders = detectPlaceholders(promptContent)
  const resolvedPrompt = resolvePlaceholders(promptContent, placeholderValues)
  
  // Format history for sidebar
  const recentRuns = [...testRuns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)

  return (
    <div className="test-runner page-container animate-fade-in">
      <div className="runner-layout">
        
        {/* Main Area */}
        <div className="runner-main">
          {!apiKey && (
            <div className="api-key-warning mb-6 animate-scale-in">
              <AlertCircle className="warning-icon" />
              <div className="warning-content">
                <h3>API Key Required</h3>
                <p>You need to set your Gemini API key before running tests.</p>
              </div>
              <Link to="/settings" className="btn btn-primary">Go to Settings</Link>
            </div>
          )}

          <div className="runner-panel input-panel">
            <div className="panel-header">
              <h2>{activePrompt ? `Testing: ${activePrompt.name}` : 'Ad-hoc Test'}</h2>
              <div className="model-badge">
                <Badge variant="info" size="sm">{activeVersion?.parameters?.model || defaultModel}</Badge>
              </div>
            </div>

            {detectedPlaceholders.length > 0 && (
              <div className="placeholders-section">
                <h3 className="section-label">Placeholder Values</h3>
                <div className="placeholders-grid">
                  {detectedPlaceholders.map(p => (
                    <div key={p.key} className="placeholder-input-group">
                      <label>{p.key}</label>
                      <input 
                        type="text" 
                        className="custom-input"
                        placeholder={p.description || `Value for ${p.key}`}
                        value={placeholderValues[p.key] || ''}
                        onChange={(e) => handlePlaceholderChange(p.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="prompt-preview-section">
              <div className="section-header">
                <h3 className="section-label">Resolved Prompt</h3>
                <button 
                  className="text-link"
                  onClick={() => setShowResolved(!showResolved)}
                >
                  {showResolved ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {showResolved && (
                <div className="resolved-prompt animate-slide-up">
                  {resolvedPrompt || <span className="text-muted">Empty prompt...</span>}
                </div>
              )}
            </div>

            <div className="action-bar">
              {isRunning ? (
                <Button 
                  variant="danger" 
                  icon={<Square size={16} />}
                  onClick={cancelTest}
                  className="run-btn"
                >
                  Cancel Test
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  icon={<Play size={16} fill="currentColor" />}
                  onClick={handleRun}
                  disabled={!apiKey || !promptContent}
                  className="run-btn"
                >
                  Run Test
                </Button>
              )}
            </div>
          </div>

          <div className="runner-panel response-panel">
            <div className="panel-header">
              <h2>Response</h2>
              {!isRunning && currentResponse && (
                <Button variant="ghost" size="sm" icon={<Copy size={16} />} onClick={() => copyToClipboard(currentResponse)}>
                  Copy
                </Button>
              )}
            </div>

            {error && (
              <div className="error-banner animate-fade-in">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="response-content">
              {!currentResponse && !isRunning && !error ? (
                <div className="empty-response text-muted">
                  Click 'Run Test' to generate a response.
                </div>
              ) : (
                <div className="markdown-body">
                  {/* Basic pre-wrap for now, would use ReactMarkdown in a real app */}
                  <pre className="response-text">{currentResponse}</pre>
                  {isRunning && <span className="cursor-blink">▋</span>}
                  <div ref={responseEndRef} />
                </div>
              )}
            </div>

            {metrics && !isRunning && (
              <div className="metrics-bar animate-fade-in">
                <div className="metric-item">
                  <Clock size={14} className="text-muted" />
                  <span>{metrics.latencyMs}ms</span>
                </div>
                <div className="metric-item">
                  <Zap size={14} className="text-muted" />
                  <span>{metrics.totalTokens} tokens</span>
                  <span className="text-muted text-xs">({metrics.promptTokens} in / {metrics.completionTokens} out)</span>
                </div>
                <div className="metric-item">
                  <DollarSign size={14} className="text-muted" />
                  <span>{formatCost(metrics.estimatedCost)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar History */}
        <div className="runner-sidebar hide-mobile">
          <div className="sidebar-header">
            <h3>Recent Runs</h3>
          </div>
          
          <div className="history-list">
            {recentRuns.length === 0 ? (
              <p className="text-muted text-sm p-4 text-center">No tests run yet.</p>
            ) : (
              recentRuns.map(run => (
                <div key={run.id} className="history-item">
                  <div className="history-item-header">
                    <span className="history-prompt-name truncate">{run.promptName || 'Ad-hoc'}</span>
                    <Badge 
                      variant={run.status === 'success' ? 'success' : run.status === 'error' ? 'error' : 'warning'}
                      size="sm"
                    >
                      {run.status}
                    </Badge>
                  </div>
                  <div className="history-item-meta">
                    <span>{new Date(run.createdAt).toLocaleTimeString()}</span>
                    {run.metrics && <span>{run.metrics.latencyMs}ms</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
