import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { LauncherWindow } from './components/layouts/LauncherWindow'
import { CliGrid } from './components/cli/CliGrid'
import { CliCatalog } from './components/cli/CliCatalog'
import { CliConfigModal } from './components/cli/CliConfigModal'
import { BulkProgressModal } from './components/cli/BulkProgressModal'
import { SettingsModal } from './components/SettingsModal'
import { FolderPicker } from './components/cli/FolderPicker'
import { DependencyModal } from './components/installer/DependencyModal'
import { Loader } from './components/ui/Loader'
import { ToastContainer } from './components/ui/Toast'
import { useTheme } from './hooks/useTheme'
import type { CliDefinition, DependencyCheck, CliCount, CliState, AppSettings, RefreshProgressMessage } from '@shared/types'
import type { Toast, ToastType } from './components/ui/Toast'

/** Subsequence fuzzy matcher. Returns a score > 0 when `query` is a (possibly
 *  non-contiguous) subsequence of `text`; higher is a better match (substring
 *  matches rank above scattered ones, earlier matches rank above later). */
function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  if (!q) return 1
  const idx = t.indexOf(q)
  if (idx !== -1) return 1000 - idx
  let ti = 0
  let score = 0
  let streak = 0
  for (const ch of q) {
    const found = t.indexOf(ch, ti)
    if (found === -1) return 0
    streak = found === ti ? streak + 1 : 0
    score += 1 + streak
    ti = found + 1
  }
  return score
}

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const [loaded, setLoaded] = useState(false)
  const [statesLoading, setStatesLoading] = useState(true)
  const [clis, setClis] = useState<CliDefinition[]>([])
  const [states, setStates] = useState<Record<string, CliState>>({})
  const [deps, setDeps] = useState<DependencyCheck | null>(null)
  const [depsLoading, setDepsLoading] = useState(true)
  const [refreshProgress, setRefreshProgress] = useState(0)
  const [refreshCurrent, setRefreshCurrent] = useState('')
  const [showDeps, setShowDeps] = useState(false)
  const [showCatalog, setShowCatalog] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [configCliId, setConfigCliId] = useState<string | null>(null)
  const [bulkAction, setBulkAction] = useState<'update' | 'repair' | null>(null)
  const [catalogOutdatedOnly, setCatalogOutdatedOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [counts, setCounts] = useState<CliCount[]>([])
  const [justInstalled, setJustInstalled] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [cliOrder, setCliOrder] = useState<string[]>([])
  const [yoloMode, setYoloMode] = useState(false)
  const [alwaysOnTop, setAlwaysOnTop] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [hiddenClis, setHiddenClis] = useState<string[]>([])
  const [cliAlias, setCliAlias] = useState<Record<string, string>>({})
  const searchInputRef = useRef<HTMLInputElement>(null)
  const refreshInFlightRef = useRef(false)

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
  // cli:state-updated event. Uses a ref guard so rapid calls (e.g. Cmd+R
  // spam) are silently deduplicated rather than stacking.
  const refreshStates = useCallback(
    () => {
      if (refreshInFlightRef.current) return
      refreshInFlightRef.current = true
      setRefreshProgress(0)
      setRefreshCurrent('')
      window.electronAPI
        .refreshCliStates()
        .catch(() => {})
        .finally(() => {
          refreshInFlightRef.current = false
          setStatesLoading(false)
        })
    },
    []
  )

  // Refresh both CLI states + dependency detection
  const refreshAll = useCallback(() => {
    refreshStates()
    setDepsLoading(true)
    window.electronAPI.checkDependencies().then(setDeps).catch(() => {}).finally(() => setDepsLoading(false))
  }, [refreshStates])

  const loadSettings = useCallback(async () => {
    try {
      const settings = await window.electronAPI.getSettings()
      if (settings.favorites) setFavorites(settings.favorites)
      if (settings.cliOrder) setCliOrder(settings.cliOrder)
      if (settings.yoloMode !== undefined) setYoloMode(settings.yoloMode)
      if (settings.alwaysOnTop !== undefined) setAlwaysOnTop(settings.alwaysOnTop)
      if (settings.hiddenClis) setHiddenClis(settings.hiddenClis)
      if (settings.cliAlias) setCliAlias(settings.cliAlias)
      // Theme is owned by useTheme (localStorage) as the single source of
      // truth; it also persists into settings, so we don't re-apply it here.
    } catch { /* ignore */ }
  }, [])

  // Send only the changed keys; the main process merges them into the stored
  // settings. Doing the merge in one place (there) avoids a renderer-side
  // read-modify-write race between concurrent saves (e.g. order + favorites).
  const saveSettings = useCallback(async (updates: Partial<AppSettings>) => {
    try {
      await window.electronAPI.saveSettings(updates)
    } catch { /* ignore */ }
  }, [])

  // Mirror settings back into React state so title-bar buttons (pin, YOLO
  // dropdown) stay in sync when the SettingsModal saves.
  const handleSaveSettings = useCallback(async (updates: Partial<AppSettings>) => {
    await saveSettings(updates)
    if (updates.yoloMode !== undefined) setYoloMode(updates.yoloMode)
    if (updates.alwaysOnTop !== undefined) setAlwaysOnTop(updates.alwaysOnTop)
  }, [saveSettings])

  useEffect(() => {
    // Show the app as soon as the CLI list is available — never block the
    // loader on the (potentially slow) status detection IPC. Always clear the
    // loader even if the list IPC rejects, so a failure can't strand the app
    // on the spinner forever.
    window.electronAPI
      .getClis()
      .then(setClis)
      .catch(() => addToast('Failed to load CLI list', 'error'))
      .finally(() => setLoaded(true))
    setDepsLoading(true)
    window.electronAPI.checkDependencies().then(setDeps).catch(() => {}).finally(() => setDepsLoading(false))
    loadStates()      // instant cache paint
    refreshStates()   // background fresh detection
    loadSettings()
  }, [loadStates, refreshStates, loadSettings, addToast])

  // Coalesce the burst of per-CLI state updates that arrive during a refresh
  // into a single render per animation frame (avoids ~36 back-to-back renders
  // of the whole grid on startup). Also tracks refresh progress for the bar.
  useEffect(() => {
    const pending: Record<string, CliState> = {}
    let receivedCount = 0
    let frame: number | null = null
    const flush = () => {
      frame = null
      receivedCount += Object.keys(pending).length
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

  // Listen for refresh progress with current CLI name.
  useEffect(() => {
    const cleanup = window.electronAPI.onRefreshProgress((msg: RefreshProgressMessage) => {
      setRefreshProgress(msg.completed)
      setRefreshCurrent(msg.current)
    })
    return cleanup
  }, [])

  const isInstalled = (cliId: string) =>
    states[cliId]?.status === 'installed' || states[cliId]?.status === 'update-available'

  const getCount = useCallback(
    (cliId: string) => counts.find((c) => c.cliId === cliId)?.count ?? 1,
    [counts]
  )

  const handleUpdateCount = useCallback((cliId: string, delta: number) => {
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
  }, [])

  // The grid renders a filtered subset, so the drag indices are positions
  // within `filtered`. Translate them to CLI ids and reorder the full global
  // order, otherwise the wrong items move whenever a filter/search is active.
  // This only updates in-memory state (called live during drag); persistence
  // happens once on drop via handleReorderCommit.
  const cliOrderRef = useRef<string[]>([])
  useEffect(() => { cliOrderRef.current = cliOrder }, [cliOrder])

  // Refs mirroring the derived lists so handleReorder (which must stay a stable
  // callback to keep drag handlers memoized) can read the latest values without
  // taking them as dependencies.
  const filteredRef = useRef<CliDefinition[]>([])
  const orderedClisRef = useRef<CliDefinition[]>([])

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    const fromId = filteredRef.current[fromIndex]?.id
    const toId = filteredRef.current[toIndex]?.id
    if (!fromId || !toId || fromId === toId) return

    const fullOrder = orderedClisRef.current.map((c) => c.id)
    const fi = fullOrder.indexOf(fromId)
    const ti = fullOrder.indexOf(toId)
    if (fi === -1 || ti === -1) return

    fullOrder.splice(fi, 1)
    fullOrder.splice(ti, 0, fromId)
    setCliOrder(fullOrder)
  }, [])

  const handleReorderCommit = useCallback(() => {
    saveSettings({ cliOrder: cliOrderRef.current })
  }, [saveSettings])

  const handleYoloModeChange = useCallback((value: boolean) => {
    setYoloMode(value)
    saveSettings({ yoloMode: value })
  }, [saveSettings])

  const handleToggleAlwaysOnTop = useCallback(() => {
    setAlwaysOnTop((prev) => {
      const next = !prev
      saveSettings({ alwaysOnTop: next })
      return next
    })
  }, [saveSettings])

  const handleToggleFavorite = (cliId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(cliId)
        ? prev.filter((id) => id !== cliId)
        : [...prev, cliId]
      saveSettings({ favorites: next })
      return next
    })
  }

  const handleHide = useCallback((cliId: string) => {
    setHiddenClis((prev) => {
      if (prev.includes(cliId)) return prev
      const next = [...prev, cliId]
      saveSettings({ hiddenClis: next })
      return next
    })
  }, [saveSettings])

  const handleUnhide = useCallback((cliId: string) => {
    setHiddenClis((prev) => {
      const next = prev.filter((id) => id !== cliId)
      saveSettings({ hiddenClis: next })
      return next
    })
  }, [saveSettings])

  const handleLaunch = useCallback(async (cliId: string, count: number) => {
    const cli = clis.find((c) => c.id === cliId)
    if (!cli) return
    for (let i = 0; i < count; i++) {
      const result = await window.electronAPI.launchCli({ cliId, permissionMode: yoloMode ? 'dangerous' : 'normal' })
      if (!result.success) {
        addToast(result.error || 'Failed to launch', 'error')
      }
    }
  }, [clis, addToast, yoloMode])

  // CliCard performs the repair/update itself (with its own toast + busy
  // state); these callbacks let it notify the app afterwards so the shared
  // state map is refreshed (e.g. the version/update badge updates).
  const handleRepair = useCallback((cliId: string) => {
    window.electronAPI.getCliState(cliId).catch(() => {})
  }, [])

  const handleUpdate = useCallback((cliId: string) => {
    window.electronAPI.getCliState(cliId).catch(() => {})
  }, [])

  const handleBulkAction = useCallback(async (action: 'update' | 'repair') => {
    setBulkAction(action)
    try {
      await window.electronAPI.bulkAction(action)
      refreshStates()
    } catch {
      addToast(`Failed to ${action} CLIs`, 'error')
    } finally {
      // The modal stays open until progress completes; this just fires the job.
    }
  }, [refreshStates, addToast])

  // Order the list favorites-first, then by the saved manual order (memoized so
  // it only recomputes when the list, saved order, or favorites change).
  const orderedClis = useMemo(() => {
    const copy = [...clis]
    const favSet = new Set(favorites)
    const orderMap = cliOrder.length > 0 ? new Map(cliOrder.map((id, i) => [id, i])) : null
    copy.sort((a, b) => {
      const fa = favSet.has(a.id) ? 0 : 1
      const fb = favSet.has(b.id) ? 0 : 1
      if (fa !== fb) return fa - fb
      if (orderMap) {
        const ai = orderMap.get(a.id)
        const bi = orderMap.get(b.id)
        if (ai !== undefined && bi !== undefined) return ai - bi
        if (ai !== undefined) return -1
        if (bi !== undefined) return 1
      }
      return 0
    })
    return copy
  }, [clis, cliOrder, favorites])
  useEffect(() => { orderedClisRef.current = orderedClis }, [orderedClis])

  // Main page shows only CLIs already installed (and not hidden), then applies
  // a fuzzy search across name / id / description / alias (best match first).
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const installed = orderedClis.filter(
      (cli) => isInstalled(cli.id) && !hiddenClis.includes(cli.id)
    )
    if (!q) return installed
    return installed
      .map((cli) => ({
        cli,
        score: Math.max(
          fuzzyScore(q, cli.name),
          fuzzyScore(q, cli.id),
          fuzzyScore(q, cli.description),
          fuzzyScore(q, cliAlias[cli.id] || '')
        ),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.cli)
  }, [orderedClis, states, search, hiddenClis, cliAlias])

  const outdatedCount = useMemo(
    () => clis.filter((c) => states[c.id]?.status === 'update-available').length,
    [clis, states]
  )
  useEffect(() => { filteredRef.current = filtered }, [filtered])

  // Reset the keyboard selection to the first result whenever the filter
  // changes (new search term, install/uninstall), so Enter always targets the
  // top match.
  useEffect(() => {
    setSelectedIndex(filtered.length > 0 ? 0 : -1)
  }, [filtered])

  // Keyboard shortcuts. Declared after `filtered` is defined (it reads it) and
  // after handleLaunch/getCount so it can list them as dependencies (avoids a
  // stale-closure hazard) and honour the per-CLI launch count instead of always
  // opening a single terminal.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const inInput = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

      // Enter launches the selected (or first) match — works even while typing
      // in the search box so the launcher can be driven entirely from the
      // keyboard.
      if (e.key === 'Enter') {
        const idx = selectedIndex >= 0 && selectedIndex < filtered.length ? selectedIndex : 0
        const cli = filtered[idx]
        if (cli) {
          e.preventDefault()
          handleLaunch(cli.id, getCount(cli.id))
        }
        return
      }

      if (inInput) return

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'f') {
          e.preventDefault()
          searchInputRef.current?.focus()
        } else if (e.key === 'd') {
          e.preventDefault()
          setShowDeps(true)
        } else if (e.key === 'r') {
          e.preventDefault()
          if (refreshInFlightRef.current) {
            addToast('Refresh already in progress', 'info')
          } else {
            refreshAll()
          }
        } else if (e.key >= '1' && e.key <= '9') {
          const idx = parseInt(e.key, 10) - 1
          const installed = clis.filter(
            (cli) => states[cli.id]?.status === 'installed' || states[cli.id]?.status === 'update-available'
          )
          if (installed[idx]) {
            e.preventDefault()
            handleLaunch(installed[idx].id, getCount(installed[idx].id))
          }
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Escape') {
        if (search) {
          setSearch('')
        } else {
          setSelectedIndex(-1)
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [clis, states, filtered, selectedIndex, handleLaunch, getCount, refreshAll, addToast, search, setSearch])

  if (!window.electronAPI) {
    return (
      <LauncherWindow isDark={theme === 'dark'} onToggleTheme={toggleTheme} onToast={addToast}>
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 text-center px-6">
          <p className="text-sm text-white/80">
            This window must be opened from inside the Electron app.
          </p>
          <p className="text-xs text-white/50">
            Run <code className="px-1 rounded bg-white/10">npm run dev</code> (not just Vite) so the
            native bridge is available.
          </p>
        </div>
      </LauncherWindow>
    )
  }

  if (!loaded) return <Loader />

  return (
      <LauncherWindow
        isDark={theme === 'dark'}
        onToggleTheme={toggleTheme}
        alwaysOnTop={alwaysOnTop}
        onToggleAlwaysOnTop={handleToggleAlwaysOnTop}
        onOpenSettings={() => setShowSettings(true)}
        outdatedCount={outdatedCount}
        onShowOutdated={() => { setCatalogOutdatedOnly(true); setShowCatalog(true) }}
        onToast={addToast}
      >
      <div className="px-4 pt-3 pb-2 shrink-0 flex items-center gap-2">
        <FolderPicker />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <CliGrid
          clis={filtered}
          states={states}
          counts={counts}
          loading={statesLoading}
          refreshProgress={refreshProgress}
          refreshCurrent={refreshCurrent}
          totalClis={clis.length}
          onUpdateCount={handleUpdateCount}
          onLaunch={handleLaunch}
          onRepair={handleRepair}
          onUpdate={handleUpdate}
          onReorder={handleReorder}
          onReorderCommit={handleReorderCommit}
          onOpenDeps={() => setShowDeps(true)}
          onOpenCatalog={() => setShowCatalog(true)}
          onCliChanged={refreshStates}
          onConfigure={setConfigCliId}
          onUpdateAll={() => handleBulkAction('update')}
          onHide={handleHide}
          onToggleFavorite={handleToggleFavorite}
          favorites={favorites}
          aliasMap={cliAlias}
          onRefreshAll={refreshAll}
          deps={deps}
          depsLoading={depsLoading}
          search={search}
          onSearchChange={setSearch}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          justInstalled={justInstalled}
          onToast={addToast}
          searchInputRef={searchInputRef}
          yoloMode={yoloMode}
          onYoloModeChange={handleYoloModeChange}
        />
      </div>

      <CliCatalog
        open={showCatalog}
        onClose={() => { setShowCatalog(false); setCatalogOutdatedOnly(false) }}
        clis={orderedClis}
        states={states}
        onChanged={refreshStates}
        onToast={addToast}
        updateToast={updateToast}
        outdatedOnly={catalogOutdatedOnly}
        hiddenClis={hiddenClis}
        onUnhide={handleUnhide}
        aliasMap={cliAlias}
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

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        onToggleTheme={toggleTheme}
        isDark={theme === 'dark'}
        getCurrentFolder={() => window.electronAPI.getSavedFolder()}
        selectFolder={() => window.electronAPI.selectFolder()}
        initialAlwaysOnTop={alwaysOnTop}
        initialYoloMode={yoloMode}
      />

      {configCliId && (
        <CliConfigModal
          cliId={configCliId}
          cliName={clis.find((c) => c.id === configCliId)?.name ?? configCliId}
          onClose={() => setConfigCliId(null)}
          onSave={(cliConfig) => saveSettings({ cliConfig })}
        />
      )}

      <BulkProgressModal
        open={bulkAction !== null}
        action={bulkAction}
        onClose={() => setBulkAction(null)}
        onProgress={window.electronAPI.onBulkProgress}
        cliName={(id) => clis.find((c) => c.id === id)?.name ?? id}
      />
    </LauncherWindow>
  )
}


