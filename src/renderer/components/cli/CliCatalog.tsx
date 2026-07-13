import { useState, useMemo, useEffect } from 'react'
import { Modal, Tooltip, Button } from '../ui'
import { getCliLogo } from '../../logos'
import type { CliDefinition, CliState, ActionProgressMessage } from '@shared/types'
import type { ToastType } from '../ui/Toast'
import { ArrowLeft, Download, Check, Search, Package, Globe, DownloadCloud, X, RefreshCw } from 'lucide-react'

interface CliCatalogProps {
  open: boolean
  onClose: () => void
  clis: CliDefinition[]
  states: Record<string, CliState>
  onChanged: () => void
  onInstalled?: (cliId: string) => void
  onToast?: (message: string, type: ToastType) => string | void
  updateToast?: (id: string, message: string, type: ToastType) => void
  outdatedOnly?: boolean
  hiddenClis?: string[]
  onUnhide?: (cliId: string) => void
  aliasMap?: Record<string, string>
}

type ManagerGroup = 'npm' | 'pip' | 'standalone'

const groupLabels: Record<ManagerGroup, string> = {
  npm: 'npm (Node.js)',
  pip: 'pip (Python)',
  standalone: 'Standalone',
}

const groupIcons: Record<ManagerGroup, string> = {
  npm: '⬡',
  pip: '▰',
  standalone: '◈',
}

