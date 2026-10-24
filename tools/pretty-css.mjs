import fs from 'node:fs'
import path from 'node:path'
const dir = process.argv[2]
for (const name of fs.readdirSync(dir)) {
  if (!name.endsWith('.css') || name.endsWith('.pretty.css')) continue
  const p = path.join(dir, name)
  let css = fs.readFileSync(p, 'utf8').replace(/\r?\n/g, ' ')
  const out = []
  let depth = 0
  let buf = ''
  let inStr = null
  let inComment = false
  for (let i = 0; i < css.length; i++) {
    const ch = css[i]
    const nx = css[i + 1]
    if (inComment) { buf += ch; if (ch === '*' && nx === '/') { buf += nx; i++; inComment = false } continue }
    if (inStr) { buf += ch; if (ch === inStr && css[i - 1] !== '\\') inStr = null; continue }
    if (ch === '/' && nx === '*') { inComment = true; buf += ch; continue }
    if (ch === '"' || ch === "'") { inStr = ch; buf += ch; continue }
    if (ch === '{') { out.push('  '.repeat(depth) + buf.trim() + ' {'); buf = ''; depth++; continue }
    if (ch === '}') { if (buf.trim()) out.push('  '.repeat(depth) + buf.trim()); buf = ''; depth = Math.max(0, depth - 1); out.push('  '.repeat(depth) + '}'); continue }
    if (ch === ';') { out.push('  '.repeat(depth) + buf.trim() + ';'); buf = ''; continue }
    buf += ch
  }
  if (buf.trim()) out.push(buf.trim())
  fs.writeFileSync(p.replace(/\.css$/, '.pretty.css'), out.join('\n'))
}
console.log('done')
