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

    var CSS = "\n/* ===== 00-foundation.css ===== */\n/* ============================================================================\n   dsh-ui-deepseek · 00 foundation + glass engine\n   DeepSeek-web visual language on top of the DSH `--dsw-*` token system.\n\n   Glass engine ported from wallpaper-engine's 5-layer recipe (see\n   docs/GLASS-SPEC.md):\n     ① fill (token) ② top specular sheen ③ backdrop-filter frost\n     ④ inset bevel + hairline ⑤ soft outer elevation\n   Fill maths (color-mix, premultiplied):\n     effAlpha = floor + a * (1 - floor)      floor = theme readability floor\n\n   Tiers:\n     L1 content surfaces  · light fill, small frost\n     L2 cards / bubbles   · medium fill + frost   (readability uplift)\n     L3 popups / details  · strong fill + strong frost (readability uplift)\n   ========================================================================== */\n\nhtml[data-dsg='on'] {\n  /* ---- engine sources (shared) ------------------------------------------ */\n  --dsg-sat: 1.3;\n  --dsg-bright: 1.04;\n  --dsg-contrast: 1.01;\n  --dsg-fidelity: 0.55;\n  --dsg-floor-base-light: 0.45;\n  --dsg-floor-base-dark: 0.59;\n  --dsg-floor: calc(var(--dsg-floor-base-light) * var(--dsg-fidelity));\n  /* L3 (popups / details / settings) never drops below the wallpaper-safe\n     floor: readable text is the point of the extra frost. */\n  --dsg-floor-l3: var(--dsg-floor-base-light);\n\n  --dsg-a1: 0.06;\n  --dsg-a2: 0.20;\n  --dsg-a3: 0.72;\n\n  /* blur ladder: wallpaper-engine's 8px anchor, then readability uplift for\n     cards and popups (user requirement: more frost on cards/popups/details). */\n  --dsg-blur-l1: calc(6px * var(--dsg-blur, 1));\n  --dsg-blur-l2: calc(16px * var(--dsg-blur, 1));\n  --dsg-blur-l3: calc(24px * var(--dsg-blur, 1));\n\n  --dsg-motion: 1;\n\n  --dsg-radius-card: 20px;\n  --dsg-radius-modal: 24px;\n  --dsg-radius-composer: 28px;\n  --dsg-motion-dur: calc(180ms * var(--dsg-motion));\n  --dsg-ease: cubic-bezier(0.22, 0.61, 0.36, 1);\n\n  --dsg-blue: #4d6bfe;\n  --dsg-blue-strong: #3556f0;\n  --dsg-blue-soft: rgba(77, 107, 254, 0.12);\n  --dsg-blue-ring: rgba(77, 107, 254, 0.45);\n}\n\n/* ---- atmosphere ---------------------------------------------------------- */\n/* Static layered mist from docs/DESIGN-SPEC §6.1 (measured from deepseek.com),\n   plus three very faint drifting light pools for depth. */\nhtml[data-dsg='on'] body {\n  background-color: transparent !important;\n}\nhtml[data-dsg='on'] .dsg-atmosphere {\n  position: fixed;\n  inset: 0;\n  z-index: -1;\n  pointer-events: none;\n  overflow: hidden;\n  background-color: #f4f7fc;\n  background-image:\n    radial-gradient(120% 62% at 50% -14%, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.55) 42%, rgba(255, 255, 255, 0) 68%),\n    radial-gradient(46% 40% at 71% 1%, rgba(120, 152, 219, 0.58) 0%, rgba(120, 152, 219, 0.2) 55%, rgba(120, 152, 219, 0) 78%),\n    radial-gradient(40% 42% at 28% 50%, rgba(146, 178, 230, 0.55) 0%, rgba(146, 178, 230, 0.22) 58%, rgba(146, 178, 230, 0) 82%),\n    radial-gradient(52% 46% at 100% 62%, rgba(196, 213, 238, 0.4) 0%, rgba(196, 213, 238, 0) 72%),\n    radial-gradient(100% 46% at 50% 112%, rgba(248, 247, 248, 0.98) 0%, rgba(248, 247, 248, 0.7) 40%, rgba(248, 247, 248, 0) 70%),\n    linear-gradient(178deg, #fbfcfe 0%, #eef4fb 24%, #e3ecf7 46%, #dfe9f6 58%, #e9eff7 74%, #f4f4f5 90%, #f8f7f8 100%);\n  background-repeat: no-repeat;\n}\nhtml[data-dsg='on'] .dsg-atmosphere .dsg-aurora {\n  position: absolute;\n  display: block;\n  border-radius: 50%;\n  filter: blur(90px);\n  opacity: 0.5;\n  will-change: transform;\n  animation: dsg-drift 34s ease-in-out infinite alternate;\n}\nhtml[data-dsg='on'] .dsg-atmosphere .dsg-aurora-a {\n  width: 46vw; height: 38vw; left: -10vw; top: -12vw;\n  background: radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0) 70%);\n}\nhtml[data-dsg='on'] .dsg-atmosphere .dsg-aurora-b {\n  width: 40vw; height: 34vw; right: -10vw; top: 6vh;\n  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0) 72%);\n  animation-delay: -12s; animation-duration: 42s;\n}\nhtml[data-dsg='on'] .dsg-atmosphere .dsg-aurora-c {\n  width: 56vw; height: 30vw; left: 22vw; bottom: -18vw;\n  background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0) 72%);\n  animation-delay: -20s; animation-duration: 48s;\n}\nhtml[data-dsg='on'] .dsg-atmosphere .dsg-grid {\n  position: absolute; inset: 0;\n  background-image:\n    linear-gradient(to right, rgba(59, 91, 148, 0.045) 1px, transparent 1px),\n    linear-gradient(to bottom, rgba(59, 91, 148, 0.045) 1px, transparent 1px);\n  background-size: 75px 75px;\n  background-position: 56px 56px;\n  -webkit-mask-image: radial-gradient(120% 95% at 50% 32%, #000 30%, transparent 82%);\n  mask-image: radial-gradient(120% 95% at 50% 32%, #000 30%, transparent 82%);\n}\nhtml[data-dsg='on'] .dsg-atmosphere .dsg-grain {\n  position: absolute; inset: 0; opacity: 0.12; mix-blend-mode: soft-light;\n  background-image: url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>\");\n}\n@keyframes dsg-drift {\n  from { transform: translate3d(0, 0, 0) scale(1); }\n  to   { transform: translate3d(1.4vw, -1vh, 0) scale(1.03); }\n}\nhtml[data-dsg-atmosphere='mist'] .dsg-atmosphere .dsg-aurora { opacity: 0.25; }\nhtml[data-dsg-atmosphere='off'] .dsg-atmosphere { display: none; }\n\n/* Dark palette atmosphere */\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-atmosphere {\n  background-color: #0a1020;\n  background-image:\n    radial-gradient(120% 64% at 50% -14%, rgba(88, 122, 200, 0.34) 0%, rgba(10, 14, 26, 0) 64%),\n    radial-gradient(46% 40% at 72% 2%, rgba(77, 107, 254, 0.28) 0%, rgba(77, 107, 254, 0) 76%),\n    radial-gradient(42% 44% at 24% 54%, rgba(90, 130, 255, 0.16) 0%, rgba(90, 130, 255, 0) 78%),\n    radial-gradient(52% 46% at 100% 62%, rgba(120, 90, 255, 0.12) 0%, rgba(120, 90, 255, 0) 74%),\n    linear-gradient(178deg, #0c1322 0%, #0b1426 34%, #0a111f 62%, #0c1524 100%);\n}\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-atmosphere .dsg-aurora { opacity: 0.22; }\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-atmosphere .dsg-aurora-a {\n  background: radial-gradient(circle at 40% 40%, rgba(77, 107, 254, 0.45), rgba(77, 107, 254, 0) 68%);\n}\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-atmosphere .dsg-aurora-b {\n  background: radial-gradient(circle at 50% 50%, rgba(90, 130, 255, 0.3), rgba(90, 130, 255, 0) 70%);\n}\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-atmosphere .dsg-aurora-c {\n  background: radial-gradient(circle at 50% 50%, rgba(120, 90, 255, 0.24), rgba(120, 90, 255, 0) 72%);\n}\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-atmosphere .dsg-grid {\n  background-image:\n    linear-gradient(to right, rgba(150, 180, 255, 0.045) 1px, transparent 1px),\n    linear-gradient(to bottom, rgba(150, 180, 255, 0.045) 1px, transparent 1px);\n}\n\n/* ---- glass engine · light ------------------------------------------------ */\nhtml[data-dsg='on'] body {\n  --dsg-tint: #ffffff;\n  --dsg-tint-rgb: 255 255 255;\n\n  /* three tier fills: effAlpha = floor + a * (1 - floor) */\n  --dsg-fill-l1: color-mix(in srgb,\n      var(--dsg-tint) calc(var(--dsg-floor) * 100%),\n      color-mix(in srgb, var(--dsg-tint) calc(var(--dsg-a1) * 100%), transparent) calc((1 - var(--dsg-floor)) * 100%));\n  --dsg-fill-l2: color-mix(in srgb,\n      var(--dsg-tint) calc(var(--dsg-floor) * 100%),\n      color-mix(in srgb, var(--dsg-tint) calc(var(--dsg-a2) * 100%), transparent) calc((1 - var(--dsg-floor)) * 100%));\n  --dsg-fill-l3: color-mix(in srgb,\n      var(--dsg-tint) calc(var(--dsg-floor-l3) * 100%),\n      color-mix(in srgb, var(--dsg-tint) calc(var(--dsg-a3) * 100%), transparent) calc((1 - var(--dsg-floor-l3)) * 100%));\n\n  /* frost */\n  --dsg-backdrop-l1: blur(var(--dsg-blur-l1)) saturate(var(--dsg-sat)) brightness(var(--dsg-bright)) contrast(var(--dsg-contrast));\n  --dsg-backdrop-l2: blur(var(--dsg-blur-l2)) saturate(var(--dsg-sat)) brightness(var(--dsg-bright)) contrast(var(--dsg-contrast));\n  --dsg-backdrop-l3: blur(var(--dsg-blur-l3)) saturate(var(--dsg-sat)) brightness(var(--dsg-bright)) contrast(var(--dsg-contrast));\n  --dsg-backdrop-panel: blur(calc(10px * var(--dsg-blur, 1))) saturate(1.2) brightness(var(--dsg-bright));\n\n  /* specular sheen */\n  --dsg-sheen-l1: linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03) 38%, rgba(255, 255, 255, 0.02));\n  --dsg-sheen-l2: linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.05) 38%, rgba(255, 255, 255, 0.02));\n  --dsg-sheen-l3: linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.05) 38%, rgba(255, 255, 255, 0.03));\n\n  /* bevel + elevation */\n  --dsg-bevel-l1:\n    inset 0 1px 0 rgba(255, 255, 255, 0.45),\n    inset 0 -1px 0 rgba(255, 255, 255, 0.08),\n    inset 0 0 0 0.5px rgba(255, 255, 255, 0.16),\n    0 8px 26px rgba(44, 74, 140, 0.08);\n  --dsg-bevel-l2:\n    inset 0 1px 0 rgba(255, 255, 255, 0.6),\n    inset 0 -1px 0 rgba(255, 255, 255, 0.1),\n    inset 0 0 0 0.5px rgba(255, 255, 255, 0.22),\n    0 14px 44px rgba(44, 74, 140, 0.12);\n  --dsg-bevel-l3:\n    inset 0 1px 0 rgba(255, 255, 255, 0.7),\n    inset 0 0 0 1px rgba(255, 255, 255, 0.28),\n    0 24px 80px rgba(23, 48, 108, 0.2);\n\n  --dsg-border-hair: rgba(56, 88, 158, 0.14);\n\n  /* ---- consume engine into DSH tokens ---------------------------------- */\n  --dsw-alias-bg-base: transparent;\n  --dsw-alias-bg-layer-1: var(--dsg-fill-l1);\n  --dsw-alias-bg-layer-2: var(--dsg-fill-l2);\n  --dsw-alias-bg-layer-3: var(--dsg-fill-l3);\n  --dsw-alias-bg-overlay: var(--dsg-fill-l3);\n  --dsw-alias-bg-module-platform: var(--dsg-fill-l1);\n  --dsw-alias-bg-multi-select: var(--dsg-fill-l1);\n\n  --dsw-specific-sidebar-fill: var(--dsg-fill-l1);\n  --dsw-specific-input-major: var(--dsg-fill-l2);\n  --dsw-specific-bubble: var(--dsg-fill-l2);\n  --dsw-specific-menu: color-mix(in srgb, #ffffff 82%, transparent);\n  --dsw-menu-surface-fill: color-mix(in srgb, #ffffff 82%, transparent);\n  --dsw-alias-menu-group-header-fill: rgba(250, 252, 255, 0.94);\n  --dsw-specific-selector: var(--dsg-fill-l2);\n  --dsw-specific-tip: var(--dsg-fill-l2);\n  --dsw-specific-sidebar-nav-item-active: var(--dsg-fill-l2);\n  --dsw-specific-sidebar-nav-item-hover: rgba(77, 107, 254, 0.07);\n  --dsw-specific-sidebar-nav-item-active-accent: var(--dsg-blue-soft);\n\n  /* borders: blue-grey hairlines */\n  --dsw-alias-border-l1: rgba(56, 88, 158, 0.1);\n  --dsw-alias-border-l2: rgba(56, 88, 158, 0.16);\n  --dsw-alias-border-l3: rgba(56, 88, 158, 0.2);\n  --dsw-alias-border-l4: rgba(56, 88, 158, 0.26);\n  --dsw-elevation-stroke-color: rgba(56, 88, 158, 0.18);\n\n  /* DeepSeek blue interaction states */\n  --dsw-alias-state-business-primary: var(--dsg-blue);\n  --dsw-alias-link: var(--dsg-blue);\n  --dsw-alias-brand-primary-new-colorprimary-new-color: var(--dsg-blue);\n  --dsw-alias-interactive-bg-hover: rgba(77, 107, 254, 0.07);\n  --dsw-alias-interactive-bg-active: rgba(77, 107, 254, 0.12);\n  --dsw-alias-interactive-bg-hover-accent: var(--dsg-blue-soft);\n  --dsw-alias-state-business-tertiary: rgba(77, 107, 254, 0.1);\n\n  /* content surfaces */\n  --dsw-alias-markdown-code-block: var(--dsg-fill-l1);\n  --dsw-alias-markdown-code-block-banner: var(--dsg-fill-l2);\n  --dsw-alias-markdown-inline-code: rgba(77, 107, 254, 0.08);\n  --dsw-alias-markdown-citation: var(--dsg-fill-l1);\n  --dsw-alias-markdown-tag: rgba(77, 107, 254, 0.08);\n  --dsw-alias-turn-trigger-bg: var(--dsg-fill-l1);\n  --dsw-alias-turn-trigger-bg-hover: var(--dsg-fill-l2);\n  --dsw-alias-settings-card-fill: var(--dsg-fill-l2);\n  --dsw-alias-settings-card-stroke: rgba(56, 88, 158, 0.16);\n\n  /* host frosted channels */\n  --dsw-menu-backdrop-filter: blur(calc(24px * var(--dsg-blur, 1))) saturate(1.4);\n  --dsw-mask-blur: blur(calc(14px * var(--dsg-blur, 1))) saturate(1.2);\n\n  /* elevation: diffuse blue-tinted daylight */\n  --dsw-shadow-lv1: 0 2px 6px rgba(44, 74, 140, 0.06);\n  --dsw-shadow-lv2: 0 6px 18px rgba(44, 74, 140, 0.08);\n  --dsw-shadow-lv3: 0 18px 48px rgba(44, 74, 140, 0.12);\n  --dsw-elevation-panel: var(--dsw-elevation-stroke), 0 6px 20px rgba(44, 74, 140, 0.08), 0 0 24px rgba(44, 74, 140, 0.04);\n  --dsw-elevation-prominent: var(--dsw-elevation-stroke), 0 10px 34px rgba(44, 74, 140, 0.12), 0 0 30px rgba(44, 74, 140, 0.06);\n  --dsw-elevation-soft: var(--dsw-elevation-stroke), 0 8px 28px rgba(44, 74, 140, 0.08), 0 0 28px rgba(44, 74, 140, 0.05);\n\n  /* ink: deeper ramp for readable text over glass (≥4.9:1) */\n  --dsw-alias-label-primary: #101728;\n  --dsw-alias-label-secondary: #333c4d;\n  --dsw-alias-label-tertiary: #5c6472;\n  --dsw-alias-label-caption: #626a78;\n}\n\n/* ---- glass engine · dark ------------------------------------------------- */\nhtml[data-dsg='on'] body[data-ds-dark-theme] {\n  --dsg-tint: #0d1524;\n  --dsg-tint-rgb: 13 21 36;\n  --dsg-floor: calc(var(--dsg-floor-base-dark) * var(--dsg-fidelity));\n  --dsg-a1: 0.08;\n  --dsg-a2: 0.34;\n  --dsg-a3: 0.66;\n\n  --dsg-fill-l1: color-mix(in srgb,\n      var(--dsg-tint) calc(var(--dsg-floor) * 100%),\n      color-mix(in srgb, var(--dsg-tint) calc(var(--dsg-a1) * 100%), transparent) calc((1 - var(--dsg-floor)) * 100%));\n  --dsg-fill-l2: color-mix(in srgb,\n      var(--dsg-tint) calc(var(--dsg-floor) * 100%),\n      color-mix(in srgb, var(--dsg-tint) calc(var(--dsg-a2) * 100%), transparent) calc((1 - var(--dsg-floor)) * 100%));\n  --dsg-fill-l3: color-mix(in srgb,\n      var(--dsg-tint) calc(var(--dsg-floor) * 100%),\n      color-mix(in srgb, var(--dsg-tint) calc(var(--dsg-a3) * 100%), transparent) calc((1 - var(--dsg-floor)) * 100%));\n\n  --dsg-sheen-l1: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02) 38%, rgba(255, 255, 255, 0.01));\n  --dsg-sheen-l2: linear-gradient(180deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.03) 38%, rgba(255, 255, 255, 0.01));\n  --dsg-sheen-l3: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02) 38%, rgba(255, 255, 255, 0.03));\n\n  --dsg-bevel-l1:\n    inset 0 1px 0 rgba(255, 255, 255, 0.14),\n    inset 0 -1px 0 rgba(255, 255, 255, 0.05),\n    inset 0 0 0 0.5px rgba(255, 255, 255, 0.08),\n    0 8px 26px rgba(0, 0, 0, 0.22);\n  --dsg-bevel-l2:\n    inset 0 1px 0 rgba(255, 255, 255, 0.16),\n    inset 0 -1px 0 rgba(255, 255, 255, 0.06),\n    inset 0 0 0 0.5px rgba(255, 255, 255, 0.1),\n    0 14px 44px rgba(0, 0, 0, 0.32);\n  --dsg-bevel-l3:\n    inset 0 1px 0 rgba(255, 255, 255, 0.16),\n    inset 0 0 0 1px rgba(255, 255, 255, 0.08),\n    0 24px 80px rgba(0, 0, 0, 0.48);\n\n  --dsg-border-hair: rgba(150, 180, 255, 0.14);\n\n  --dsw-specific-menu: color-mix(in srgb, #0d1524 86%, transparent);\n  --dsw-menu-surface-fill: color-mix(in srgb, #0d1524 84%, transparent);\n  --dsw-alias-menu-group-header-fill: rgba(13, 21, 36, 0.95);\n  --dsw-specific-sidebar-nav-item-hover: rgba(255, 255, 255, 0.05);\n  --dsw-specific-sidebar-nav-item-active-accent: rgba(77, 107, 254, 0.22);\n\n  --dsw-alias-border-l1: rgba(150, 180, 255, 0.1);\n  --dsw-alias-border-l2: rgba(150, 180, 255, 0.16);\n  --dsw-alias-border-l3: rgba(150, 180, 255, 0.22);\n  --dsw-alias-border-l4: rgba(150, 180, 255, 0.28);\n  --dsw-elevation-stroke-color: rgba(150, 180, 255, 0.2);\n\n  --dsw-alias-markdown-inline-code: rgba(120, 150, 255, 0.14);\n  --dsw-alias-markdown-tag: rgba(120, 150, 255, 0.14);\n  --dsw-alias-turn-trigger-bg-hover: var(--dsg-fill-l2);\n  --dsw-alias-settings-card-fill: var(--dsg-fill-l2);\n  --dsw-alias-settings-card-stroke: rgba(150, 180, 255, 0.18);\n\n  --dsw-alias-label-primary: #eef3ff;\n  --dsw-alias-label-secondary: #b9c6df;\n  --dsw-alias-label-tertiary: #93a3c0;\n  --dsw-alias-label-caption: #7d8da9;\n}\n\n/* ---- global texture: selection, focus, scrollbar ------------------------- */\nhtml[data-dsg='on'] ::selection {\n  background: rgba(77, 107, 254, 0.22);\n}\nhtml[data-dsg='on'] body :focus-visible:not(:read-write) {\n  outline-color: var(--dsg-blue-ring) !important;\n}\nhtml[data-dsg='on'] * {\n  scrollbar-color: rgba(77, 107, 254, 0.28) transparent;\n}\nhtml[data-dsg='on'] ::-webkit-scrollbar-thumb {\n  background: rgba(77, 107, 254, 0.24) !important;\n  border-radius: 999px;\n}\nhtml[data-dsg='on'] ::-webkit-scrollbar-thumb:hover {\n  background: rgba(77, 107, 254, 0.38) !important;\n}\n\n/* ---- runtime fallback: software rasteriser (syntax OK, frost missing) ---- */\nhtml[data-dsg='on'] body[data-dsg-fallback] {\n  --dsg-fill-l1: rgba(250, 252, 255, 0.92);\n  --dsg-fill-l2: rgba(252, 253, 255, 0.95);\n  --dsg-fill-l3: rgba(255, 255, 255, 0.97);\n  --dsg-backdrop-l1: none;\n  --dsg-backdrop-l2: none;\n  --dsg-backdrop-l3: none;\n  --dsg-backdrop-panel: none;\n  --dsw-menu-backdrop-filter: none;\n  --dsw-mask-blur: none;\n  --dsg-sheen-l1: none;\n  --dsg-sheen-l2: none;\n  --dsg-sheen-l3: none;\n}\nhtml[data-dsg='on'] body[data-ds-dark-theme][data-dsg-fallback] {\n  --dsg-fill-l1: rgba(13, 21, 36, 0.93);\n  --dsg-fill-l2: rgba(16, 26, 44, 0.96);\n  --dsg-fill-l3: rgba(18, 29, 49, 0.98);\n}\n\n/* ---- reduced motion ------------------------------------------------------- */\n@media (prefers-reduced-motion: reduce) {\n  html[data-dsg='on'] .dsg-atmosphere .dsg-aurora {\n    animation: none !important;\n  }\n  html[data-dsg='on'] * {\n    transition-duration: 1ms !important;\n    animation-duration: 1ms !important;\n  }\n}\n\n@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {\n  html[data-dsg='on'] body {\n    --dsg-fill-l1: rgba(250, 252, 255, 0.9);\n    --dsg-fill-l2: rgba(252, 253, 255, 0.94);\n    --dsg-fill-l3: rgba(255, 255, 255, 0.97);\n    --dsw-specific-menu: #fafcff;\n    --dsw-menu-surface-fill: #fafcff;\n  }\n  html[data-dsg='on'] body[data-ds-dark-theme] {\n    --dsg-fill-l1: rgba(13, 21, 36, 0.92);\n    --dsg-fill-l2: rgba(16, 26, 44, 0.95);\n    --dsg-fill-l3: rgba(18, 29, 49, 0.97);\n    --dsw-specific-menu: #0f1728;\n    --dsw-menu-surface-fill: #0f1728;\n  }\n}\n\n/* ===== 95-settings-panel.css ===== */\n/* ============================================================================\n   95 plugin settings panel (rendered inside Settings → settings.section)\n   Uses its own .dsg-* vocabulary so it never collides with shipped UI.\n   ========================================================================== */\nhtml[data-dsg='on'] .dsg-settings {\n  display: flex;\n  flex-direction: column;\n  gap: 18px;\n  max-width: 760px;\n  color: var(--dsw-alias-label-primary);\n}\nhtml[data-dsg='on'] .dsg-settings-head {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\nhtml[data-dsg='on'] .dsg-settings-title {\n  font-size: 15px;\n  font-weight: 600;\n  letter-spacing: 0.01em;\n}\nhtml[data-dsg='on'] .dsg-settings-sub {\n  font-size: 12px;\n  line-height: 1.6;\n  color: var(--dsw-alias-label-tertiary);\n}\nhtml[data-dsg='on'] .dsg-settings-body {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  padding: 8px 18px;\n  border-radius: var(--dsg-radius-card);\n  background: rgba(255, 255, 255, calc(0.5 * var(--dsg-glass, 1)));\n  border: 1px solid var(--dsw-alias-border-l2);\n  -webkit-backdrop-filter: blur(var(--dsg-card-blur)) saturate(var(--dsg-sat));\n  backdrop-filter: blur(var(--dsg-card-blur)) saturate(var(--dsg-sat));\n  box-shadow:\n    inset 0 1px 0 rgba(255, 255, 255, 0.55),\n    0 10px 30px rgba(44, 74, 140, 0.08);\n}\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-settings-body {\n  background: rgba(22, 33, 58, calc(0.6 * var(--dsg-glass, 1)));\n  box-shadow:\n    inset 0 1px 0 rgba(255, 255, 255, 0.08),\n    0 14px 36px rgba(0, 0, 0, 0.32);\n}\nhtml[data-dsg='on'] .dsg-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 20px;\n  padding: 14px 0;\n  border-bottom: 1px solid var(--dsw-alias-border-l1);\n}\nhtml[data-dsg='on'] .dsg-row:last-child {\n  border-bottom: 0;\n}\nhtml[data-dsg='on'] .dsg-row-text {\n  min-width: 0;\n}\nhtml[data-dsg='on'] .dsg-row-label {\n  font-size: 13px;\n  font-weight: 500;\n}\nhtml[data-dsg='on'] .dsg-row-hint {\n  margin-top: 3px;\n  font-size: 11px;\n  color: var(--dsw-alias-label-tertiary);\n}\nhtml[data-dsg='on'] .dsg-row-control {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  flex: 0 0 auto;\n}\nhtml[data-dsg='on'] .dsg-slider {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\nhtml[data-dsg='on'] .dsg-slider input[type='range'] {\n  width: 148px;\n  accent-color: var(--dsg-blue);\n}\nhtml[data-dsg='on'] .dsg-slider-value {\n  width: 40px;\n  font-size: 12px;\n  font-variant-numeric: tabular-nums;\n  color: var(--dsw-alias-label-secondary);\n  text-align: right;\n}\nhtml[data-dsg='on'] .dsg-seg {\n  display: inline-flex;\n  padding: 3px;\n  gap: 2px;\n  border-radius: 999px;\n  background: rgba(77, 107, 254, 0.07);\n  border: 1px solid var(--dsw-alias-border-l1);\n}\nhtml[data-dsg='on'] .dsg-seg-btn {\n  border: 0;\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  line-height: 1;\n  padding: 7px 13px;\n  border-radius: 999px;\n  cursor: pointer;\n  transition: background var(--dsg-motion-dur) var(--dsg-ease), color var(--dsg-motion-dur) var(--dsg-ease);\n}\nhtml[data-dsg='on'] .dsg-seg-btn:hover {\n  color: var(--dsw-alias-label-primary);\n  background: rgba(255, 255, 255, 0.5);\n}\nhtml[data-dsg='on'] .dsg-seg-btn.is-on {\n  color: var(--dsg-blue);\n  background: #fff;\n  box-shadow: 0 2px 8px rgba(44, 74, 140, 0.12);\n}\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-seg-btn.is-on {\n  background: rgba(77, 107, 254, 0.28);\n  color: #dce6ff;\n}\nhtml[data-dsg='on'] .dsg-switch {\n  position: relative;\n  width: 44px;\n  height: 26px;\n  padding: 0;\n  border-radius: 999px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: rgba(120, 140, 180, 0.22);\n  cursor: pointer;\n  transition: background var(--dsg-motion-dur) var(--dsg-ease);\n}\nhtml[data-dsg='on'] .dsg-switch .dsg-switch-thumb {\n  position: absolute;\n  top: 3px;\n  left: 3px;\n  width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  background: #fff;\n  box-shadow: 0 1px 4px rgba(20, 40, 90, 0.24);\n  transition: transform var(--dsg-motion-dur) var(--dsg-ease);\n}\nhtml[data-dsg='on'] .dsg-switch.is-on {\n  background: var(--dsg-blue);\n  border-color: transparent;\n}\nhtml[data-dsg='on'] .dsg-switch.is-on .dsg-switch-thumb {\n  transform: translateX(18px);\n}\nhtml[data-dsg='on'] .dsg-settings-foot {\n  display: flex;\n  justify-content: flex-end;\n  padding: 12px 0 10px;\n}\nhtml[data-dsg='on'] .dsg-btn {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: rgba(255, 255, 255, 0.6);\n  color: var(--dsw-alias-label-secondary);\n  font-size: 12px;\n  padding: 8px 16px;\n  border-radius: 999px;\n  cursor: pointer;\n  transition: all var(--dsg-motion-dur) var(--dsg-ease);\n}\nhtml[data-dsg='on'] .dsg-btn:hover {\n  color: var(--dsg-blue);\n  border-color: var(--dsg-blue-ring);\n  background: #fff;\n}\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-btn {\n  background: rgba(255, 255, 255, 0.06);\n}\nhtml[data-dsg='on'] body[data-ds-dark-theme] .dsg-btn:hover {\n  background: rgba(77, 107, 254, 0.22);\n  color: #dce6ff;\n}\n"

    var STORAGE_KEY = 'dsh-ui-deepseek/config'
    var COLOR_KEY = 'dsh-ui-deepseek/color'
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
    var ctxRef = null
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
      root.style.setProperty('--dsg-glass', String(c.glass))
      root.style.setProperty('--dsg-blur', String(c.blur))
      root.style.setProperty('--dsg-motion', c.motion ? '1' : '0')
    }

    function applyConfig(c) {
      applyAtmosphere(c)
      applyVars(c)
    }

    // Software rasterisers accept backdrop-filter syntax but paint no frost.
    // Detect once and pin the fallback material (near-opaque, no blur).
    function detectGlassFallback() {
      try {
        var canvas = document.createElement('canvas')
        var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        if (!gl) { document.body.setAttribute('data-dsg-fallback', '1'); return }
        var ext = gl.getExtension('WEBGL_debug_renderer_info')
        var renderer = ext
          ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '')
          : String(gl.getParameter(gl.RENDERER) || '')
        var lose = gl.getExtension('WEBGL_lose_context')
        if (lose) lose.loseContext()
        if (/swiftshader|software|llvmpipe|softpipe|microsoft basic render|stack-gl/i.test(renderer)) {
          document.body.setAttribute('data-dsg-fallback', '1')
        }
      } catch (e) { /* keep the frost */ }
    }

    // Color mode is owned by DSH's native theme service; this plugin only
    // selects a mode on first activation (the reference look is the airy light
    // palette) and then mirrors whatever the native Appearance setting says.
    function themeService(ctx) {
      try { return ctx.get('theme') } catch (e) { return null }
    }
    function currentColor(theme) {
      try {
        var snap = theme && theme.getTheme && theme.getTheme()
        return snap && snap.id ? snap.id : 'light'
      } catch (e) { return 'light' }
    }
    function setColor(ctx, id) {
      var theme = themeService(ctx)
      if (!theme || !theme.setTheme) return
      try { theme.setTheme(id) } catch (e) { /* non-fatal */ }
      try { window.localStorage.setItem(COLOR_KEY, id) } catch (e) { /* non-fatal */ }
      emit()
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
          h(Row, { key: 'color', label: T('配色', 'Color mode'), hint: T('浅色为 DeepSeek 网页端基准；深色为同构夜航玻璃', 'Light matches the DeepSeek web reference; dark is the same glass at night') }, h('div', { className: 'dsg-seg' }, ['light', 'dark', 'system'].map(function (v) {
            var theme = ctxRef ? themeService(ctxRef) : null
            var active = (theme && currentColor(theme) === v)
            return h('button', {
              key: v,
              type: 'button',
              className: 'dsg-seg-btn' + (active ? ' is-on' : ''),
              onClick: function () { setColor(ctxRef, v) }
            }, v === 'light' ? T('浅色', 'Light') : v === 'dark' ? T('深色', 'Dark') : T('跟随系统', 'System'))
          }))),
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

    // ---- dev-only DOM snapshot (removed before delivery) --------------------
    // Writes a JSON snapshot of the live shell to the clipboard once per
    // DUMP_VERSION so the build loop can inspect real DOM classes/attributes.
    var DUMP_VERSION = 'v6'
    function dumpDom() {
      try {
        if (window.sessionStorage.getItem('dsg-dom-dump') === DUMP_VERSION) return
        window.sessionStorage.setItem('dsg-dom-dump', DUMP_VERSION)
      } catch (e) { return }
      window.setTimeout(function () {
        try {
          var SKIP = { STYLE: 1, SCRIPT: 1, LINK: 1, META: 1, TEMPLATE: 1 }
          var nodes = 0
          function walk(el, depth) {
            if (nodes > 9000) return null
            var tag = el.tagName
            if (SKIP[tag]) return null
            if (tag === 'svg' || el.namespaceURI === 'http://www.w3.org/2000/svg') {
              return { t: 'svg', c: String(el.getAttribute('class') || '').slice(0, 120) }
            }
            nodes++
            var out = { t: tag.toLowerCase() }
            if (el.className && typeof el.className === 'string') out.c = el.className.slice(0, 240)
            var attrs = {}
            for (var i = 0; i < el.attributes.length; i++) {
              var a = el.attributes[i]
              if (a.name === 'class' || a.name === 'style') continue
              if (a.name.indexOf('aria-') === 0 || a.name === 'role' || a.name === 'title' || a.name === 'type' || a.name.indexOf('data-') === 0) {
                attrs[a.name] = String(a.value).slice(0, 160)
              }
            }
            if (Object.keys(attrs).length) out.a = attrs
            var txt = ''
            for (var j = 0; j < el.childNodes.length; j++) {
              var n = el.childNodes[j]
              if (n.nodeType === 3) txt += n.textContent
            }
            txt = txt.replace(/\s+/g, ' ').trim()
            if (txt) out.x = txt.slice(0, 160)
            if (depth < 40) {
              var kids = []
              for (var k = 0; k < el.children.length; k++) {
                var child = walk(el.children[k], depth + 1)
                if (child) kids.push(child)
              }
              if (kids.length) out.ch = kids
            }
            return out
          }
          function styles(sel) {
            var el = document.querySelector(sel)
            if (!el) return null
            var cs = getComputedStyle(el)
            return {
              background: cs.backgroundColor, image: (cs.backgroundImage || '').slice(0, 120),
              backdrop: cs.backdropFilter, radius: cs.borderRadius, border: cs.borderColor + ' ' + cs.borderWidth,
              shadow: (cs.boxShadow || '').slice(0, 200), color: cs.color, font: cs.fontSize + '/' + cs.fontWeight,
              padding: cs.padding, overflow: cs.overflow, position: cs.position
            }
          }
          var selectors = [
            'html', 'body', '.BynINW_frame', '.BynINW_sidebarCol', '.BynINW_centerCol', '.BynINW_rightbarCol',
            '[data-slot="sidebar"]', '[data-conversation-region="chat"]', '[data-conversation-region="composer"]',
            '[data-chat-flow]', '[class*="_header"]', '[class*="_tabs"]', '[class*="_bubble"]',
            '[data-composer-seat]', '[data-composer-card]', '[class*="_card"]', '[class*="_row"]',
            '[class*="_panel"]', '[class*="_pill"]', '[class*="_overlay"]'
          ]
          var body = document.body
          var computed = {}
          selectors.forEach(function (s) { computed[s] = styles(s) })
          var payload = {
            url: location.href,
            title: document.title,
            dark: body.hasAttribute('data-ds-dark-theme'),
            dsg: document.documentElement.getAttribute('data-dsg'),
            tree: walk(body, 0),
            probes: selectors.map(function (sel) {
              var els = document.querySelectorAll(sel)
              return { sel: sel, count: els.length }
            }),
            computed: computed
          }
          var text = JSON.stringify(payload)
          var ta = document.createElement('textarea')
          ta.value = text
          ta.setAttribute('readonly', '')
          ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0'
          document.body.appendChild(ta)
          ta.select()
          var ok = false
          try { ok = document.execCommand('copy') } catch (e) { ok = false }
          ta.remove()
          if (!ok && navigator.clipboard) navigator.clipboard.writeText(text)
        } catch (e) { /* dev-only */ }
      }, 4000)
    }

    // ---- dev-only settings opener (removed before delivery) -----------------
    // Opens the native settings dialog through the real account menu so the
    // DOM dump and screenshots can cover settings/plugin/detail surfaces.
    function devOpenSettings() {
      try {
        if (window.sessionStorage.getItem('dsg-dev-settings') === 'v2') return
        window.sessionStorage.setItem('dsg-dev-settings', 'v2')
      } catch (e) { return }
      window.setTimeout(function () {
        // If the settings dialog is already open, jump to our own section.
        var dialog = document.querySelector('[role="dialog"]')
        if (dialog) {
          var items = [].slice.call(dialog.querySelectorAll('button, a, [role="menuitem"], [role="tab"]'))
          for (var i = 0; i < items.length; i++) {
            if (/外观 · DeepSeek|DeepSeek glass/i.test(items[i].textContent || '')) { items[i].click(); return }
          }
          return
        }
        var launcher = document.querySelector('[data-slot="settings.launcher"] button')
        if (launcher) launcher.click()
        window.setTimeout(function () {
          var nodes = [].slice.call(document.querySelectorAll('[role="menuitem"], button, a'))
          var target = null
          for (var j = 0; j < nodes.length; j++) {
            var el = nodes[j]
            if (el.closest('[role="dialog"]')) continue
            var label = (el.getAttribute('aria-label') || '') + ' ' + (el.textContent || '')
            if (/设置|Settings/.test(label)) { target = el; break }
          }
          if (target) target.click()
        }, 700)
      }, 3000)
    }

    // ---- dev-only settings closer (removed before delivery) -----------------
    function devCloseSettings() {
      try {
        if (window.sessionStorage.getItem('dsg-dev-close') === 'v1') return
        window.sessionStorage.setItem('dsg-dev-close', 'v1')
      } catch (e) { return }
      window.setTimeout(function () {
        var dlg = document.querySelector('[role="dialog"]')
        if (!dlg) return
        var buttons = [].slice.call(dlg.querySelectorAll('button'))
        for (var i = 0; i < buttons.length; i++) {
          var label = (buttons[i].getAttribute('aria-label') || '') + ' ' + (buttons[i].title || '')
          if (/关闭|Close/i.test(label)) { buttons[i].click(); return }
        }
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }))
      }, 2500)
    }

    function apply(ctx) {
      ctxRef = ctx
      dumpDom()
      devOpenSettings()
      devCloseSettings()
      detectGlassFallback()

      // 0. first activation: adopt the DeepSeek-web light palette once. Later
      // changes made in DSH's native Appearance settings are left alone.
      try {
        var stored = window.localStorage.getItem(COLOR_KEY)
        if (!stored) setColor(ctx, 'light')
      } catch (e) { /* non-fatal */ }

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
