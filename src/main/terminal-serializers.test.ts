import { describe, it, expect } from 'vitest'
import { qPS, qSH, qCMD, buildPSCommand, buildWSLCommand, toWslPath } from './terminal-serializers'

// ---------------------------------------------------------------------------
// PowerShell quoting
// ---------------------------------------------------------------------------
describe('qPS (PowerShell single-quote)', () => {
  it('wraps simple strings in single quotes', () => {
    expect(qPS('hello')).toBe("'hello'")
  })

  it('doubles embedded single quotes', () => {
    expect(qPS("John's App")).toBe("'John''s App'")
  })

  it('handles empty string', () => {
    expect(qPS('')).toBe("''")
  })

  it('preserves spaces', () => {
    expect(qPS('hello world')).toBe("'hello world'")
  })

  it('preserves double quotes', () => {
    expect(qPS('he"llo')).toBe("'he\"llo'")
  })

  it('preserves shell metacharacters', () => {
    expect(qPS('$HOME')).toBe("'$HOME'")
    expect(qPS('$(danger)')).toBe("'$(danger)'")
    expect(qPS('back`tick')).toBe("'back`tick'")
    expect(qPS('hello;other')).toBe("'hello;other'")
    expect(qPS('hello&other')).toBe("'hello&other'")
    expect(qPS('hello|other')).toBe("'hello|other'")
  })

  it('handles multiple single quotes', () => {
    expect(qPS("it's John's")).toBe("'it''s John''s'")
  })

  it('handles Unicode and emoji', () => {
    expect(qPS('日本語')).toBe("'日本語'")
    expect(qPS('emoji-🚀')).toBe("'emoji-🚀'")
  })

  it('handles trailing backslash', () => {
    expect(qPS('path\\')).toBe("'path\\'")
  })
})

// ---------------------------------------------------------------------------
// POSIX shell quoting
// ---------------------------------------------------------------------------
describe('qSH (POSIX single-quote)', () => {
  it('wraps simple strings in single quotes', () => {
    expect(qSH('hello')).toBe("'hello'")
  })

  it('escapes embedded single quotes with the five-char sequence', () => {
    expect(qSH("John's App")).toBe("'John'\"'\"'s App'")
  })

  it('handles empty string', () => {
    expect(qSH('')).toBe("''")
  })

  it('preserves spaces', () => {
    expect(qSH('hello world')).toBe("'hello world'")
  })

  it('preserves shell metacharacters (no expansion)', () => {
    expect(qSH('$HOME')).toBe("'$HOME'")
    expect(qSH('$(danger)')).toBe("'$(danger)'")
    expect(qSH('back`tick')).toBe("'back`tick'")
  })

  it('preserves double quotes', () => {
    expect(qSH('he"llo')).toBe("'he\"llo'")
  })
})

// ---------------------------------------------------------------------------
// Windows cmd.exe quoting
// ---------------------------------------------------------------------------
describe('qCMD (cmd.exe double-quote)', () => {
  it('wraps simple strings in double quotes', () => {
    expect(qCMD('hello')).toBe('"hello"')
  })

  it('escapes embedded double quotes by doubling them', () => {
    expect(qCMD('he"llo')).toBe('"he""llo"')
  })

  it('leaves percent signs untouched (no cmd arg-parse escape exists)', () => {
    expect(qCMD('99%')).toBe('"99%"')
  })

  it('handles empty string', () => {
    expect(qCMD('')).toBe('""')
  })

  it('preserves spaces', () => {
    expect(qCMD('hello world')).toBe('"hello world"')
  })

  it('preserves shell metacharacters (no expansion)', () => {
    expect(qCMD('&cmd')).toBe('"&cmd"')
    expect(qCMD('|cmd')).toBe('"|cmd"')
    expect(qCMD('<cmd>')).toBe('"<cmd>"')
    expect(qCMD('^caret')).toBe('"^caret"')
  })
})

// ---------------------------------------------------------------------------
// PowerShell command builder (buildPSCommand)
// ---------------------------------------------------------------------------
describe('buildPSCommand', () => {
  it('builds a simple command with no folder', () => {
    const result = buildPSCommand('codebuff', [], null)
    expect(result).toBe("& 'codebuff'")
  })

  it('includes arguments as separate quoted tokens', () => {
    const result = buildPSCommand('codebuff', ['--flag', 'value'], null)
    expect(result).toBe("& 'codebuff' '--flag' 'value'")
  })

  it('prepends Set-Location when folder is provided', () => {
    const result = buildPSCommand('codebuff', [], 'C:\\My Project')
    expect(result).toBe("Set-Location -LiteralPath 'C:\\My Project'; & 'codebuff'")
  })

  it('escapes single quotes in folder name', () => {
    const result = buildPSCommand('codebuff', [], "C:\\John's App")
    expect(result).toBe("Set-Location -LiteralPath 'C:\\John''s App'; & 'codebuff'")
  })

  it('escapes single quotes in args', () => {
    const result = buildPSCommand('codebuff', ["--name=John's"], null)
    expect(result).toBe("& 'codebuff' '--name=John''s'")
  })
})

// ---------------------------------------------------------------------------
// WSL command builder (buildWSLCommand)
// ---------------------------------------------------------------------------
describe('buildWSLCommand', () => {
  it('builds a simple WSL command with no folder', () => {
    const result = buildWSLCommand('codebuff', [], null)
    expect(result).toBe("'codebuff'")
  })

  it('includes arguments', () => {
    const result = buildWSLCommand('codebuff', ['--flag', 'value'], null)
    expect(result).toBe("'codebuff' '--flag' 'value'")
  })

  it('prepends cd when folder is provided', () => {
    const result = buildWSLCommand('codebuff', [], '/mnt/c/My Project')
    expect(result).toBe("cd '/mnt/c/My Project' && 'codebuff'")
  })

  it('escapes single quotes in folder', () => {
    const result = buildWSLCommand('codebuff', [], "/mnt/c/John's App")
    expect(result).toBe("cd '/mnt/c/John'\"'\"'s App' && 'codebuff'")
  })

  it('converts a Windows drive path to a WSL mount path', () => {
    const result = buildWSLCommand('codebuff', [], 'C:\\My Project')
    expect(result).toBe("cd '/mnt/c/My Project' && 'codebuff'")
  })
})

// ---------------------------------------------------------------------------
// Windows → WSL path conversion (toWslPath)
// ---------------------------------------------------------------------------
describe('toWslPath', () => {
  it('maps a Windows drive path to /mnt/<drive>', () => {
    expect(toWslPath('C:\\Users\\me\\proj')).toBe('/mnt/c/Users/me/proj')
  })

  it('lowercases the drive letter', () => {
    expect(toWslPath('D:\\Work')).toBe('/mnt/d/Work')
  })

  it('handles a drive path that already uses forward slashes', () => {
    expect(toWslPath('C:/foo/bar')).toBe('/mnt/c/foo/bar')
  })

  it('leaves an existing POSIX path unchanged', () => {
    expect(toWslPath('/mnt/c/foo')).toBe('/mnt/c/foo')
  })

  it('normalises separators for a driveless path', () => {
    expect(toWslPath('relative\\path')).toBe('relative/path')
  })
})
