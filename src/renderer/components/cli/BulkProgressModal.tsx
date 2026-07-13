import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui'
import type { BulkProgressMessage } from '@shared/types'

interface BulkProgressModalProps {
  open: boolean
  action: 'update' | 'repair' | null
  onClose: () => void
  onProgress: (cb: (msg: BulkProgressMessage) => void) => () => void
  cliName: (cliId: string) => string
}

export function BulkProgressModal({ open, action, onClose, onProgress, cliName }: BulkProgressModalProps) {
  const [done, setDone] = useState(0)
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!open) return
    setDone(0)
    setTotal(0)
    setCurrent(null)
    setFinished(false)
    const cleanup = onProgress((msg: BulkProgressMessage) => {
      setDone(msg.done)
      setTotal(msg.total)
      if (msg.cliId) setCurrent(cliName(msg.cliId))
      if (msg.done >= msg.total && msg.total > 0) setFinished(true)
    })
    return cleanup
  }, [open, onProgress, cliName])

  if (!open) return null

  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onMouseDown={finished ? onClose : undefined}>
      <div className="mac-surface bg-card text-card-foreground w-[380px] max-w-[92vw] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 h-11 border-b border-border shrink-0">
          <span className="text-[14px] font-bold tracking-tight">
            {action === 'update' ? 'Updating CLIs' : 'Repairing CLIs'}
          </span>
          {finished && (
            <button onClick={onClose} className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" aria-label="Close">
              <X size={15} />
            </button>
          )}
        </div>

        <div className="px-4 py-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground truncate">{current || 'Preparing…'}</span>
            <span className="font-mono tabular-nums text-foreground shrink-0">{done}/{total}</span>
          </div>
          <div className="h-1.5 bg-border overflow-hidden rounded-none">
            <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {finished ? 'Done. Close to return.' : 'Running in the background — you can keep using the app.'}
          </p>
        </div>

        {finished && (
          <div className="flex items-center justify-end px-4 h-12 border-t border-border shrink-0">
            <Button variant="primary" size="sm" onClick={onClose}>Close</Button>
          </div>
        )}
      </div>
    </div>
  )
}
