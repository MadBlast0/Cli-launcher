import { useState, useCallback } from 'react'
import { SearchInput, Button, Dropdown, Tooltip } from '../ui'
import { CliCard } from './CliCard'
import type { CliDefinition, DependencyCheck, CliCount, CliState } from '@shared/types'
import { Database, AlertTriangle, Terminal, Plus, Download, Star } from 'lucide-react'

interface CliGridProps {
  clis: CliDefinition[]
  states: Record<string, CliState>
  counts: CliCount[]
  favorites: string[]
  terminalEmulator?: string
  onUpdateCount: (cliId: string, delta: number) => void
  onLaunch: (cliId: string, count: number) => void
  onInstall: (cliId: string) => void
  onUninstall: (cliId: string) => void
  onRepair: (cliId: string) => void
  onUpdate: (cliId: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onToggleFavorite: (cliId: string) => void
  onOpenDeps: () => void
  onOpenCatalog: () => void
  onCliChanged: () => void
  deps: DependencyCheck | null
  search: string
  onSearchChange: (value: string) => void
  justInstalled?: string | null
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void
  onInstallAllMissing?: () => void
  onTerminalChange?: (terminal: string) => void
}

const terminalOptions = [
  { value: '', label: 'Auto-detect' },
  { value: 'cmd', label: 'CMD (Windows)' },
  { value: 'wt', label: 'Windows Terminal' },
  { value: 'terminal', label: 'Terminal.app (macOS)' },
  { value: 'iterm', label: 'iTerm2 (macOS)' },
  { value: 'x-terminal-emulator', label: 'X Terminal' },
  { value: 'gnome-terminal', label: 'GNOME Terminal' },
  { value: 'konsole', label: 'Konsole' },
  { value: 'xterm', label: 'XTerm' },
]

export function CliGrid({
  clis, states, counts, favorites, terminalEmulator, onUpdateCount, onLaunch, onInstall, onUninstall,
  onRepair, onUpdate, onReorder, onToggleFavorite, onOpenDeps, onOpenCatalog, onCliChanged,
  deps, search, onSearchChange, justInstalled, onToast, onInstallAllMissing, onTerminalChange,
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

  const installedCount = clis.length
  const allClisCount = 0 // We don't have total count here easily, skip

  return (
    <div className="flex flex-col h-full min-h-0 px-4 pb-4" role="main" aria-label="CLI Launcher">
      {/* Search + Deps + Tools */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex-1">
          <SearchInput value={search} onChange={onSearchChange} placeholder="Search CLIs…" aria-label="Search CLIs" />
        </div>
        {missingDeps.length > 0 && (
          <Tooltip text="Install missing dependencies">
            <Button variant="destructive" size="sm" icon={<AlertTriangle size={14} />} onClick={onOpenDeps} aria-label="Missing dependencies">
              {missingDeps.length} missing
            </Button>
          </Tooltip>
        )}
        <Tooltip text="Manage dependencies (Node.js, Python)">
          <Button variant="secondary" size="sm" icon={<Database size={14} />} onClick={onOpenDeps} aria-label="Dependencies">
            Deps
          </Button>
        </Tooltip>
      </div>

      {/* Terminal emulator choice */}
      <div className="flex items-center gap-2 mt-2 shrink-0">
        <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase shrink-0">Terminal:</span>
        <div className="flex-1 max-w-[200px]">
          <Dropdown
            options={terminalOptions}
            value={terminalEmulator || ''}
            onChange={(v) => onTerminalChange?.(v)}
            placeholder="Auto-detect"
          />
        </div>
      </div>

      {/* Section label */}
      <div className="flex items-center justify-between px-1 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Installed
          </span>
          <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
            {installedCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onInstallAllMissing && (
            <Tooltip text="Install all CLIs that are not yet installed">
              <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={onInstallAllMissing} aria-label="Install all missing">
                Install All
              </Button>
            </Tooltip>
          )}
          <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={onOpenCatalog} aria-label="Browse CLI catalog">
            Catalog
          </Button>
        </div>
      </div>

      {/* Favorites section */}
      {favorites.length > 0 && search === '' && (
        <>
          <div className="flex items-center gap-2 px-1 pb-1.5 shrink-0">
            <Star size={11} className="text-warning" />
            <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Favorites</span>
          </div>
          <div className="flex flex-col gap-2 mb-3">
            {clis.filter((c) => favorites.includes(c.id)).map((cli) => (
              <CliCard
                key={cli.id}
                cli={cli}
                state={states[cli.id] ?? null}
                index={-1}
                count={getCount(cli.id)}
                isFavorite={true}
                onCountChange={(delta) => onUpdateCount(cli.id, delta)}
                onLaunch={() => onLaunch(cli.id, getCount(cli.id))}
                onToggleFavorite={() => onToggleFavorite(cli.id)}
                onChanged={onCliChanged}
                onDragStart={() => {}}
                onDragOver={() => {}}
                onDrop={() => {}}
                justInstalled={justInstalled}
                onToast={onToast}
              />
            ))}
          </div>
        </>
      )}

      {/* CLI Rows */}
      <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-0.5 -mr-0.5" role="list" aria-label="Installed CLI tools">
        {clis.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground">
            <Terminal size={26} className="opacity-40" />
            <span className="text-[12px] font-medium">
              {search ? 'No CLIs match your search' : 'No CLIs installed yet'}
            </span>
            {!search && (
              <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={onOpenCatalog} aria-label="Browse catalog">
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
            isFavorite={favorites.includes(cli.id)}
            onCountChange={(delta) => onUpdateCount(cli.id, delta)}
            onLaunch={() => onLaunch(cli.id, getCount(cli.id))}
            onToggleFavorite={() => onToggleFavorite(cli.id)}
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
