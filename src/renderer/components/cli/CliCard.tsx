import { useState, useEffect, useRef, memo } from 'react'
import { Tooltip } from '../ui'
import { getCliLogo } from '../../logos'
import type { CliDefinition, CliState } from '@shared/types'
import { GripVertical, Wrench, Trash2, Download, RefreshCw, Plus, Minus, ArrowUpCircle, ExternalLink, Globe, Copy } from 'lucide-react'

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
  onDragStart, onDragOver, onDrop, index, justInstalled, onToast,
}: CliCardProps) {
  const isNew = justInstalled === cli.id
  const [busy, setBusy] = useState<Busy>(null)
  const [latest, setLatest] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

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

  const runAction = async (action: Exclude<Busy, null>) => {
    if (busy) return
    setBusy(action)
    setError(null)
    setContextMenu(null)
    try {
      const result = await window.electronAPI.executeAction(cli.id, action)
      if (action === 'install' || action === 'uninstall') {
        const fresh = await window.electronAPI.getCliState(cli.id)
        const ok = fresh?.status === 'installed' || fresh?.status === 'update-available'
        if (action === 'install') {
          if (result.success && ok) {
            onToast?.(`${cli.name} installed successfully`, 'success')
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
      try { window.open(cli.homepage, '_blank') } catch { /* ignore */ }
    }
    setContextMenu(null)
  }

  const logo = getCliLogo(cli.id)
  const initial = cli.name.charAt(0).toUpperCase()
  const anyBusy = busy !== null

  return (
    <div
      ref={cardRef}
      className={`mac-card flex items-center gap-2 pl-2 pr-2 py-2 ${isNew ? 'anim-slide-in' : ''} relative`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-index={index}
      onContextMenu={handleContextMenu}
      role="listitem"
      aria-label={`${cli.name}${installed ? `, version ${state?.version || 'installed'}` : ', not installed'}`}
    >
      <div className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground shrink-0 transition-colors" aria-hidden="true">
        <GripVertical size={14} />
      </div>

      <div className="w-9 h-9 flex items-center justify-center shrink-0">
        {logo ? (
          <img src={logo} alt={`${cli.name} logo`} className="w-full h-full object-contain" draggable={false} />
        ) : (
          <span className="text-[15px] font-bold text-muted-foreground" aria-hidden="true">{initial}</span>
        )}
      </div>

      <div className="flex flex-col min-w-0 flex-1 leading-tight">
        <span className="text-[13px] font-semibold tracking-tight text-card-foreground truncate">
          {cli.name}
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

      <Tooltip text={installed ? 'Uninstall' : 'Install'}>
        <button
          className="mac-btn mac-btn-soft p-1.5 rounded-none text-secondary-foreground disabled:opacity-50"
          disabled={anyBusy}
          onClick={() => runAction(installed ? 'uninstall' : 'install')}
          aria-label={installed ? `Uninstall ${cli.name}` : `Install ${cli.name}`}
        >
          {busy === 'install' || busy === 'uninstall'
            ? <RefreshCw size={13} className="animate-spin" />
            : installed ? <Trash2 size={13} /> : <Download size={13} />}
        </button>
      </Tooltip>

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
