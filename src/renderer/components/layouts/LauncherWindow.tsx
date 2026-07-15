import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { X, Minus, ArrowUpFromLine, Loader2, Download, Pin, Settings, FileText } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'
import type { AppUpdateStatus } from '../../../shared/types'
import appLogo from '../../assets/app-logo.png'

interface LauncherWindowProps {
  children: ReactNode
  isDark: boolean
  onToggleTheme: () => void
  alwaysOnTop?: boolean
  onToggleAlwaysOnTop?: () => void
  onOpenSettings?: () => void
  outdatedCount?: number
  onShowOutdated?: () => void
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void
}

type UpdateState =
  | { type: 'idle' }
  | { type: 'checking' }
  | { type: 'available'; version: string; notes?: string }
  | { type: 'not-available' }
  | { type: 'downloading'; progress: number }
  | { type: 'downloaded'; version: string }
  | { type: 'error'; message: string }

export function LauncherWindow({ children, isDark, onToggleTheme, alwaysOnTop = false, onToggleAlwaysOnTop, onOpenSettings,   outdatedCount = 0, onShowOutdated, onToast }: LauncherWindowProps) {
  const [update, setUpdate] = useState<UpdateState>({ type: 'idle' })
  const [showNotes, setShowNotes] = useState(false)

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
    if (update.type !== 'available') return
    setUpdate({ type: 'downloading', progress: 0 })
    try {
      const res = await window.electronAPI.downloadAppUpdate()
      if (!res.success) {
        const message = res.error ?? 'Failed to download update'
        setUpdate({ type: 'error', message })
        onToast?.(message, 'error')
        return
      }
      await window.electronAPI.installAppUpdate()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setUpdate({ type: 'error', message })
      onToast?.(message, 'error')
    }
  }, [update.type, onToast])

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden border border-border relative">
      {/* Release notes popover (#16) — shown when an update is available and
          the user expands it. Notes are rendered as plain text only (no
          dangerouslySetInnerHTML) so remote content can't execute scripts. */}
      {update.type === 'available' && showNotes && update.notes && (
        <div className="absolute left-0 right-0 top-11 z-20 bg-popover text-popover-foreground border-b border-border shadow-xl max-h-64 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-bold">What's new in v{update.version}</span>
            <button
              onClick={() => setShowNotes(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close release notes"
            >
              <X size={14} />
            </button>
          </div>
          <pre className="text-[11px] leading-relaxed whitespace-pre-wrap break-words font-sans">{update.notes}</pre>
          <a
            href="https://github.com/MadBlast0/Cli-launcher/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-[11px] font-semibold text-primary hover:underline"
          >
            View on GitHub
          </a>
        </div>
      )}

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
        {update.type === 'available' && (
          <>
            {update.notes && (
              <button
                onClick={() => setShowNotes((s) => !s)}
                className={`flex items-center justify-center w-6 h-6 rounded-md transition-colors ${showNotes ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                aria-label="Show release notes"
                title="What's new"
              >
                <FileText size={14} />
              </button>
            )}
            <button
              onClick={handleUpdateClick}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-primary/15 text-primary hover:bg-primary/25 transition-colors whitespace-nowrap"
              aria-label={`Update to v${update.version}`}
              title={`Update to v${update.version}`}
            >
              <Download size={15} />
              <span>Update</span>
            </button>
          </>
        )}
        {update.type === 'downloading' && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-primary/15 text-primary whitespace-nowrap"
            aria-label={`Downloading… ${Math.round(update.progress)}%`}
            title={`Downloading… ${Math.round(update.progress)}%`}
          >
            <Loader2 size={14} className="animate-spin" />
            <span className="font-mono tabular-nums">{Math.round(update.progress)}%</span>
          </div>
        )}
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          {onShowOutdated && outdatedCount > 0 && (
            <button
              onClick={onShowOutdated}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-primary/15 text-primary hover:bg-primary/25 transition-colors whitespace-nowrap"
              aria-label={`${outdatedCount} updates available`}
              title={`${outdatedCount} update${outdatedCount > 1 ? 's' : ''} available`}
            >
              <ArrowUpFromLine size={13} />
              {outdatedCount} update{outdatedCount > 1 ? 's' : ''}
            </button>
          )}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Settings"
              title="Settings"
            >
              <Settings size={15} />
            </button>
          )}
          {onToggleAlwaysOnTop && (
            <button
              onClick={onToggleAlwaysOnTop}
              className={
                'flex items-center justify-center w-6 h-6 rounded-md transition-colors ' +
                (alwaysOnTop
                  ? 'text-primary bg-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent')
              }
              aria-label={alwaysOnTop ? 'Disable always-on-top' : 'Enable always-on-top'}
              title={alwaysOnTop ? 'Always on top: on' : 'Always on top: off'}
            >
              <Pin size={15} />
            </button>
          )}
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
