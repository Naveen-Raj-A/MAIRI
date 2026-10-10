import React, { useState, useRef, useEffect } from 'react'

/**
 * ManualInput — Fallback text input for when audio capture fails
 * or the user wants to type a question directly.
 */
export default function ManualInput({ onSubmit, placeholder }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) {
        onSubmit(value.trim())
        setValue('')
      }
    }
  }

  const handleBlur = () => {
    // Don't auto-submit on blur, just keep the value
  }

  return (
    <div className="manual-input">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={2}
        className="manual-textarea"
        aria-label="Manual question input"
      />
      <button
        className="manual-submit-btn"
        onClick={() => {
          if (value.trim()) {
            onSubmit(value.trim())
            setValue('')
          }
        }}
        disabled={!value.trim()}
      >
        Send
      </button>
    </div>
  )
}