import { useState, useEffect, useCallback, useRef } from 'react'
import { flushSync } from 'react-dom'

type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem('cli-launcher-theme') as Theme) || 'dark'
  })

  // localStorage is the single source of truth for the theme; always apply it
  // to the DOM + storage, and mirror it into settings.json on every change.
  // `savedThemeRef` tracks the last theme actually persisted so this effect
  // does NOT write settings on mount (or under StrictMode's double-invoke) —
  // only a real user change triggers a settings write.
  const savedThemeRef = useRef<Theme>(theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('cli-launcher-theme', theme)
    if (savedThemeRef.current !== theme) {
      savedThemeRef.current = theme
      window.electronAPI.saveSettings({ theme }).catch(() => {})
    }
  }, [theme])

  // Apply a theme change as a single DOM state change, with a smooth
  // whole-page transition. Uses the View Transitions API when available (the
  // page crossfades as one snapshot); otherwise falls back to scoped color
  // transitions via the .theme-transition class.
  const applyTheme = useCallback((next: Theme) => {
    const updateDom = () => {
      setThemeState(next)
      document.documentElement.classList.toggle('dark', next === 'dark')
    }
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void }
    if (typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(() => {
        flushSync(updateDom)
      })
    } else {
      const html = document.documentElement
      html.classList.add('theme-transition')
      updateDom()
      window.setTimeout(() => html.classList.remove('theme-transition'), 250)
    }
  }, [])

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t)
  }, [applyTheme])

  const toggleTheme = useCallback(() => {
    applyTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, applyTheme])

  return { theme, setTheme, toggleTheme }
}
