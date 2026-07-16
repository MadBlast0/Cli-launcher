import { useState, useEffect, useRef, memo } from 'react'
import { Tooltip } from '../ui'
import { getCliLogo } from '../../logos'
import type { CliDefinition, CliState, ActionProgressMessage } from '@shared/types'
import { GripVertical, Wrench, Trash2, Download, RefreshCw, Plus, Minus, ArrowUpCircle, ExternalLink, Globe, Copy, X, Star } from 'lucide-react'

interface CliCardProps {
  cli: CliDefinition
  state: CliState | null
  count: number
  onCountChange: (delta: number) => void
  onLaunch: () => void
  onChanged?: () => void
  onRepaired?: () => void
  onUpdated?: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  index: number
  selected?: boolean
  onSelect?: (index: number) => void
  onConfigure?: (cliId: string) => void
  onHide?: (cliId: string) => void
  onToggleFavorite?: (cliId: string) => void
  favorites?: string[]
  aliasMap?: Record<string, string>
  justInstalled?: string | null
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void
}

type Busy = 'install' | 'uninstall' | 'update' | 'repair' | null

/** Builds the correct global-install command for the CLI's package manager. */
function installCommandFor(cli: CliDefinition): string {
  const pkg = cli.packageName || cli.id
  if (cli.dependencyType === 'python') return `pip install ${pkg}`
  if (cli.dependencyType === 'standalone') {
    return cli.homepage ? `# See install instructions: ${cli.homepage}` : `# Install ${cli.name} from its homepage`
  }
  return `npm install -g ${pkg}`
}

