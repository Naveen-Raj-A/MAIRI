import React, { useState, useEffect, useRef, useCallback } from 'react'
import { audioService } from '../services/audioService'
import { generateTalkingPoints } from '../services/aiService'
import { isInterviewerQuestion } from '../utils/questionFilter'
import { storage, STORAGE_KEYS } from '../utils/storage'
import SettingsModal from './SettingsModal'
import AudioVisualizer from './AudioVisualizer'
import ManualInput from './ManualInput'

export default function InterviewScreen() {
  // Configuration from localStorage
  const [config, setConfig] = useState(() => ({
    provider: storage.get(STORAGE_KEYS.PROVIDER, 'openrouter'),
    model: storage.get(STORAGE_KEYS.MODEL, ''),
    apiKey: storage.get(STORAGE_KEYS.API_KEY, ''),
    resumeContext: storage.get(STORAGE_KEYS.RESUME_CONTEXT, '')
  }))
  const [settings, setSettings] = useState(() =>
    storage.get(STORAGE_KEYS.SETTINGS, { autoStart: false, showWaveform: true, soundNotifications: true, compactMode: false, maxBulletPoints: 3 })
  )

  // UI state
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [talkingPoints, setTalkingPoints] = useState([])
  const [status, setStatus] = useState('idle') // idle | listening | processing | error
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [manualQuestion, setManualQuestion] = useState('')

  // Refs
  const abortControllerRef = useRef(null)

  // Update config if localStorage changes externally
  useEffect(() => {
    const handleStorageChange = () => {
      setConfig({
        provider: storage.get(STORAGE_KEYS.PROVIDER, 'openrouter'),
        model: storage.get(STORAGE_KEYS.MODEL, ''),
        apiKey: storage.get(STORAGE_KEYS.API_KEY, ''),
        resumeContext: storage.get(STORAGE_KEYS.RESUME_CONTEXT, '')
      })
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Save settings
  useEffect(() => {
    storage.set(STORAGE_KEYS.SETTINGS, settings)
  }, [settings])

  const handleInterimTranscript = useCallback((text, isFinal) => {
    setInterimTranscript(text)
  }, [])

  const handleError = useCallback((err) => {
    console.error('Audio error:', err)
    setError(err.message)
    setStatus('error')
    setIsListening(false)
  }, [])

  const handleQuestionDetected = useCallback(async (question) => {
    setStatus('processing')
    setError('')
    abortControllerRef.current = new AbortController()

    try {
      const points = await generateTalkingPoints(
        question,
        config.resumeContext,
        {
          providerId: config.provider,
          model: config.model,
          apiKey: config.apiKey
        }
      )

      // Parse the AI response into individual bullet points
      const parsedPoints = points
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .slice(0, settings.maxBulletPoints)

      setTalkingPoints(parsedPoints)
      setStatus('idle')
    } catch (err) {
      console.error('AI error:', err)
      setError(err.message)
      setStatus('error')
    } finally {
      setInterimTranscript('')
    }
  }, [config, settings.maxBulletPoints])

  const startListening = useCallback(() => {
    if (!audioService.isSpeechRecognitionSupported()) {
      setError('Speech recognition not supported. Use Chrome or Edge.')
      return
    }
    setStatus('listening')
    setIsListening(true)
    setError('')
    audioService.startRecognition({
      onQuestion: handleQuestionDetected,
      onTranscript: handleInterimTranscript,
      onError: handleError
    })
  }, [handleQuestionDetected, handleInterimTranscript, handleError])

  const stopListening = useCallback(() => {
    audioService.stopRecognition()
    setIsListening(false)
    setStatus('idle')
  }, [])

  const handleManualSubmit = useCallback(async (question) => {
    if (!question.trim()) return
    await handleQuestionDetected(question.trim())
  }, [handleQuestionDetected])

  const clearTalkingPoints = useCallback(() => {
    setTalkingPoints([])
    setInterimTranscript('')
  }, [])

  // Keyboard shortcuts: Space to start/stop listening
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'Space') {
        e.preventDefault()
        if (isListening) stopListening()
        else startListening()
      }
      if (e.code === 'Escape') {
        clearTalkingPoints()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isListening, startListening, stopListening, clearTalkingPoints])

  if (showSettings) {
    return (
      <SettingsModal
        config={config}
        settings={settings}
        onSave={(newConfig, newSettings) => {
          setConfig(newConfig)
          setSettings(newSettings)
        }}
        onClose={() => setShowSettings(false)}
      />
    )
  }

  return (
    <div className={`mairi-app ${settings.compactMode ? 'compact' : ''}`}>
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">MAIRI</span>
        </div>
        <div className="header-controls">
          <button
            className="icon-btn"
            onClick={() => setShowSettings(true)}
            title="Settings (⌘,)"
            aria-label="Settings"
          >
            ⚙
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* Audio Visualizer */}
        {settings.showWaveform && (
          <AudioVisualizer
            isListening={isListening}
            interimTranscript={interimTranscript}
            status={status}
          />
        )}

        {/* Talking Points Display */}
        <section className="talking-points" aria-live="polite">
          {talkingPoints.length === 0 ? (
            <div className="empty-state">
              <p className="empty-hint">
                {isListening ? 'Listening for questions...' : 'Press Space to start listening'}
              </p>
              <p className="empty-hint sub">Or type a question below.</p>
            </div>
          ) : (
            <ul className="points-list">
              {talkingPoints.map((point, i) => (
                <li key={i} className="point-item">
                  <span className="point-bullet">▸</span>
                  <span className="point-text" dangerouslySetInnerHTML={{ __html: point }} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Status / Error */}
        {status === 'error' && (
          <div className="error-toast">{error}</div>
        )}
        {status === 'processing' && (
          <div className="processing-toast">Generating talking points...</div>
        )}

        {/* Manual Input Fallback */}
        <ManualInput
          onSubmit={handleManualSubmit}
          placeholder="Type a question manually..."
        />
      </main>

      <footer className="app-footer">
        <div className="footer-controls">
          <button
            className={`control-btn ${isListening ? 'active' : ''}`}
            onClick={isListening ? stopListening : startListening}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? '■ Stop' : '▶ Listen'}
          </button>
          <button
            className="control-btn secondary"
            onClick={clearTalkingPoints}
            disabled={talkingPoints.length === 0}
          >
            ✕ Clear
          </button>
        </div>
        <div className="shortcuts-hint">
          <kbd>Space</kd> Listen &nbsp;|&nbsp; <kbd>Esc</kbd> Clear
        </div>
      </footer>
    </div>
  )
}