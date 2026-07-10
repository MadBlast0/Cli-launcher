import { useState, useEffect, useCallback, useRef } from 'react'

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

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  return { theme, setTheme, toggleTheme }
}
