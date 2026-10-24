#!/usr/bin/env node
// Minimal ASAR reader used to inspect the packaged DSH UI (read-only reference).
// Usage: node tools/asar-extract.mjs <asar> <outDir> [pathPrefix ...]
//   pathPrefix examples: node_modules/@deepseek-ai/dsh-client-ui-chat/ node_modules/@deepseek-ai/dsh-web-frontend/
import fs from 'node:fs'
import path from 'node:path'

const [asarPath, outDir, ...prefixes] = process.argv.slice(2)
if (!asarPath || !outDir) {
  console.error('usage: node tools/asar-extract.mjs <asar> <outDir> [pathPrefix ...]')
  process.exit(1)
}

const buf = fs.readFileSync(asarPath)
const headerSize = buf.readUInt32LE(4)
const jsonSize = buf.readUInt32LE(12)
const json = JSON.parse(buf.subarray(16, 16 + jsonSize).toString('utf8'))
const dataOffset = 8 + headerSize

const files = []
function walk(node, rel) {
  for (const [name, entry] of Object.entries(node.files || {})) {
    const p = rel ? rel + '/' + name : name
    if (entry.files) walk(entry, p)
    else files.push({ path: p, offset: Number(entry.offset), size: entry.size })
  }
}
walk(json, '')

let selected = files
if (prefixes.length) selected = files.filter(f => prefixes.some(p => f.path.startsWith(p)))
console.log(`asar: ${files.length} files, selected: ${selected.length}`)
for (const f of selected) {
  const dest = path.join(outDir, f.path)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, buf.subarray(dataOffset + f.offset, dataOffset + f.offset + f.size))
}
console.log(`extracted to ${outDir}`)
