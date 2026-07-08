import { useState } from 'react'
import { Modal, Tooltip } from '../ui'
import { getCliLogo } from '../../logos'
import type { CliDefinition, CliState } from '@shared/types'
import { Download, Check } from 'lucide-react'

interface CliCatalogProps {
  open: boolean
  onClose: () => void
  clis: CliDefinition[]
  states: Record<string, CliState>
  onChanged: () => void
  onInstalled?: (cliId: string) => void
}

export function CliCatalog({ open, onClose, clis, states, onChanged, onInstalled }: CliCatalogProps) {
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
    await window.electronAPI.executeAction(cliId, 'install')
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
  }

  return (
    <Modal open={open} onClose={onClose} title="Catalog" width="480px" hideHeader>
      <div className="p-4 flex flex-col gap-3">
        <input
          className="mac-input w-full px-3 py-2 text-xs font-semibold"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

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
