import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui'
import type { AppSettings, CliConfig } from '@shared/types'

interface CliConfigModalProps {
  cliId: string
  cliName: string
  onClose: () => void
  onSave: (cliConfig: Record<string, CliConfig>) => void
}

/** Parses "KEY=VALUE" lines (ignoring blanks/comments) into a record. */
function parseEnv(text: string): Record<string, string> {
  const env: Record<string, string> = {}
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    const value = line.slice(eq + 1).trim()
    if (key) env[key] = value
  }
  return env
}

/** Serializes a record back to "KEY=VALUE" lines. */
function serializeEnv(env: Record<string, string> | undefined): string {
  if (!env) return ''
  return Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')
}

export function CliConfigModal({ cliId, cliName, onClose, onSave }: CliConfigModalProps) {
  const [envText, setEnvText] = useState('')
  const [model, setModel] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const s = (await window.electronAPI.getSettings()) as AppSettings
      const cfg = s.cliConfig?.[cliId]
      setEnvText(serializeEnv(cfg?.env))
      setModel(cfg?.model || '')
      setBaseUrl(cfg?.baseUrl || '')
    } catch { /* ignore */ }
  }, [cliId])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = () => {
    const env = parseEnv(envText)
    const config: CliConfig = {}
    if (Object.keys(env).length) config.env = env
    if (model.trim()) config.model = model.trim()
    if (baseUrl.trim()) config.baseUrl = baseUrl.trim()
    if (Object.keys(config).length === 0) {
      setError('Add at least one setting, or cancel to leave this CLI unconfigured.')
      return
    }
    // Merge into the existing cliConfig map so other CLIs are preserved.
    window.electronAPI
      .getSettings()
      .then((s: AppSettings) => {
        const map = { ...(s.cliConfig || {}) }
        map[cliId] = config
        onSave(map)
        onClose()
      })
      .catch(() => setError('Failed to read settings.'))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onMouseDown={onClose}>
      <div
        className="mac-surface bg-card text-card-foreground w-[460px] max-w-[92vw] max-h-[82vh] rounded-lg shadow-2xl flex flex-col overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 h-11 border-b border-border shrink-0">
          <span className="text-[14px] font-bold tracking-tight">Configure {cliName}</span>
          <button onClick={onClose} className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" aria-label="Close">
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          <div>
            <label className="text-[12px] font-medium text-foreground block mb-1">Environment variables</label>
            <p className="text-[11px] text-muted-foreground mb-1.5">
              One <code className="px-1 rounded bg-muted">KEY=VALUE</code> per line. Use this for API keys (e.g. <code className="px-1 rounded bg-muted">ANTHROPIC_API_KEY=sk-…</code>).
            </p>
            <textarea
              value={envText}
              onChange={(e) => setEnvText(e.target.value)}
              rows={5}
              spellCheck={false}
              className="mac-input w-full rounded bg-muted text-foreground text-[12px] font-mono px-2 py-1.5 resize-y"
              placeholder={'OPENAI_API_KEY=sk-…\nANTHROPIC_BASE_URL=https://…'}
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-foreground block mb-1">Model (optional)</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="mac-input w-full rounded bg-muted text-foreground text-[12px] px-2 py-1.5"
              placeholder="claude-sonnet-4-0"
            />
          </div>

          <div>
            <label className="text-[12px] font-medium text-foreground block mb-1">Base URL (optional)</label>
            <input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="mac-input w-full rounded bg-muted text-foreground text-[12px] px-2 py-1.5"
              placeholder="https://api.example.com"
            />
          </div>

          {error && <p className="text-[11px] text-destructive">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-4 h-12 border-t border-border shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  )
}