function CliCardInner({
  cli, state, count, onCountChange, onLaunch, onChanged, onRepaired, onUpdated,
  onDragStart, onDragOver, onDrop, index, selected = false, onSelect, onConfigure, onHide, onToggleFavorite, favorites, aliasMap, justInstalled, onToast,
}: CliCardProps) {
  const isNew = justInstalled === cli.id
  const displayName = (aliasMap && aliasMap[cli.id]) || cli.name
  const [busy, setBusy] = useState<Busy>(null)
  const [lastAction, setLastAction] = useState<Busy>(null)
  const [latest, setLatest] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [progressPercent, setProgressPercent] = useState<number | undefined>(undefined)
  const [progressMessage, setProgressMessage] = useState<string>('')
  const cardRef = useRef<HTMLDivElement>(null)

  // Keep the keyboard-selected card scrolled into view.
  useEffect(() => {
    if (selected && cardRef.current) {
      cardRef.current.scrollIntoView({ block: 'nearest' })
    }
  }, [selected])

  const installed = state?.status === 'installed' || state?.status === 'update-available'
  const updateAvailable = !!latest

  // Key on the primitive status/version rather than the `state` object: the
  // startup refresh coalesces updates into a fresh object each frame, so keying
  // on object identity re-ran this update check on every unrelated tick.
  useEffect(() => {
    if (state?.status === 'installed' || state?.status === 'update-available') {
      window.electronAPI.checkCliUpdate(cli.id).then((upd) => {
        setLatest(upd.updateAvailable ? upd.latestVersion ?? 'new' : null)
      })
    } else {
      setLatest(null)
    }
  }, [state?.status, state?.version, cli.id])

  // Close the context menu on an outside click OR the Escape key.
  useEffect(() => {
    if (!contextMenu) return
    const handleClick = () => setContextMenu(null)
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setContextMenu(null) }
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [contextMenu])

  // Elapsed-seconds timer while any action is in progress.
  useEffect(() => {
    if (busy === null) {
      setElapsed(0)
      setProgressPercent(undefined)
      setProgressMessage('')
      return
    }
    const start = Date.now()
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [busy])

  // Listen for structured install progress streamed from the main process.
  useEffect(() => {
    if (busy !== 'install') return
    const cleanup = window.electronAPI.onActionProgress((cliId: string, msg: ActionProgressMessage) => {
      if (cliId !== cli.id) return
      if (msg.message === '__done__') {
        setProgressPercent(undefined)
        setProgressMessage('Detecting…')
        return
      }
      setProgressPercent(msg.percent)
      setProgressMessage(msg.message)
    })
    return cleanup
  }, [busy, cli.id])

  const runAction = async (action: Exclude<Busy, null>) => {
    if (busy) return
    setLastAction(action)
    setBusy(action)
    setError(null)
    setContextMenu(null)
    try {
      const result = await window.electronAPI.executeAction(cli.id, action)
      if (action === 'install' || action === 'uninstall') {
        const fresh = await window.electronAPI.getCliState(cli.id)
        const ok = fresh?.status === 'installed' || fresh?.status === 'update-available'
        if (action === 'install') {
          if (!result.success && result.error === 'Cancelled') {
            onToast?.(`${cli.name} install cancelled`, 'info')
          } else if (result.success && ok) {
            onToast?.(`${cli.name} installed successfully`, 'success')
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 1200)
          } else {
            setError(result.error || 'Install failed')
            onToast?.(`${cli.name} install failed: ${result.error || 'CLI not found after install'}`, 'error')
          }
        } else {
          if (result.success && !ok) {
            onToast?.(`${cli.name} uninstalled`, 'info')
          } else {
            setError(result.error || 'Uninstall may have failed')
            onToast?.(`${cli.name} uninstall ${result.success ? 'reported success but CLI is still present' : 'failed'}: ${result.error || ''}`, 'error')
          }
        }
        onChanged?.()
      } else {
        if (!result.success) {
          setError(result.error || 'Action failed')
          onToast?.(`${cli.name} ${action} failed: ${result.error}`, 'error')
        } else {
          onToast?.(`${cli.name} ${action} complete`, 'success')
          // Notify the app so shared state (version / update badge) refreshes.
          if (action === 'update') onUpdated?.()
          if (action === 'repair') onRepaired?.()
          onChanged?.()
        }
      }
    } catch (err) {
      const msg = String(err)
      setError(msg)
      onToast?.(`${cli.name} ${action} error: ${msg}`, 'error')
    } finally {
      setBusy(null)
    }
  }

  const cancelInstall = async () => {
    await window.electronAPI.cancelAction(cli.id)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    // Clamp to the viewport so the menu never renders off-screen near the
    // right/bottom edges (approximate menu size: 190×150).
    const MENU_W = 190
    const MENU_H = 150
    const x = Math.max(4, Math.min(e.clientX, window.innerWidth - MENU_W))
    const y = Math.max(4, Math.min(e.clientY, window.innerHeight - MENU_H))
    setContextMenu({ x, y })
  }

  const copyInstallCommand = async () => {
    const cmd = installCommandFor(cli)
    try {
      await navigator.clipboard.writeText(cmd)
      onToast?.('Install command copied', 'success')
    } catch { /* ignore */ }
    setContextMenu(null)
  }

  const openHomepage = () => {
    if (cli.homepage) {
      try { window.open(cli.homepage, '_blank', 'noopener,noreferrer') } catch { /* ignore */ }
    }
    setContextMenu(null)
  }

  const logo = getCliLogo(cli.id)
  const initial = cli.name.charAt(0).toUpperCase()
  const anyBusy = busy !== null

  return (
    <div
      ref={cardRef}
      className={`mac-card flex items-center gap-2 pl-2 pr-2 py-2 relative ${isNew ? 'anim-slide-in' : 'anim-stagger-in'} ${showSuccess ? 'anim-flash-success' : ''} ${selected ? 'ring-2 ring-primary ring-inset' : ''}`}
      style={{ animationDelay: `${index * 30}ms` }}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-index={index}
      onMouseDown={() => onSelect?.(index)}
      onContextMenu={handleContextMenu}
      role="listitem"
      aria-label={`${displayName}${installed ? `, version ${state?.version || 'installed'}` : ', not installed'}`}
    >
      <div className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground shrink-0 transition-colors" aria-hidden="true">
        <GripVertical size={14} />
      </div>
      {onToggleFavorite && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(cli.id) }}
          className={`flex items-center justify-center w-5 h-5 shrink-0 rounded-sm transition-colors ${
            favorites?.includes(cli.id)
              ? 'text-yellow-500 hover:text-yellow-400'
              : 'text-muted-foreground/30 hover:text-muted-foreground/60'
          }`}
          aria-label={favorites?.includes(cli.id) ? 'Remove from favorites' : 'Add to favorites'}
          title={favorites?.includes(cli.id) ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star size={12} fill={favorites?.includes(cli.id) ? 'currentColor' : 'none'} />
        </button>
      )}

      <div className="w-9 h-9 flex items-center justify-center shrink-0">
        {logo ? (
          <img src={logo} alt={`${cli.name} logo`} className="w-full h-full object-contain" draggable={false} />
        ) : (
          <span className="text-[15px] font-bold text-muted-foreground" aria-hidden="true">{initial}</span>
        )}
      </div>

      <div className="flex flex-col min-w-0 flex-1 leading-tight">
        <span className="text-[13px] font-semibold tracking-tight text-card-foreground truncate">
          {displayName}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          {error && (
            <Tooltip text={error}>
              <span className="text-[10px] font-mono text-destructive truncate max-w-[120px]" role="alert">
                {error}
              </span>
            </Tooltip>
          )}
          {!error && (
            <>
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${installed ? 'bg-success' : 'bg-muted-foreground/40'}`}
                aria-hidden="true"
              />
              <span className="text-[10.5px] font-mono text-muted-foreground truncate">
                {installed ? state?.version || 'installed' : 'not installed'}
              </span>
            </>
          )}
        </div>
      </div>

      {updateAvailable && (
        <Tooltip text={`Update to ${latest}`}>
          <button
            className="mac-btn flex items-center gap-1 px-1.5 py-1 text-[10px] font-semibold bg-white text-black border border-border rounded-none shrink-0 disabled:opacity-50"
            disabled={anyBusy}
            onClick={() => runAction('update')}
            aria-label={`Update ${cli.name} to ${latest}`}
          >
            {busy === 'update'
              ? <RefreshCw size={11} className="animate-spin" />
              : <ArrowUpCircle size={11} />}
            Update
          </button>
        </Tooltip>
      )}

      {installed && (
        <Tooltip text="Repair">
          <button
            className="mac-btn mac-btn-soft p-1.5 rounded-none text-secondary-foreground disabled:opacity-50"
            disabled={anyBusy}
            onClick={() => runAction('repair')}
            aria-label={`Repair ${cli.name}`}
          >
            {busy === 'repair' ? <RefreshCw size={13} className="animate-spin" /> : <Wrench size={13} />}
          </button>
        </Tooltip>
      )}

      {installed ? (
        <Tooltip text={busy === 'uninstall' ? 'Uninstalling…' : 'Uninstall'}>
          <button
            className="mac-btn mac-btn-soft p-1.5 rounded-none text-secondary-foreground disabled:opacity-50"
            disabled={anyBusy}
            onClick={() => runAction('uninstall')}
            aria-label={`Uninstall ${cli.name}`}
          >
            {busy === 'uninstall'
              ? <RefreshCw size={13} className="animate-spin" />
              : <Trash2 size={13} />}
          </button>
        </Tooltip>
      ) : busy === 'install' ? (
        <Tooltip text={`Cancel install${elapsed > 0 ? ` (${elapsed}s)` : ''} — ${progressMessage || 'installing…'}`}>
          <button
            className="mac-btn mac-btn-soft p-1.5 rounded-none text-destructive hover:text-destructive"
            onClick={cancelInstall}
            aria-label={`Cancel install ${cli.name}`}
          >
            <X size={13} />
          </button>
        </Tooltip>
      ) : (
        <Tooltip text="Install">
          <button
            className="mac-btn mac-btn-soft p-1.5 rounded-none text-secondary-foreground disabled:opacity-50"
            disabled={anyBusy}
            onClick={() => runAction('install')}
            aria-label={`Install ${cli.name}`}
          >
            <Download size={13} />
          </button>
        </Tooltip>
      )}

      <div className="flex items-center gap-0.5 mac-input rounded-none px-0.5 py-0.5 shrink-0" role="group" aria-label={`Launch count for ${cli.name}`}>
        <button
          className="mac-btn p-0.5 rounded-none text-muted-foreground hover:text-foreground disabled:opacity-30"
          disabled={count <= 1}
          onClick={() => onCountChange(-1)}
          aria-label="Decrease launch count"
        >
          <Minus size={12} />
        </button>
        <span className="w-4 text-center text-[12px] font-semibold font-mono text-card-foreground tabular-nums" aria-live="polite">
          {count}
        </span>
        <button
          className="mac-btn p-0.5 rounded-none text-muted-foreground hover:text-foreground disabled:opacity-30"
          disabled={count >= 9}
          onClick={() => onCountChange(1)}
          aria-label="Increase launch count"
        >
          <Plus size={12} />
        </button>
      </div>

      <Tooltip text={installed ? (count > 1 ? `Open ${count} terminals` : 'Open terminal') : 'Install first'}>
        <button
          className="mac-btn mac-btn-soft px-3 py-1.5 text-[12px] font-bold rounded-none shrink-0 uppercase tracking-wide text-foreground disabled:opacity-40"
          disabled={!installed}
          onClick={onLaunch}
          aria-label={`Open ${cli.name}${count > 1 ? ` (${count} terminals)` : ''}`}
        >
          Open
        </button>
      </Tooltip>

      {/* Failure diagnostics: retry / copy error / open log (#10, #19) */}
      {error && !anyBusy && (
        <div className="absolute bottom-1.5 left-0 right-0 px-3 flex items-center justify-center gap-2 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1">
            <button
              className="mac-btn mac-btn-soft px-2 py-1 text-[10px] font-semibold rounded-none text-foreground hover:bg-accent"
              onClick={() => { if (lastAction) runAction(lastAction) }}
              aria-label={`Retry ${cli.name}`}
            >
              Retry
            </button>
            <button
              className="mac-btn mac-btn-soft px-2 py-1 text-[10px] font-semibold rounded-none text-foreground hover:bg-accent"
              onClick={async () => { try { await navigator.clipboard.writeText(error) } catch { /* ignore */ } }}
              aria-label="Copy error"
            >
              Copy
            </button>
            <button
              className="mac-btn mac-btn-soft px-2 py-1 text-[10px] font-semibold rounded-none text-foreground hover:bg-accent"
              onClick={async () => {
                const p = await window.electronAPI.getActionLog(cli.id)
                if (p) window.electronAPI.openPath(p)
                else onToast?.('No log available', 'info')
              }}
              aria-label="Open log"
            >
              Log
            </button>
          </div>
        </div>
      )}

      {/* Progress info text during install */}
      {busy === 'install' && (progressMessage || elapsed > 0) && (
        <div className="absolute bottom-2.5 left-0 right-0 px-3 flex justify-center pointer-events-none">
          <span className="text-[9px] font-mono text-muted-foreground truncate text-center">
            {progressPercent !== undefined ? `${progressPercent}%` : ''}
            {progressPercent !== undefined && progressMessage ? ' — ' : ''}
            {progressMessage || (elapsed > 0 ? `${elapsed}s` : '')}
          </span>
        </div>
      )}

      {/* Progress bar — indeterminate pulse when no percent, determinate when we have it */}
      <div
        className={`absolute bottom-0 left-0 right-0 overflow-hidden transition-all duration-300 ease-out ${
          anyBusy ? 'max-h-0.5 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="h-0.5 bg-border">
          <div
            className={`h-full rounded-none transition-all duration-300 ease-out ${
              progressPercent === undefined ? 'bg-primary anim-pulse-bar' : 'bg-primary'
            }`}
            style={progressPercent !== undefined ? { width: `${progressPercent}%` } : { width: '100%' }}
          />
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-[9999] mac-surface bg-popover text-popover-foreground p-1.5 anim-pop min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          role="menu"
          aria-label={`Actions for ${cli.name}`}
        >
          {cli.homepage && (
            <button
              className="w-full text-left px-3 py-2 text-[13px] font-medium rounded-[3px] hover:bg-accent-soft transition-colors flex items-center gap-2"
              onClick={openHomepage}
              role="menuitem"
            >
              <Globe size={13} /> Homepage
            </button>
          )}
           {cli.packageName && (
             <button
               className="w-full text-left px-3 py-2 text-[13px] font-medium rounded-[3px] hover:bg-accent-soft transition-colors flex items-center gap-2"
               onClick={copyInstallCommand}
               role="menuitem"
             >
               <Copy size={13} /> Copy install command
             </button>
           )}
          <button
            className="w-full text-left px-3 py-2 text-[13px] font-medium rounded-[3px] hover:bg-accent-soft transition-colors flex items-center gap-2"
            onClick={() => { onConfigure?.(cli.id); setContextMenu(null) }}
            role="menuitem"
          >
            <Wrench size={13} /> Configure
          </button>
          {onHide && (
            <button
              className="w-full text-left px-3 py-2 text-[13px] font-medium rounded-[3px] hover:bg-accent-soft transition-colors flex items-center gap-2"
              onClick={() => { onHide(cli.id); setContextMenu(null) }}
              role="menuitem"
            >
              <X size={13} /> Hide
            </button>
          )}
          {error && lastAction && (
            <button
              className="w-full text-left px-3 py-2 text-[13px] font-medium rounded-[3px] hover:bg-accent-soft transition-colors flex items-center gap-2"
              onClick={() => { setContextMenu(null); runAction(lastAction) }}
              role="menuitem"
            >
              <RefreshCw size={13} /> Retry
            </button>
          )}
          <button
            className="w-full text-left px-3 py-2 text-[13px] font-medium rounded-[3px] hover:bg-accent-soft transition-colors flex items-center gap-2"
            onClick={async () => {
              setContextMenu(null)
              const p = await window.electronAPI.getActionLog(cli.id)
              if (p) window.electronAPI.openPath(p)
              else onToast?.('No log available', 'info')
            }}
            role="menuitem"
          >
            <Copy size={13} /> View run log
          </button>
          <button
            className="w-full text-left px-3 py-2 text-[13px] font-medium rounded-[3px] hover:bg-accent-soft transition-colors flex items-center gap-2"
            onClick={() => { onLaunch(); setContextMenu(null) }}
            role="menuitem"
          >
            <ExternalLink size={13} /> Open terminal
          </button>
        </div>
      )}
    </div>
  )
}

// Memoized so a state update for one CLI doesn't re-render every other card.
export const CliCard = memo(CliCardInner)
