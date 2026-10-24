import fs from 'node:fs'
const p = 'plugin/src/client-template.js'
let s = fs.readFileSync(p, 'utf8')
const startMarker = '    // ---- dev-only DOM snapshot'
const endMarker = '    function apply(ctx) {'
const a = s.indexOf(startMarker)
const b = s.indexOf(endMarker)
if (a < 0 || b < 0 || b <= a) { console.error('markers not found', a, b); process.exit(1) }
s = s.slice(0, a) + s.slice(b)
s = s.replace(/\n\s*dumpDom\(\)\n/, '\n')
s = s.replace(/\n\s*devScenario\(ctx\)\n/, '\n')
fs.writeFileSync(p, s)
console.log('removed dev blocks; remaining dev refs:', (s.match(/devScenario|dumpDom|DEV_SCENARIO|DUMP_VERSION/g) || []).length)
