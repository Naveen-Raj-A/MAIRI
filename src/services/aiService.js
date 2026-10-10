/**
 * aiService.js — Multi-provider AI API client (v1).
 *
 * Supports OpenRouter, Google Gemini, OpenAI, Anthropic Claude, Perplexity AI.
 * Each provider has a different API format, so we normalize them here.
 *
 * Design: This module is a thin wrapper. The audio pipeline, question filter,
 * and UI never need to know which provider is active — they just call
 * generateTalkingPoints(question, context).
 */
import { PROVIDERS, SYSTEM_PROMPT } from './constants'

/**
 * Build the request body + headers for a given provider.
 * Each provider has a different API shape, so we branch here.
 */
function buildRequest(providerConfig, model, prompt, apiKey) {
  const { id, baseURL } = providerConfig

  switch (id) {
    case 'openrouter':
    case 'openai':
    case 'perplexity': {
      // OpenAI-compatible format (OpenRouter, OpenAI, Perplexity all use /chat/completions)
      return {
        url: `${baseURL}/chat/completions`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...(id === 'openrouter' && {
            'HTTP-Referer': window.location.origin,
            'X-Title': 'MAIRI'
          })
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: `Interviewer question: "${prompt}"` }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      }
    }

    case 'gemini': {
      // Google Gemini uses a different endpoint + request shape
      return {
        url: `${baseURL}/models/${model}:generateContent?key=${apiKey}`,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${prompt}\n\nInterviewer question: ""` }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7
          }
        })
      }
    }

    case 'anthropic': {
      // Anthropic uses /messages with system as a top-level field
      return {
        url: `${baseURL}/messages`,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: 300,
          system: prompt,
          messages: [
            { role: 'user', content: `Interviewer question: "${prompt}"` }
          ]
        })
      }
    }

    default:
      throw new Error(`Unknown provider: ${id}`)
  }
}

/**
 * Parse the response from each provider's format into plain text.
 */
function parseResponse(providerId, data) {
  switch (providerId) {
    case 'openrouter':
    case 'openai':
    case 'perplexity':
      return data?.choices?.[0]?.message?.content || ''
    case 'gemini':
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    case 'anthropic':
      return data?.content?.[0]?.text || ''
    default:
      return ''
  }
}

/**
 * Generate talking points from an interviewer question.
 *
 * @param {string} question - The interviewer's question text
 * @param {string} resumeContext - The candidate's resume/context
 * @param {object} config - { providerId, model, apiKey }
 * @returns {Promise<string>} - The AI's talking points
 */
export async function generateTalkingPoints(question, resumeContext, config) {
  const { providerId, model, apiKey } = config

  if (!apiKey) {
    throw new Error('API key is required. Please configure it in Settings.')
  }

  const providerConfig = PROVIDERS[providerId]
  if (!providerConfig) {
    throw new Error(`Unknown provider: ${providerId}`)
  }

  const finalModel = model || providerConfig.defaultModel

  // Build the full system prompt with the candidate's resume context injected
  const systemPrompt = SYSTEM_PROMPT.replace('{RESUME_CONTEXT}', resumeContext || 'No resume context provided.')

  const { url, headers, body } = buildRequest(providerConfig, finalModel, question, apiKey)

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    let errorMessage = `API request failed (${response.status})`
    try {
      const errJson = JSON.parse(errorText)
      errorMessage = errJson?.error?.message || errJson?.message || errorMessage
    } catch {
      // Use the raw text if it's short, otherwise keep the generic message
      if (errorText && errorText.length < 200) errorMessage = errorText
    }
    throw new Error(errorMessage)
  }

  const data = await response.json()
  const text = parseResponse(providerId, data)

  if (!text) {
    throw new Error('No response from AI provider.')
  }

  return text.trim()
}

export default { generateTalkingPoints }