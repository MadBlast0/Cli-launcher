import { useState, useEffect, useCallback, useRef } from 'react'
import { Terminal, ChevronDown } from 'lucide-react'
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
  const [favorites, setFavorites] = useState<string[]>([])
  const [cliOrder, setCliOrder] = useState<string[]>([])
  const [terminalEmulator, setTerminalEmulator] = useState<string | undefined>(undefined)
  const [availableTerminals, setAvailableTerminals] = useState<{ value: string; label: string }[]>([])

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

  const loadSettings = useCallback(async () => {
    try {
      const settings = await window.electronAPI.getSettings()
      if (settings.favorites) setFavorites(settings.favorites)
      if (settings.cliOrder) setCliOrder(settings.cliOrder)
      if (settings.terminalEmulator) setTerminalEmulator(settings.terminalEmulator)
    } catch { /* ignore */ }
  }, [])

  const saveSettings = useCallback(async (updates: Partial<AppSettings>) => {
    try {
      const current = await window.electronAPI.getSettings()
      const merged = { ...current, ...updates }
      await window.electronAPI.saveSettings(merged)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    window.electronAPI.getClis().then(setClis)
    window.electronAPI.checkDependencies().then(setDeps)
    window.electronAPI.getAvailableTerminals().then(setAvailableTerminals)
    loadStates()
    loadSettings()
  }, [loadStates, loadSettings])

  useEffect(() => {
    const cleanup = window.electronAPI.onCliStateUpdate((cliId, state) => {
      setStates((prev) => ({ ...prev, [cliId]: state }))
    })
    return cleanup
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'f') {
          e.preventDefault()
          const input = document.querySelector<HTMLInputElement>('input[type="text"]')
          input?.focus()
        }
        if (e.key === 'd') {
          e.preventDefault()
          setShowDeps(true)
        }
        if (e.key >= '1' && e.key <= '9') {
          const idx = parseInt(e.key) - 1
          const installed = clis.filter((cli) => isInstalled(cli.id))
          if (installed[idx]) {
            e.preventDefault()
            window.electronAPI.executeAction(installed[idx].id, 'open')
          }
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  })

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
      const newOrder = copy.map((c) => c.id)
      setCliOrder(newOrder)
      saveSettings({ cliOrder: newOrder })
      return copy
    })
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

  const handleInstallAllMissing = async () => {
    addToast('Installing all missing CLIs...', 'info')
    const results = await window.electronAPI.installAllMissing()
    const succeeded = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length
    refreshStates()
    if (failed === 0) {
      addToast(`Installed ${succeeded} CLI(s) successfully`, 'success')
    } else {
      addToast(`Installed ${succeeded}, ${failed} failed`, 'error')
    }
  }

  const handleTerminalChange = async (terminal: string) => {
    setTerminalEmulator(terminal)
    await saveSettings({ terminalEmulator: terminal || undefined })
  }

  // Apply cliOrder to the list
  const orderedClis = [...clis]
  if (cliOrder.length > 0) {
    const orderMap = new Map(cliOrder.map((id, i) => [id, i]))
    orderedClis.sort((a, b) => {
      const ai = orderMap.get(a.id)
      const bi = orderMap.get(b.id)
      if (ai !== undefined && bi !== undefined) return ai - bi
      if (ai !== undefined) return -1
      if (bi !== undefined) return 1
      return 0
    })
  }

  // Main page shows only CLIs already installed
  const sortedFavoriteIds = [...favorites].sort((a, b) => a.localeCompare(b))
  const installedClis = orderedClis.filter((cli) => isInstalled(cli.id))
  const filtered = installedClis.filter(
    (cli) =>
      cli.name.toLowerCase().includes(search.toLowerCase()) ||
      cli.id.toLowerCase().includes(search.toLowerCase())
  )

  if (!loaded) return <Loader />

  return (
    <LauncherWindow isDark={theme === 'dark'} onToggleTheme={toggleTheme}>
      <div className="px-4 pt-3 pb-2 shrink-0 flex items-center gap-2">
        <FolderPicker />
        <TerminalPicker
          options={availableTerminals}
          value={terminalEmulator || ''}
          onChange={handleTerminalChange}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <CliGrid
          clis={filtered}
          states={states}
          counts={counts}
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
        onInstalled={(id) => {
          setJustInstalled(id)
          setTimeout(() => setJustInstalled(null), 5000)
        }}
        onInstallAllMissing={handleInstallAllMissing}
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

function TerminalPicker({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selected = options.find((o) => o.value === value)
  const display = selected?.label || 'Auto'

  return (
    <div ref={ref} className="relative w-[140px] shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="mac-input w-full flex items-center gap-2.5 px-3 py-2.5 text-left group hover:border-border-strong transition-colors"
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-none bg-muted text-muted-foreground shrink-0 group-hover:text-foreground transition-colors">
          <Terminal size={13} />
        </span>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] font-medium tracking-wide text-muted-foreground">Terminal</span>
          <span className="text-[12px] font-mono truncate text-foreground">{display}</span>
        </div>
        <ChevronDown size={10} className={`text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 mac-surface bg-popover text-popover-foreground p-1 anim-pop max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`w-full text-left px-2.5 py-1.5 text-[12px] font-medium rounded-[3px] hover:bg-accent-soft transition-colors ${
                value === opt.value ? 'bg-accent-soft text-primary' : ''
              }`}
              onClick={() => { onChange(opt.value); setOpen(false) }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
