/**
 * localStorage wrapper with safe JSON serialization.
 * All keys are namespaced under 'mairi_' to avoid collisions.
 */
export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return fallback
      return JSON.parse(raw)
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },
  clear() {
    try {
      localStorage.clear()
      return true
    } catch {
      return false
    }
  }
}

export default storage