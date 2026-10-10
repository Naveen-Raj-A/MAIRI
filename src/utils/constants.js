// MAIRI constants and provider configurations

export const PROVIDERS = {
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    label: 'OpenRouter (Universal)',
    baseURL: 'https://openrouter.ai/api/v1',
    models: [
      { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku' },
      { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B' }
    ],
    defaultModel: 'google/gemini-2.5-flash'
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    label: 'Google Gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.0-flash-001', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' }
    ],
    defaultModel: 'gemini-2.5-flash'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    label: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini' }
    ],
    defaultModel: 'gpt-4o-mini'
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    label: 'Anthropic Claude',
    baseURL: 'https://api.anthropic.com/v1',
    models: [
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' }
    ],
    defaultModel: 'claude-3-5-haiku-20241022'
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity AI',
    label: 'Perplexity AI',
    baseURL: 'https://api.perplexity.ai',
    models: [
      { id: 'sonar', name: 'Sonar' },
      { id: 'sonar-pro', name: 'Sonar Pro' },
      { id: 'sonar-reasoning-pro', name: 'Sonar Reasoning Pro' }
    ],
    defaultModel: 'sonar'
  }
}

export const STORAGE_KEYS = {
  API_KEY: 'mairi_api_key',
  PROVIDER: 'mairi_provider',
  MODEL: 'mairi_model',
  RESUME_CONTEXT: 'mairi_resume_context',
  SETTINGS: 'mairi_settings'
}

export const DEFAULT_SETTINGS = {
  autoStart: false,
  showWaveform: true,
  soundNotifications: true,
  compactMode: false,
  maxBulletPoints: 3
}

export const QUESTION_STARTERS = [
  'how', 'why', 'what', 'which', 'who', 'when', 'where',
  'can you', 'could you', 'would you', 'should you',
  'tell me about', 'walk me through', 'describe',
  'explain', 'elaborate', 'give me an example',
  'what is', 'what are', 'how does', 'how do',
  'do you', 'have you', 'did you', 'are you'
]

export const SELF_SPEECH_PATTERNS = [
  'in my experience', 'in my previous role', 'i worked on',
  'my team', 'i built', 'as i mentioned', 'as i said',
  'my project', 'i developed', 'i created', 'i designed',
  'in my career', 'at my last job', 'when i was',
  'i have been', 'i am currently', 'my background is'
]

export const FILLER_PATTERNS = [
  'uh-huh', 'uh', 'um', 'yeah', 'okay', 'sure', 'yep',
  'uh-huh', 'hmm', 'right', 'got it', 'i see'
]

export const MIN_TRANSCRIPT_LENGTH = 10

export const DEBOUNCE_MS = 800

export const SYSTEM_PROMPT = `You are MAIRI, a real-time interview companion. Your job is to convert an interviewer's question into 2-4 ultra-concise, high-impact talking points for the candidate to glance at during a live interview.

Rules:
- Output ONLY the talking points. No intro, no explanation, no markdown headers.
- Each point must be 1-2 short sentences maximum.
- Each point MUST start with a bold lead phrase like "**Core Pitch**:", "**Key Consideration**:", "**Example**:", or "**Risk**:".
- Use the candidate's provided resume context to tailor the answer.
- Keep total output under 120 words.
- Never write full sentences the candidate would read verbatim. These are prompts, not scripts.
- Do not include greetings, closings, or filler.

Candidate context:
{RESUME_CONTEXT}`