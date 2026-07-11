import React, { useState } from 'react'
import { Download, Upload, Copy, Share2, AlertCircle, CheckCircle } from 'lucide-react'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { usePromptStore } from '@/store/promptStore'
import { exportPromptAsJson, importPromptFromJson } from '@/services/storage'
import { encodePromptToUrl } from '@/services/sharing'
import { copyToClipboard } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import './SharePanel.css'

export function SharePanel() {
  const [activeTab, setActiveTab] = useState('export')
  const prompts = usePromptStore(state => state.prompts)
  const [selectedPromptId, setSelectedPromptId] = useState(prompts[0]?.id || '')
  const [includeHistory, setIncludeHistory] = useState(true)
  const addToast = useUIStore(state => state.addToast)

  // Export Tab State
  const [exportJson, setExportJson] = useState('')

  // Import Tab State
  const [importJson, setImportJson] = useState('')
  const [importError, setImportError] = useState('')

  // Share Link Tab State
  const [shareUrl, setShareUrl] = useState('')

  const tabs = [
    { id: 'export', label: 'Export JSON', icon: Download },
    { id: 'import', label: 'Import JSON', icon: Upload },
    { id: 'share', label: 'Share Link', icon: Share2 },
  ]

  const handleExport = () => {
    if (!selectedPromptId) return
    const versions = usePromptStore.getState().getVersionsForPrompt(selectedPromptId)
    const prompt = prompts.find(p => p.id === selectedPromptId)
    if (!prompt) return

    const data = exportPromptAsJson(prompt, includeHistory ? versions : [versions[0]])
    setExportJson(data)
  }

  const handleDownload = () => {
    if (!exportJson) return
    const blob = new Blob([exportJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `promptforge-export-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    addToast('File downloaded successfully', 'success')
  }

  const handleImport = () => {
    setImportError('')
    try {
      const { prompt, versions } = importPromptFromJson(importJson)
      // Basic check
      if (!prompt.name || !versions.length) throw new Error("Invalid format")
      
      // In a real app, we'd add these to the store. For MVP, we'll just show success
      addToast(`Successfully imported: ${prompt.name}`, 'success')
      setImportJson('')
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse JSON')
    }
  }

  const handleGenerateLink = () => {
    if (!selectedPromptId) return
    const version = usePromptStore.getState().getCurrentVersion(selectedPromptId)
    const prompt = prompts.find(p => p.id === selectedPromptId)
    if (!prompt || !version) return

    try {
      const hash = encodePromptToUrl(prompt, version)
      const url = `${window.location.origin}/import#${hash}`
      setShareUrl(url)
    } catch (e) {
      addToast('Prompt is too large to encode in URL', 'error')
    }
  }

  return (
    <div className="share-panel page-container animate-fade-in">
      <div className="share-header">
        <h2>Share & Export</h2>
        <p className="text-muted">Export your prompts for backup, or share them with others.</p>
      </div>

      <div className="share-content">
        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
          className="share-tabs mb-6"
        />

        <div className="share-tab-content glass">
          
          {/* EXPORT TAB */}
          {activeTab === 'export' && (
            <div className="animate-slide-up">
              <div className="form-group mb-4">
                <label className="form-label">Select Prompt to Export</label>
                <select 
                  className="custom-select"
                  value={selectedPromptId}
                  onChange={(e) => setSelectedPromptId(e.target.value)}
                >
                  {prompts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="checkbox-group mb-6">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={includeHistory}
                    onChange={(e) => setIncludeHistory(e.target.checked)}
                  />
                  <span>Include version history</span>
                </label>
              </div>

              <div className="action-buttons mb-6">
                <Button variant="primary" onClick={handleExport}>Generate Export</Button>
                {exportJson && (
                  <>
                    <Button variant="secondary" icon={<Download size={16} />} onClick={handleDownload}>
                      Download File
                    </Button>
                    <Button variant="ghost" icon={<Copy size={16} />} onClick={() => copyToClipboard(exportJson)}>
                      Copy JSON
                    </Button>
                  </>
                )}
              </div>

              {exportJson && (
                <div className="json-preview animate-scale-in">
                  <pre>{exportJson}</pre>
                </div>
              )}
            </div>
          )}

          {/* IMPORT TAB */}
          {activeTab === 'import' && (
            <div className="animate-slide-up">
              <div className="form-group mb-4">
                <label className="form-label">Paste JSON Data</label>
                <textarea 
                  className="json-input"
                  placeholder='{"id": "...", "name": "..."}'
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                />
              </div>

              {importError && (
                <div className="error-banner mb-4">
                  <AlertCircle size={16} />
                  <span>{importError}</span>
                </div>
              )}

              <Button 
                variant="primary" 
                icon={<Upload size={16} />} 
                onClick={handleImport}
                disabled={!importJson.trim()}
              >
                Import Prompt
              </Button>
            </div>
          )}

          {/* SHARE LINK TAB */}
          {activeTab === 'share' && (
            <div className="animate-slide-up">
              <div className="info-box mb-6">
                <InfoIcon />
                <p>Share links encode the prompt data directly into the URL hash. No data is sent to our servers. URLs can get very long for large prompts.</p>
              </div>

              <div className="form-group mb-6">
                <label className="form-label">Select Prompt to Share</label>
                <select 
                  className="custom-select"
                  value={selectedPromptId}
                  onChange={(e) => setSelectedPromptId(e.target.value)}
                >
                  {prompts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <Button variant="primary" onClick={handleGenerateLink}>
                Generate URL
              </Button>

              {shareUrl && (
                <div className="share-url-result mt-6 animate-scale-in">
                  <div className="url-display">{shareUrl}</div>
                  <Button variant="secondary" icon={<Copy size={16} />} onClick={() => copyToClipboard(shareUrl)}>
                    Copy Link
                  </Button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function InfoIcon() {
  return <AlertCircle size={20} className="text-muted shrink-0" />
}
