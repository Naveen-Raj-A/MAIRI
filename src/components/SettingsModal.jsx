import React, { useState, useEffect } from 'react'
import { PROVIDERS, STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants'
import { storage } from '../utils/storage'

export default function SettingsModal({ config, settings, onSave, onClose }) {
  const [provider, setProvider] = useState(config.provider)
  const [apiKey, setApiKey] = useState(config.apiKey)
  const [model, setModel] = useState(config.model)
  const [resumeContext, setResumeContext] = useState(config.resumeContext)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const providerConfig = PROVIDERS[provider]
  const availableModels = providerConfig.models
  const currentModel = model || providerConfig.defaultModel

  useEffect(() => {
    setProvider(config.provider)
    setApiKey(config.apiKey)
    setModel(config.model)
    setResumeContext(config.resumeContext)
    setLocalSettings(settings)
    setSaved(false)
  }, [config, settings])

  const handleProviderChange = (e) => {
    const newProvider = e.target.value
    setProvider(newProvider)
    setModel(PROVIDERS[newProvider].defaultModel)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!apiKey.trim()) {
      setError('API key is required.')
      return
    }

    const newConfig = {
      provider,
      apiKey: apiKey.trim(),
      model: currentModel,
      resumeContext: resumeContext.trim()
    }

    onSave(newConfig, localSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="settings-section">
            <h3>AI Provider</h3>

            <div className="form-group">
              <label htmlFor="settings-provider">Provider</label>
              <select
                id="settings-provider"
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
              <label htmlFor="settings-apiKey">API Key</label>
              <input
                type="password"
                id="settings-apiKey"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Paste your API key..."
                className="text-input"
              />
              <p className="field-hint">Stored locally in your browser.</p>
            </div>

            <div className="form-group">
              <label htmlFor="settings-model">Model</label>
              <select
                id="settings-model"
                value={currentModel}
                onChange={e => setModel(e.target.value)}
                className="select-input"
              >
                {availableModels.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h3>Your Context</h3>
            <div className="form-group">
              <label htmlFor="settings-resume">
                Resume / Context
                <span className="field-optional">(optional)</span>
              </label>
              <textarea
                id="settings-resume"
                value={resumeContext}
                onChange={e => setResumeContext(e.target.value)}
                placeholder="Paste your resume, key projects, tech stack, and achievements..."
                className="textarea-input"
                rows={6}
              />
            </div>
          </div>

          <div className="settings-section">
            <h3>Behavior</h3>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localSettings.autoStart}
                  onChange={e => handleSettingChange('autoStart', e.target.checked)}
                />
                <span>Auto-start listening on launch</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localSettings.showWaveform}
                  onChange={e => handleSettingChange('showWaveform', e.target.checked)}
                />
                <span>Show audio waveform visualizer</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localSettings.soundNotifications}
                  onChange={e => handleSettingChange('soundNotifications', e.target.checked)}
                />
                <span>Sound notifications</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localSettings.compactMode}
                  onChange={e => handleSettingChange('compactMode', e.target.checked)}
                />
                <span>Compact mode (narrower overlay)</span>
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="maxBullets">Max bullet points</label>
              <select
                id="maxBullets"
                value={localSettings.maxBulletPoints}
                onChange={e => handleSettingChange('maxBulletPoints', Number(e.target.value))}
                className="select-input"
              >
                {[2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {saved && <div className="success-message">Settings saved!</div>}

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}