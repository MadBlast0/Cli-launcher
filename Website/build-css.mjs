import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const cli = path.join(root, '..', 'node_modules', '.bin', 'tailwindcss')
const src = path.join(root, 'src.css')
const out = path.join(root, 'tailwind.css')

const cmd = `"${cli}" -i "${src}" -o "${out}"`
try {
  execSync(cmd, { cwd: root, stdio: 'inherit', shell: true })
  console.log('Compiled tailwind.css ->', fs.statSync(out).size, 'bytes')
} catch (err) {
  console.error('Tailwind compile failed:', err.message)
  process.exit(1)
}
