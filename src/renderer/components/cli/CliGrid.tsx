import { useState, useCallback, useMemo, memo, type RefObject } from 'react'
import { SearchInput, Button, Tooltip, CliCardSkeleton } from '../ui'
import { CliCard } from './CliCard'
import { ModeDropdown } from './ModeDropdown'
import type { CliDefinition, DependencyCheck, CliCount, CliState } from '@shared/types'
import { Database, AlertTriangle, Terminal, Plus, RefreshCw, ArrowUpFromLine } from 'lucide-react'

interface CliGridProps {

  clis: CliDefinition[]
  states: Record<string, CliState>
  counts: CliCount[]
  loading?: boolean
  refreshProgress?: number
  refreshCurrent?: string
  totalClis?: number
  onUpdateCount: (cliId: string, delta: number) => void
  onLaunch: (cliId: string, count: number) => void
  onRepair: (cliId: string) => void
  onUpdate: (cliId: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onReorderCommit: () => void
  onOpenDeps: () => void
  onOpenCatalog: () => void
  onCliChanged: () => void
  onRefreshAll: () => void
  deps: DependencyCheck | null
  depsLoading?: boolean
  search: string
  onSearchChange: (value: string) => void
  justInstalled?: string | null
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void
  searchInputRef?: RefObject<HTMLInputElement | null>
  yoloMode: boolean
  onYoloModeChange: (value: boolean) => void
  selectedIndex?: number
  onSelect?: (index: number) => void
  onConfigure?: (cliId: string) => void
  onUpdateAll?: () => void
  onHide?: (cliId: string) => void
  onToggleFavorite?: (cliId: string) => void
  onRename?: (cliId: string) => void
  favorites?: string[]
  aliasMap?: Record<string, string>
}

export function CliGrid({
  clis, states, counts, loading = false, onUpdateCount, onLaunch,
  onRepair, onUpdate, onReorder, onReorderCommit, onOpenDeps, onOpenCatalog, onCliChanged, onRefreshAll,
  deps, depsLoading = false, search, onSearchChange, justInstalled, onToast, searchInputRef,
  yoloMode, onYoloModeChange, refreshProgress = 0, refreshCurrent = '', totalClis = 0,
  selectedIndex = -1, onSelect, onConfigure, onUpdateAll, onHide, onToggleFavorite, onRename, favorites, aliasMap,
}: CliGridProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [reordered, setReordered] = useState(false)

  const getCount = useCallback(
    (cliId: string) => counts.find((c) => c.cliId === cliId)?.count ?? 1,
    [counts]
  )

  const supportedYoloClis = useMemo(
    () => clis.filter((c) => c.skipPermissions).map((c) => c.name),
    [clis]
  )

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    // Reorder live in memory for visual feedback, but do NOT persist here —
    // dragover fires continuously, so persisting on every event thrashes the
    // settings file and IPC. The order is committed once on drop instead.
    onReorder(dragIndex, index)
    setDragIndex(index)
    setReordered(true)
  }, [dragIndex, onReorder])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragIndex(null)
    if (reordered) {
      onReorderCommit()
      setReordered(false)
    }
  }, [reordered, onReorderCommit])

  const missingDeps = deps
    ? [!deps.node.installed && 'Node.js', !deps.python.installed && 'Python'].filter(Boolean)
    : []

  const refreshing = refreshProgress > 0 && refreshProgress < totalClis
  const outdatedCount = clis.filter((c) => states[c.id]?.status === 'update-available').length

  return (
    <div className="flex flex-col h-full min-h-0 px-4 pb-4" role="main" aria-label="CLI Launcher">
      {/* Search + Deps + Tools */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex-1">
          <SearchInput ref={searchInputRef} value={search} onChange={onSearchChange} placeholder="Search CLIs…" aria-label="Search CLIs" />
        </div>
        {depsLoading && (
          <Button variant="secondary" size="sm" loading aria-label="Checking dependencies">
            Checking
          </Button>
        )}
        {missingDeps.length > 0 && (
          <Tooltip text="Install missing dependencies">
            <Button variant="destructive" size="sm" icon={<AlertTriangle size={14} />} onClick={onOpenDeps} aria-label="Missing dependencies">
              {missingDeps.length} missing
            </Button>
          </Tooltip>
        )}
        {!depsLoading && (
          <Tooltip text="Manage dependencies (Node.js, Python)">
            <Button variant="secondary" size="sm" icon={<Database size={14} />} onClick={onOpenDeps} aria-label="Dependencies">
              Deps
            </Button>
          </Tooltip>
        )}
      </div>

      {/* Section label */}
      <div className="flex items-center justify-between px-1 pt-3 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            Installed
          </span>
          {refreshing && (
            <span className="text-[10px] font-mono text-muted-foreground tabular-nums shrink-0">
              {refreshCurrent ? `Checking ${refreshCurrent}… ` : ''}
              {refreshProgress}/{totalClis}
            </span>
          )}
          <Tooltip text="Re-detect CLIs and dependencies">
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />}
              onClick={onRefreshAll}
              aria-label="Refresh detection"
            />
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          {onUpdateAll && outdatedCount > 0 && (
            <Button variant="secondary" size="xs" icon={<ArrowUpFromLine size={13} />} onClick={onUpdateAll} aria-label={`Update all ${outdatedCount} outdated CLIs`}>
              Update all{outdatedCount > 0 ? ` (${outdatedCount})` : ''}
            </Button>
          )}
          <ModeDropdown
            yoloMode={yoloMode}
            onYoloModeChange={onYoloModeChange}
            supportedClis={supportedYoloClis}
          />
          <Button variant="secondary" size="xs" icon={<Plus size={14} />} onClick={onOpenCatalog} aria-label="Browse CLI catalog">
            Catalog
          </Button>
        </div>
      </div>

      {/* CLI Rows */}
      <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-0.5 -mr-0.5" role="list" aria-label="Installed CLI tools">
        {loading && clis.length === 0 && (
          Array.from({ length: 8 }).map((_, i) => <CliCardSkeleton key={`sk-${i}`} delay={i * 40} />)
        )}
        {!loading && clis.length === 0 && (
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
          <CliGridRow
            key={cli.id}
            cli={cli}
            state={states[cli.id] ?? null}
            index={index}
            count={getCount(cli.id)}
            onUpdateCount={onUpdateCount}
            onLaunch={onLaunch}
            onCliChanged={onCliChanged}
            onRepair={onRepair}
            onUpdate={onUpdate}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            selected={index === selectedIndex}
            onSelect={onSelect}
            onConfigure={onConfigure}
            onHide={onHide}
            onToggleFavorite={onToggleFavorite}
            onRename={onRename}
            favorites={favorites}
            aliasMap={aliasMap}
            justInstalled={justInstalled}
            onToast={onToast}
          />
        ))}
      </div>
    </div>
  )
}

