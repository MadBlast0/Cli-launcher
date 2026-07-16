import { useState, useEffect, useCallback, useRef } from 'react'
import { X, FolderIcon, RotateCcw, Search, FileText, AlertTriangle } from 'lucide-react'
import { Button } from './ui'
import type { AppSettings } from '@shared/types'

type Theme = 'system' | 'light' | 'dark'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  onSave: (updates: Partial<AppSettings>) => void
  theme: Theme
  onThemeChange: (t: Theme) => void
  getCurrentFolder: () => Promise<string | null>
  selectFolder: () => Promise<string | null>
  /** Current live state so the modal starts in sync with the title-bar toggles. */
  initialAlwaysOnTop?: boolean
  initialYoloMode?: boolean
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
    const map: Record<string, string> = { ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right', Escape: 'Esc' }
    parts.push(map[key] ?? key)
  }
  return parts.join('+')
}

export function SettingsModal({ open, onClose, onSave, theme, onThemeChange, getCurrentFolder, selectFolder, initialAlwaysOnTop = false, initialYoloMode = false }: SettingsModalProps) {
  const [hotkey, setHotkey] = useState('')
  const [alwaysOnTop, setAlwaysOnTop] = useState(initialAlwaysOnTop)
  const [yoloMode, setYoloMode] = useState(initialYoloMode)
  const [elevateInstalls, setElevateInstalls] = useState(true)
  const [terminal, setTerminal] = useState('')
  const [folder, setFolder] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [customCss, setCustomCss] = useState('')
  const [cssLoaded, setCssLoaded] = useState(false)

  const load = useCallback(async () => {
    try {
      const s = (await window.electronAPI.getSettings()) as AppSettings
      setHotkey(s.globalHotkey || '')
      setElevateInstalls(s.elevateInstalls !== false)
      setTerminal(s.terminalEmulator || '')
      setFolder(await getCurrentFolder())
      setCustomCss(s.customCss || '')
      setCssLoaded(true)
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
      if (!/[A-Za-z0-9 ]/.test(accel.slice(-1))) return
      setHotkey(accel)
      onSave({ globalHotkey: accel || undefined })
      setCapturing(false)
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [capturing, onSave])

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

  const Toggle = ({ value, onChange, onAutoSave }: { value: boolean; onChange: (v: boolean) => void; onAutoSave: (v: boolean) => void }) => (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => { const next = !value; onChange(next); onAutoSave(next) }}
      className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-muted-foreground/30'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : ''}`} />
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onMouseDown={onClose}>
      <div
        className="mac-surface bg-card text-card-foreground w-[480px] max-w-[92vw] max-h-[84vh] rounded-lg shadow-2xl flex flex-col overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 h-11 border-b border-border shrink-0">
          <span className="text-[14px] font-bold tracking-tight">Settings</span>
          <button onClick={onClose} className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" aria-label="Close settings">
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-1">
          {/* --- General --- */}
          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground pt-3 pb-1">General</div>

          <Row label="Global hotkey" hint="Show/hide the window from anywhere. Click to record, Esc to cancel.">
            {capturing ? (
              <span className="text-[12px] font-mono text-primary animate-pulse">Press keys...</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-mono px-2 py-1 rounded bg-muted text-foreground min-w-[88px] text-center">
                  {hotkey || 'Not set'}
                </span>
                <Button variant="secondary" size="sm" onClick={() => setCapturing(true)}>Record</Button>
                {hotkey && (
                  <Button variant="ghost" size="sm" onClick={() => { setHotkey(''); onSave({ globalHotkey: undefined }) }}>Clear</Button>
                )}
              </div>
            )}
          </Row>

          <Row label="Always on top" hint="Keep the window above other apps.">
            <Toggle value={alwaysOnTop} onChange={setAlwaysOnTop} onAutoSave={(v) => onSave({ alwaysOnTop: v })} />
          </Row>

          <Row label="Default working directory" hint={folder || 'Not set — last used folder is remembered.'}>
            <Button variant="secondary" size="sm" icon={<FolderIcon size={13} />} onClick={async () => { const f = await selectFolder(); if (f) setFolder(f) }}>
              Choose...
            </Button>
          </Row>

          {/* --- Appearance --- */}
          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground pt-4 pb-1">Appearance</div>

          <Row label="Theme">
            <div className="flex gap-1 p-0.5 bg-muted rounded-md">
              {([['system', 'System'], ['light', 'Light'], ['dark', 'Dark']] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => onThemeChange(mode)}
                  className={`px-3 py-1 text-[12px] font-semibold rounded-[4px] capitalize transition-all ${
                    theme === mode
                      ? 'bg-accent text-accent-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Row>

          <Row label="Custom CSS" hint="Inject custom styles to override the app theme.">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const el = document.getElementById('settings-css-area')
                if (el) el.style.display = el.style.display === 'none' ? '' : 'none'
              }}
            >
              Edit CSS
            </Button>
          </Row>
          <div id="settings-css-area" style={{ display: 'none' }} className="pb-3">
            <textarea
              className="w-full h-24 text-[11px] font-mono p-2 rounded bg-muted text-foreground border border-border resize-vertical"
              placeholder="/* Paste CSS variables or overrides here */"
              value={customCss}
              onChange={(e) => {
                setCustomCss(e.target.value)
                const styleTag = document.getElementById('user-stylesheet')
                if (styleTag) styleTag.textContent = e.target.value
                onSave({ customCss: e.target.value || undefined })
              }}
            />
            <p className="text-[10px] text-muted-foreground mt-1">Changes apply immediately. Empty the field to remove custom styles.</p>
          </div>

          {/* --- CLIs & Actions --- */}
          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground pt-4 pb-1">CLIs & Actions</div>

          <Row label="YOLO mode by default" hint="Launch CLIs with skip-permissions enabled.">
            <Toggle value={yoloMode} onChange={setYoloMode} onAutoSave={(v) => onSave({ yoloMode: v })} />
          </Row>

          <Row label="Elevate global installs" hint="Use an admin prompt for npm/pip installs on macOS/Linux.">
            <Toggle value={elevateInstalls} onChange={setElevateInstalls} onAutoSave={(v) => onSave({ elevateInstalls: v })} />
          </Row>

          <Row label="Terminal emulator" hint="Which terminal opens launched CLIs.">
            <select
              value={terminal}
              onChange={(e) => { const v = e.target.value; setTerminal(v); onSave({ terminalEmulator: v || undefined }) }}
              className="mac-input rounded bg-muted text-foreground text-[12px] px-2 py-1"
            >
              {terminals.map((t) => (
                <option key={t} value={t}>{terminalLabel(t)}</option>
              ))}
            </select>
          </Row>


        </div>
      </div>
    </div>
  )
}
