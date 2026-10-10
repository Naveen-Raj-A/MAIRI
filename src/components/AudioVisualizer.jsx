import React from 'react'

/**
 * AudioVisualizer — Real-time waveform display.
 * Shows listening state + interim transcript while MAIRI is capturing audio.
 */
export default function AudioVisualizer({ isListening, interimTranscript, status }) {
  const barsRef = useRef([])
  const animationRef = useRef(null)

  useEffect(() => {
    if (isListening) {
      // Generate random-ish bar heights for visual feedback
      animateBars()
    } else {
      cancelAnimationFrame(animationRef.current)
      barsRef.current = []
    }
  }, [isListening])

  const animateBars = () => {
    // 24 bars for the visualizer
    const newBars = Array.from({ length: 24 }, () => Math.random() * 0.6 + 0.2)
    barsRef.current = newBars
    animationRef.current = requestAnimationFrame(animateBars)
  }

  // Render a simple canvas-based waveform
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      if (!isListening) return

      const width = canvas.width / dpr
      const height = canvas.height / dpr

      ctx.clearRect(0, 0, width, height)

      const barWidth = width / barsRef.current.length
      const maxHeight = height * 0.8

      ctx.fillStyle = '#3f3f46' // zinc-700

      barsRef.current.forEach((heightRatio, i) => {
        const barHeight = maxHeight * heightRatio
        const x = i * barWidth
        const y = (height - barHeight) / 2

        ctx.beginPath()
        ctx.roundRect(x + 1, y, barWidth - 2, barHeight, 2)
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(draw)
    }

    if (isListening) draw()

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [isListening])

  return (
    <div className="audio-visualizer">
      <canvas ref={canvasRef} width={400} height={80} />
      {interimTranscript && (
        <div className="transcript-preview" aria-live="polite">
          {interimTranscript}
        </div>
      )}
      {status === 'processing' && (
        <div className="processing-indicator">
          <span className="spinner"></span>
          Analyzing question...
        </div>
      )}
    </div>
  )
}

import { useRef, useEffect } from 'react'