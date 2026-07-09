import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { LauncherWindow } from './components/layouts/LauncherWindow'
import { CliGrid } from './components/cli/CliGrid'
import { CliCatalog } from './components/cli/CliCatalog'
import { FolderPicker } from './components/cli/FolderPicker'
import { DependencyModal } from './components/installer/DependencyModal'
import { Loader } from './components/ui/Loader'
import { ToastContainer } from './components/ui/Toast'
import { useTheme } from './hooks/useTheme'
import type { CliDefinition, DependencyCheck, CliCount, CliState, AppSettings } from '@shared/types'
import type { Toast, ToastType } from './components/ui/Toast'

export default function App() {
  const { theme, toggleTheme, setTheme } = useTheme()
  const [loaded, setLoaded] = useState(false)
  const [statesLoading, setStatesLoading] = useState(true)
  const [clis, setClis] = useState<CliDefinition[]>([])
  const [states, setStates] = useState<Record<string, CliState>>({})
  const [deps, setDeps] = useState<DependencyCheck | null>(null)
  const [showDeps, setShowDeps] = useState(false)
  const [showCatalog, setShowCatalog] = useState(false)
  const [search, setSearch] = useState('')
  const [counts, setCounts] = useState<CliCount[]>([])
  const [justInstalled, setJustInstalled] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [cliOrder, setCliOrder] = useState<string[]>([])


  const addToast = useCallback((message: string, type: ToastType = 'info'): string => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts((prev) => [...prev, { id, message, type }])
    return id
  }, [])

  const updateToast = useCallback((id: string, message: string, type: ToastType) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, message, type } : t))
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Instant first paint from the persisted cache; if it already has entries we
  // can drop the skeletons immediately.
  const loadStates = useCallback(
    () =>
      window.electronAPI
        .getAllCliStates()
        .then((cached) => {
          setStates(cached)
          if (cached && Object.keys(cached).length > 0) setStatesLoading(false)
        })
        .catch(() => {}),
    []
  )

  // Kick off a fresh detection pass; individual results stream back via the
  // cli:state-updated event. Clears the loading flag when the pass completes.
  const refreshStates = useCallback(
    () =>
      window.electronAPI
        .refreshCliStates()
        .catch(() => {})
        .finally(() => setStatesLoading(false)),
    []
  )

  const loadSettings = useCallback(async () => {
    try {
      const settings = await window.electronAPI.getSettings()
      if (settings.favorites) setFavorites(settings.favorites)
      if (settings.cliOrder) setCliOrder(settings.cliOrder)
      if (settings.theme) setTheme(settings.theme)
    } catch { /* ignore */ }
  }, [setTheme])

  const saveSettings = useCallback(async (updates: Partial<AppSettings>) => {
    try {
      const current = await window.electronAPI.getSettings()
      const merged = { ...current, ...updates }
      await window.electronAPI.saveSettings(merged)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    // Show the app as soon as the CLI list is available — never block the
    // loader on the (potentially slow) status detection IPC.
    window.electronAPI.getClis().then(setClis).then(() => setLoaded(true))
    window.electronAPI.checkDependencies().then(setDeps)
    loadStates()      // instant cache paint
    refreshStates()   // background fresh detection
    loadSettings()
  }, [loadStates, refreshStates, loadSettings])

  // Coalesce the burst of per-CLI state updates that arrive during a refresh
  // into a single render per animation frame (avoids ~36 back-to-back renders
  // of the whole grid on startup).
  useEffect(() => {
    const pending: Record<string, CliState> = {}
    let frame: number | null = null
    const flush = () => {
      frame = null
      setStates((prev) => ({ ...prev, ...pending }))
      for (const k of Object.keys(pending)) delete pending[k]
    }
    const cleanup = window.electronAPI.onCliStateUpdate((cliId, state) => {
      pending[cliId] = state
      if (frame === null) frame = requestAnimationFrame(flush)
    })
    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
      cleanup()
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'f') {
          e.preventDefault()
          const input = document.querySelector<HTMLInputElement>('input[type="text"]')
          input?.focus()
        } else if (e.key === 'd') {
          e.preventDefault()
          setShowDeps(true)
        } else if (e.key >= '1' && e.key <= '9') {
          const idx = parseInt(e.key, 10) - 1
          const installed = clis.filter(
            (cli) => states[cli.id]?.status === 'installed' || states[cli.id]?.status === 'update-available'
          )
          if (installed[idx]) {
            e.preventDefault()
            handleLaunch(installed[idx].id, 1)
          }
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [clis, states])

  const isInstalled = (cliId: string) =>
    states[cliId]?.status === 'installed' || states[cliId]?.status === 'update-available'

  const getCount = useCallback(
    (cliId: string) => counts.find((c) => c.cliId === cliId)?.count ?? 1,
    [counts]
  )

  const handleUpdateCount = (cliId: string, delta: number) => {
    setCounts((prev) => {
      const existing = prev.find((c) => c.cliId === cliId)
      if (existing) {
        const next = existing.count + delta
        if (next < 1 || next > 9) return prev
        return prev.map((c) => (c.cliId === cliId ? { ...c, count: next } : c))
      }
      const next = 1 + delta
      if (next < 1 || next > 9) return prev
      return [...prev, { cliId, count: next }]
    })
  }

  // The grid renders a filtered subset, so the drag indices are positions
  // within `filtered`. Translate them to CLI ids and reorder the full global
  // order, otherwise the wrong items move whenever a filter/search is active.
  const handleReorder = (fromIndex: number, toIndex: number) => {
    const fromId = filtered[fromIndex]?.id
    const toId = filtered[toIndex]?.id
    if (!fromId || !toId || fromId === toId) return

    const fullOrder = orderedClis.map((c) => c.id)
    const fi = fullOrder.indexOf(fromId)
    const ti = fullOrder.indexOf(toId)
    if (fi === -1 || ti === -1) return

    fullOrder.splice(fi, 1)
    fullOrder.splice(ti, 0, fromId)
    setCliOrder(fullOrder)
    saveSettings({ cliOrder: fullOrder })
  }

  const handleToggleFavorite = (cliId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(cliId)
        ? prev.filter((id) => id !== cliId)
        : [...prev, cliId]
      saveSettings({ favorites: next })
      return next
    })
  }

  const handleLaunch = async (cliId: string, count: number) => {
    const cli = clis.find((c) => c.id === cliId)
    if (!cli) return
    for (let i = 0; i < count; i++) {
      const result = await window.electronAPI.launchCli({ cliId, permissionMode: 'normal' })
      if (!result.success) {
        addToast(result.error || 'Failed to launch', 'error')
      }
    }
  }

  // CliCard performs the repair/update itself (with its own toast + busy
  // state); these callbacks let it notify the app afterwards so the shared
  // state map is refreshed (e.g. the version/update badge updates).
  const handleRepair = (cliId: string) => {
    window.electronAPI.getCliState(cliId).catch(() => {})
  }

  const handleUpdate = (cliId: string) => {
    window.electronAPI.getCliState(cliId).catch(() => {})
  }

  // Apply cliOrder to the list (memoized so it only recomputes when the list
  // or the saved order actually changes).
  const orderedClis = useMemo(() => {
    const copy = [...clis]
    if (cliOrder.length > 0) {
      const orderMap = new Map(cliOrder.map((id, i) => [id, i]))
      copy.sort((a, b) => {
        const ai = orderMap.get(a.id)
        const bi = orderMap.get(b.id)
        if (ai !== undefined && bi !== undefined) return ai - bi
        if (ai !== undefined) return -1
        if (bi !== undefined) return 1
        return 0
      })
    }
    return copy
  }, [clis, cliOrder])

  // Favorites first, then the rest — kept for the ordering the grid consumes.
  const sortedFavoriteIds = useMemo(
    () => [...favorites].sort((a, b) => a.localeCompare(b)),
    [favorites]
  )

  // Main page shows only CLIs already installed, then applies the search.
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return orderedClis
      .filter((cli) => isInstalled(cli.id))
      .filter((cli) => cli.name.toLowerCase().includes(q) || cli.id.toLowerCase().includes(q))
  }, [orderedClis, states, search])

  if (!loaded) return <Loader />

  return (
    <LauncherWindow isDark={theme === 'dark'} onToggleTheme={toggleTheme}>
      <div className="px-4 pt-3 pb-2 shrink-0 flex items-center gap-2">
        <FolderPicker />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <CliGrid
          clis={filtered}
          states={states}
          counts={counts}
          totalCount={clis.length}
          loading={statesLoading}
          onUpdateCount={handleUpdateCount}
          onLaunch={handleLaunch}
          onRepair={handleRepair}
          onUpdate={handleUpdate}
          onReorder={handleReorder}
          onOpenDeps={() => setShowDeps(true)}
          onOpenCatalog={() => setShowCatalog(true)}
          onCliChanged={refreshStates}
          deps={deps}
          search={search}
          onSearchChange={setSearch}
          justInstalled={justInstalled}
          onToast={addToast}
        />
      </div>

      <CliCatalog
        open={showCatalog}
        onClose={() => setShowCatalog(false)}
        clis={orderedClis}
        states={states}
        onChanged={refreshStates}
        onToast={addToast}
        updateToast={updateToast}
        onInstalled={(id) => {
          setJustInstalled(id)
          setTimeout(() => setJustInstalled(null), 5000)
        }}
      />

      {showDeps && deps && (
        <DependencyModal
          deps={deps}
          onClose={() => setShowDeps(false)}
          onInstalled={(updated) => setDeps(updated)}
        />
      )}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </LauncherWindow>
  )
}


