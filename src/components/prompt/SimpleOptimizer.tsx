import React, { useState } from 'react'
import { Wand2, Loader2, Copy, CheckCircle2 } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { useUIStore } from '@/store/uiStore'
import { optimizePrompt } from '@/services/ai/aiService'
import { Button } from '@/components/ui/Button'
import { copyToClipboard } from '@/lib/utils'
import './SimpleOptimizer.css'

export function SimpleOptimizer() {
  const [draft, setDraft] = useState('')
  const [optimized, setOptimized] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [copied, setCopied] = useState(false)

  const apiKey = useSettingsStore(state => state.apiKey)
  const defaultModel = useSettingsStore(state => state.defaultModel)
  const addToast = useUIStore(state => state.addToast)

  const handleOptimize = async () => {
    if (!draft.trim()) return

    if (!apiKey) {
      addToast('Please configure your API key in Settings first', 'warning')
      return
    }

    setIsOptimizing(true)
    try {
      const result = await optimizePrompt(draft, '', {
        apiKey,
        model: 'gemini-3.0-flash', // Force 3.0 flash for new API accounts
      })
      
      // Combine system message and content if both exist
      let finalOutput = result.content
      if (result.systemMessage) {
        finalOutput = `**System Message:**\n${result.systemMessage}\n\n**Prompt:**\n${result.content}`
      }
      
      setOptimized(finalOutput)
      setCopied(false)
      addToast('Prompt optimized successfully!', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Optimization failed', 'error')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleCopy = () => {
    if (!optimized) return
    copyToClipboard(optimized)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="simple-optimizer page-container animate-fade-in">
      <div className="optimizer-header">
        <h1>AI Prompt Optimizer</h1>
        <p>Turn a simple idea into a highly detailed, professional prompt.</p>
      </div>

      <div className="optimizer-split">
        {/* Left Pane: Input */}
        <div className="optimizer-pane">
          <div className="pane-header">
            <h2>Your Draft</h2>
          </div>
          <textarea
            className="pane-textarea"
            placeholder="Type a simple idea here... (e.g. 'make me an app')"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={isOptimizing}
          />
        </div>

        {/* Center Action */}
        <div className="optimizer-action-center">
          <Button 
            variant="primary" 
            size="lg"
            className="optimize-btn"
            icon={isOptimizing ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
            onClick={handleOptimize}
            disabled={isOptimizing || !draft.trim()}
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize'}
          </Button>
        </div>

        {/* Right Pane: Output */}
        <div className="optimizer-pane">
          <div className="pane-header">
            <h2>Optimized Result</h2>
            <Button
              variant="ghost"
              size="sm"
              icon={copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
              onClick={handleCopy}
              disabled={!optimized}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <textarea
            className="pane-textarea output-textarea"
            placeholder="Your expanded, highly specific prompt will appear here..."
            value={optimized}
            readOnly
          />
        </div>
      </div>
    </div>
  )
}
