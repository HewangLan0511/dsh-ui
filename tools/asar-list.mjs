// List entries inside an ASAR archive (read-only).
// Usage: node tools/asar-list.mjs <asar> [regex]
import fs from 'node:fs'
const [asarPath, pattern] = process.argv.slice(2)
if (!asarPath) { console.error('usage: node tools/asar-list.mjs <asar> [regex]'); process.exit(1) }
const buf = fs.readFileSync(asarPath)
const headerSize = buf.readUInt32LE(4)
const jsonSize = buf.readUInt32LE(12)
const json = JSON.parse(buf.subarray(16, 16 + jsonSize).toString('utf8'))
const re = pattern ? new RegExp(pattern) : null
const out = []
function walk(node, rel) {
  for (const [name, entry] of Object.entries(node.files || {})) {
    const p = rel ? rel + '/' + name : name
    if (entry.files) walk(entry, p)
    else if (!re || re.test(p)) out.push(p + '  ' + entry.size)
  }
}
walk(json, '')
console.log(out.slice(0, 3000).join('\n'))
console.log('total', out.length)
