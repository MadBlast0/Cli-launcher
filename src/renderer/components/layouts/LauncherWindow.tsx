import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { X, Minus, ArrowUpFromLine, Loader2, Download, RotateCcw } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'
import type { AppUpdateStatus } from '../../../shared/types'
import appLogo from '../../assets/app-logo.png'

interface LauncherWindowProps {
  children: ReactNode
  isDark: boolean
  onToggleTheme: () => void
}

type UpdateState =
  | { type: 'idle' }
  | { type: 'checking' }
  | { type: 'available'; version: string }
  | { type: 'not-available' }
  | { type: 'downloading'; progress: number }
  | { type: 'downloaded'; version: string }
  | { type: 'error'; message: string }

export function LauncherWindow({ children, isDark, onToggleTheme }: LauncherWindowProps) {
  const [update, setUpdate] = useState<UpdateState>({ type: 'idle' })

  useEffect(() => {
    if (!window.electronAPI?.onAppUpdateStatus) return
    const unsub = window.electronAPI.onAppUpdateStatus((status: AppUpdateStatus) => {
      switch (status.type) {
        case 'checking':
          setUpdate({ type: 'checking' })
          break
        case 'available':
          setUpdate({ type: 'available', version: status.version ?? '' })
          break
        case 'not-available':
          setUpdate({ type: 'not-available' })
          setTimeout(() => setUpdate({ type: 'idle' }), 2000)
          break
        case 'downloading':
          setUpdate({ type: 'downloading', progress: status.progress ?? 0 })
          break
        case 'downloaded':
          setUpdate({ type: 'downloaded', version: status.version ?? '' })
          break
        case 'error':
          setUpdate({ type: 'error', message: status.error ?? 'Unknown error' })
          setTimeout(() => setUpdate({ type: 'idle' }), 3000)
          break
      }
    })
    return unsub
  }, [])

  const handleUpdateClick = useCallback(async () => {
    switch (update.type) {
      case 'idle':
        setUpdate({ type: 'checking' })
        const info = await window.electronAPI.checkForAppUpdate()
        if (!info.updateAvailable) {
          setUpdate({ type: 'not-available' })
          setTimeout(() => setUpdate({ type: 'idle' }), 2000)
        }
        break
      case 'available':
      case 'error':
        setUpdate({ type: 'downloading', progress: 0 })
        await window.electronAPI.downloadAppUpdate()
        break
      case 'downloaded':
        window.electronAPI.installAppUpdate()
        break
    }
  }, [update.type])

  let updateIcon: ReactNode
  let updateLabel: string
  let buttonText: string
  let updateDisabled = false

  switch (update.type) {
    case 'idle':
      updateIcon = <ArrowUpFromLine size={15} />
      updateLabel = 'Check for updates'
      buttonText = 'Update'
      break
    case 'checking':
      updateIcon = <Loader2 size={15} className="animate-spin" />
      updateLabel = 'Checking…'
      buttonText = '⋯'
      updateDisabled = true
      break
    case 'available':
      updateIcon = <Download size={15} />
      updateLabel = `Update to v${update.version}`
      buttonText = 'Update'
      break
    case 'not-available':
      updateIcon = <ArrowUpFromLine size={15} />
      updateLabel = 'Up to date'
      buttonText = 'Updated'
      updateDisabled = true
      break
    case 'downloading':
      updateIcon = (
        <span className="text-[10px] font-mono tabular-nums">
          {Math.round(update.progress)}%
        </span>
      )
      updateLabel = `Downloading… ${Math.round(update.progress)}%`
      buttonText = ''
      updateDisabled = true
      break
    case 'downloaded':
      updateIcon = <RotateCcw size={15} />
      updateLabel = 'Restart to update'
      buttonText = 'Restart'
      break
    case 'error':
      updateIcon = <ArrowUpFromLine size={15} />
      updateLabel = update.message
      buttonText = 'Update'
      break
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden border border-border">
      {/* Title bar — flush with the app background, no divider */}
      <div
        className="flex items-center justify-between px-3.5 h-11 shrink-0 bg-background"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div
          className="flex items-center gap-2.5"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <img
            src={appLogo}
            alt="CLI Launcher"
            className="w-6 h-6 object-contain shrink-0"
            draggable={false}
          />
          <span className="text-[13px] font-bold tracking-tight text-foreground">
            CLI Launcher
          </span>
        </div>

        <div
          className="flex items-center gap-2"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={handleUpdateClick}
            disabled={updateDisabled}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50 whitespace-nowrap"
            aria-label={updateLabel}
            title={updateLabel}
          >
            {updateIcon}
            {buttonText && <span>{buttonText}</span>}
          </button>
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          <button
            onClick={() => window.electronAPI.minimizeWindow()}
            className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Minimize"
          >
            <Minus size={15} />
          </button>
          <button
            onClick={() => window.electronAPI.closeWindow()}
            className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  )
}
