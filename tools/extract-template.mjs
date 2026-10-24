import fs from 'node:fs'
const file = process.argv[2]
const marker = process.argv[3] || '--we-blur'
const out = process.argv[4]
const s = fs.readFileSync(file, 'utf8')
const i = s.indexOf(marker)
if (i < 0) { console.error('marker not found'); process.exit(1) }
// find enclosing template literal start (backtick not escaped)
let start = i
while (start > 0) {
  if (s[start] === '`' && s[start - 1] !== '\\') break
  start--
}
let end = i
while (end < s.length) {
  if (s[end] === '`' && s[end - 1] !== '\\') break
  end++
}
const chunk = s.slice(start + 1, end)
fs.writeFileSync(out, chunk)
console.log('wrote', out, chunk.length, 'chars; start', start, 'end', end)
