#!/usr/bin/env node
// Build dsh-ui-deepseek: concatenate src/styles/*.css (sorted) into the client
// template and emit plugin/lib/client.js.
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const repoRoot = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)))
const root = path.join(repoRoot, 'plugin')
const stylesDir = path.join(root, 'src', 'styles')
const templatePath = path.join(root, 'src', 'client-template.js')
const outPath = path.join(root, 'lib', 'client.js')

const files = fs.readdirSync(stylesDir).filter((f) => f.endsWith('.css')).sort()
let css = ''
for (const f of files) {
  const body = fs.readFileSync(path.join(stylesDir, f), 'utf8')
  css += `\n/* ===== ${f} ===== */\n${body.trim()}\n`
}

let template = fs.readFileSync(templatePath, 'utf8')
if (!template.includes('__DSG_CSS__')) {
  console.error('template is missing the __DSG_CSS__ placeholder')
  process.exit(1)
}
template = template.replace('__DSG_CSS__', JSON.stringify(css))

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, template)
const kb = (Buffer.byteLength(template) / 1024).toFixed(1)
console.log(`built ${outPath} (${files.length} css files, ${kb} KiB)`)
