import fs from 'node:fs'
import path from 'node:path'

const rel = (p) => path.resolve(p).replace(/\\/g, '/')
const root = process.cwd()
const css = [
  'baseline/ui-theme/base.pretty.css',
  'baseline/ui-theme/design_platform.pretty.css',
  'baseline/ui-theme/corner_shape.pretty.css',
  'baseline/ui-theme/scrollbar.pretty.css',
  '.ref/context.css',
  'plugin/src/styles/00-foundation.css',
  'plugin/src/styles/10-shell.css',
  'plugin/src/styles/12-windows-titlebar.css',
  'plugin/src/styles/20-sidebar.css',
  'plugin/src/styles/21-collapsed-titlebar.css',
  'plugin/src/styles/30-composer.css',
  'plugin/src/styles/35-hero.css',
  'plugin/src/styles/40-content.css',
  'plugin/src/styles/50-overlays.css',
  'plugin/src/styles/60-settings.css',
]

const svgChart = `
<svg viewBox="0 0 600 260" class="mock-svg" aria-hidden="true">
  <defs>
    <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3ac3ae"/><stop offset="1" stop-color="#3ac3ae" stop-opacity=".55"/>
    </linearGradient>
    <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2f8bff"/><stop offset="1" stop-color="#2f8bff" stop-opacity=".5"/>
    </linearGradient>
  </defs>
  ${[40, 80, 120, 160, 200].map((y) => `<line x1="40" y1="${y}" x2="590" y2="${y}" stroke="#c7d2e6" stroke-dasharray="2 4" stroke-width="1"/>`).join('')}
  <path d="M40 250 L40 200 L90 180 L140 165 L190 150 L240 130 L290 112 L340 92 L390 70 L440 48 L490 26 L540 12 L590 4 L590 250 Z" fill="url(#gA)"/>
  <path d="M40 250 L40 232 L90 220 L140 210 L190 200 L240 186 L290 170 L340 150 L390 128 L440 104 L490 82 L540 60 L590 42 L590 250 Z" fill="url(#gB)"/>
  ${Array.from({ length: 70 }, (_, i) => {
    const x = 44 + i * 7.8
    const h = 6 + ((i * 37) % 46)
    return `<rect x="${x}" y="${250 - h}" width="3" height="${h}" fill="#5b6a86" opacity=".55"/>`
  }).join('')}
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<text x="${44 + i * 75}" y="272" fill="#8b98b0" font-size="10" text-anchor="middle">${i}</text>`).join('')}
  ${[0, 0.25, 0.5, 0.75, 1].map((r, i) => `<text x="14" y="${250 - i * 56}" fill="#8b98b0" font-size="10">${(r * 492).toFixed(1)}k</text>`).join('')}
  <text x="470" y="272" fill="#8b98b0" font-size="10" transform="translate(0,0)">41.4s</text>
</svg>`

const page = (dark) => `<!doctype html>
<html lang="zh-CN" data-dsg="on"${dark ? ' data-theme="dark"' : ''}>
<head>
<meta charset="utf-8">
<title>mistblue tooltip preview (${dark ? 'dark' : 'light'})</title>
${css.map((p) => `<link rel="stylesheet" href="file:///${rel(p)}">`).join('\n')}
<style>
  html, body { height: 100%; }
  body {
    margin: 0;
    font-family: "Segoe UI", "Microsoft YaHei UI", "Microsoft YaHei", sans-serif;
    background: radial-gradient(120% 90% at 18% 0%, #cfe0fb 0%, #eef4ff 46%, #f7fbff 100%);
    display: flex; align-items: flex-start; justify-content: center;
    padding: 28px; box-sizing: border-box;
  }
  [data-ds-dark-theme] body, body[data-ds-dark-theme] { background: radial-gradient(120% 90% at 18% 0%, #16233c 0%, #0b1322 60%, #070d18 100%); }
  .card {
    position: relative; width: 660px; padding: 16px 18px 18px; border-radius: 16px;
    background: var(--dsg-fill-l2, rgba(255,255,255,.6));
    border: .5px solid var(--dsg-hairline-soft, rgba(56,88,158,.14));
    box-shadow: 0 18px 48px -28px rgba(23,48,108,.4);
    color: var(--dsw-alias-label-primary, #101728);
  }
  .card h3 { margin: 0 0 4px; font-size: 15px; font-weight: 600; }
  .mock-svg { width: 100%; height: auto; display: block; }
  .tipwrap { position: absolute; left: 118px; top: 128px; }
  .lc-chart-tip { position: relative; display: flex; flex-direction: column; gap: 2px; }
  .tooltip-demo { margin-top: 22px; display: flex; gap: 18px; align-items: center; }
  .tooltip-demo .fake-btn {
    display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px;
    border-radius: 8px; border: .5px solid var(--dsg-hairline-soft, rgba(56,88,158,.14));
    background: var(--dsg-capsule, rgba(255,255,255,.5)); font-size: 13px;
  }
  [role="tooltip"] { display: inline-flex; align-items: center; gap: 6px; }
</style>
</head>
<body${dark ? ' data-ds-dark-theme' : ''}>
  <div class="card">
    <h3>上下文趋势</h3>
    <div class="mock-svgwrap">${svgChart}</div>
    <div class="tipwrap">
      <div class="lc-chart-tip">
        <span>第 4 轮 · 第 9 步（共 114 步）</span>
        <span>合计 ≈ 308.1k</span>
        <span>耗时 4.7s</span>
      </div>
    </div>
    <div class="tooltip-demo">
      <span class="fake-btn">悬停按钮<span style="color:#8b98b0">（示例）</span></span>
      <span role="tooltip">
        <span class="label">打开侧边栏</span>
        <span class="keys"><kbd>Ctrl</kbd><kbd>B</kbd></span>
      </span>
    </div>
  </div>
</body>
</html>`

fs.mkdirSync('.ref/tip-preview', { recursive: true })
fs.writeFileSync('.ref/tip-preview/light.html', page(false))
fs.writeFileSync('.ref/tip-preview/dark.html', page(true))
console.log('written .ref/tip-preview/light.html dark.html')
