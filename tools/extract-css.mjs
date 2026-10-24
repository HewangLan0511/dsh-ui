// Extract long CSS-looking template/string literals from a bundled client.js.
// Usage: node tools/extract-css.mjs <file> [outFile]
import fs from 'node:fs'
const src = process.argv[2]
const out = process.argv[3] || 'extracted.css'
const s = fs.readFileSync(src, 'utf8')

const chunks = []
// template literals and normal strings, unescaped crudely
const re = /`([^`\\]*(?:\\.[^`\\]*)*)`|"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g
let m
while ((m = re.exec(s))) {
  const body = m[1] ?? m[2] ?? m[3] ?? ''
  if (body.length < 400) continue
  if (!/[{:]/.test(body)) continue
  if (!/[.#\[][\w-]+\s*[{,]/.test(body)) continue
  chunks.push(body.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\'))
}
fs.writeFileSync(out, chunks.join('\n\n/* ===== next chunk ===== */\n\n'))
console.log('chunks', chunks.length, 'bytes', chunks.reduce((a, b) => a + b.length, 0), '->', out)