export function CliCatalog({ open, onClose, clis, states, onChanged, onInstalled, onToast, updateToast, outdatedOnly = false, hiddenClis = [], onUnhide, aliasMap }: CliCatalogProps) {
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [leaving, setLeaving] = useState<string | null>(null)
  const [progressMsgs, setProgressMsgs] = useState<Record<string, { percent?: number; message: string }>>({})

  // Listen for progress updates for any CLI being installed
  useEffect(() => {
    if (!open) return
    const cleanup = window.electronAPI.onActionProgress((cliId: string, msg: ActionProgressMessage) => {
      if (msg.message === '__done__') {
        setProgressMsgs((prev) => ({ ...prev, [cliId]: { message: 'Detecting…' } }))
        return
      }
      setProgressMsgs((prev) => ({ ...prev, [cliId]: { percent: msg.percent, message: msg.message } }))
    })
    return cleanup
  }, [open])

  const statusOf = (cli: CliDefinition) => states[cli.id]?.status
  const isInstalled = (cli: CliDefinition) => statusOf(cli) === 'installed' || statusOf(cli) === 'update-available'
  const displayName = (cli: CliDefinition) => (aliasMap && aliasMap[cli.id]) || cli.name

  const notInstalled = clis.filter((cli) => !isInstalled(cli) && !hiddenClis.includes(cli.id))

  const filtered = notInstalled.filter(
    (cli) =>
      cli.name.toLowerCase().includes(search.toLowerCase()) ||
      cli.id.toLowerCase().includes(search.toLowerCase())
  )

  // When opened as an "updates" view, show the installed CLIs that have an
  // update available (so the user can act on them), rather than the not-yet
  // installed ones.
  const visible = outdatedOnly
    ? clis.filter((cli) => statusOf(cli) === 'update-available')
    : filtered

  // Hidden CLIs are listed separately at the bottom so they remain manageable.
  const hidden = clis.filter((cli) => hiddenClis.includes(cli.id))

  // Group by dependency type
  const grouped = useMemo(() => {
    const groups: Record<ManagerGroup, CliDefinition[]> = { npm: [], pip: [], standalone: [] }
    for (const cli of visible) {
      const type: ManagerGroup =
        cli.dependencyType === 'node'
          ? 'npm'
          : cli.dependencyType === 'python'
            ? 'pip'
            : 'standalone'
      groups[type].push(cli)
    }
    return groups
  }, [visible])

  const setToast = (toastId: string | void, message: string, type: ToastType) => {
    if (toastId && updateToast) updateToast(toastId, message, type)
    else onToast?.(message, type)
  }

  const cancelInstall = async (cliId: string) => {
    await window.electronAPI.cancelAction(cliId)
  }

  const handleInstall = async (cliId: string) => {
    setBusy(cliId)
    setProgressMsgs((prev) => { const next = { ...prev }; delete next[cliId]; return next })
    const cliName = clis.find((c) => c.id === cliId)?.name || cliId
    const toastId = onToast?.(`Installing ${cliName}…`, 'loading')

    try {
      const result = await window.electronAPI.executeAction(cliId, 'install')
      if (!result.success && result.error === 'Cancelled') {
        setToast(toastId, `${cliName} install cancelled`, 'info')
        setBusy(null)
        return
      }
      const fresh = await window.electronAPI.getCliState(cliId)
      const installed = fresh?.status === 'installed' || fresh?.status === 'update-available'

        if (result.success && installed) {
          setToast(toastId, `${cliName} installed successfully`, 'success')
          setBusy(null)
          setLeaving(cliId)
          setTimeout(() => {
            setTimeout(() => {
              setLeaving(null)
              onChanged()
              onInstalled?.(cliId)
            }, 50)
          }, 250)
          return
        }
      setToast(toastId, `${cliName} install failed: ${result.error || 'CLI not found after install'}`, 'error')
    } catch (err) {
      // An IPC rejection must never leave the row stuck spinning.
      setToast(toastId, `${cliName} install error: ${String(err)}`, 'error')
    } finally {
      // On the success path busy was already cleared before the animation; this
      // guarantees it is cleared on every failure/error path too.
      setBusy((cur) => (cur === cliId ? null : cur))
    }
  }

  const installAll = async (list: CliDefinition[]) => {
    for (const cli of list) {
      // Skip CLIs that are already installed so we don't re-trigger an install
      // for items that became installed (or were installed already) — e.g. if
      // `states` updated while the catalog was open.
      if (states[cli.id]?.status === 'installed' || states[cli.id]?.status === 'update-available') {
        continue
      }
      const toastId = onToast?.(`Installing ${cli.name}…`, 'loading')
      try {
        const result = await window.electronAPI.executeAction(cli.id, 'install')
        const fresh = await window.electronAPI.getCliState(cli.id)
        const installed = fresh?.status === 'installed' || fresh?.status === 'update-available'

        if (result.success && installed) {
          setToast(toastId, `${cli.name} installed successfully`, 'success')
          onChanged()
          onInstalled?.(cli.id)
        } else {
          setToast(toastId, `${cli.name} install failed: ${result.error || 'CLI not found after install'}`, 'error')
        }
      } catch (err) {
        setToast(toastId, `${cli.name} install error: ${String(err)}`, 'error')
      }
    }
  }

  const renderCliItem = (cli: CliDefinition) => {
    const logo = getCliLogo(cli.id)
    const initial = cli.name.charAt(0).toUpperCase()
    const isBusy = busy === cli.id
    const isLeaving = leaving === cli.id
    const prog = progressMsgs[cli.id]
    const hasProgress = isBusy && prog
    return (
      <div
        key={cli.id}
        className={`mac-card flex flex-col gap-0 px-3 py-2 relative ${isLeaving ? 'anim-slide-out' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center shrink-0">
            {logo ? (
              <img src={logo} alt="" className="w-full h-full object-contain" draggable={false} />
            ) : (
              <span className="text-[15px] font-bold text-muted-foreground">{initial}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold tracking-tight text-card-foreground truncate">
                {displayName(cli)}
              </span>
              {cli.packageName && (
                <span className="text-[10px] font-mono text-muted-foreground truncate flex items-center gap-1">
                  <Package size={9} /> {cli.packageName}
                </span>
              )}
            </div>
            {cli.description && (
              <p className="text-[10.5px] text-muted-foreground truncate mt-0.5">{cli.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {cli.homepage && (
              <a
                href={cli.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="mac-btn mac-btn-soft p-1.5 rounded-[3px] text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
                aria-label={`${cli.name} homepage`}
              >
                <Globe size={12} />
              </a>
            )}
            {isBusy ? (
              <Tooltip text={`Cancel — ${prog?.message || 'installing…'}`}>
                <button
                  className="mac-btn mac-btn-soft p-1.5 rounded-[3px] text-destructive"
                  onClick={() => cancelInstall(cli.id)}
                  aria-label={`Cancel install ${cli.name}`}
                >
                  <X size={12} />
                </button>
              </Tooltip>
            ) : (
              <Tooltip text={isLeaving ? 'Installed!' : 'Install'}>
                <button
                  className={`mac-btn p-1.5 rounded-[3px] ${isLeaving ? 'mac-btn-primary' : 'mac-btn-primary'}`}
                  onClick={() => handleInstall(cli.id)}
                  disabled={isLeaving}
                  aria-label={`Install ${cli.name}`}
                >
                  {isLeaving ? <Check size={12} /> : <Download size={12} />}
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Progress info + bar */}
        {isBusy && (
          <div className="mt-1.5">
            {prog && (prog.message || prog.percent !== undefined) && (
              <div className="flex items-center justify-center pb-1">
                <span className="text-[9px] font-mono text-muted-foreground truncate text-center">
                  {prog.percent !== undefined ? `${prog.percent}%` : ''}
                  {prog.percent !== undefined && prog.message ? ' — ' : ''}
                  {prog.message || ''}
                </span>
              </div>
            )}
            <div className="h-0.5 bg-border rounded-none overflow-hidden">
              <div
                className={`h-full rounded-none transition-all duration-300 ease-out ${
                  prog?.percent === undefined ? 'bg-primary anim-pulse-bar' : 'bg-primary'
                }`}
                style={prog?.percent !== undefined ? { width: `${prog.percent}%` } : { width: '100%' }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  const hasAny = Object.values(grouped).some((g) => g.length > 0)

  return (
    <Modal open={open} onClose={onClose} title="Catalog" width="520px" hideHeader>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="mac-btn p-1.5 rounded-[3px]"
            aria-label="Back"
          >
            <ArrowLeft size={14} />
          </button>
          <div className="mac-input flex items-center gap-2 px-3 py-2 flex-1">
            <Search size={15} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent text-foreground text-[13px] font-[450] outline-none placeholder:text-muted-foreground"
              aria-label="Search available CLIs"
            />
          </div>
          {!outdatedOnly && visible.length > 0 && (
            <Tooltip text="Install all CLIs that are not yet installed">
              <Button
                variant="primary"
                size="sm"
                icon={<DownloadCloud size={14} />}
                onClick={() => installAll(visible)}
                aria-label="Install all missing CLIs"
              >
                Install All
              </Button>
            </Tooltip>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {!hasAny && (
            <div className="text-center py-8 text-xs font-semibold uppercase text-muted-foreground">
              {search ? 'No CLIs match' : 'All CLIs are installed'}
            </div>
          )}

          {(Object.entries(grouped) as [ManagerGroup, CliDefinition[]][]).map(([group, groupClis]) => {
            if (groupClis.length === 0) return null
            return (
              <div key={group}>
                <div className="flex items-center gap-2 px-1 pb-1.5">
                  <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase flex items-center gap-1">
                    {groupIcons[group]} {groupLabels[group]}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                    {groupClis.length}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {groupClis.map(renderCliItem)}
                </div>
              </div>
            )
          })}

          {hidden.length > 0 && !outdatedOnly && (
            <div>
              <div className="flex items-center gap-2 px-1 pb-1.5 pt-2">
                <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Hidden
                </span>
                <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                  {hidden.length}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {hidden.map((cli) => (
                  <div key={cli.id} className="mac-card flex items-center gap-3 px-3 py-2 opacity-70">
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-semibold tracking-tight text-card-foreground truncate block">
                        {displayName(cli)}
                      </span>
                      <p className="text-[10.5px] text-muted-foreground truncate">{cli.description}</p>
                    </div>
                    {onUnhide && (
                      <Button variant="secondary" size="sm" onClick={() => onUnhide(cli.id)} aria-label={`Unhide ${displayName(cli)}`}>
                        Unhide
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
