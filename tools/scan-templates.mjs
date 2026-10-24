import fs from 'node:fs'
const file = process.argv[2]
const s = fs.readFileSync(file, 'utf8')
const parts = []
let start = -1
for (let i = 0; i < s.length; i++) {
  if (s[i] !== '`') continue
  // count preceding backslashes
  let bs = 0
  let p = i - 1
  while (p >= 0 && s[p] === '\\') { bs++; p-- }
  if (bs % 2 === 1) continue
  if (start === -1) start = i
  else {
    const chunk = s.slice(start + 1, i)
    if (chunk.length > 800 && (chunk.includes('backdrop-filter') || chunk.includes('--dsw-alias') || chunk.includes('position:absolute') || chunk.includes('display:flex') || chunk.includes(':root'))) {
      parts.push({ start, end: i, len: chunk.length, head: chunk.slice(0, 60).replace(/\n/g, ' '), css: chunk.includes('backdrop-filter') || chunk.includes('--dsw-alias') })
    }
    start = -1
  }
}
parts.sort((a, b) => b.len - a.len)
for (const [i, p] of parts.slice(0, 25).entries()) console.log(i, p.start, p.len, p.css ? 'CSS' : 'js', JSON.stringify(p.head))
