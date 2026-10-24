// dsh-skin-mistblue (雾蓝) — browser half.
// GENERATED FILE: edit src/client-template.js and src/styles/*.css, then run
// `node tools/build-plugin.mjs`. The build inlines the CSS bundle into `CSS`.
window.__ModuleLoader__.load({
  id: 'dsh-skin-mistblue',
  factory: function (require) {
    var module = { exports: {} }
    var exports = module.exports
    var React = require('react')
    var h = React.createElement
    var useState = React.useState
    var useEffect = React.useEffect

    var CSS = __DSG_CSS__

    // 旧包名（v1.0–v1.6）的配置键：读新键失败时回退到旧键，避免改名丢设置。
    var STORAGE_KEY = 'dsh-skin-mistblue/config'
    var COLOR_KEY = 'dsh-skin-mistblue/color'
    var LEGACY_STORAGE_KEY = 'dsh-ui-deepseek/config'
    var LEGACY_COLOR_KEY = 'dsh-ui-deepseek/color'
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
    function readItem(key, legacyKey) {
      try {
        var v = window.localStorage.getItem(key)
        if (v !== null && v !== undefined) return v
        return legacyKey ? window.localStorage.getItem(legacyKey) : null
      } catch (e) { return null }
    }
    function load() {
      try {
        var raw = readItem(STORAGE_KEY, LEGACY_STORAGE_KEY)
        return normalize(raw ? JSON.parse(raw) : null)
      } catch (e) { return normalize(null) }
    }
    function save(c) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c))
        // 迁移完成：旧键只读不写，清掉避免长期两份配置
        window.localStorage.removeItem(LEGACY_STORAGE_KEY)
      } catch (e) { /* non-fatal */ }
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
      try {
        window.localStorage.setItem(COLOR_KEY, id)
        window.localStorage.removeItem(LEGACY_COLOR_KEY)
      } catch (e) { /* non-fatal */ }
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
    // DSH 的 locale 服务会把 <html lang> 同步成 zh-CN / en，但本插件（immediately
    // 加载）可能在 locale 初始化之前执行，所以不能把语言缓存成模块作用域常量。
    // 这里每次按当前 locale 判定，并在 locale/change 时重渲染设置页。
    function currentLanguage() {
      try {
        var locale = ctxRef && ctxRef.get ? ctxRef.get('locale') : null
        if (locale && typeof locale.getSnapshot === 'function') {
          var snap = locale.getSnapshot()
          if (snap && snap.active) return String(snap.active)
        }
      } catch (e) { /* non-fatal */ }
      try {
        var htmlLang = document && document.documentElement && document.documentElement.lang
        if (htmlLang) return String(htmlLang)
      } catch (e) { /* non-fatal */ }
      try {
        if (typeof navigator !== 'undefined' && navigator.language) return String(navigator.language)
      } catch (e) { /* non-fatal */ }
      return 'zh' // 产品默认中文
    }
    function isZh() { return /^zh/i.test(currentLanguage()) }
    function T(zhText, enText) { return isZh() ? zhText : enText }

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
          h('div', { className: 'dsg-settings-title', key: 't' }, T('雾蓝玻璃外观', 'Mistblue glass appearance')),
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
          }, 'dsh-skin-mistblue: windows caption sync')
        } catch (e) { /* non-fatal */ }
      } catch (e) { /* non-fatal */ }
    }

    // Resize performance guard: while the user drags (sidebar/panel boundary, dockkit
    // splitter, or any other layout drag) the app relayouts every frame; every surface
    // with backdrop-filter — every bubble, the sidebars, header, composer — makes
    // Chromium re-sample and re-blur its backdrop on each frame, which is the visible
    // jank. We flag <html data-dsg-resizing> once a pointer press turns into a real
    // drag, so the stylesheet can drop the expensive frosting/shadows for the duration
    // (the backdrop there is the smooth atmosphere, so it looks almost identical) and
    // restore them on release. Steady-state appearance is untouched.
    function initResizeGuard(ctx) {
      if (typeof document === 'undefined' || typeof window === 'undefined') return
      if (window.__dsgResizeGuard) return
      window.__dsgResizeGuard = true
      var html = document.documentElement
      var armed = false
      var active = false
      var startX = 0
      var startY = 0
      var timer = 0
      function clear() {
        window.clearTimeout(timer)
        var was = active
        armed = false
        active = false
        if (was) html.removeAttribute('data-dsg-resizing')
        window.removeEventListener('pointermove', onMove, true)
        window.removeEventListener('pointerup', clear, true)
        window.removeEventListener('pointercancel', clear, true)
        window.removeEventListener('blur', clear, true)
      }
      function onMove(e) {
        if (!armed || active) return
        var dx = e.clientX - startX
        var dy = e.clientY - startY
        if (dx * dx + dy * dy < 16) return // ~4px: clicks never trigger, drags do
        active = true
        html.setAttribute('data-dsg-resizing', '1')
        window.removeEventListener('pointermove', onMove, true)
        timer = window.setTimeout(clear, 15000) // safety net
      }
      function onDown(e) {
        if (e.button !== 0) return
        clear()
        armed = true
        startX = e.clientX
        startY = e.clientY
        // A splitter press IS a resize drag from the first frame: drop the frosted
        // materials immediately instead of waiting for the 4px threshold, otherwise
        // the first frames of every drag still pay for the full glass stack.
        var target = e.target
        var divider = target && target.closest ? target.closest('[data-dockkit-divider]') : null
        if (divider) {
          active = true
          html.setAttribute('data-dsg-resizing', '1')
          timer = window.setTimeout(clear, 15000)
        } else {
          window.addEventListener('pointermove', onMove, true)
        }
        window.addEventListener('pointerup', clear, true)
        window.addEventListener('pointercancel', clear, true)
        window.addEventListener('blur', clear, true)
      }
      document.addEventListener('pointerdown', onDown, true)
      try {
        ctx.effect(function () {
          return function () {
            clear()
            document.removeEventListener('pointerdown', onDown, true)
            window.__dsgResizeGuard = false
          }
        }, 'dsh-skin-mistblue: resize guard')
      } catch (e) { /* non-fatal */ }
    }

    // Left sidebar panel list: drag-to-reorder + click-again-to-go-back --------
    // The host renders the panel list (插件 / 上下文洞察 / MCP 连接器 …) in registry
    // order and always calls selectPanel(id) on click. Both behaviours are added
    // here without touching host state:
    //   · reorder = per-row CSS `order` (flex column), persisted in localStorage,
    //     re-applied after every React re-render; no DOM moves, so React keys stay.
    //   · click-again = remember the view that was active when the panel opened
    //     (conversation tab or previous panel) and replay it.
    var PANEL_ORDER_KEY = 'dsh-skin-mistblue/panel-order'

    function initSidebarEnhancer(ctx) {
      if (typeof document === 'undefined' || typeof window === 'undefined') return
      if (window.__dsgSidebarEnhancer) return
      window.__dsgSidebarEnhancer = true
      var ROW_SEL = 'button[class*="_panelRow"]'
      var NAV_SEL = 'nav[class*="_panelList"]'
      var TAB_SEL = '[data-conversation-tabs] [role="tab"]'
      var ORDER_KEY = 'dsh-skin-mistblue/panel-order'
      var nav = null
      var lastView = null
      var lastSig = ''
      var schedule = false
      var dragRow = null
      var dropRow = null
      var dropAfter = false
      var suppressClick = false

      function rowOf(node) {
        if (!node || node.nodeType !== 1 || !node.closest) return null
        return node.closest(ROW_SEL)
      }
      function rowsOf() {
        return nav ? Array.prototype.slice.call(nav.querySelectorAll(ROW_SEL)) : []
      }
      function labelOf(row) {
        if (!row) return ''
        return row.getAttribute('aria-label') || (row.textContent || '').trim()
      }
      function activeRow() {
        return nav ? nav.querySelector(ROW_SEL + '[aria-current="page"]') : null
      }
      function activeTab() {
        var tabs = document.querySelectorAll(TAB_SEL)
        for (var i = 0; i < tabs.length; i++) {
          if (tabs[i].getAttribute('aria-selected') === 'true') return tabs[i]
        }
        return null
      }
      function layoutService() {
        try { return ctx.get ? ctx.get('layout') : null } catch (e) { return null }
      }
      function panelId() {
        var layout = layoutService()
        try {
          if (layout && layout.panelInfo && layout.panelInfo.getSnapshot) {
            return layout.panelInfo.getSnapshot().activePanelId
          }
        } catch (e) { /* non-fatal */ }
        return undefined
      }
      function selectPanel(id) {
        var layout = layoutService()
        if (!layout || typeof layout.selectPanel !== 'function') return false
        try { layout.selectPanel(id); return true } catch (e) { return false }
      }
      function readOrder() {
        try {
          var raw = readItem(ORDER_KEY)
          var list = raw ? JSON.parse(raw) : []
          return Array.isArray(list) ? list : []
        } catch (e) { return [] }
      }
      function saveOrder() {
        var labels = visualRows().map(labelOf)
        try { localStorage.setItem(ORDER_KEY, JSON.stringify(labels)) } catch (e) { /* non-fatal */ }
      }
      function visualRows() {
        var rows = rowsOf()
        var indexed = rows.map(function (r, i) { return { r: r, i: i } })
        indexed.sort(function (a, b) {
          var ao = a.r.style.order === '' ? 9999 : parseInt(a.r.style.order, 10)
          var bo = b.r.style.order === '' ? 9999 : parseInt(b.r.style.order, 10)
          return ao !== bo ? ao - bo : a.i - b.i
        })
        return indexed.map(function (x) { return x.r })
      }
      function applyOrder() {
        if (!nav) return
        var rows = rowsOf()
        if (!rows.length) return
        var sig = rows.map(labelOf).join('|')
        var missing = rows.some(function (r) { return r.getAttribute('draggable') !== 'true' })
        if (sig === lastSig && !missing) return
        lastSig = sig
        var saved = readOrder()
        rows.forEach(function (r, i) {
          if (r.getAttribute('draggable') !== 'true') r.setAttribute('draggable', 'true')
          var pos = saved.indexOf(labelOf(r))
          r.style.order = String(pos >= 0 ? pos : saved.length + i)
        })
        visualRows().forEach(function (r, i) { r.style.order = String(i) })
      }
      function scheduleApply() {
        if (schedule) return
        schedule = true
        window.requestAnimationFrame(function () {
          schedule = false
          findNav()
          applyOrder()
        })
      }
      function setNav(next) {
        nav = next
        lastSig = ''
        if (nav) applyOrder()
      }
      function findNav() {
        var found = document.querySelector(NAV_SEL)
        if (found) setNav(found)
      }
      function clearDrop() {
        if (dropRow) dropRow.classList.remove('dsg-panel-row-drop')
        dropRow = null
      }
      function moveRow(dragged, target, after) {
        var list = visualRows().filter(function (r) { return r !== dragged })
        var idx = list.indexOf(target)
        if (idx < 0) return
        list.splice(after ? idx + 1 : idx, 0, dragged)
        list.forEach(function (r, i) { r.style.order = String(i) })
      }
      function endDrag() {
        if (dragRow) dragRow.classList.remove('dsg-panel-row-drag')
        dragRow = null
        clearDrop()
        saveOrder()
      }
      function onDragStart(e) {
        var row = rowOf(e.target)
        if (!row || !nav || !nav.contains(row)) return
        dragRow = row
        row.classList.add('dsg-panel-row-drag')
        try {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', labelOf(row))
        } catch (err) { /* non-fatal */ }
      }
      function onDragOver(e) {
        if (!dragRow) return
        e.preventDefault()
        try { e.dataTransfer.dropEffect = 'move' } catch (err) { /* non-fatal */ }
        var target = rowOf(e.target)
        if (!target || target === dragRow) return
        if (dropRow !== target) {
          clearDrop()
          dropRow = target
          target.classList.add('dsg-panel-row-drop')
        }
        var r = target.getBoundingClientRect()
        dropAfter = e.clientY > r.top + r.height / 2
      }
      function onDrop(e) {
        if (!dragRow) return
        e.preventDefault()
        var target = dropRow || rowOf(e.target)
        var after = dropRow ? dropAfter : false
        var dragged = dragRow
        if (target && target !== dragged) {
          moveRow(dragged, target, after)
        }
        dragRow.classList.remove('dsg-panel-row-drag')
        clearDrop()
        suppressClick = true
        window.setTimeout(function () { suppressClick = false }, 120)
        dragRow = null
        saveOrder()
      }
      function onDragEnd() {
        suppressClick = true
        window.setTimeout(function () { suppressClick = false }, 120)
        endDrag()
      }
      function navigateBack(view) {
        if (selectPanel(null)) return true
        if (!view) {
          var tab = document.querySelector(TAB_SEL)
          if (tab) tab.click()
          return true
        }
        if (view.type === 'panel') {
          var target = rowsOf().filter(function (r) { return labelOf(r) === view.label })[0]
          if (target) { target.click(); return true }
        }
        var tabs = document.querySelectorAll(TAB_SEL)
        var pick = null
        for (var i = 0; i < tabs.length; i++) {
          if ((tabs[i].textContent || '').trim() === view.label) { pick = tabs[i]; break }
        }
        if (!pick && tabs.length) pick = tabs[0]
        if (pick) pick.click()
        return true
      }
      function onClick(e) {
        var row = rowOf(e.target)
        if (!row || !nav || !nav.contains(row)) return
        if (suppressClick) {
          e.preventDefault()
          e.stopImmediatePropagation()
          return
        }
        var pid = panelId()
        if (pid !== null && pid !== undefined && activeRow() === row) {
          e.preventDefault()
          e.stopImmediatePropagation()
          navigateBack(lastView)
          return
        }
        var prev = activeRow()
        if (prev && prev !== row) {
          lastView = { type: 'panel', label: labelOf(prev) }
        } else {
          var tab = activeTab()
          lastView = { type: 'tab', label: tab ? (tab.textContent || '').trim() : '对话' }
        }
      }
      function start() {
        findNav()
        if (!nav) return false
        document.addEventListener('dragstart', onDragStart, true)
        document.addEventListener('dragover', onDragOver, true)
        document.addEventListener('drop', onDrop, true)
        document.addEventListener('dragend', onDragEnd, true)
        document.addEventListener('click', onClick, true)
        try {
          var mo = new MutationObserver(scheduleApply)
          mo.observe(document.body, { childList: true, subtree: true })
          ctx.effect(function () {
            return function () {
              mo.disconnect()
              document.removeEventListener('dragstart', onDragStart, true)
              document.removeEventListener('dragover', onDragOver, true)
              document.removeEventListener('drop', onDrop, true)
              document.removeEventListener('dragend', onDragEnd, true)
              document.removeEventListener('click', onClick, true)
              endDrag()
              nav = null
              window.__dsgSidebarEnhancer = false
            }
          }, 'dsh-skin-mistblue: sidebar enhancer')
        } catch (e) { /* non-fatal */ }
        return true
      }
      if (!start()) {
        var tries = 0
        var timer = window.setInterval(function () {
          tries++
          if (start() || tries > 120) window.clearInterval(timer)
        }, 250)
        try {
          ctx.effect(function () {
            return function () { window.clearInterval(timer) }
          }, 'dsh-skin-mistblue: sidebar enhancer wait')
        } catch (e) { /* non-fatal */ }
      }
    }

    function apply(ctx) {
      ctxRef = ctx
      detectGlassFallback()
      syncDesktopCaption(ctx)
      initResizeGuard(ctx)
      initSidebarEnhancer(ctx)

      // settings labels follow the live DSH locale (zh is the product default)
      try {
        ctx.effect(function () {
          var handler = function () { emit() }
          try { ctx.on('locale/change', handler) } catch (e) { /* non-fatal */ }
          return function () {
            try { if (ctx.off) ctx.off('locale/change', handler) } catch (e) { /* non-fatal */ }
          }
        }, 'dsh-skin-mistblue: locale labels')
      } catch (e) { /* non-fatal */ }

      // 0. first activation: adopt the DeepSeek-web light palette once. Later
      // changes made in DSH's native Appearance settings are left alone.
      try {
        var stored = readItem(COLOR_KEY, LEGACY_COLOR_KEY)
        if (!stored) setColor(ctx, 'light')
      } catch (e) { /* non-fatal */ }

      // 1. global stylesheet, owned by this plugin (removed on unload/HMR)
      try {
        ctx.effect(function () {
          var tag = document.createElement('style')
          tag.setAttribute('data-plugin', 'dsh-skin-mistblue')
          tag.setAttribute('data-plugin-css', 'dsh-skin-mistblue/glass')
          tag.textContent = CSS
          document.head.appendChild(tag)
          return function () { tag.remove() }
        }, 'dsh-skin-mistblue: stylesheet')
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
        }, 'dsh-skin-mistblue: atmosphere')
      } catch (e) { /* non-fatal */ }

      // 3. settings page section
      var slots = ctx.get('slots')
      if (slots) {
        try {
          slots.inject('settings.section', function () {
            return slots.register(
              { name: 'settings.section', id: 'dsh-skin-mistblue', order: 60, label: T('外观 · 雾蓝', 'Appearance · Mistblue') },
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
