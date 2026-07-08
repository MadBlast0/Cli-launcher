import { useState } from 'react'
import { Modal, Button, Badge } from '../ui'
import type { DependencyCheck } from '@shared/types'
import { Check, X, DownloadCloud } from 'lucide-react'

interface DependencyModalProps {
  deps: DependencyCheck
  onClose: () => void
  onInstalled: (deps: DependencyCheck) => void
}

export function DependencyModal({ deps, onClose, onInstalled }: DependencyModalProps) {
  const [installing, setInstalling] = useState<string | null>(null)
  const [installLog, setInstallLog] = useState<string | null>(null)

  const handleInstall = async (type: 'node' | 'python') => {
    setInstalling(type)
    setInstallLog(null)
    try {
      const result = await window.electronAPI.installDependency(type)
      setInstallLog(result)
      const check = await window.electronAPI.checkDependencies()
      onInstalled(check)
    } catch (err) {
      setInstallLog(String(err))
    } finally {
      setInstalling(null)
    }
  }

  const items = [
    {
      id: 'node' as const,
      label: 'Node.js',
      installed: deps.node.installed,
      version: deps.node.version,
    },
    {
      id: 'python' as const,
      label: 'Python',
      installed: deps.python.installed,
      version: deps.python.version,
    },
  ]

  return (
    <Modal open onClose={onClose} title="Dependencies" width="420px">
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="mac-card flex items-center justify-between p-3.5"
          >
            <div className="flex items-center gap-3">
              {item.installed ? (
                <div className="flex items-center justify-center w-8 h-8 rounded-[3px] bg-success/15 text-success">
                  <Check size={16} strokeWidth={2.6} />
                </div>
              ) : (
                <div className="flex items-center justify-center w-8 h-8 rounded-[3px] bg-destructive/15 text-destructive">
                  <X size={16} strokeWidth={2.6} />
                </div>
              )}
              <div>
                <p className="text-[13px] font-semibold tracking-tight text-card-foreground">
                  {item.label}
                </p>
                {item.version && (
                  <p className="text-[11px] font-mono text-muted-foreground">{item.version}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={item.installed ? 'success' : 'error'}>
                {item.installed ? 'OK' : 'MISSING'}
              </Badge>
              {!item.installed && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<DownloadCloud size={14} />}
                  loading={installing === item.id}
                  onClick={() => handleInstall(item.id)}
                >
                  Install
                </Button>
              )}
            </div>
          </div>
        ))}

        {installLog && (
          <div className="rounded-[3px] bg-muted border border-border p-3 max-h-[120px] overflow-y-auto">
            <pre className="text-[10.5px] font-mono text-muted-foreground whitespace-pre-wrap">
              {installLog}
            </pre>
          </div>
        )}

        <Button variant="secondary" size="md" onClick={onClose} className="mt-1">
          Close
        </Button>
      </div>
    </Modal>
  )
}
