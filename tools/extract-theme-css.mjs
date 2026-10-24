import fs from 'node:fs'
import path from 'node:path'
const file = process.argv[2]
const out = process.argv[3]
const s = fs.readFileSync(file, 'utf8')
const re = /var ([a-z0-9_]+_css_default) = (")/g
fs.mkdirSync(out, { recursive: true })
let m
const found = []
while ((m = re.exec(s))) {
  const name = m[1]
  const start = m.index + m[0].length - 1
  let i = start + 1
  let escaped = false
  while (i < s.length) {
    const ch = s[i]
    if (escaped) { escaped = false; i++; continue }
    if (ch === '\\') { escaped = true; i++; continue }
    if (ch === '"') break
    i++
  }
  const raw = s.slice(start, i + 1)
  let css
  try { css = JSON.parse(raw) } catch (e) { console.log('skip', name, e.message); continue }
  fs.writeFileSync(path.join(out, name.replace(/_css_default$/, '') + '.css'), css)
  found.push(`${name}: ${css.length}`)
}
console.log(found.join('\n'))
