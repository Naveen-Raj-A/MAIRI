/**
 * audioService.js — Web Speech API audio capture + question detection (v1).
 *
 * Uses the browser's built-in Web Speech Recognition (webkitSpeechRecognition)
 * to transcribe audio in real time. Each transcript chunk is passed through
 * isInterviewerQuestion() to decide whether to trigger the AI.
 *
 * Design: This is a modular transcription layer. It can later be swapped
 * for a paid cloud API (Deepgram, Whisper) without touching the rest of the app.
 */
import { isInterviewerQuestion } from './questionFilter'
import { DEBOUNCE_MS } from './constants'

let recognition = null
let isListening = false
let onQuestionDetected = null
let onTranscriptUpdate = null
let onError = null
let debounceTimer = null
let lastProcessedText = ''

/**
 * Check if the browser supports Web Speech Recognition.
 */
export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
}

/**
 * Initialize and start the speech recognition engine.
 *
 * @param {function} callbacks.onQuestion - Called with (questionText) when an interviewer question is detected
 * @param {function} callbacks.onTranscript - Called with (transcript) on every partial/final transcript
 * @param {function} callbacks.onError - Called with (error) on recognition errors
 */
export function startRecognition({ onQuestion, onTranscript, onError }) {
  if (!isSpeechRecognitionSupported()) {
    onError?.(new Error('Speech Recognition is not supported in this browser. Please use Chrome or Edge.'))
    return false
  }

  if (isListening) {
    stopRecognition()
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SpeechRecognition()

  // Continuous listening, don't auto-stop after each phrase
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'en-US'
  recognition.maxAlternatives = 1

  onQuestionDetected = onQuestion
  onTranscriptUpdate = onTranscript
  onErrorCb = onError

  recognition.onstart = () => {
    isListening = true
  }

  recognition.onresult = (event) => {
    let finalTranscript = ''
    let interimTranscript = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript
      } else {
        interimTranscript += transcript
      }
    }

    // Always report interim for the live visualizer
    if (interimTranscript) {
      onTranscriptUpdate?.(interimTranscript, false)
    }

    // When we have a final result, check if it's a question
    if (finalTranscript) {
      const cleaned = finalTranscript.trim()
      onTranscriptUpdate?.(cleaned, true)

      // Debounce to avoid firing multiple times on the same question
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        if (cleaned && cleaned !== lastProcessedText && isInterviewerQuestion(cleaned)) {
          lastProcessedText = cleaned
          onQuestionDetected?.(cleaned)
        }
      }, DEBOUNCE_MS)
    }
  }

  recognition.onerror = (event) => {
    // 'no-speech' is normal during pauses — don't treat as an error
    if (event.error === 'no-speech') return
    if (event.error === 'aborted') return

    onError?.(new Error(`Speech recognition error: ${event.error}`))
  }

  recognition.onend = () => {
    isListening = false
    // Auto-restart if we were stopped externally but should still be listening
    // (handled by the caller checking isListening)
  }

  try {
    recognition.start()
    return true
  } catch (err) {
    onError?.(err)
    return false
  }
}

/**
 * Stop the speech recognition engine.
 */
export function stopRecognition() {
  if (recognition) {
    try {
      recognition.stop()
    } catch (e) {
      // ignore
    }
    recognition = null
  }
  isListening = false
  clearTimeout(debounceTimer)
}

/**
 * Check if recognition is currently running.
 */
export function getIsListening() {
  return isListening
}

// Internal reference for the onError callback
let onErrorCb = null

export default {
  startRecognition,
  stopRecognition,
  getIsListening,
  isSpeechRecognitionSupported
}