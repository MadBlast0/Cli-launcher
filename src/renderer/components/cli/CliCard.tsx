import { useState, useEffect } from 'react'
import { Tooltip } from '../ui'
import { getCliLogo } from '../../logos'
import type { CliDefinition, CliState } from '@shared/types'
import { GripVertical, Wrench, Trash2, Download, RefreshCw, Plus, Minus, ArrowUpCircle } from 'lucide-react'

interface CliCardProps {
  cli: CliDefinition
  state: CliState | null
  count: number
  onCountChange: (delta: number) => void
  onLaunch: () => void
  onChanged?: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  index: number
  justInstalled?: string | null
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void
}

type Busy = 'install' | 'uninstall' | 'update' | 'repair' | null

export function CliCard({
  cli, state, count, onCountChange, onLaunch, onChanged,
  onDragStart, onDragOver, onDrop, index, justInstalled, onToast,
}: CliCardProps) {
  const isNew = justInstalled === cli.id
  const [busy, setBusy] = useState<Busy>(null)
  const [latest, setLatest] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const installed = state?.status === 'installed' || state?.status === 'update-available'
  const updateAvailable = !!latest

  useEffect(() => {
    if (state?.status === 'installed' || state?.status === 'update-available') {
      window.electronAPI.checkCliUpdate(cli.id).then((upd) => {
        setLatest(upd.updateAvailable ? upd.latestVersion ?? 'new' : null)
      })
    } else {
      setLatest(null)
    }
  }, [state, cli.id])

  const runAction = async (action: Exclude<Busy, null>) => {
    if (busy) return
    setBusy(action)
    setError(null)
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

  const logo = getCliLogo(cli.id)
  const initial = cli.name.charAt(0).toUpperCase()
  const anyBusy = busy !== null

  return (
    <div
      className={`mac-card flex items-center gap-2 pl-2 pr-2 py-2 ${isNew ? 'anim-slide-in' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-index={index}
    >
      <div className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground shrink-0 transition-colors">
        <GripVertical size={14} />
      </div>

      <div className="w-9 h-9 flex items-center justify-center shrink-0">
        {logo ? (
          <img src={logo} alt="" className="w-full h-full object-contain" draggable={false} />
        ) : (
          <span className="text-[15px] font-bold text-muted-foreground">{initial}</span>
        )}
      </div>

      <div className="flex flex-col min-w-0 flex-1 leading-tight">
        <span className="text-[13px] font-semibold tracking-tight text-card-foreground truncate">
          {cli.name}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          {error && (
            <span className="text-[10px] font-mono text-destructive truncate max-w-[120px]" title={error}>
              {error}
            </span>
          )}
          {!error && (
            <>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${installed ? 'bg-success' : 'bg-muted-foreground/40'}`} />
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
        >
          {busy === 'install' || busy === 'uninstall'
            ? <RefreshCw size={13} className="animate-spin" />
            : installed ? <Trash2 size={13} /> : <Download size={13} />}
        </button>
      </Tooltip>

      <div className="flex items-center gap-0.5 mac-input rounded-none px-0.5 py-0.5 shrink-0">
        <button
          className="mac-btn p-0.5 rounded-none text-muted-foreground hover:text-foreground disabled:opacity-30"
          disabled={count <= 1}
          onClick={() => onCountChange(-1)}
        >
          <Minus size={12} />
        </button>
        <span className="w-4 text-center text-[12px] font-semibold font-mono text-card-foreground tabular-nums">
          {count}
        </span>
        <button
          className="mac-btn p-0.5 rounded-none text-muted-foreground hover:text-foreground disabled:opacity-30"
          disabled={count >= 9}
          onClick={() => onCountChange(1)}
        >
          <Plus size={12} />
        </button>
      </div>

      <Tooltip text={installed ? (count > 1 ? `Open ${count} terminals` : 'Open terminal') : 'Install first'}>
        <button
          className="mac-btn mac-btn-soft px-3 py-1.5 text-[12px] font-bold rounded-none shrink-0 uppercase tracking-wide text-foreground disabled:opacity-40"
          disabled={!installed}
          onClick={onLaunch}
        >
          Open
        </button>
      </Tooltip>
    </div>
  )
}
