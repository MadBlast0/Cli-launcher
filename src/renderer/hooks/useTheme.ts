import { useState, useEffect, useCallback, useRef } from 'react'

type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem('cli-launcher-theme') as Theme) || 'dark'
  })

  // localStorage is the single source of truth for the theme; always apply it
  // to the DOM + storage. The settings.json mirror is only written on an actual
  // user change (not on the initial mount), so it can't clobber the stored
  // value during startup before the rest of the app has read settings.
  const mounted = useRef(false)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('cli-launcher-theme', theme)
    if (mounted.current) {
      try { window.electronAPI.saveSettings({ theme }) } catch { /* ignore */ }
    } else {
      mounted.current = true
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
