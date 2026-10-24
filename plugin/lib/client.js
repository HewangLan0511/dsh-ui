// dsh-ui-deepseek — browser half.
// GENERATED FILE: edit src/client-template.js and src/styles/*.css, then run
// `node tools/build-plugin.mjs`. The build inlines the CSS bundle into `CSS`.
window.__ModuleLoader__.load({
  id: 'dsh-ui-deepseek',
  factory: function (require) {
    var module = { exports: {} }
    var exports = module.exports
    var React = require('react')
    var h = React.createElement
    var useState = React.useState
    var useEffect = React.useEffect

    var CSS = "\n/* ===== 00-foundation.css ===== */\n/* ============================================================================\n   dsh-ui-deepseek · 00 foundation\n   DeepSeek-web visual language: airy mist-blue canvas, hairline grid, soft\n   aurora glows, translucent surfaces, DeepSeek-blue accent.\n   All colours are token overrides on body so every shipped component follows.\n   ========================================================================== */\n\n/* ---- atmosphere layers -------------------------------------------------- */\nhtml[data-dsg='on'] body {\n  background-color: transparent !important;\n}\n\nhtml[data-dsg='on'] .dsg-atmosphere {\n  position: fixed;\n  inset: -12%;\n  z-index: -1;\n  pointer-events: none;\n  overflow: hidden;\n  background:\n    radial-gradient(120% 90% at 50% -10%, #ffffff 0%, rgba(255, 255, 255, 0) 62%),\n    linear-gradient(180deg, #eef5ff 0%, #f6f9ff 34%, #e9f0fe 72%, #f3f7ff 100%);\n}\n\n/* Aurora blobs: very large, very soft, permanently drifting a few px. */\nhtml[data-dsg='on'] .dsg-atmosphere .dsg-aurora {\n  position: absolute;\n  display: block;\n  border-radius: 50%;\n  filter: blur(70px);\n  opacity: 0.62;\n  will-change: transform;\n  animation: dsg-drift 26s ease-in-out infinite alternate;\n}\nhtml[data-dsg='on'] .dsg-atmosphere .dsg-aurora-a {\n  width: 58vw; height: 46vw;\n  left: -12vw; top: -10vw;\n  background: radial-gradient(circle at 40% 40%, rgba(120, 158, 255, 0.55), rgba(120, 158, 255, 0) 68%);\n}\nhtml[data-dsg='on'] .dsg-atmosphere .dsg-aurora-b {\n  width: 52vw; height: 44vw;\n  right: -14vw; top: 2vh;\n  background: radial-gradient(circle at 50% 50%, rgba(178, 203, 255, 0.55), rgba(178, 203, 255, 0) 70%);\n  animation-delay: -8s;\n  animation-duration: 32s;\n}\nhtml[data-dsg='on'] .dsg-atmosphere .dsg-aurora-c {\n  width: 70vw; height: 40vw;\n  left: 18vw; bottom: -22vw;\n  background: radial-gradient(circle at 50% 50%, rgba(205, 222, 255, 0.6), rgba(205, 222, 255, 0) 72%);\n  animation-delay: -15s;\n  animation-duration: 38s;\n}\n\n/* Faint engineering grid, faded out at the edges (matches deepseek.com). */\nhtml[data-dsg='on'] .dsg-atmosphere .dsg-grid {\n  position: absolute;\n  inset: 0;\n  background-image:\n    linear-gradient(to right, rgba(86, 118, 180, 0.055) 1px, transparent 1px),\n    linear-gradient(to bottom, rgba(86, 118, 180, 0.055) 1px, transparent 1px);\n  background-size: 88px 88px;\n  -webkit-mask-image: radial-gradient(120% 95% at 50% 32%, #000 30%, transparent 82%);\n  mask-image: radial-gradient(120% 95% at 50% 32%, #000 30%, transparent 82%);\n}\n\n/* Micro grain keeps large translucent fields from banding. */\nhtml[data-dsg='on'] .dsg-atmosphere .dsg-grain {\n  position: absolute;\n  inset: 0;\n  opacity: 0.16;\n  mix-blend-mode: soft-light;\n  background-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>\");\n}\n\n@keyframes dsg-drift {\n  from { transform: translate3d(0, 0, 0) scale(1); }\n  to   { transform: translate3d(1.6vw, -1.2vh, 0) scale(1.04); }\n}\n\n/* Dark palette: deep navy glass (DeepSeek night mode), same composition. */\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-atmosphere {\n  background:\n    radial-gradient(120% 90% at 50% -10%, rgba(45, 72, 140, 0.42) 0%, rgba(10, 14, 26, 0) 60%),\n    linear-gradient(180deg, #0a1020 0%, #0c1424 40%, #0a111f 75%, #0b1426 100%);\n}\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-atmosphere .dsg-aurora { opacity: 0.34; }\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-atmosphere .dsg-aurora-a {\n  background: radial-gradient(circle at 40% 40%, rgba(77, 107, 254, 0.5), rgba(77, 107, 254, 0) 68%);\n}\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-atmosphere .dsg-aurora-b {\n  background: radial-gradient(circle at 50% 50%, rgba(90, 130, 255, 0.32), rgba(90, 130, 255, 0) 70%);\n}\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-atmosphere .dsg-aurora-c {\n  background: radial-gradient(circle at 50% 50%, rgba(120, 90, 255, 0.26), rgba(120, 90, 255, 0) 72%);\n}\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-atmosphere .dsg-grid {\n  background-image:\n    linear-gradient(to right, rgba(150, 180, 255, 0.05) 1px, transparent 1px),\n    linear-gradient(to bottom, rgba(150, 180, 255, 0.05) 1px, transparent 1px);\n}\n\n/* ---- shared material knobs ---------------------------------------------- */\nhtml[data-dsg='on'] {\n  --dsg-blue: #4d6bfe;\n  --dsg-blue-strong: #3556f0;\n  --dsg-blue-soft: rgba(77, 107, 254, 0.14);\n  --dsg-blue-ring: rgba(77, 107, 254, 0.42);\n  --dsg-glass-blur: calc(20px * var(--dsg-blur, 1));\n  --dsg-card-blur: calc(26px * var(--dsg-blur, 1));\n  --dsg-overlay-blur: calc(34px * var(--dsg-blur, 1));\n  --dsg-sat: 1.7;\n  --dsg-brightness: 1.04;\n  --dsg-radius-card: 20px;\n  --dsg-radius-modal: 24px;\n  --dsg-radius-composer: 28px;\n  --dsg-motion-dur: 180ms;\n  --dsg-ease: cubic-bezier(0.22, 0.61, 0.36, 1);\n}\nhtml[data-dsg='on'][data-dsg-atmosphere='off'] .dsg-atmosphere { display: none; }\n\n/* ---- light token layer --------------------------------------------------- */\nhtml[data-dsg='on'] body {\n  /* canvas + raised surfaces */\n  --dsw-alias-bg-base: transparent;\n  --dsw-alias-bg-layer-1: rgba(255, 255, 255, calc(0.56 * var(--dsg-glass, 1)));\n  --dsw-alias-bg-layer-2: rgba(255, 255, 255, calc(0.66 * var(--dsg-glass, 1)));\n  --dsw-alias-bg-layer-3: rgba(255, 255, 255, calc(0.76 * var(--dsg-glass, 1)));\n  --dsw-alias-bg-overlay: rgba(248, 251, 255, calc(0.82 * var(--dsg-glass, 1)));\n  --dsw-alias-bg-module-platform: rgba(255, 255, 255, calc(0.5 * var(--dsg-glass, 1)));\n  --dsw-alias-bg-multi-select: rgba(255, 255, 255, calc(0.42 * var(--dsg-glass, 1)));\n\n  /* specific surfaces */\n  --dsw-specific-sidebar-fill: rgba(255, 255, 255, calc(0.34 * var(--dsg-glass, 1)));\n  --dsw-specific-input-major: rgba(255, 255, 255, calc(0.62 * var(--dsg-glass, 1)));\n  --dsw-specific-bubble: rgba(236, 242, 255, calc(0.62 * var(--dsg-glass, 1)));\n  --dsw-specific-menu: rgba(248, 251, 255, calc(0.7 * var(--dsg-glass, 1)));\n  --dsw-menu-surface-fill: rgba(248, 251, 255, calc(0.68 * var(--dsg-glass, 1)));\n  --dsw-alias-menu-group-header-fill: rgba(248, 251, 255, calc(0.9 * var(--dsg-glass, 1)));\n  --dsw-specific-selector: rgba(255, 255, 255, calc(0.55 * var(--dsg-glass, 1)));\n  --dsw-specific-tip: rgba(255, 255, 255, calc(0.62 * var(--dsg-glass, 1)));\n  --dsw-specific-sidebar-nav-item-active: rgba(255, 255, 255, calc(0.54 * var(--dsg-glass, 1)));\n  --dsw-specific-sidebar-nav-item-hover: rgba(255, 255, 255, calc(0.34 * var(--dsg-glass, 1)));\n  --dsw-specific-sidebar-nav-item-active-accent: var(--dsg-blue-soft);\n\n  /* borders: blue-grey hairlines instead of neutral black */\n  --dsw-alias-border-l1: rgba(56, 88, 158, 0.1);\n  --dsw-alias-border-l2: rgba(56, 88, 158, 0.16);\n  --dsw-alias-border-l3: rgba(56, 88, 158, 0.2);\n  --dsw-alias-border-l4: rgba(56, 88, 158, 0.26);\n  --dsw-elevation-stroke-color: rgba(56, 88, 158, 0.18);\n\n  /* DeepSeek blue is already the brand; align interaction states to it */\n  --dsw-alias-state-business-primary: var(--dsg-blue);\n  --dsw-alias-link: var(--dsg-blue);\n  --dsw-alias-brand-primary-new-colorprimary-new-color: var(--dsg-blue);\n  --dsw-alias-interactive-bg-hover: rgba(77, 107, 254, 0.07);\n  --dsw-alias-interactive-bg-active: rgba(77, 107, 254, 0.12);\n  --dsw-alias-interactive-bg-hover-accent: var(--dsg-blue-soft);\n  --dsw-alias-state-business-tertiary: rgba(77, 107, 254, 0.1);\n\n  /* content surfaces */\n  --dsw-alias-markdown-code-block: rgba(255, 255, 255, calc(0.58 * var(--dsg-glass, 1)));\n  --dsw-alias-markdown-code-block-banner: rgba(245, 249, 255, calc(0.7 * var(--dsg-glass, 1)));\n  --dsw-alias-markdown-inline-code: rgba(77, 107, 254, 0.08);\n  --dsw-alias-markdown-citation: rgba(255, 255, 255, calc(0.5 * var(--dsg-glass, 1)));\n  --dsw-alias-markdown-tag: rgba(77, 107, 254, 0.08);\n  --dsw-alias-turn-trigger-bg: rgba(255, 255, 255, calc(0.5 * var(--dsg-glass, 1)));\n  --dsw-alias-turn-trigger-bg-hover: rgba(255, 255, 255, calc(0.66 * var(--dsg-glass, 1)));\n  --dsw-alias-settings-card-fill: rgba(255, 255, 255, calc(0.56 * var(--dsg-glass, 1)));\n  --dsw-alias-settings-card-stroke: rgba(56, 88, 158, 0.16);\n\n  /* menus: DeepSeek uses a real frosted menu */\n  --dsw-menu-backdrop-filter: blur(var(--dsg-card-blur)) saturate(var(--dsg-sat));\n\n  /* shadows: diffuse blue-tinted daylight instead of black */\n  --dsw-shadow-lv1: 0 2px 6px rgba(44, 74, 140, 0.06);\n  --dsw-shadow-lv2: 0 6px 18px rgba(44, 74, 140, 0.08);\n  --dsw-shadow-lv3: 0 18px 48px rgba(44, 74, 140, 0.12);\n  --dsw-elevation-panel: var(--dsw-elevation-stroke), 0 6px 20px rgba(44, 74, 140, 0.08), 0 0 24px rgba(44, 74, 140, 0.04);\n  --dsw-elevation-prominent: var(--dsw-elevation-stroke), 0 10px 34px rgba(44, 74, 140, 0.12), 0 0 30px rgba(44, 74, 140, 0.06);\n  --dsw-elevation-soft: var(--dsw-elevation-stroke), 0 8px 28px rgba(44, 74, 140, 0.08), 0 0 28px rgba(44, 74, 140, 0.05);\n\n  /* darker secondary text keeps contrast over glass */\n  --dsw-alias-label-primary: #16202f;\n  --dsw-alias-label-secondary: #4d5b73;\n  --dsw-alias-label-tertiary: #6b7a93;\n  --dsw-alias-label-caption: #8391a8;\n}\n\n/* ---- dark token layer ---------------------------------------------------- */\nhtml[data-dsg='on'] body[data-ds-dark-theme] {\n  --dsw-alias-bg-layer-1: rgba(22, 33, 58, calc(0.6 * var(--dsg-glass, 1)));\n  --dsw-alias-bg-layer-2: rgba(26, 38, 66, calc(0.68 * var(--dsg-glass, 1)));\n  --dsw-alias-bg-layer-3: rgba(30, 44, 76, calc(0.76 * var(--dsg-glass, 1)));\n  --dsw-alias-bg-overlay: rgba(20, 30, 54, calc(0.86 * var(--dsg-glass, 1)));\n  --dsw-alias-bg-module-platform: rgba(22, 33, 58, calc(0.5 * var(--dsg-glass, 1)));\n  --dsw-alias-bg-multi-select: rgba(28, 40, 68, calc(0.46 * var(--dsg-glass, 1)));\n\n  --dsw-specific-sidebar-fill: rgba(14, 22, 40, calc(0.4 * var(--dsg-glass, 1)));\n  --dsw-specific-input-major: rgba(24, 36, 62, calc(0.66 * var(--dsg-glass, 1)));\n  --dsw-specific-bubble: rgba(38, 54, 92, calc(0.62 * var(--dsg-glass, 1)));\n  --dsw-specific-menu: rgba(20, 30, 52, calc(0.76 * var(--dsg-glass, 1)));\n  --dsw-menu-surface-fill: rgba(20, 30, 52, calc(0.72 * var(--dsg-glass, 1)));\n  --dsw-alias-menu-group-header-fill: rgba(20, 30, 52, calc(0.92 * var(--dsg-glass, 1)));\n  --dsw-specific-selector: rgba(28, 40, 68, calc(0.6 * var(--dsg-glass, 1)));\n  --dsw-specific-tip: rgba(24, 36, 62, calc(0.66 * var(--dsg-glass, 1)));\n  --dsw-specific-sidebar-nav-item-active: rgba(255, 255, 255, calc(0.08 * var(--dsg-glass, 1)));\n  --dsw-specific-sidebar-nav-item-hover: rgba(255, 255, 255, calc(0.05 * var(--dsg-glass, 1)));\n  --dsw-specific-sidebar-nav-item-active-accent: rgba(77, 107, 254, 0.26);\n\n  --dsw-alias-border-l1: rgba(150, 180, 255, 0.1);\n  --dsw-alias-border-l2: rgba(150, 180, 255, 0.16);\n  --dsw-alias-border-l3: rgba(150, 180, 255, 0.22);\n  --dsw-alias-border-l4: rgba(150, 180, 255, 0.28);\n  --dsw-elevation-stroke-color: rgba(150, 180, 255, 0.2);\n\n  --dsw-alias-markdown-code-block: rgba(12, 20, 36, calc(0.55 * var(--dsg-glass, 1)));\n  --dsw-alias-markdown-code-block-banner: rgba(20, 30, 52, calc(0.7 * var(--dsg-glass, 1)));\n  --dsw-alias-markdown-inline-code: rgba(120, 150, 255, 0.14);\n  --dsw-alias-markdown-citation: rgba(24, 36, 62, calc(0.5 * var(--dsg-glass, 1)));\n  --dsw-alias-markdown-tag: rgba(120, 150, 255, 0.14);\n  --dsw-alias-turn-trigger-bg: rgba(26, 38, 66, calc(0.5 * var(--dsg-glass, 1)));\n  --dsw-alias-turn-trigger-bg-hover: rgba(30, 44, 76, calc(0.68 * var(--dsg-glass, 1)));\n  --dsw-alias-settings-card-fill: rgba(22, 33, 58, calc(0.6 * var(--dsg-glass, 1)));\n  --dsw-alias-settings-card-stroke: rgba(150, 180, 255, 0.18);\n\n  --dsw-alias-label-primary: #eef3ff;\n  --dsw-alias-label-secondary: #b9c6df;\n  --dsw-alias-label-tertiary: #93a3c0;\n  --dsw-alias-label-caption: #7d8da9;\n}\n\n/* ---- global texture: selection, focus, scrollbar ------------------------- */\nhtml[data-dsg='on'] ::selection {\n  background: rgba(77, 107, 254, 0.22);\n}\nhtml[data-dsg='on'] body :focus-visible:not(:read-write) {\n  outline-color: var(--dsg-blue-ring) !important;\n}\nhtml[data-dsg='on'] * {\n  scrollbar-color: rgba(77, 107, 254, 0.28) transparent;\n}\nhtml[data-dsg='on'] ::-webkit-scrollbar-thumb {\n  background: rgba(77, 107, 254, 0.24) !important;\n  border-radius: 999px;\n}\nhtml[data-dsg='on'] ::-webkit-scrollbar-thumb:hover {\n  background: rgba(77, 107, 254, 0.38) !important;\n}\n\n/* ===== 95-settings-panel.css ===== */\n/* ============================================================================\n   95 plugin settings panel (rendered inside Settings → settings.section)\n   Uses its own .dsg-* vocabulary so it never collides with shipped UI.\n   ========================================================================== */\nhtml[data-dsg='on'] .dsg-settings {\n  display: flex;\n  flex-direction: column;\n  gap: 18px;\n  max-width: 760px;\n  color: var(--dsw-alias-label-primary);\n}\nhtml[data-dsg='on'] .dsg-settings-head {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\nhtml[data-dsg='on'] .dsg-settings-title {\n  font-size: 15px;\n  font-weight: 600;\n  letter-spacing: 0.01em;\n}\nhtml[data-dsg='on'] .dsg-settings-sub {\n  font-size: 12px;\n  line-height: 1.6;\n  color: var(--dsw-alias-label-tertiary);\n}\nhtml[data-dsg='on'] .dsg-settings-body {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  padding: 8px 18px;\n  border-radius: var(--dsg-radius-card);\n  background: rgba(255, 255, 255, calc(0.5 * var(--dsg-glass, 1)));\n  border: 1px solid var(--dsw-alias-border-l2);\n  -webkit-backdrop-filter: blur(var(--dsg-card-blur)) saturate(var(--dsg-sat));\n  backdrop-filter: blur(var(--dsg-card-blur)) saturate(var(--dsg-sat));\n  box-shadow:\n    inset 0 1px 0 rgba(255, 255, 255, 0.55),\n    0 10px 30px rgba(44, 74, 140, 0.08);\n}\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-settings-body {\n  background: rgba(22, 33, 58, calc(0.6 * var(--dsg-glass, 1)));\n  box-shadow:\n    inset 0 1px 0 rgba(255, 255, 255, 0.08),\n    0 14px 36px rgba(0, 0, 0, 0.32);\n}\nhtml[data-dsg='on'] .dsg-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 20px;\n  padding: 14px 0;\n  border-bottom: 1px solid var(--dsw-alias-border-l1);\n}\nhtml[data-dsg='on'] .dsg-row:last-child {\n  border-bottom: 0;\n}\nhtml[data-dsg='on'] .dsg-row-text {\n  min-width: 0;\n}\nhtml[data-dsg='on'] .dsg-row-label {\n  font-size: 13px;\n  font-weight: 500;\n}\nhtml[data-dsg='on'] .dsg-row-hint {\n  margin-top: 3px;\n  font-size: 11px;\n  color: var(--dsw-alias-label-tertiary);\n}\nhtml[data-dsg='on'] .dsg-row-control {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  flex: 0 0 auto;\n}\nhtml[data-dsg='on'] .dsg-slider {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\nhtml[data-dsg='on'] .dsg-slider input[type='range'] {\n  width: 148px;\n  accent-color: var(--dsg-blue);\n}\nhtml[data-dsg='on'] .dsg-slider-value {\n  width: 40px;\n  font-size: 12px;\n  font-variant-numeric: tabular-nums;\n  color: var(--dsw-alias-label-secondary);\n  text-align: right;\n}\nhtml[data-dsg='on'] .dsg-seg {\n  display: inline-flex;\n  padding: 3px;\n  gap: 2px;\n  border-radius: 999px;\n  background: rgba(77, 107, 254, 0.07);\n  border: 1px solid var(--dsw-alias-border-l1);\n}\nhtml[data-dsg='on'] .dsg-seg-btn {\n  border: 0;\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 1;\n  padding: 7px 13px;\n  border-radius: 999px;\n  cursor: pointer;\n  transition: background var(--dsg-motion-dur) var(--dsg-ease), color var(--dsg-motion-dur) var(--dsg-ease);\n}\nhtml[data-dsg='on'] .dsg-seg-btn:hover {\n  color: var(--dsw-alias-label-primary);\n  background: rgba(255, 255, 255, 0.5);\n}\nhtml[data-dsg='on'] .dsg-seg-btn.is-on {\n  color: var(--dsg-blue);\n  background: #fff;\n  box-shadow: 0 2px 8px rgba(44, 74, 140, 0.12);\n}\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-seg-btn.is-on {\n  background: rgba(77, 107, 254, 0.28);\n  color: #dce6ff;\n}\nhtml[data-dsg='on'] .dsg-switch {\n  position: relative;\n  width: 44px;\n  height: 26px;\n  padding: 0;\n  border-radius: 999px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: rgba(120, 140, 180, 0.22);\n  cursor: pointer;\n  transition: background var(--dsg-motion-dur) var(--dsg-ease);\n}\nhtml[data-dsg='on'] .dsg-switch .dsg-switch-thumb {\n  position: absolute;\n  top: 3px;\n  left: 3px;\n  width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  background: #fff;\n  box-shadow: 0 1px 4px rgba(20, 40, 90, 0.24);\n  transition: transform var(--dsg-motion-dur) var(--dsg-ease);\n}\nhtml[data-dsg='on'] .dsg-switch.is-on {\n  background: var(--dsg-blue);\n  border-color: transparent;\n}\nhtml[data-dsg='on'] .dsg-switch.is-on .dsg-switch-thumb {\n  transform: translateX(18px);\n}\nhtml[data-dsg='on'] .dsg-settings-foot {\n  display: flex;\n  justify-content: flex-end;\n  padding: 12px 0 10px;\n}\nhtml[data-dsg='on'] .dsg-btn {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: rgba(255, 255, 255, 0.6);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  padding: 8px 16px;\n  border-radius: 999px;\n  cursor: pointer;\n  transition: all var(--dsg-motion-dur) var(--dsg-ease);\n}\nhtml[data-dsg='on'] .dsg-btn:hover {\n  color: var(--dsg-blue);\n  border-color: var(--dsg-blue-ring);\n  background: #fff;\n}\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-btn {\n  background: rgba(255, 255, 255, 0.06);\n}\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-btn:hover {\n  background: rgba(77, 107, 254, 0.22);\n  color: #dce6ff;\n}\n"

    var STORAGE_KEY = 'dsh-ui-deepseek/config'
    var DEFAULTS = {
      glass: 1,        // 0..1 surface opacity multiplier (1 = theme default)
      blur: 1,         // 0..1 blur radius multiplier
      atmosphere: 'aurora', // aurora | mist | off
      motion: true
    }

    var state = {
      config: null,
      bgEl: null,
      rootAttrSet: false
    }
    var listeners = []
    function emit() {
      for (var i = 0; i < listeners.length; i++) {
        try { listeners[i]() } catch (e) { /* non-fatal */ }
      }
    }
    function subscribe(fn) {
      listeners.push(fn)
      return function () {
        listeners = listeners.filter(function (l) { return l !== fn })
      }
    }

    function clamp01(v) {
      var n = Number(v)
      if (!Number.isFinite(n)) return 0
      return Math.max(0, Math.min(1, n))
    }
    function normalize(raw) {
      var src = raw && typeof raw === 'object' ? raw : {}
      var c = {}
      c.glass = clamp01(src.glass === undefined ? DEFAULTS.glass : src.glass)
      c.blur = clamp01(src.blur === undefined ? DEFAULTS.blur : src.blur)
      c.atmosphere = (src.atmosphere === 'mist' || src.atmosphere === 'off') ? src.atmosphere : 'aurora'
      c.motion = src.motion === undefined ? DEFAULTS.motion : !!src.motion
      return c
    }
    function load() {
      try {
        var raw = window.localStorage.getItem(STORAGE_KEY)
        return normalize(raw ? JSON.parse(raw) : null)
      } catch (e) { return normalize(null) }
    }
    function save(c) {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c)) } catch (e) { /* non-fatal */ }
    }

    function applyAtmosphere(c) {
      if (typeof document === 'undefined') return
      var html = document.documentElement
      html.setAttribute('data-dsg', 'on')
      html.setAttribute('data-dsg-atmosphere', c.atmosphere)
      state.rootAttrSet = true
      if (c.atmosphere === 'off') {
        if (state.bgEl) { state.bgEl.remove(); state.bgEl = null }
        return
      }
      if (!state.bgEl) {
        var el = document.createElement('div')
        el.className = 'dsg-atmosphere'
        el.setAttribute('aria-hidden', 'true')
        el.innerHTML = '<i class="dsg-aurora dsg-aurora-a"></i><i class="dsg-aurora dsg-aurora-b"></i><i class="dsg-aurora dsg-aurora-c"></i><i class="dsg-grid"></i><i class="dsg-grain"></i>'
        var root = document.getElementById('root')
        if (root && root.parentNode) root.parentNode.insertBefore(el, root)
        else document.body.insertBefore(el, document.body.firstChild)
        state.bgEl = el
      }
    }

    function applyVars(c) {
      if (typeof document === 'undefined') return
      var root = document.documentElement
      // 0..1 multipliers consumed by the stylesheet (calc() based).
      root.style.setProperty('--dsg-glass', String(c.glass))
      root.style.setProperty('--dsg-blur', String(c.blur))
      root.style.setProperty('--dsg-motion', c.motion ? '1' : '0')
    }

    function applyConfig(c) {
      applyAtmosphere(c)
      applyVars(c)
    }

    function commit(next, persist) {
      state.config = next
      applyConfig(next)
      if (persist !== false) save(next)
      emit()
    }

    function patch(p) {
      commit(normalize(Object.assign({}, state.config || DEFAULTS, p)))
    }

    // ---- settings section (deepseek web styled by the global sheet) ----
    var zh = (function () {
      try { return String(document.documentElement.lang || navigator.language || '').toLowerCase().indexOf('zh') === 0 }
      catch (e) { return false }
    })()
    function T(zhText, enText) { return zh ? zhText : enText }

    function Row(props) {
      return h('div', { className: 'dsg-row' }, [
        h('div', { className: 'dsg-row-text', key: 't' }, [
          h('div', { className: 'dsg-row-label', key: 'l' }, props.label),
          props.hint ? h('div', { className: 'dsg-row-hint', key: 'h' }, props.hint) : null
        ]),
        h('div', { className: 'dsg-row-control', key: 'c' }, props.children)
      ])
    }

    function Slider(props) {
      return h('div', { className: 'dsg-slider' }, [
        h('input', {
          key: 'i', type: 'range', min: '0', max: '100', step: '1',
          value: String(Math.round(props.value * 100)),
          onChange: function (e) { props.onChange(Number(e.target.value) / 100) }
        }),
        h('span', { key: 'v', className: 'dsg-slider-value' }, Math.round(props.value * 100) + '%')
      ])
    }

    function SettingsPanel() {
      var cfgState = useState(state.config || DEFAULTS)
      var config = cfgState[0]
      var setConfig = cfgState[1]
      useEffect(function () {
        return subscribe(function () { setConfig(state.config || DEFAULTS) })
      }, [])
      return h('div', { className: 'dsg-settings' }, [
        h('div', { className: 'dsg-settings-head', key: 'head' }, [
          h('div', { className: 'dsg-settings-title', key: 't' }, T('DeepSeek 玻璃外观', 'DeepSeek glass appearance')),
          h('div', { className: 'dsg-settings-sub', key: 's' }, T('透明氛围背景 + 分级液态玻璃；设置即时生效并保存在本机。', 'Ambient translucent background with tiered liquid glass. Changes apply instantly and persist on this device.'))
        ]),
        h('div', { className: 'dsg-settings-body', key: 'body' }, [
          h(Row, { key: 'atmo', label: T('氛围背景', 'Ambient background'), hint: T('极光云雾 / 轻雾 / 关闭（露出壁纸或纯色）', 'Aurora mist / soft mist / off') }, h('div', { className: 'dsg-seg' }, ['aurora', 'mist', 'off'].map(function (v) {
            return h('button', {
              key: v,
              type: 'button',
              className: 'dsg-seg-btn' + (config.atmosphere === v ? ' is-on' : ''),
              onClick: function () { patch({ atmosphere: v }) }
            }, v === 'aurora' ? T('极光', 'Aurora') : v === 'mist' ? T('轻雾', 'Mist') : T('关闭', 'Off'))
          }))),
          h(Row, { key: 'glass', label: T('玻璃透明度', 'Glass transparency'), hint: T('数值越低越通透（文字可读性由分级加雾保底）', 'Lower is clearer; readability floors protect text') }, h(Slider, { value: config.glass, onChange: function (v) { patch({ glass: v }) } })),
          h(Row, { key: 'blur', label: T('模糊强度', 'Blur strength'), hint: T('卡面/弹窗的背景模糊倍率', 'Backdrop blur multiplier for cards and popups') }, h(Slider, { value: config.blur, onChange: function (v) { patch({ blur: v }) } })),
          h(Row, { key: 'motion', label: T('动效', 'Motion'), hint: T('悬浮抬升、柔光过渡', 'Hover lift and soft transitions') }, h('button', {
            type: 'button', className: 'dsg-switch' + (config.motion ? ' is-on' : ''),
            onClick: function () { patch({ motion: !config.motion }) }
          }, h('span', { className: 'dsg-switch-thumb' }))),
          h('div', { key: 'reset', className: 'dsg-settings-foot' }, h('button', {
            type: 'button', className: 'dsg-btn',
            onClick: function () { commit(normalize(null)) }
          }, T('恢复默认', 'Reset to defaults')))
        ])
      ])
    }

    function apply(ctx) {
      // 1. global stylesheet, owned by this plugin (removed on unload/HMR)
      try {
        ctx.effect(function () {
          var tag = document.createElement('style')
          tag.setAttribute('data-plugin', 'dsh-ui-deepseek')
          tag.setAttribute('data-plugin-css', 'dsh-ui-deepseek/glass')
          tag.textContent = CSS
          document.head.appendChild(tag)
          return function () { tag.remove() }
        }, 'dsh-ui-deepseek: stylesheet')
      } catch (e) { /* non-fatal */ }

      // 2. atmosphere layer + root attributes
      try {
        ctx.effect(function () {
          state.config = load()
          applyConfig(state.config)
          return function () {
            if (state.bgEl) { state.bgEl.remove(); state.bgEl = null }
            var html = document.documentElement
            html.removeAttribute('data-dsg')
            html.removeAttribute('data-dsg-atmosphere')
            html.style.removeProperty('--dsg-glass')
            html.style.removeProperty('--dsg-blur')
            html.style.removeProperty('--dsg-motion')
          }
        }, 'dsh-ui-deepseek: atmosphere')
      } catch (e) { /* non-fatal */ }

      // 3. settings page section
      var slots = ctx.get('slots')
      if (slots) {
        try {
          slots.inject('settings.section', function () {
            return slots.register(
              { name: 'settings.section', id: 'dsh-ui-deepseek', order: 60, label: T('外观 · DeepSeek', 'Appearance · DeepSeek') },
              function () { return h(SettingsPanel, {}) }
            )
          })
        } catch (e) { /* non-fatal */ }
      }
    }

    exports.inject = ['slots', 'theme']
    exports.apply = apply
    return module.exports
  }
})
