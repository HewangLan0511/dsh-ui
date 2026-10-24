// Search file contents inside an ASAR archive (read-only).
// Usage: node tools/asar-grep.mjs <asar> <regex> [pathRegex] [maxHits]
import fs from 'node:fs'
const [asarPath, pattern, pathRe, maxHitsArg] = process.argv.slice(2)
if (!asarPath || !pattern) { console.error('usage: node tools/asar-grep.mjs <asar> <regex> [pathRegex] [maxHits]'); process.exit(1) }
const maxHits = Number(maxHitsArg || 20)
const buf = fs.readFileSync(asarPath)
const headerSize = buf.readUInt32LE(4)
const jsonSize = buf.readUInt32LE(12)
const json = JSON.parse(buf.subarray(16, 16 + jsonSize).toString('utf8'))
const dataOffset = 8 + headerSize
const re = new RegExp(pattern, 'g')
const pathFilter = pathRe ? new RegExp(pathRe) : null
const files = []
function walk(node, rel) {
  for (const [name, entry] of Object.entries(node.files || {})) {
    const p = rel ? rel + '/' + name : name
    if (entry.files) walk(entry, p)
    else files.push({ path: p, offset: Number(entry.offset), size: entry.size })
  }
}
walk(json, '')
let hits = 0
for (const f of files) {
  if (pathFilter && !pathFilter.test(f.path)) continue
  if (f.size > 30 * 1024 * 1024) continue
  if (!/\.(js|mjs|cjs|css|json|ts)$/.test(f.path)) continue
  const text = buf.subarray(dataOffset + f.offset, dataOffset + f.offset + f.size).toString('utf8')
  re.lastIndex = 0
  let m
  while ((m = re.exec(text)) && hits < maxHits) {
    const start = Math.max(0, m.index - 160)
    console.log('=== ' + f.path + ' :: ' + JSON.stringify(text.slice(start, m.index + 240)))
    hits++
  }
  if (hits >= maxHits) break
}
console.log('hits', hits)
