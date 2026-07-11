import React, { useState } from 'react'
import { Eye, EyeOff, Key, Server, Cpu, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { testConnection } from '@/services/ai/aiService'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import './ApiKeyConfig.css'

export function ApiKeyConfig() {
  const { apiKey, setApiKey, baseUrl, setBaseUrl, defaultModel, setModel, availableModels } = useSettingsStore()
  
  const [showKey, setShowKey] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTestConnection = async () => {
    if (!apiKey) {
      setTestResult({ success: false, message: 'Please enter an API key first' })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const result = await testConnection(apiKey, baseUrl)
      if (result.success) {
        setTestResult({ success: true, message: 'Connection successful!' })
      } else {
        setTestResult({ success: false, message: result.error || 'Connection failed' })
      }
    } catch (error: any) {
      setTestResult({ success: false, message: error.message || 'Connection failed' })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="api-config">
      <div className="security-notice">
        <div className="security-icon"><Key size={24} /></div>
        <div className="security-text">
          <p className="font-semibold text-white">Your API key is secure</p>
          <p className="text-sm text-muted">
            Your key is stored <strong>only in your browser's local storage</strong>. 
            It is never sent to our servers or written to any file. It is only sent directly to the Google Gemini API when you run a test.
          </p>
        </div>
      </div>

      <div className="config-form">
        <div className="form-group">
          <div className="input-with-action">
            <Input
              label="Gemini API Key"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              icon={<Key size={18} />}
              autoComplete="off"
            />
            <button 
              className="toggle-visibility"
              type="button"
              onClick={() => setShowKey(!showKey)}
              aria-label={showKey ? "Hide API key" : "Show API key"}
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="form-helper">
            Get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Google AI Studio</a>.
          </p>
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label className="form-label">Default Model <Cpu size={14} className="inline ml-1 opacity-60" /></label>
            <div className="custom-select-wrapper">
              <select 
                className="custom-select"
                value={defaultModel}
                onChange={(e) => setModel(e.target.value)}
              >
                {availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group flex-2">
            <Input
              label="API Base URL (Optional)"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://generativelanguage.googleapis.com/v1beta"
              icon={<Server size={18} />}
            />
          </div>
        </div>

        <div className="test-connection-area">
          <Button 
            variant="secondary"
            onClick={handleTestConnection}
            disabled={isTesting || !apiKey}
            icon={isTesting ? <Loader2 size={16} className="animate-spin" /> : null}
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Button>

          {testResult && (
            <div className={`test-result animate-scale-in ${testResult.success ? 'success' : 'error'}`}>
              {testResult.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
