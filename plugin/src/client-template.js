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

    var CSS = __DSG_CSS__

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

    // Windows caption sync: the desktop preload measures a hidden probe span and
    // forwards the colours to Electron's titleBarOverlay. It only re-measures on
    // a few mutations, so nudge it after our stylesheet/theme settles; without
    // this the native caption area can keep the launch-time colour and clash
    // with the glass titlebar in the other scheme.
    function syncDesktopCaption(ctx) {
      try {
        if (typeof document === 'undefined' || !document.body) return
        var body = document.body
        var tick = 0
        function ping() {
          try { body.style.setProperty('--dsg-caption-tick', String(++tick)) } catch (e) { /* noop */ }
        }
        var timers = []
        ;[250, 700, 1500, 2800].forEach(function (delay) { timers.push(window.setTimeout(ping, delay)) })
        var observer = new MutationObserver(function () {
          timers.push(window.setTimeout(ping, 60))
          timers.push(window.setTimeout(ping, 450))
        })
        try {
          observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-ds-theme-source'] })
          observer.observe(body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
        } catch (e) { /* noop */ }
        try {
          ctx.effect(function () {
            return function () {
              observer.disconnect()
              for (var i = 0; i < timers.length; i++) window.clearTimeout(timers[i])
            }
          }, 'dsh-ui-deepseek: windows caption sync')
        } catch (e) { /* non-fatal */ }
      } catch (e) { /* non-fatal */ }
    }

    function apply(ctx) {
      ctxRef = ctx
      detectGlassFallback()
      syncDesktopCaption(ctx)

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