// Per-row wrapper that owns the per-card callbacks so they keep stable
// identities across CliGrid re-renders (enabling CliCard's React.memo to
// actually skip re-rendering unchanged cards).
interface CliGridRowProps {
  cli: CliDefinition
  state: CliState | null
  index: number
  count: number
  onUpdateCount: (cliId: string, delta: number) => void
  onLaunch: (cliId: string, count: number) => void
  onCliChanged: () => void
  onRepair: (cliId: string) => void
  onUpdate: (cliId: string) => void
  handleDragStart: (e: React.DragEvent, index: number) => void
  handleDragOver: (e: React.DragEvent, index: number) => void
  handleDrop: (e: React.DragEvent) => void
  selected?: boolean
  onSelect?: (index: number) => void
  onConfigure?: (cliId: string) => void
  onHide?: (cliId: string) => void
  onToggleFavorite?: (cliId: string) => void
  onRename?: (cliId: string) => void
  favorites?: string[]
  aliasMap?: Record<string, string>
  justInstalled?: string | null
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void
}

const CliGridRow = memo(function CliGridRow({
  cli, state, index, count, onUpdateCount, onLaunch, onCliChanged, onRepair,
  onUpdate, handleDragStart, handleDragOver, handleDrop, selected = false, onSelect, onConfigure, onHide, onToggleFavorite, onRename, favorites, aliasMap, justInstalled, onToast,
}: CliGridRowProps) {
  const handleCountChange = useCallback(
    (delta: number) => onUpdateCount(cli.id, delta),
    [onUpdateCount, cli.id]
  )
  const handleLaunch = useCallback(
    () => onLaunch(cli.id, count),
    [onLaunch, cli.id, count]
  )
  const handleRepaired = useCallback(() => onRepair(cli.id), [onRepair, cli.id])
  const handleUpdated = useCallback(() => onUpdate(cli.id), [onUpdate, cli.id])
  const onDragStart = useCallback(
    (e: React.DragEvent) => handleDragStart(e, index),
    [handleDragStart, index]
  )
  const onDragOver = useCallback(
    (e: React.DragEvent) => handleDragOver(e, index),
    [handleDragOver, index]
  )
  const onSelectRow = useCallback(() => onSelect?.(index), [onSelect, index])

  return (
    <CliCard
      cli={cli}
      state={state}
      index={index}
      count={count}
      onCountChange={handleCountChange}
      onLaunch={handleLaunch}
      onChanged={onCliChanged}
      onRepaired={handleRepaired}
      onUpdated={handleUpdated}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={handleDrop}
      selected={selected}
      onSelect={onSelectRow}
      onConfigure={onConfigure}
      onHide={onHide}
      onToggleFavorite={onToggleFavorite}
      onRename={onRename}
      favorites={favorites}
      aliasMap={aliasMap}
      justInstalled={justInstalled}
      onToast={onToast}
    />
  )
})
