import { useState, useEffect, useCallback, useRef } from 'react'
import { flushSync } from 'react-dom'

type Theme = 'system' | 'light' | 'dark'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(pref: Theme): 'light' | 'dark' {
  return pref === 'system' ? getSystemTheme() : pref
}

export function useTheme() {
  const [preference, setPreference] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system'
    return (localStorage.getItem('cli-launcher-theme') as Theme) || 'system'
  })

  const savedPrefRef = useRef<Theme>(preference)

  // Apply the resolved theme to the DOM.
  const applyResolved = useCallback((pref: Theme) => {
    const resolved = resolveTheme(pref)
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }, [])

  // Persist preference and apply.
  useEffect(() => {
    localStorage.setItem('cli-launcher-theme', preference)
    applyResolved(preference)
    if (savedPrefRef.current !== preference) {
      savedPrefRef.current = preference
      window.electronAPI.saveSettings({ theme: preference }).catch(() => {})
    }
  }, [preference, applyResolved])

  // Listen for OS theme changes when in system mode.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (preference === 'system') applyResolved('system')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preference, applyResolved])

  const applyTheme = useCallback((next: Theme) => {
    const updateDom = () => {
      setPreference(next)
      applyResolved(next)
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
  }, [applyResolved])

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t)
  }, [applyTheme])

  const toggleTheme = useCallback(() => {
    // Cycle: system → light → dark → system
    const cycle: Theme[] = ['system', 'light', 'dark']
    const idx = cycle.indexOf(preference)
    applyTheme(cycle[(idx + 1) % 3])
  }, [preference, applyTheme])

  return { theme: preference, setTheme, toggleTheme, isDark: resolveTheme(preference) === 'dark' }
}
