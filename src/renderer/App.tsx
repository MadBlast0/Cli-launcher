import { useState, useEffect, useCallback } from 'react'
import { LauncherWindow } from './components/layouts/LauncherWindow'
import { CliGrid } from './components/cli/CliGrid'
import { CliCatalog } from './components/cli/CliCatalog'
import { FolderPicker } from './components/cli/FolderPicker'
import { DependencyModal } from './components/installer/DependencyModal'
import { Loader } from './components/ui/Loader'
import { ToastContainer } from './components/ui/Toast'
import { useTheme } from './hooks/useTheme'
import type { CliDefinition, DependencyCheck, CliCount, CliState } from '@shared/types'
import type { Toast, ToastType } from './components/ui/Toast'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const [loaded, setLoaded] = useState(false)
  const [clis, setClis] = useState<CliDefinition[]>([])
  const [states, setStates] = useState<Record<string, CliState>>({})
  const [deps, setDeps] = useState<DependencyCheck | null>(null)
  const [showDeps, setShowDeps] = useState(false)
  const [showCatalog, setShowCatalog] = useState(false)
  const [search, setSearch] = useState('')
  const [counts, setCounts] = useState<CliCount[]>([])
  const [justInstalled, setJustInstalled] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const loadStates = useCallback(
    () => window.electronAPI.getAllCliStates().then((cached) => {
      setStates(cached)
      setLoaded(true)
    }),
    []
  )

  const refreshStates = useCallback(
    () => window.electronAPI.refreshCliStates(),
    []
  )

  useEffect(() => {
    window.electronAPI.getClis().then(setClis)
    window.electronAPI.checkDependencies().then(setDeps)
    loadStates()
  }, [loadStates])

  useEffect(() => {
    const cleanup = window.electronAPI.onCliStateUpdate((cliId, state) => {
      setStates((prev) => ({ ...prev, [cliId]: state }))
    })
    return cleanup
  }, [])

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

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setClis((prev) => {
      const copy = [...prev]
      const [moved] = copy.splice(fromIndex, 1)
      copy.splice(toIndex, 0, moved)
      return copy
    })
  }

  const handleLaunch = (cliId: string, count: number) => {
    const cli = clis.find((c) => c.id === cliId)
    if (!cli) return
    for (let i = 0; i < count; i++) {
      window.electronAPI.executeAction(cliId, 'open')
    }
  }

  const handleInstall = (cliId: string) => {
    window.electronAPI.executeAction(cliId, 'install')
  }

  const handleUninstall = (cliId: string) => {
    window.electronAPI.executeAction(cliId, 'uninstall')
  }

  const handleRepair = (cliId: string) => {
    window.electronAPI.executeAction(cliId, 'repair')
  }

  const handleUpdate = (cliId: string) => {
    window.electronAPI.executeAction(cliId, 'update')
  }

  // Main page shows only CLIs already installed on this machine.
  const installedClis = clis.filter((cli) => isInstalled(cli.id))
  const filtered = installedClis.filter(
    (cli) =>
      cli.name.toLowerCase().includes(search.toLowerCase()) ||
      cli.id.toLowerCase().includes(search.toLowerCase())
  )

  if (!loaded) return <Loader />

  return (
    <LauncherWindow isDark={theme === 'dark'} onToggleTheme={toggleTheme}>
      <div className="px-4 pt-3 pb-2 shrink-0">
        <FolderPicker />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <CliGrid
          clis={filtered}
          states={states}
          counts={counts}
          onUpdateCount={handleUpdateCount}
          onLaunch={handleLaunch}
          onInstall={handleInstall}
          onUninstall={handleUninstall}
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
        clis={clis}
        states={states}
        onChanged={refreshStates}
        onToast={addToast}
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
