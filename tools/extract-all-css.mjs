import fs from 'node:fs'
import path from 'node:path'
const file = process.argv[2]
const outDir = process.argv[3]
const s = fs.readFileSync(file, 'utf8')
fs.mkdirSync(outDir, { recursive: true })
const parts = []
let start = -1
for (let i = 0; i < s.length; i++) {
  if (s[i] !== '`') continue
  let bs = 0, p = i - 1
  while (p >= 0 && s[p] === '\\') { bs++; p-- }
  if (bs % 2 === 1) continue
  if (start === -1) start = i
  else {
    const chunk = s.slice(start + 1, i)
    if (chunk.length > 800 && (chunk.includes('backdrop-filter') || chunk.includes('--dsw-alias') || chunk.includes('display:flex') || chunk.includes(':root'))) {
      parts.push({ start, len: chunk.length, head: chunk.slice(0, 80).replace(/\n/g, ' '), chunk })
    }
    start = -1
  }
}
parts.sort((a, b) => b.len - a.len)
parts.forEach((part, i) => {
  fs.writeFileSync(path.join(outDir, `${String(i).padStart(2, '0')}-${part.start}-${part.len}.css`), part.chunk)
  console.log(i, part.start, part.len, JSON.stringify(part.head.slice(0, 70)))
})
