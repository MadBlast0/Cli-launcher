import { compile } from '@tailwindcss/node'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const srcPath = path.join(root, 'src.css')
const outPath = path.join(root, 'tailwind.css')

const source = fs.readFileSync(srcPath, 'utf8')

try {
  const { css } = await compile(source, {
    base: root,
    minify: false,
  })
  fs.writeFileSync(outPath, css)
  console.log('Compiled tailwind.css ->', css.length, 'bytes')
} catch (err) {
  console.error('Tailwind compile failed:', err)
  process.exit(1)
}
