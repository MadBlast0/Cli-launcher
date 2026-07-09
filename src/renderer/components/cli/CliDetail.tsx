import { useState, useEffect } from 'react'
import { Button, Badge, Panel } from '../ui'
import { CliActions } from './CliActions'
import type { CliDefinition, CliState } from '@shared/types'
import { ArrowLeft, Globe, Package, Terminal } from 'lucide-react'

interface CliDetailProps {
  cli: CliDefinition
  onBack: () => void
}

export function CliDetail({ cli, onBack }: CliDetailProps) {
  const [state, setState] = useState<CliState | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshState = () => {
    setLoading(true)
    window.electronAPI.getCliState(cli.id).then((s) => {
      setState(s)
      setLoading(false)
    })
  }

  useEffect(() => {
    refreshState()
  }, [cli.id])

  const statusVariant =
    state?.status === 'installed'
      ? 'success'
      : state?.status === 'update-available'
        ? 'warning'
        : 'error'

  const statusLabel =
    state?.status === 'installed'
      ? state.version || 'installed'
      : state?.status === 'update-available'
        ? 'update available'
        : 'not installed'

  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={onBack}>
          Back
        </Button>
      </div>

      <div className="flex items-start gap-4">
        <div className="rounded-[3px] p-3 bg-primary text-primary-foreground shadow-sm">
          <Terminal size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              {cli.name}
            </h1>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{cli.description}</p>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1">
              <Terminal size={12} /> {cli.executable}
            </span>
            <span className="flex items-center gap-1">
              <Package size={12} /> {cli.packageName || '—'}
            </span>
            {cli.homepage && (
              <span className="flex items-center gap-1">
                <Globe size={12} /> {cli.homepage}
              </span>
            )}
          </div>
        </div>
      </div>

      {cli.skipPermissions && (
        <Panel title="Permissions" className="shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground">
              --dangerously-skip-permissions flag enabled
            </span>
          </div>
        </Panel>
      )}

      <CliActions cli={cli} state={state} onActionComplete={refreshState} />
    </div>
  )
}
