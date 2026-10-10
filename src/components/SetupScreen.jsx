import React, { useState, useEffect } from 'react'
import { PROVIDERS, STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants'
import { storage } from '../utils/storage'

export default function SetupScreen({ onComplete }) {
  const [provider, setProvider] = useState('openrouter')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [resumeContext, setResumeContext] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [error, setError] = useState('')

  // Load any previously saved values so the user can re-configure
  useEffect(() => {
    const savedProvider = storage.get(STORAGE_KEYS.PROVIDER, 'openrouter')
    const savedKey = storage.get(STORAGE_KEYS.API_KEY, '')
    const savedModel = storage.get(STORAGE_KEYS.MODEL, '')
    const savedResume = storage.get(STORAGE_KEYS.RESUME_CONTEXT, '')

    setProvider(savedProvider)
    setApiKey(savedKey)
    setModel(savedModel)
    setResumeContext(savedResume)
  }, [])

  const providerConfig = PROVIDERS[provider]
  const availableModels = providerConfig.models
  const currentModel = model || providerConfig.defaultModel

  const handleProviderChange = (e) => {
    const newProvider = e.target.value
    setProvider(newProvider)
    setModel(PROVIDERS[newProvider].defaultModel)
  }

  const handleModelChange = (e) => {
    setModel(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!apiKey.trim()) {
      setError('API key is required.')
      return
    }

    // Save to localStorage
    storage.set(STORAGE_KEYS.PROVIDER, provider)
    storage.set(STORAGE_KEYS.API_KEY, apiKey.trim())
    storage.set(STORAGE_KEYS.MODEL, currentModel)
    storage.set(STORAGE_KEYS.RESUME_CONTEXT, resumeContext.trim())
    storage.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)

    onComplete()
  }

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <div className="setup-header">
          <div className="logo">
            <span className="logo-icon">✦</span>
            <span className="logo-text">MAIRI</span>
          </div>
          <p className="setup-subtitle">Real-Time AI Interview Companion</p>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label htmlFor="provider">AI Provider</label>
            <select
              id="provider"
              value={provider}
              onChange={handleProviderChange}
              className="select-input"
            >
              {Object.values(PROVIDERS).map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="apiKey">API Key</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Paste your API key..."
              className="text-input"
              autoFocus
            />
            <p className="field-hint">
              Your key is stored locally in your browser. It never leaves your machine.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="model">Model</label>
            <select
              id="model"
              value={currentModel}
              onChange={handleModelChange}
              className="select-input"
            >
              {availableModels.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? '▲ Hide advanced' : '▼ Show advanced'}
            </button>
          </div>

          {showAdvanced && (
            <div className="form-group advanced-section">
              <label htmlFor="customModel">Custom Model ID</label>
              <input
                type="text"
                id="customModel"
                value={model}
                onChange={handleModelChange}
                placeholder="e.g., anthropic/claude-3.5-sonnet"
                className="text-input"
              />
              <p className="field-hint">
                Override the model selection above. Useful for OpenRouter models not in the list.
              </p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="resumeContext">
              Your Context / Resume
              <span className="field-optional">(optional but recommended)</span>
            </label>
            <textarea
              id="resumeContext"
              value={resumeContext}
              onChange={e => setResumeContext(e.target.value)}
              placeholder={'Paste your resume, key projects, tech stack, and achievements here.\n\nExample:\n- 5 years full-stack experience\n- Specializes in React, Node.js, PostgreSQL\n- Led migration of monolith to microservices\n- Strong in system design and distributed systems'}
              className="textarea-input"
              rows={8}
            />
            <p className="field-hint">
              MAIRI uses this to tailor talking points to your specific background.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="primary-btn">
            Launch MAIRI
          </button>
        </form>

        <div className="setup-footer">
          <p>
            Don't have an API key?{' '}
            <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">
              Get one from OpenRouter
            </a>
            {' '}or{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
              Google AI Studio
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}