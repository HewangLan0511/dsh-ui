#!/usr/bin/env node
/**
 * Release packaging for dsh-skin-mistblue.
 *
 * Steps: build the client -> run regression tests -> `npm pack` the plugin ->
 * `git archive` a source zip -> write SHA-256 checksums into dist/.
 *
 * Usage:
 *   node tools/release.mjs            # uses plugin/package.json version
 */
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const pkgPath = path.join(root, 'plugin', 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const version = pkg.version
const dist = path.join(root, 'dist')
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const run = (cmd, args, cwd = root) => {
  console.log(`\n$ ${cmd} ${args.join(' ')}`)
  // npm.cmd is a batch shim; Node >= 20 refuses to spawn it without a shell.
  const shell = process.platform === 'win32' && cmd === npmCmd
  execFileSync(cmd, args, { cwd, stdio: 'inherit', shell })
}

if (!pkg.name || pkg.version !== version) {
  console.error('plugin/package.json is missing name/version')
  process.exit(1)
}
if (pkg.private === true) {
  console.error('plugin/package.json still has "private": true — remove it before packaging')
  process.exit(1)
}

run(process.execPath, ['tools/build-plugin.mjs'])
run(process.execPath, ['tools/test-plugin-logic.mjs'])

fs.mkdirSync(dist, { recursive: true })
const tgz = `${pkg.name}-${version}.tgz`
const srcZip = `${pkg.name}-${version}-src.zip`

run(npmCmd, ['pack', '--pack-destination', dist], path.join(root, 'plugin'))
run(process.platform === 'win32' ? 'git.exe' : 'git', [
  'archive',
  '--format=zip',
  `--prefix=${pkg.name}-${version}/`,
  '-o',
  `dist/${srcZip}`,
  'HEAD',
])

const files = fs.readdirSync(dist).filter((f) => f.endsWith('.tgz') || f.endsWith('-src.zip'))
const lines = []
for (const file of files.sort()) {
  const buf = fs.readFileSync(path.join(dist, file))
  const sha = createHash('sha256').update(buf).digest('hex')
  lines.push(`${sha}  ${file}`)
}
fs.writeFileSync(path.join(dist, 'SHA256SUMS.txt'), lines.join('\n') + '\n')

console.log('\n=== release artifacts ===')
console.log(`version : ${version}`)
console.log(`tgz     : dist/${tgz}`)
console.log(`src zip : dist/${srcZip}`)
console.log(`checksum: dist/SHA256SUMS.txt`)
for (const line of lines) console.log(line)
console.log('\nnext: npm publish (logged in) / git push + GitHub Release')
