import { useState, useMemo } from 'react'
import { Modal, Tooltip, Button } from '../ui'
import { getCliLogo } from '../../logos'
import type { CliDefinition, CliState } from '@shared/types'
import type { ToastType } from '../ui/Toast'
import { ArrowLeft, Download, Check, Search, Package, Globe, DownloadCloud } from 'lucide-react'

interface CliCatalogProps {
  open: boolean
  onClose: () => void
  clis: CliDefinition[]
  states: Record<string, CliState>
  onChanged: () => void
  onInstalled?: (cliId: string) => void
  onToast?: (message: string, type: ToastType) => string | void
  updateToast?: (id: string, message: string, type: ToastType) => void
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

export function CliCatalog({ open, onClose, clis, states, onChanged, onInstalled, onToast, updateToast }: CliCatalogProps) {
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [leaving, setLeaving] = useState<string | null>(null)
  const [justInstalled, setJustInstalled] = useState<string | null>(null)

  const notInstalled = clis.filter(
    (cli) => states[cli.id]?.status !== 'installed' && states[cli.id]?.status !== 'update-available'
  )

  const filtered = notInstalled.filter(
    (cli) =>
      cli.name.toLowerCase().includes(search.toLowerCase()) ||
      cli.id.toLowerCase().includes(search.toLowerCase())
  )

  // Group by dependency type
  const grouped = useMemo(() => {
    const groups: Record<ManagerGroup, CliDefinition[]> = { npm: [], pip: [], standalone: [] }
    for (const cli of filtered) {
      const type: ManagerGroup =
        cli.dependencyType === 'node'
          ? 'npm'
          : cli.dependencyType === 'python'
            ? 'pip'
            : 'standalone'
      groups[type].push(cli)
    }
    return groups
  }, [filtered])

  const handleInstall = async (cliId: string) => {
    setBusy(cliId)
    const cliName = clis.find((c) => c.id === cliId)?.name || cliId
    const toastId = onToast?.(`Installing ${cliName}…`, 'loading')

    const result = await window.electronAPI.executeAction(cliId, 'install')
    const fresh = await window.electronAPI.getCliState(cliId)
    const installed = fresh?.status === 'installed' || fresh?.status === 'update-available'

    if (result.success && installed) {
      if (toastId && updateToast) updateToast(toastId, `${cliName} installed successfully`, 'success')
      else onToast?.(`${cliName} installed successfully`, 'success')
      setBusy(null)
      setLeaving(cliId)
      setTimeout(() => {
        setJustInstalled(cliId)
        setTimeout(() => {
          setLeaving(null)
          setJustInstalled(null)
          onChanged()
          onInstalled?.(cliId)
        }, 50)
      }, 250)
    } else {
      if (toastId && updateToast) updateToast(toastId, `${cliName} install failed: ${result.error || 'CLI not found after install'}`, 'error')
      else onToast?.(`${cliName} install failed: ${result.error || 'CLI not found after install'}`, 'error')
      setBusy(null)
    }
  }

  const installAll = async (list: CliDefinition[]) => {
    for (const cli of list) {
      const toastId = onToast?.(`Installing ${cli.name}…`, 'loading')
      const result = await window.electronAPI.executeAction(cli.id, 'install')
      const fresh = await window.electronAPI.getCliState(cli.id)
      const installed = fresh?.status === 'installed' || fresh?.status === 'update-available'

      if (result.success && installed) {
        if (toastId && updateToast) updateToast(toastId, `${cli.name} installed successfully`, 'success')
        else onToast?.(`${cli.name} installed successfully`, 'success')
        onChanged()
        onInstalled?.(cli.id)
      } else {
        if (toastId && updateToast) updateToast(toastId, `${cli.name} install failed: ${result.error || 'CLI not found after install'}`, 'error')
        else onToast?.(`${cli.name} install failed: ${result.error || 'CLI not found after install'}`, 'error')
      }
    }
  }

  const renderCliItem = (cli: CliDefinition) => {
    const logo = getCliLogo(cli.id)
    const initial = cli.name.charAt(0).toUpperCase()
    const isBusy = busy === cli.id
    const isLeaving = leaving === cli.id
    return (
      <div
        key={cli.id}
        className={`mac-card flex flex-col gap-0 px-3 py-2 ${isLeaving ? 'anim-slide-out' : ''}`}
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
                {cli.name}
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
            <Tooltip text={isBusy ? 'Installing…' : 'Install'}>
              <button
                className="mac-btn mac-btn-primary p-1.5 rounded-[3px]"
                onClick={() => handleInstall(cli.id)}
                disabled={isBusy || isLeaving}
                aria-label={`Install ${cli.name}`}
              >
                {isBusy ? (
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isLeaving ? (
                  <Check size={12} />
                ) : (
                  <Download size={12} />
                )}
              </button>
            </Tooltip>
          </div>
        </div>
        {isBusy && (
          <div className="h-1 bg-border rounded-none overflow-hidden mt-1.5">
            <div className="h-full bg-primary anim-pulse-bar rounded-none" />
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
          {filtered.length > 0 && (
            <Tooltip text="Install all CLIs that are not yet installed">
              <Button
                variant="primary"
                size="sm"
                icon={<DownloadCloud size={14} />}
                onClick={() => installAll(filtered)}
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
        </div>
      </div>
    </Modal>
  )
}
