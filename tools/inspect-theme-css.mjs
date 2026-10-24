import fs from 'node:fs'
const file = process.argv[2]
const s = fs.readFileSync(file, 'utf8')
const i = s.indexOf(':root{--dsw')
console.log('first :root at', i)
for (let k = i; k < i + 8; k++) {
  console.log(k, JSON.stringify(s[k]))
}
// find surrounding JS string delimiters by scanning backwards to a backtick or quote that is likely a literal start
const quotes = ['`', '"', "'"]
for (const q of quotes) {
  let pos = i
  while (pos > 0 && s[pos - 1] !== q) pos--
  console.log('prev', q, 'at', pos - 1, JSON.stringify(s.slice(pos - 40, pos + 20)))
  console.log('next', q, 'at', s.indexOf(q, i), JSON.stringify(s.slice(s.indexOf(q, i) - 60, s.indexOf(q, i) + 20)))
}
