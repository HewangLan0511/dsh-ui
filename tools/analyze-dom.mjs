import fs from 'node:fs'
const src = process.argv[2] || '.ref/dom/tree.json'
const out = process.argv[3] || '.ref/dom/surface-tree.txt'
const d = JSON.parse(fs.readFileSync(src, 'utf8').replace(/^\uFEFF/, ''))
const lines = []
function label(n) {
  let s = n.t || '?'
  if (n.c) s += '.' + n.c.split(/\s+/).join('.')
  if (n.a) {
    const keys = Object.keys(n.a)
    if (keys.length) s += ' ' + keys.map((k) => (n.a[k] ? `${k}=${n.a[k].length > 40 ? n.a[k].slice(0, 40) + '…' : n.a[k]}` : k)).join(' ')
  }
  if (n.x) s += '  | ' + n.x.replace(/\s+/g, ' ').slice(0, 70)
  return s
}
function walk(n, depth) {
  if (!n) return
  lines.push('  '.repeat(depth) + label(n))
  for (const c of n.ch || []) walk(c, depth + 1)
}
walk(d.tree, 0)
fs.writeFileSync(out, lines.join('\n'))
console.log('wrote', out, lines.length, 'lines')
console.log('dark', d.dark, 'dsg', d.dsg)
for (const [k, v] of Object.entries(d.computed || {})) {
  if (!v) continue
  console.log('CSS', k, '=> bg', v.background, '| blur', v.backdrop, '| radius', v.radius, '| shadow', v.shadow ? 'yes' : 'none')
}
