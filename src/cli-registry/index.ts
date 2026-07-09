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
import clineDef from './cline'
import codyDef from './cody'
import skiDef from './ski'
import boltDef from './bolt'
import replitAgentDef from './replit-agent'
import interpreterDef from './interpreter'
import openhandsDef from './openhands'
import plandexDef from './plandex'
import continueDef from './continue'
import cursorAgentDef from './cursor-agent'
import droidDef from './droid'
import auggieDef from './auggie'
import grokDef from './grok'
import modsDef from './mods'
import aichatDef from './aichat'
import gptmeDef from './gptme'
import sgptDef from './sgpt'
import raAidDef from './ra-aid'
import fabricDef from './fabric'

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
  clineDef,
  codyDef,
  skiDef,
  boltDef,
  replitAgentDef,
  interpreterDef,
  openhandsDef,
  plandexDef,
  continueDef,
  cursorAgentDef,
  droidDef,
  auggieDef,
  grokDef,
  modsDef,
  aichatDef,
  gptmeDef,
  sgptDef,
  raAidDef,
  fabricDef,
]

export function getCliRegistry(): CliDefinition[] {
  return registry
}

export function getCliById(id: string): CliDefinition | undefined {
  return registry.find((cli) => cli.id === id)
}

export default registry
