import { useState, useCallback } from 'react'
import { SearchInput, Button } from '../ui'
import { CliCard } from './CliCard'
import type { CliDefinition, DependencyCheck, CliCount, CliState } from '@shared/types'
import { Database, AlertTriangle, Terminal, Plus } from 'lucide-react'

interface CliGridProps {
  clis: CliDefinition[]
  states: Record<string, CliState>
  counts: CliCount[]
  onUpdateCount: (cliId: string, delta: number) => void
  onLaunch: (cliId: string, count: number) => void
  onInstall: (cliId: string) => void
  onUninstall: (cliId: string) => void
  onRepair: (cliId: string) => void
  onUpdate: (cliId: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onOpenDeps: () => void
  onOpenCatalog: () => void
  onCliChanged: () => void
  deps: DependencyCheck | null
  search: string
  onSearchChange: (value: string) => void
  justInstalled?: string | null
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void
}

export function CliGrid({
  clis, states, counts, onUpdateCount, onLaunch, onInstall, onUninstall,
  onRepair, onUpdate, onReorder, onOpenDeps, onOpenCatalog, onCliChanged,
  deps, search, onSearchChange, justInstalled, onToast,
}: CliGridProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const getCount = useCallback(
    (cliId: string) => counts.find((c) => c.cliId === cliId)?.count ?? 1,
    [counts]
  )

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    onReorder(dragIndex, index)
    setDragIndex(index)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragIndex(null)
  }

  const missingDeps = [
    !deps?.node.installed && 'Node.js',
    !deps?.python.installed && 'Python',
  ].filter(Boolean)

  return (
    <div className="flex flex-col h-full min-h-0 px-4 pb-4">
      {/* Search + Deps */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex-1">
          <SearchInput value={search} onChange={onSearchChange} placeholder="Search CLIs…" />
        </div>
        {missingDeps.length > 0 && (
          <Button variant="destructive" size="sm" icon={<AlertTriangle size={14} />} onClick={onOpenDeps}>
            {missingDeps.length} missing
          </Button>
        )}
        <Button variant="secondary" size="sm" icon={<Database size={14} />} onClick={onOpenDeps}>
          Deps
        </Button>
      </div>

      {/* Section label */}
      <div className="flex items-center justify-between px-1 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Installed
          </span>
          <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
            {clis.length}
          </span>
        </div>
        <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={onOpenCatalog}>
          Catalog
        </Button>
      </div>

      {/* CLI Rows */}
      <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-0.5 -mr-0.5">
        {clis.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground">
            <Terminal size={26} className="opacity-40" />
            <span className="text-[12px] font-medium">
              {search ? 'No CLIs match your search' : 'No CLIs installed yet'}
            </span>
            {!search && (
              <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={onOpenCatalog}>
                Browse catalog
              </Button>
            )}
          </div>
        )}
          {clis.map((cli, index) => (
            <CliCard
              key={cli.id}
              cli={cli}
              state={states[cli.id] ?? null}
              index={index}
              count={getCount(cli.id)}
              onCountChange={(delta) => onUpdateCount(cli.id, delta)}
              onLaunch={() => onLaunch(cli.id, getCount(cli.id))}
              onChanged={onCliChanged}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
              justInstalled={justInstalled}
              onToast={onToast}
            />
        ))}
      </div>
    </div>
  )
}
