import type { CliDefinition } from '../shared/types'

import claudeDef from './claude'
import opencodeDef from './opencode'
import geminiDef from './gemini'
import copilotDef from './copilot'
import codexDef from './codex'
import aiderDef from './aider'
import kiloDef from './kilo'
import qwenDef from './qwen'
import codebuffDef from './codebuff'
import gooseDef from './goose'
import piDef from './pi'
import crushDef from './crush'
import freebuffDef from './freebuff'
import commandcodeDef from './commandcode'
import cursorDef from './cursor'
import ampDef from './amp'
import amazonqDef from './amazonq'

const registry: CliDefinition[] = [
  claudeDef,
  opencodeDef,
  geminiDef,
  copilotDef,
  codexDef,
  aiderDef,
  kiloDef,
  qwenDef,
  codebuffDef,
  gooseDef,
  piDef,
  crushDef,
  freebuffDef,
  commandcodeDef,
  cursorDef,
  ampDef,
  amazonqDef,
]

export function getCliRegistry(): CliDefinition[] {
  return registry
}

export function getCliById(id: string): CliDefinition | undefined {
  return registry.find((cli) => cli.id === id)
}

export default registry
