// Unit test for two pieces of plugin logic extracted verbatim from
// plugin/src/client-template.js: the resize guard and the locale-aware labels.
// Run: node tools/test-plugin-logic.mjs
import fs from 'node:fs'

const src = fs.readFileSync(new URL('../plugin/src/client-template.js', import.meta.url), 'utf8')

function sliceFunction(name) {
  const start = src.indexOf('function ' + name + '(')
  if (start < 0) throw new Error('function not found: ' + name)
  let depth = 0
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    const ch = src[i]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return src.slice(start, i + 1)
    }
  }
  throw new Error('unterminated function: ' + name)
}

function build(source, names, scope) {
  const fn = new Function(...Object.keys(scope), source + '\nreturn { ' + names.join(', ') + ' }')
  return fn(...Object.values(scope))
}

// ---- mock event target -------------------------------------------------------
function makeEnv() {
  const listeners = new Map()
  function add(type, fn) {
    if (!listeners.has(type)) listeners.set(type, [])
    listeners.get(type).push(fn)
  }
  function remove(type, fn) {
    const arr = listeners.get(type)
    if (arr) listeners.set(type, arr.filter((f) => f !== fn))
  }
  function fire(type, ev) {
    for (const fn of (listeners.get(type) || []).slice()) fn(ev)
  }
  const attrs = new Map()
  const doc = {
    documentElement: {
      setAttribute: (k, v) => attrs.set(k, v),
      removeAttribute: (k) => attrs.delete(k),
      hasAttribute: (k) => attrs.has(k)
    },
    addEventListener: add,
    removeEventListener: remove
  }
  const win = {
    addEventListener: add,
    removeEventListener: remove,
    setTimeout: () => 0,
    clearTimeout: () => {},
    __dsgResizeGuard: false
  }
  return { doc, win, attrs, fire, listeners }
}

const guardSource = sliceFunction('initResizeGuard')
let failures = 0
function check(label, ok) {
  console.log((ok ? 'PASS ' : 'FAIL ') + label)
  if (!ok) failures++
}

// 1. click (no movement) must not trigger
{
  const env = makeEnv()
  const disposers = []
  const ctx = { effect: (fn) => { disposers.push(fn()) } }
  const { initResizeGuard } = build(guardSource, ['initResizeGuard'], { window: env.win, document: env.doc, ctx })
  initResizeGuard(ctx)
  env.fire('pointerdown', { button: 0, clientX: 100, clientY: 100 })
  env.fire('pointermove', { clientX: 102, clientY: 101 })
  check('small jitter (<4px) does not arm the guard', !env.attrs.has('data-dsg-resizing'))
  env.fire('pointerup', {})
  check('pointerup keeps it clean', !env.attrs.has('data-dsg-resizing'))
  env.fire('pointerdown', { button: 0, clientX: 100, clientY: 100 })
  env.fire('pointermove', { clientX: 140, clientY: 100 })
  check('real drag arms the guard (attribute set)', env.attrs.get('data-dsg-resizing') === '1')
  env.fire('pointerup', {})
  check('pointerup removes the attribute', !env.attrs.has('data-dsg-resizing'))
  disposers.forEach((d) => d && d())
  check('disposer clears the attribute and listener', !env.attrs.has('data-dsg-resizing') && (env.listeners.get('pointerdown') || []).length === 0)
}

// ---- locale-aware T() --------------------------------------------------------
const langSource = [sliceFunction('currentLanguage'), sliceFunction('isZh'), sliceFunction('T')].join('\n')

function renderT(scope) {
  const { T } = build(langSource, ['T'], scope)
  return T('中文', 'English')
}

// 2. explicit html lang
{
  const doc = { documentElement: { lang: 'zh-CN' } }
  check('html lang=zh-CN → 中文', renderT({ document: doc, navigator: { language: 'en-US' }, ctxRef: null }) === '中文')
}
{
  const doc = { documentElement: { lang: 'en' } }
  check('html lang=en → English', renderT({ document: doc, navigator: { language: 'zh-CN' }, ctxRef: null }) === 'English')
}
// 3. DSH locale service wins
{
  const doc = { documentElement: { lang: '' } }
  const ctxRef = { get: () => ({ getSnapshot: () => ({ active: 'zh' }) }) }
  check('locale service active=zh → 中文 (even if navigator=en)', renderT({ document: doc, navigator: { language: 'en-US' }, ctxRef }) === '中文')
}
// 4. Chinese fallback when nothing is known
{
  const doc = { documentElement: { lang: '' } }
  check('no signal → 中文 (product default)', renderT({ document: doc, navigator: undefined, ctxRef: null }) === '中文')
}

console.log(failures ? `\n${failures} failure(s)` : '\nall checks passed')
process.exit(failures ? 1 : 0)
