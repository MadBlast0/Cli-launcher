import { useState, useEffect, useCallback } from 'react'
import { X, FolderIcon } from 'lucide-react'
import { Button } from './ui'
import type { AppSettings } from '@shared/types'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  onSave: (updates: Partial<AppSettings>) => void
  onToggleTheme: () => void
  isDark: boolean
  getCurrentFolder: () => Promise<string | null>
  selectFolder: () => Promise<string | null>
}

const PLATFORM = process.platform

const TERMINALS: Record<string, string[]> = {
  win32: ['', 'wt', 'powershell', 'cmd', 'alacritty', 'wezterm', 'pwsh', 'hyper', 'tabby'],
  darwin: ['', 'iterm', 'alacritty', 'warp'],
  linux: ['', 'gnome-terminal', 'konsole', 'xfce4-terminal', 'xterm', 'alacritty', 'wezterm'],
}

function terminalLabel(value: string): string {
  if (!value) return 'Automatic (detect)'
  return value
}

/** Builds an Electron accelerator string from a keydown event. */
function acceleratorFromEvent(e: KeyboardEvent): string {
  const parts: string[] = []
  if (e.ctrlKey) parts.push('Control')
  if (e.metaKey && PLATFORM !== 'win32') parts.push('Command')
  if (e.shiftKey) parts.push('Shift')
  if (e.altKey) parts.push('Alt')
  const key = e.key
  if (key && key !== 'Control' && key !== 'Shift' && key !== 'Alt' && key !== 'Meta' && key.length === 1) {
    parts.push(key.toUpperCase())
  } else if (key && key.startsWith('F') && /F\d{1,2}/.test(key)) {
    parts.push(key.toUpperCase())
  } else if (key === ' ') {
    parts.push('Space')
  } else if (key && key.length > 1) {
    // ArrowUp, Enter, etc. — normalize a few common ones
    const map: Record<string, string> = { ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right', Escape: 'Esc' }
    parts.push(map[key] ?? key)
  }
  return parts.join('+')
}

export function SettingsModal({ open, onClose, onSave, onToggleTheme, isDark, getCurrentFolder, selectFolder }: SettingsModalProps) {
  const [hotkey, setHotkey] = useState('')
  const [alwaysOnTop, setAlwaysOnTop] = useState(false)
  const [yoloMode, setYoloMode] = useState(false)
  const [elevateInstalls, setElevateInstalls] = useState(true)
  const [terminal, setTerminal] = useState('')
  const [folder, setFolder] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)

  const load = useCallback(async () => {
    try {
      const s = (await window.electronAPI.getSettings()) as AppSettings
      setHotkey(s.globalHotkey || '')
      setAlwaysOnTop(!!s.alwaysOnTop)
      setYoloMode(!!s.yoloMode)
      setElevateInstalls(s.elevateInstalls !== false)
      setTerminal(s.terminalEmulator || '')
      setFolder(await getCurrentFolder())
    } catch { /* ignore */ }
  }, [getCurrentFolder])

  useEffect(() => {
    if (open) {
      load()
      setCapturing(false)
    }
  }, [open, load])

  useEffect(() => {
    if (!capturing) return
    const handler = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.key === 'Escape') {
        setCapturing(false)
        return
      }
      const accel = acceleratorFromEvent(e)
      // Ignore bare modifier presses with no real key.
      if (!/[A-Za-z0-9 ]/.test(accel.slice(-1))) return
      setHotkey(accel)
      setCapturing(false)
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [capturing])

  if (!open) return null

  const terminals = TERMINALS[PLATFORM] ?? ['']

  const Row = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border/60 last:border-b-0">
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-foreground">{label}</div>
        {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-muted-foreground/30'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : ''}`} />
    </button>
  )

  const saveAll = () => {
    onSave({
      globalHotkey: hotkey || undefined,
      alwaysOnTop,
      yoloMode,
      elevateInstalls,
      terminalEmulator: terminal || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onMouseDown={onClose}>
      <div
        className="mac-surface bg-card text-card-foreground w-[440px] max-w-[92vw] max-h-[82vh] rounded-lg shadow-2xl flex flex-col overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 h-11 border-b border-border shrink-0">
          <span className="text-[14px] font-bold tracking-tight">Settings</span>
          <button onClick={onClose} className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" aria-label="Close settings">
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-1">
          <Row label="Global hotkey" hint="Show/hide the window from anywhere. Click to record, Esc to cancel.">
            {capturing ? (
              <span className="text-[12px] font-mono text-primary animate-pulse">Press keys…</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-mono px-2 py-1 rounded bg-muted text-foreground min-w-[88px] text-center">
                  {hotkey || 'Auto'}
                </span>
                <Button variant="secondary" size="sm" onClick={() => setCapturing(true)}>Record</Button>
                {hotkey && (
                  <Button variant="ghost" size="sm" onClick={() => setHotkey('')}>Clear</Button>
                )}
              </div>
            )}
          </Row>

          <Row label="Always on top" hint="Keep the window above other apps.">
            <Toggle value={alwaysOnTop} onChange={setAlwaysOnTop} />
          </Row>

          <Row label="YOLO mode by default" hint="Launch CLIs with skip-permissions enabled.">
            <Toggle value={yoloMode} onChange={setYoloMode} />
          </Row>

          <Row label="Elevate global installs" hint="Use an admin prompt for npm/pip installs on macOS/Linux.">
            <Toggle value={elevateInstalls} onChange={setElevateInstalls} />
          </Row>

          <Row label="Terminal emulator" hint="Which terminal opens launched CLIs.">
            <select
              value={terminal}
              onChange={(e) => setTerminal(e.target.value)}
              className="mac-input rounded bg-muted text-foreground text-[12px] px-2 py-1"
            >
              {terminals.map((t) => (
                <option key={t} value={t}>{terminalLabel(t)}</option>
              ))}
            </select>
          </Row>

          <Row label="Default working directory" hint={folder || 'Not set — last used folder is remembered.'}>
            <Button variant="secondary" size="sm" icon={<FolderIcon size={13} />} onClick={async () => { const f = await selectFolder(); if (f) setFolder(f) }}>
              Choose…
            </Button>
          </Row>

          <Row label="Appearance" hint="Toggle light / dark theme.">
            <Button variant="secondary" size="sm" onClick={onToggleTheme}>
              {isDark ? 'Dark' : 'Light'}
            </Button>
          </Row>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-12 py-3 border-t border-border shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={() => { saveAll(); onClose() }}>Save</Button>
        </div>
      </div>
    </div>
  )
}
