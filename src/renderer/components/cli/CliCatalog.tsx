import { useState } from 'react'
import { Modal, Tooltip } from '../ui'
import { getCliLogo } from '../../logos'
import type { CliDefinition, CliState } from '@shared/types'
import { ArrowLeft, Download, Check, Search } from 'lucide-react'

interface CliCatalogProps {
  open: boolean
  onClose: () => void
  clis: CliDefinition[]
  states: Record<string, CliState>
  onChanged: () => void
  onInstalled?: (cliId: string) => void
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void
}

export function CliCatalog({ open, onClose, clis, states, onChanged, onInstalled, onToast }: CliCatalogProps) {
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

  const handleInstall = async (cliId: string) => {
    setBusy(cliId)
    const result = await window.electronAPI.executeAction(cliId, 'install')
    const cliName = clis.find((c) => c.id === cliId)?.name || cliId
    const fresh = await window.electronAPI.getCliState(cliId)
    const installed = fresh?.status === 'installed' || fresh?.status === 'update-available'

    if (result.success && installed) {
      onToast?.(`${cliName} installed successfully`, 'success')
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
      onToast?.(`${cliName} install failed: ${result.error || 'CLI not found after install'}`, 'error')
      setBusy(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Catalog" width="480px" hideHeader>
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
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          {filtered.length === 0 && (
            <div className="text-center py-8 text-xs font-semibold uppercase text-muted-foreground">
              {search ? 'No CLIs match' : 'All CLIs are installed'}
            </div>
          )}
          {filtered.map((cli) => {
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
                        <span className="text-[10px] font-mono text-muted-foreground truncate">
                          {cli.packageName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Tooltip text={isBusy ? 'Installing…' : 'Install'}>
                      <button
                        className="mac-btn mac-btn-primary p-1.5 rounded-[3px]"
                        onClick={() => handleInstall(cli.id)}
                        disabled={isBusy || isLeaving}
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
          })}
        </div>
      </div>
    </Modal>
  )
}
