import fs from 'node:fs'
const f = '.ref/asar/dsh/node_modules/@deepseek-ai/dsh-web-frontend/dist/assets/index-CN7NIWNw.js'
const s = fs.readFileSync(f, 'utf8')
const marker = 'const Is={width:23.16,height:17.04},j_="'
const start = s.indexOf(marker)
if (start < 0) { console.error('marker not found'); process.exit(1) }
let i = start + marker.length
let out = ''
let esc = false
for (; i < s.length; i++) {
  const ch = s[i]
  if (esc) { out += ch; esc = false; continue }
  if (ch === '\\') { esc = true; continue }
  if (ch === '"') break
  out += ch
}
console.log('path length', out.length, 'start', out.slice(0, 30))
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23.16 17.04"><path fill="#fff" d="${out}"/></svg>`
const b64 = Buffer.from(svg).toString('base64')
fs.writeFileSync('.ref/brand-fish.svg', svg)
fs.writeFileSync('.ref/brand-fish.b64.txt', b64)
console.log('b64 length', b64.length)
