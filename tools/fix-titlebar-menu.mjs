import fs from 'node:fs'

// 1) Build a small line-icon (panel/sidebar outline) mask and rewrite the menu block.
const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect x="3.2" y="4.2" width="17.6" height="15.6" rx="3" stroke="#fff" stroke-width="1.8"/><path d="M9.2 4.6v14.8" stroke="#fff" stroke-width="1.8"/></svg>'
const b64 = Buffer.from(svg).toString('base64')
const cssPath = 'plugin/src/styles/12-windows-titlebar.css'
let css = fs.readFileSync(cssPath, 'utf8')
const marker = '/* 3) 菜单条'
const idx = css.indexOf(marker)
if (idx < 0) throw new Error('menu block marker missing')
css = css.slice(0, idx) + `/* 3) 菜单条：
   · 宿主 div[data-windows-menu] 保持完全透明，与标题栏背景同色（不要再铺 L3 板）；
   · 左侧用「分栏/侧栏」线条图标（mask 着色，light #4d6bfe / dark #7aaaff）；
   · 菜单按钮的 hover 仍走 DSH 自带 token。 */
html[data-dsg='on'][data-windows-titlebar] {
  --dsh-windows-menu-start: 54px;
}
html[data-dsg='on'][data-windows-titlebar] div[data-windows-menu] {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
  color: var(--dsw-alias-label-secondary);
}
html[data-dsg='on'][data-windows-titlebar] div[data-windows-menu]::before {
  content: '';
  position: absolute;
  left: -42px;
  top: 50%;
  width: 18px;
  height: 18px;
  transform: translateY(-50%);
  background-color: var(--dsg-blue);
  opacity: 0.92;
  pointer-events: none;
  -webkit-mask-image: url("data:image/svg+xml;base64,${b64}");
  mask-image: url("data:image/svg+xml;base64,${b64}");
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
}
html[data-dsg='on'][data-windows-titlebar] body[data-ds-dark-theme] div[data-windows-menu]::before {
  background-color: #7aaaff;
  opacity: 0.95;
}
`
fs.writeFileSync(cssPath, css)

// 2) Remove the temporary menu-debug block from the client template.
const jsPath = 'plugin/src/client-template.js'
let js = fs.readFileSync(jsPath, 'utf8')
const a = js.indexOf('      // TEMP debug: inspect the Windows caption menu host')
const b = js.indexOf('      // 0. first activation', a)
if (a >= 0 && b > a) {
  js = js.slice(0, a) + js.slice(b)
  fs.writeFileSync(jsPath, js)
  console.log('removed temp menu debug')
} else {
  console.log('temp menu debug not found', a, b)
}
console.log('line icon b64', b64.length)
