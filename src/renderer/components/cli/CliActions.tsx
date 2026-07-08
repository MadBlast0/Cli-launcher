import { useState } from 'react'
import { Button, Panel } from '../ui'
import type { CliDefinition, CliState } from '@shared/types'
import { Play, Download, RefreshCw, Trash2, Wrench } from 'lucide-react'

interface CliActionsProps {
  cli: CliDefinition
  state: CliState | null
  onActionComplete: () => void
}

export function CliActions({ cli, state, onActionComplete }: CliActionsProps) {
  const [running, setRunning] = useState<string | null>(null)
  const [output, setOutput] = useState<string | null>(null)

  const isInstalled = state?.status === 'installed' || state?.status === 'update-available'

  const handleAction = async (action: string) => {
    setRunning(action)
    setOutput(null)
    try {
      const result = await window.electronAPI.executeAction(cli.id, action)
      setOutput(result.success ? result.output : result.error || 'Action completed')
      onActionComplete()
    } catch (err) {
      setOutput(String(err))
    } finally {
      setRunning(null)
    }
  }

  const actions = [
    { id: 'install', label: 'Install', icon: <Download size={14} />, show: !isInstalled, primary: true },
    { id: 'open', label: 'Launch', icon: <Play size={14} />, show: isInstalled, primary: true },
    { id: 'update', label: 'Update', icon: <RefreshCw size={14} />, show: isInstalled, primary: false },
    { id: 'repair', label: 'Repair', icon: <Wrench size={14} />, show: isInstalled, primary: false },
    { id: 'uninstall', label: 'Uninstall', icon: <Trash2 size={14} />, show: isInstalled, primary: false },
  ].filter((a) => a.show)

  return (
    <Panel title="Actions" className="flex-1 flex flex-col">
      <div className="grid grid-cols-2 gap-2 mb-3">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.primary ? 'primary' : 'secondary'}
            size="sm"
            icon={action.icon}
            loading={running === action.id}
            onClick={() => handleAction(action.id)}
          >
            {action.label}
          </Button>
        ))}
      </div>

      {output && (
        <div className="rounded-[3px] border border-border bg-muted text-muted-foreground p-3 mt-auto max-h-[200px] overflow-y-auto">
          <pre className="text-[11px] font-mono whitespace-pre-wrap break-all">{output}</pre>
        </div>
      )}
    </Panel>
  )
}
