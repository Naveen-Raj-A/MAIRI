/**
 * isInterviewerQuestion(text) — Rule-based interviewer question classifier (v1).
 *
 * Returns true if the transcript chunk is likely an interviewer question
 * that should trigger an AI answer. Returns false for:
 *   - short noise / filler utterances
 *   - candidate self-speech patterns
 *
 * This module is intentionally isolated so it can later be replaced
 * with an LLM-based classifier without touching the audio pipeline.
 */
import {
  QUESTION_STARTERS,
  SELF_SPEECH_PATTERNS,
  FILLER_PATTERNS,
  MIN_TRANSCRIPT_LENGTH
} from './constants'

export function isInterviewerQuestion(text) {
  if (!text || typeof text !== 'string') return false

  const normalized = text.trim().toLowerCase()

  // 1. Reject very short fragments (noise, filler words, partial words)
  if (normalized.length < MIN_TRANSCRIPT_LENGTH) return false

  // 2. Reject pure filler / backchannel utterances
  const stripped = normalized.replace(/[^\w\s]/g, ' ').trim()
  if (FILLER_PATTERNS.includes(stripped)) return false
  if (FILLER_PATTERNS.some(f => stripped === f || stripped.startsWith(f + ' '))) return false

  // 3. Reject candidate self-speech patterns
  if (SELF_SPEECH_PATTERNS.some(pattern => normalized.includes(pattern))) return false

  // 4. Question detection: matches a known question starter OR ends with '?'
  const startsWithQuestion = QUESTION_STARTERS.some(starter =>
    normalized.startsWith(starter) || normalized.includes(' ' + starter + ' ')
  )
  const endsWithQuestionMark = normalized.endsWith('?')

  return startsWithQuestion || endsWithQuestionMark
}

export default isInterviewerQuestion