import React, { useState, useEffect } from 'react'
import { storage, STORAGE_KEYS } from './utils/storage'
import SetupScreen from './components/SetupScreen'
import InterviewScreen from './components/InterviewScreen'
import './index.css'

function App() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkConfig = () => {
      const hasApiKey = !!storage.get(STORAGE_KEYS.API_KEY)
      setIsConfigured(hasApiKey)
      setChecking(false)
    }
    checkConfig()
  }, [])

  if (checking) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading MAIRI...</p>
      </div>
    )
  }

  if (!isConfigured) {
    return <SetupScreen onComplete={() => setIsConfigured(true)} />
  }

  return <InterviewScreen />
}

export default App