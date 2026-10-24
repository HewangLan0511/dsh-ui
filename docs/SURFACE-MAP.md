# SURFACE-MAP — DSH Web GUI 界面 / 表面 / 选择器清单

> 定位：**落点清单**。回答「要改哪里、用户怎么触发、用哪个选择器、现在底色是什么、已经有没有模糊、建议玻璃档位」。
> 姊妹文档：`docs/GLASS-SPEC.md`（玻璃配方 / 公式 / 变量契约）、`docs/DESIGN-SPEC.md`（视觉目标数值）。
> 本文不重复配方，只标注每个面该吃哪一级，以及**不能碰的红线**。

- 仓库：`C:\Users\baiyu\Desktop\dsh-ui`（baseline-v0 快照）
- 分析对象：`app.asar` 中 `@deepseek-ai/dsh-client-ui-*` 共 60 个包（客户端 CSS Modules + 源码属性），`@deepseek-ai/dsh-web-frontend` 的 primitives / dockkit 产物，`baseline/ui-theme/*.css`，`baseline/ui-theme/we-*.css`，`.ref/dom/surface-tree.txt`（运行时 DOM 快照）
- 结论速用：**高稳定锚点 = 源码里写死的 `data-*` / `role` / `slot key`；CSS 类名一律视为哈希（除非是 primitives 的库级类名 `.md-code-block` / `.cm-editor` / `.xterm`）**

---

## 0. 三十秒版本

1. **主壳三栏**：`sidebar`（264–320px，可折叠 56px rail）+ `conversation`（主列）+ `rightbar`（默认收起，推送式/全屏）。底部还有全宽 `shell.bottom` 槽（当前空）。
2. **中心列 = 一列 header + 一列可切换 View（对话 / 轨迹 / 上下文 / 插件贡献的画布、编队…）+ 一条 sticky composer 座位**。
3. **输入卡、提问卡、计划审阅卡、审批卡、Todo/Queue dock 全是同一座位内的 in-flow 卡片，不是 fixed 浮层**；它们只在座位上做链式接管。
4. **真正的浮层**只有：primitives Modal（`[role="dialog"][aria-modal="true"]`）、MenuSurface（`[data-menu-material]`）、Tooltip（`[role="tooltip"]`）、Toast（fixed）、图片灯箱、Dockkit 浮动面板、设置窗口（自己 portal 到 `#root` 旁边）。
5. **原生已经做了玻璃的只有三处**：菜单（`--dsw-menu-surface-fill` + `--dsw-menu-backdrop-filter: blur(40px) saturate(150%)`）、模态遮罩通道（`--dsw-mask-blur`，默认 `none`）、个别 onboarding/拖拽遮罩（`blur(10px)` / `blur(32.609px)`）。**其余全部不透明**。
6. **最高危工程点**：`backdrop-filter` 会制造 `position:fixed` 包含块 ⇒ 输入卡、左栏列、Windows 标题栏都必须把模糊搬到 `::before/::after`（左侧 6 处已有实测事故编号：WE 的 #89 / #131 / #107 / #150 / #161 / #66）。
7. **红名单（保持不透明）**：Tooltip（深底白字）、代码块/行内代码、终端与编辑器、设置窗口与菜单（≥86%）、工具结果板——理由见 §9。

---

## 1. 证据与方法（可复核）

| 来源 | 用途 | 位置 |
|---|---|---|
| 全部 UI 包内嵌 CSS Modules | 类名、组件背景 token、位置/层叠、既有 blur | `.ref/asar/dsh/node_modules/@deepseek-ai/dsh-client-ui-*/lib/client.js` |
| primitives / dockkit 产物 | 菜单、Dialog、Tooltip、Toast、灯箱、Dockkit 布局的**真实 DOM 属性** | `.ref/asar/dsh/node_modules/@deepseek-ai/dsh-web-frontend/dist/assets/index-*.{js,css}` |
| 源码写死的属性名 | 稳定 hook 白名单 | 各包 `lib/client.js` 中 `"data-*"` / `role: "…"` / `slot key` |
| 运行时 DOM 快照（队友产物） | 核对真实嵌套：`[data-chat-flow]` 在列上、composer 座位是兄弟、右栏 `aria-hidden` 收起等 | `.ref/dom/surface-tree.txt` + `.ref/dom/tree.json` |
| 主题 token | 颜色/圆角/阴影/遮罩通道权威定义 | `baseline/ui-theme/design_platform.pretty.css`、`dsh-client-ui-theme` 的 `gradient-shadow-text.css` |
| WE 玻璃 CSS（含事故注释） | 已实测的 hook 约定与坑 | `baseline/ui-theme/we-glass-chat.css` / `we-glass-sidebar.css` / `we-controls-settings.css` |

> 说明：本次 `cordis_inspect_query(platform=client, provider=Slots/Theme)` 两次 10s 超时（页面未在前台连接），因此**以静态产物 + 运行时 DOM 快照为准**。slot 拓扑从各包注册的 key 与 DOM 中 `data-slot` 交叉确认，结论不依赖在线 inspect。

### CSS 类名的两种哈希形态（决定了哪些选择器能写）

| 形态 | 例 | 稳定性 | 可用的子串选择器 |
|---|---|---|---|
| 旧式 CSS Modules：`<hash>_<local>` | `.Dc7zOa_scrollBody`、`.cJsG2q_bubble`、`.RlGAzG_card` | 哈希随构建漂移 | `[class*="_scrollBody"]`、`[class*="_bubble"]` |
| primitives 形态：`_<local>_<modHash>_<line>` | `._bubble_12mhf_1`、`._material_ri079_21`、`._toast_l6cvn_6` | 同上，且行号会变 | `[class*="_material"]`、`[class*="_toast"]` |
| 库级全局类名（非哈希） | `.md-code-block`、`.cm-editor`、`.xterm` | **稳定**（跨构建不变） | 直接使用 |

> 所以：「按类名后缀子串」是**中稳定性**手段（WE 的 [class*="_bubble"] 就是这一档）；**高稳定性只认源码属性**。

---

## 2. 全局层级与 DOM 骨架

### 2.1 body 顶层（页面底 + 浮层宿主）

```
body                                    ← 页面底：background-color: var(--dsw-alias-bg-base)
├─ [aria-hidden] .dsg-atmosphere         ← 新玻璃插件自己的氛围层（z-index:-1 一类；不属于 DSH）
├─ div (#root)                           ← React 根
│   └─ [data-slot="root"]
│       └─ .<hash>_frame  [data-rightbar-collapsed] [data-animating?] [data-dragging?]
│           ├─ .<hash>_sidebarCol        ← 左栏（bg: --dsw-specific-sidebar-fill）
│           │   └─ [data-slot="sidebar"] ← 座位锚（**display:contents，不能画皮**）
│           ├─ .<hash>_centerCol         ← 主列（bg: --dsw-alias-bg-base）
│           │   └─ [data-slot="main"]    ← keyed main 面板：conversation | Plugins | 自动化任务 | …
│           ├─ .<hash>_rightbarCol       ← 右栏 track（默认 0 宽）
│           │   └─ [data-sidebar-right-panel="push|fullscreen"]
│           └─ .<hash>_bottomRow         ← shell.bottom（当前空）
├─ span                                  ← React portal 目标（设置窗口 / 菜单 / toast / tooltip 等挂这里或 body）
├─ [data-windows-menu]                   ← Windows 原生菜单锚
└─ …（插件注入的节点）
```

> **设置窗口 portal 在 `#root` 旁边（不在 frame 内）** —— ui-settings-general README 明确：portal beside `#root`。因此它不吃 frame 上的任何样式，只能从 `body` 世代的 `[role="dialog"][data-shortcut-modal="settings"]` 命中。

### 2.2 主壳三栏 + 中心列内部

```
frame (grid: [sidebar | center | rightbar] × rows)
├─ sidebarCol 264–320px（折叠 56px rail；<1024px 自动折叠）
│   ├─ brand / 新会话 / 全局面板列表 [data-slot="sidebar.panellist"]
│   ├─ 工作区+会话列表 [data-slot="sidebar.workspaces"]
│   └─ footer：设置 [data-slot="sidebar.settings"] / 用户 [data-slot="sidebar.footer.action"]
├─ centerCol
│   └─ [data-slot="main"] = conversation（默认）
│       └─ .<hash>_root[data-phase=hero|active]
│           ├─ header  :[data-conversation-header-leading] / [data-conversation-header-corner]
│           │            + [data-conversation-tabs]（role=tablist；对话 / 轨迹 / 上下文 / 插件 View）
│           ├─ body [data-conversation-content][data-conversation-region=chat][data-content-phase]
│           │   └─ [data-conversation-scroll]（滚动容器，sticky composer 挂这里）
│           │       ├─ [data-slot="conversation.session"]
│           │       │   └─ .<hash>_viewArea → [data-slot="conversation.view"]
│           │       │       └─ chat frame → [data-chat-flow]（**列，不是滚动容器**）
│           │       │           ├─ [data-chat-flow-kind=user]        → [data-slot="conversation.chat.node"] → .userRow > .userStack > ._bubble
│           │       │           ├─ [data-chat-flow-kind=turn-process]→ 思考条/工具行分组
│           │       │           ├─ [data-chat-flow-kind=tool-call]   → [data-slot="tool.call.toolview"] → [data-chat-call-id]
│           │       │           └─ assistant 文本（无气泡，直接 markdown）
│           │       └─ [data-composer-seat][data-conversation-region=composer]  ← sticky 座位
│           │           ├─ [data-composer-card]（输入卡；含 fixed 后代，见 §8）
│           │           ├─ [data-composer-dock]（模型 / 权限 / 统计 / 上下文占用）
│           │           └─ 链式接管：提问卡 / 计划审阅卡 / 审批卡（占用座位，非浮层）
│           └─ 宽度拖拽把手：[data-width-handle][data-side=left|right]
└─ rightbarCol
    └─ [data-sidebar-right-panel][data-sidebar-right-open?]  ← 同一次会话一个 dock 面
        └─ Dockkit：split 树（[data-dockkit-*]）
            ├─ tab strip：[data-dockkit-strip] / [data-dockkit-strip-tabs] / [data-dockkit-strip-chrome]
            └─ pane：[data-dockkit-pane] > [data-dockkit-pane-active] → tab 内容
                （文件树 / 浏览器 / 终端 / 文档预览 / 计划 / 交付物 / 日程详情）
```

### 2.3 浮层层级（z-index 实测）

| 层 | 元素 | z-index | 定位 | 备注 |
|---|---|---|---|---|
| 1 | 主壳 | 普通流 | — | frame 内 `overflow:hidden` |
| 2 | 右栏 track / 宽度把手 | 0–10 | relative/absolute | `--dsh-dockkit-dock-layer:10` |
| 3 | Dockkit 浮动面板 | 60（`--dsh-dockkit-float-layer`） | **fixed** | 圆角 panel，可拖拽 |
| 4 | 会话 header 内 tab/按钮 | 1 | relative | |
| 5 | 思考条吸顶 / 代码块 banner | 6–7 | sticky | |
| 6 | composer 座位 sticky | 7（有 `[data-trigger-menu]` 时 9） | sticky | |
| 7 | 会话内自绘弹出（模型选择、权限、日程 picker、stat dialog） | 100–1100 | fixed | 多为 `--dsw-specific-menu` + `--dsw-menu-backdrop-filter` |
| 8 | 菜单（MenuSurface） | 100（+ submenu 101） | absolute/portal | `[data-menu-material]`，darwin 另有 fixed backing |
| 9 | Tooltip | 100 / portal 1100 | **fixed** | `[role="tooltip"]` |
| 10 | Toast | 1100 | **fixed** | top:40px，居中 |
| 11 | 模态层（Dialog / Settings / 灯箱 / 安装框） | 1000–1001 | **fixed inset 0** | 遮罩 + 面板 |
| 12 | 拖拽遮罩（DropOverlay）/ dock 拖拽 scrim | 1000 / 10 | **fixed** / absolute | `bg-mask-drop` + `blur(10px)` |

---

## 3. 玻璃档位定义（与 GLASS-SPEC §4.4 对齐）

| 档 | 语义 | 典型面 | 可读性策略 |
|---|---|---|---|
| **L0** | 不玻璃化（保持原生/近不透明） | Tooltip、Hovercard、代码块内部、终端/编辑器、输入框控件、图片/iframe 内容 | 保对比度；只允许装饰性高光/阴影 |
| **L1** | 内容面 · 轻雾 | 页面底、左栏、标题栏、对话画布、轨迹、工具结果板、推理行 | 大面积文字；允许低 alpha 填充（GLASS-SPEC 有效不透明度 ≈52%/66%） |
| **L2** | 卡片面 · 中雾 | composer 卡、用户气泡、提问/计划/审批卡、Todo/Queue dock、侧栏卡片、插件卡、设置卡片、右栏面板 | 卡片自带圆角+rim；交互文字，中等 alpha（≈67%/76%） |
| **L3** | 浮层面 · 高雾 | Dialog、设置整窗、菜单、Toast、灯箱、右栏全屏、文档预览 | 命中区小/文字密；高 alpha（≈85%/89%，上限 92%） |

> 数字来自 `docs/GLASS-SPEC.md` §4.4（B 预设），本文只引用档位语义，不另行定义公式。实现时以 GLASS-SPEC 的 `--dsg-*` 变量为准。
>
> **为什么只到 L3**：本仓最重的表面是满屏模态/设置整窗，GLASS-SPEC 的 L3 上限（有效 92%）已够；L4 预留给「满屏壁纸遮罩 / 整页氛围层」这类未来面（当前只有遮罩通道 `--dsw-alias-bg-mask-*` 承担，不需要独立玻璃档）。若实现侧沿用 L0–L4 五档编号，把本文 L3 当 L3、L4 留空即可。

---

## 4. 表面总表

> 列说明：**高稳定 hook** = 源码写死的属性/role/slot key（可跨构建）；**中稳定 hook** = token/语义属性/库级类名/类名后缀子串；**现有 blur** = 宿主原生是否已有 `backdrop-filter`。
> 「建议」列只给档位；具体配方见 GLASS-SPEC §1、§6。

### 4.1 壳层与页面底

| 表面 | 触发 | 高稳定性 hook | 中稳定性 hook | 当前背景 token | 现有 blur | 建议玻璃等级 |
|---|---|---|---|---|---|---|
| 页面底（整窗） | 常驻 | `html`、`body`、`body[data-ds-dark-theme]`、`html[data-platform=darwin]`、`html[data-windows-titlebar]` | `[data-slot="root"] > [class*="_frame"]`、`[class*="_centerCol"]` | `--dsw-alias-bg-base`（body + frame + centerCol 三处同值） | 无 | **L1** |
| Windows 窗口标题栏 | Windows Electron 常驻 | `html[data-windows-titlebar]`、`[data-window-drag]`、`--dsh-windows-titlebar-height` | `[data-windows-titlebar] [class*="_frame"]::before`（背景）/ `::after`（模糊） | `--dsw-specific-sidebar-fill` | 无 | **L1**（模糊必须放 `::after`，见 §8） |
| macOS 标题条 / 拖拽行 | darwin 桌面 | `html[data-platform=darwin]`、`[data-shell-leading]`、`[data-window-drag]` | `[data-window-drag]` 行、`[data-conversation-header-leading]` | 透明（`[data-platform=darwin] ._frame` 为 `background:0 0`） | 无 | **L0/L1** |
| 左栏列 | 常驻，可折叠 | `div:has(> [data-slot="sidebar"])`（WE 已验证）、`[data-slot="sidebar"]`（锚点，**display:contents**）、`[data-sidebar-collapsed]`、`[data-shell-leading]` | `[class*="_sidebarCol"]`、`[class*="_root"]`（侧栏包内）、`[class*="_newSession"]` | `--dsw-specific-sidebar-fill`（darwin 另叠渐变） | 无 | **L2**（模糊放 `::before`） |
| 左栏导航行（面板/会话） | 切换面板 / 选中会话 | `[data-slot="sidebar.panellist"]`、`[data-slot="sidebar.workspaces"]`、`[data-row-key]`、`[data-dsh-reorder]` | `[class*="_panelRow"]`、`[class*="_panelActive"]`、`[class*="_sessionRow"]` | hover：`--dsw-alias-interactive-bg-hover`；active：`--dsw-specific-sidebar-nav-item-active` / `-active-accent` | 无 | **L0**（行内不铺底，随左栏） |
| 左栏 footer（设置/用户/版本） | 常驻 | `[data-slot="sidebar.settings"]`、`[data-slot="sidebar.footer.action"]`、`[data-slot="settings.trigger"]`、`[data-slot="settings.launcher"]` | `[class*="_triggerRow"]`、`[class*="_launcher"]` | 透明；hover 用 `--dsw-alias-interactive-bg-hover` | 无 | **L0/L2**（触发按钮可胶囊化） |

### 4.2 中心列：对话壳与查看页

| 表面 | 触发 | 高稳定性 hook | 中稳定性 hook | 当前背景 token | 现有 blur | 建议玻璃等级 |
|---|---|---|---|---|---|---|
| 会话 header（标题/动作/tab 行） | 常驻 | `[data-conversation-region]`、`[data-conversation-tabs]`、`[data-conversation-header-leading]`、`[data-conversation-header-corner]`、`[data-slot="conversation.header"]`、`[data-slot="conversation.session.header.actions"]` / `[data-slot="conversation.session.header.utilities"]` / `[data-slot="conversation.session.header.lineage"]` / `[data-slot="conversation.session.header.corner"]` | `[class*="_header"]`、`[class*="_headerLeading"]`、`[class*="_tabs"]`、`[class*="_tabActive"]` | 透明；底边线 `--dsw-alias-border-l3`；active 下划线 `--dsw-alias-state-business-primary` | 无 | **L1**（滚动时给 header 加一层低 alpha 填充，勿对 header 本体上 blur） |
| 对话画布 / 滚动容器 | 常驻 | `[data-conversation-scroll]`、`[data-conversation-content]`、`[data-conversation-region=chat]`、`[data-slot="conversation.view"]`、`[data-phase="active"]` / `[data-phase="hero"]` | `[class*="_scrollBody"]`、`[class*="_column"]`、`[class*="_frame"]` | 透明；conversation root 为 `--dsw-alias-bg-base` | 无 | **L1** |
| Hero（空会话标题区） | 新会话/空会话 | `[data-phase=hero]`、`[data-slot="conversation.hero.brand.mark"]`、`.agentPreset`、`.options`、`.workspace` | `[class*="_headline"]`、`[class*="_composerHero"]`、`[class*="_heroOptions"]` | 透明（无底板） | 无 | **L0/L1**（不建议铺底，避免与输入卡重复加雾） |
| 空态占位 / 无会话 | 未选会话 | `[data-slot="main"]` 下空态节点、`[data-slot="conversation.content"]` | `[class*="_headerSessionless"]` | 透明 | 无 | **L0** |
| 轨迹页（View tab） | 点「轨迹」tab | `[data-conversation-tabs]` 选中态 + `[data-slot="conversation.view"]`、`[data-trajectory-scroll]`、`[data-trajectory-row-key]`、`[data-timeline-*]`、`[data-virtual-spacer]`、`[data-request-run-index]`、`[data-turn-start]` / `[data-turn-end]` | `[class*="_tablePane"]`、`[class*="_overviewPreview"]`、`[class*="_programPanel"]`、`[class*="_table"]`、`[class*="_details"]` | 根/工具条/面板：`--dsw-alias-bg-layer-1`；表头 th：`--dsw-specific-sidebar-fill`；JSON payload：`--dsw-alias-markdown-code-block` | **无**（实测该模块 0 条 backdrop-filter） | **L1 + 补霜**（WE 已用同一结论） |
| 其它 View tab（上下文/画布/编队…） | 点对应 tab | `[data-conversation.view]` 由插件注册；`[data-context-*]` 一组属性 | 各 view 包内 `[class*="_root"]` | 多为透明或 `--dsw-alias-bg-layer-1` | 无 | **L1**（按 view 各自实现，先不批量接管） |
| 内容宽度拖拽把手 | hover 画布左右留白 | `[data-width-handle][data-side]`、`[data-dragging]` | `[class*="_widthHandle"]` | 渐变线 `--dsw-alias-scrollbar-bg-l1` | 无 | **L0**（不铺底） |

### 4.3 输入区与座位接管卡

| 表面 | 触发 | 高稳定性 hook | 中稳定性 hook | 当前背景 token | 现有 blur | 建议玻璃等级 |
|---|---|---|---|---|---|---|
| composer 座位（sticky 底板） | 常驻 | `[data-composer-seat]`、`[data-conversation-region=composer]` | `[class*="_composerSeat"]` | `linear-gradient(180deg, transparent 0, var(--dsw-alias-bg-base) 36px)`（sticky 贴底渐变） | **无，且禁止加**（内部有 fixed 后代，见 §8） | **L0/L1**（维持渐变；用户口径：不要座位底板+霜） |
| composer 输入卡 | 常驻 | `[data-composer-card]`、`[data-composer-input]`、`[data-composer-text-ref]`、`[data-composer-command]` | `[class*="_card"]`（限座位内）、`[class*="_input"]` | `--dsw-specific-input-major`（浅 `#fff` / 深 `#353638`）+ `--dsw-elevation-soft` + radius `--dsw-radius-panel` | 无。**模糊只能放 `[data-composer-card]::before`** | **L2** |
| composer dock 行（模型/权限/统计/上下文） | 常驻 | `[data-composer-dock]`、`[data-slot="conversation.input.model"]` / `.permission` / `.left` / `.right` / `.activity`、`[data-composer-stat]` | `[class*="_dock"]`、`[class*="_trigger"]` | 透明；hover `--dsw-alias-interactive-bg-hover` | 无 | **L0**（跟随输入卡，不单独铺） |
| 队列 dock（Queue） | 运行中发消息 | `[data-queue-dock]`、`[data-slot="conversation.composer.dock"]` | `[class*="_queueDock"]`、`[class*="_root"]` | `--dsw-specific-menu` + `--dsw-menu-backdrop-filter`（部分包） | 有（若走 MenuSurface 通道则为 `blur(40px)`） | **L2** |
| Todo dock（任务进度） | 计划执行中 | `[data-slot="conversation.composer.dock"]`（TodoPanel） | `[class*="_root"]`（TodoPanel） | `--dsw-specific-menu` | **有**：`backdrop-filter: var(--dsw-menu-backdrop-filter)` | **L2/L3**（沿用菜单通道即可） |
| Goal bar | 有活动 goal | `[data-goal-bar]`、`[data-slot="conversation.input.dock"]` | `[class*="_bar"]` | 半透明底色 + `::before` 承载 `--dsw-specific-menu` + `--dsw-menu-backdrop-filter` | **有**（菜单通道） | **L2** |
| 提问卡（ask_user_question） | Host 提问等待 | `[data-question-key]`、`[data-question-scroll]`、`[data-question-reply]`、`[data-slot="conversation.composer"]`（链式接管） | `[class*="_card"]`、`[class*="_option"]`、`[class*="_body"]` | `--dsw-specific-input-major` + `--dsw-elevation-panel` + radius `--dsw-radius-xl` | 无（WE 需补 `[data-question-key] [class*="_card"]`） | **L2** |
| 计划审阅卡（exit_plan_mode） | Agent 请求批准计划 | `[data-plan-review-key]`、`[data-slot="conversation.plan-review.actions"]` | `[class*="_card"]`、`[class*="_strip"]` | `--dsw-specific-input-major` + `--dsw-elevation-panel`；strip 用 `--dsw-alias-state-warn-tertiary` | 无 | **L2** |
| 审批卡（tool permission） | 工具待批准 | `[data-approval-key]`、`[data-approval-scroll]`、`[data-slot="conversation.approval.detail"]` | `[class*="_card"]`、`[class*="_strip"]`、`[class*="_actionRow"]` | `--dsw-specific-input-major` + `1px` warn 边 + `--dsw-shadow-lv2` | 无 | **L2** |
| 输入区弹出层（overlay anchor） | 打开模型/权限/命令菜单 | `[data-composer-overlay]`、`[data-conversation-composer-overlay]`、`[data-trigger-menu]`、`[data-input-scroll]` | `[class*="_overlayAnchor"]`、`[class*="_panel"]` | 子菜单各自决定（多为 `--dsw-specific-menu`） | 部分有（菜单通道） | **L3**（按菜单处理） |

### 4.4 对话内容面（气泡 / 思考 / 工具 / 代码 / 计划 / 交付物）

| 表面 | 触发 | 高稳定性 hook | 中稳定性 hook | 当前背景 token | 现有 blur | 建议玻璃等级 |
|---|---|---|---|---|---|---|
| 用户气泡 | 发送消息 | `[data-chat-flow-kind=user]` + `[data-slot="conversation.chat.node"]` + `[data-slot="conversation.chat.user.content"]` | `[class*="_bubble"]`（**必须 `:not([role="tooltip"])`**）、`[class*="_userStack"]` | `--dsw-specific-bubble`（浅 `deepseek-50` / 深 `neutral-bluish-850`）+ radius `--dsw-radius-xl` | 无 | **L2** |
| AI 正文（markdown） | 常驻 | `[data-chat-flow-kind]`（assistant/节点）、`[data-slot="conversation.chat.node"]` | `[class*="_body"]`（AssistantMarkdown） | 透明（无卡片） | 无 | **L0**（文字直接落画布；不建议再上板） |
| 思考触发条（TurnTrigger） | 模型思考中/已完成 | `[data-turn-trigger]`、`[data-chat-flow-kind=turn-process]`、`[data-turn-process-member]` | `[class*="_root"]`（TurnTriggerNodeView） | `--dsw-alias-turn-trigger-bg`（fallback `--dsw-alias-markdown-code-block`）+ 0.5px `--dsw-alias-border-l1`；hover `-turn-trigger-bg-hover` | 无 | **L2** |
| 推理体（展开的思考内容） | 点开思考条 | `[data-variant="think"]`（Host 写在推理根）、`[data-expanded]`、`[data-disclosure-header]`、`[data-streaming]` | `[class*="_thinkBody"]`、`[class*="_summary"]` | 透明；吸顶 header 为 `--dsw-alias-bg-base` | 无 | **L1 或清底**（WE 口径：推理面清底、不加霜） |
| 回合处理分组（turn-process 分隔/汇总） | 一回合内多步 | `[data-turn-process]`、`[data-turn-process-messages]` / `[data-turn-process-subagents]` / `[data-turn-process-tool-calls]`、`[data-step-process]`、`[data-shimmer-decoration]` | `[class*="_root"]`、`[class*="_chevron"]` | 透明 + 底边 `.5px --dsw-alias-border-l2` | 无 | **L1** |
| 工具调用行（折叠态） | Agent 调工具 | `[data-slot="tool.call.toolview"]`、`[data-chat-call-id]`、`[data-chat-anchor-key]`、`[data-disclosure-row]`、`[data-disclosure-header]`、`[data-expandable]`、`[data-state]`、`[data-tool]`、`[data-variant]`、`[data-subcalls]` | `[class*="_callRow"]`、`[class*="_row"]`、`[class*="_title"]`、`[class*="_summary"]` | 透明（行本身不铺底） | 无 | **L0/L1**（玻璃给展开后的详情卡，不给行） |
| 工具详情卡（展开） | 展开工具行 | 同上 + `[data-tool=read]` / `[data-tool=grep]` / `[data-tool=glob]` / `[data-tool=write]` / `[data-tool=bash]`、`[data-inspect]`、`[data-sample]`、`[data-caption]`、`[data-change]`、`[data-tone]` | `[class*="_root"]`（ToolDetails）、`[class*="_ioCard"]`、`[class*="_ioSection"]` | `--dsw-alias-markdown-code-block` | 无 | **L1 平铺板**（WE：a+0.06，接近不透明） |
| 工具结果：终端输出 | bash/pwsh 结果 | `[data-sample="bash"]` + `[data-terminal]` | `[class*="_terminal"]`、`[class*="_bodyScroll"]` | `--dsw-alias-markdown-code-block` | 无 | **L0/L1 近不透明**（ANSI 调色板按不透明底设计） |
| 工具结果：读文件/搜索/glob | read / grep / glob | `[data-tool="read"] [data-read]`、`[data-tool="grep"] [data-search="matches"]`、`[data-tool="glob"] [data-search="paths"]` | `[class*="_readBody"]`、`[class*="_searchBody"]` | `--dsw-alias-markdown-code-block` | 无 | **L1 近不透明** |
| 工具结果：diff | edit/write 结果 | `[data-tool="write"] [data-diff]`、`[data-diff-line]`、`[data-diff-hunk-header]`、`[data-diff-side]` | `[class*="_diffBody"]`、`[class*="_diffAdded"]`、`[class*="_diffRemoved"]` | 行底 `--dsw-alias-file-diff-*`（不透明专用色） | 无 | **L0**（diff 行色不能透明化，保留加色板） |
| 工具结果：上下文注入 | 上下文折叠块 | `[data-context-injection-body]`、`[data-chat-flow-kind="context"]`、`[data-context-*]` 族 | `[class*="_contextRow"]` | 透明/`--dsw-alias-bg-layer-1` | 无 | **L1 平铺板** |
| 代码块（围栏） | markdown 代码 | `.md-code-block`（**库级稳定类名**）、`[data-code-block-banner]`、`[data-code-wrap]`、`[data-line-numbers]` | `[class*="_block"]`（primitives）、`pre`、`code` | `--dsl-code-block-background` → `--dsw-alias-markdown-code-block`（浅 `#f9fafb` / 深 `#1b1b1c`）；banner `--dsw-alias-markdown-code-block-banner` | 无 | **L0**（红名单：Shiki 前景固定，地板 ≥75%） |
| 代码块吸顶 banner | 滚动代码块 | `[data-code-block-banner]`、父级 `[class*="_bannerWrap"]`（sticky top:0 z6，宿主题内） | `[class*="_banner"]`、`[class*="_copyButton"]` | 父 `background-color: var(--dsw-alias-bg-base)`（sticky 板）；banner 自身 `banner-background-color` | 无 | **L0/L1**（吸顶板必须补一层不透明；WE #156④ 已踩） |
| 行内代码 / 标签 / 引用 | markdown 内联 | `:not(pre) > code`（在 `[data-chat-flow]` 内） | `.md-code-block` 排除 | `--dsw-alias-markdown-inline-code` / `-tag` | 无 | **L0**（WE：#197 行盒会拼成整列条，禁止加 blur） |
| Plan 预览卡（流程中） | Agent 产出计划 | `[data-plan-card]`、`[data-plan-preview]`、`[data-plan-artifacts]`、`[data-slot="conversation.chat.turnTail"]` | `[class*="_card"]`（PlanPreview） | `--plan-card-fill`（包内变量）+ 0.5px `--dsw-alias-border-l1` | 无 | **L2** |
| 交付物 / 变更文件卡 | 产出文件 | `[data-changed-files]`、`[data-presented-file]`、`[data-presented-files-row]`、`[data-review-file]`、`[data-review-view]` | `[class*="_card"]`、`[class*="_file"]`、`[class*="_tile"]` | `--dsw-alias-bg-layer-1` | 无 | **L2** |
| 图片附件（消息内） | 发送/接收图片 | `[data-slot="conversation.chat.user.images"]`、`[data-slot="conversation.chat.message.images"]`、`[data-message-attachments]` | `[class*="_gallery"]`、`[class*="_frame"]`、`[class*="_thumbnail"]` | `--dsw-alias-interactive-bg-hover`（缩略图框） | 无 | **L0**（图片本身不糊） |
| 子代理 / skill / jobs / workflow 卡片 | 子代理运行、技能、后台任务、工作流 | `[data-slot="conversation.chat.node"]` 下各包 `[data-*]`：`data-sidebar-chat`、`data-member-status`、`data-run-status`、`data-kill-state`、`data-expandable`、`data-state` | 包内 `[class*="_card"]`、`[class*="_row"]` | 多为透明或 `--dsw-alias-bg-layer-1` | 无 | **L1/L2**（按卡片是否可读代码定） |

### 4.5 右栏（Dockkit）

| 表面 | 触发 | 高稳定性 hook | 中稳定性 hook | 当前背景 token | 现有 blur | 建议玻璃等级 |
|---|---|---|---|---|---|---|
| 右栏面板容器 | 打开右栏（header corner 按钮/快捷键） | `[data-rightbar-col]`、`[data-sidebar-right-panel="push"]` / `[data-sidebar-right-panel="fullscreen"]`、`[data-sidebar-right-open]`、`[data-sidebar-right-session]`、`[data-rightbar-fullscreen]`、`[data-rightbar-collapsed]`、`[data-rightbar-instant]` | `[class*="_rightbarCol"]`、`[class*="_panel"]`（右栏包） | 容器自身无底色；内层 `[data-dockkit-host]` tabHost 为 `--dsw-alias-bg-base` | 无 | **L2**（面板）/ **L3**（全屏）；**必须带 `[data-sidebar-right-open]` 守卫** |
| Dockkit tab strip（右栏顶边） | 常驻（面板内） | `[data-dockkit-strip]`、`[data-dockkit-strip-tabs]`、`[data-dockkit-strip-chrome]`、`[data-dockkit-host="dock"]`、`[data-dockkit-column]` | `[class*="_tabStrip"]`、`[class*="_stripChrome"]`、`[class*="_tab"]`、`[class*="_tabActive"]`、`[class*="_slot"]` | 透明；分隔线 `.5px --dsw-alias-border-l4`；选中 accent `--dsw-alias-brand-primary-new-colorprimary-new-color` | 无 | **L1**（作为面板的一部分，不单独铺） |
| Dockkit 分栏 / 拖拽手柄 | hover 分栏线 | `[data-dockkit-pane]`、`[data-dockkit-pane-active]`、`[data-dockkit-divider]`、`[data-dockkit-content]` | `[class*="_pane"]`、`[class*="_divider"]`、`[class*="_splitRow"]`、`[class*="_splitColumn"]` | `--dsw-alias-bg-base`（pane）；手柄渐变 `--dsw-alias-label-caption` | 无 | **L1** |
| Dockkit 浮动面板 | 把 tab 拖出/浮动 | `[data-dockkit-float]`、`[data-dockkit-float-active]`、`[data-dockkit-pane]` | `[class*="_float"]`、`[class*="_floatHeader"]`、`[class*="_floatBody"]` | `--dsw-alias-bg-layer-2` + radius `--dsw-radius-panel` + `--dsw-elevation-prominent` | 无 | **L3** |
| 文件树（Files） | 右栏 Add → Files | `[data-slot="sidebar.right.pane.tab"]`（Files 类型）、`[data-files-root]`、`[data-files-body]`、`[data-files-row]`、`[data-files-path]`、`[data-files-state]`、`[data-files-code]`、`[data-files-auto-refresh]` | `[class*="_viewport"]`、`[class*="_root"]` | 透明（继承 panel 的 `--dsw-alias-bg-base`） | 无 | **L1**（面板级），行 hover 用 `--dsw-alias-interactive-bg-hover` |
| 浏览器面板（Browser） | 右栏打开网页 | `[data-slot="sidebar.right.pane.tab"]` + `[data-address]`/`[class*="_webview"]`（无专属 data 属性）；用 `[data-dockkit-pane]` 限定 | `[class*="_root"]`、`[class*="_toolbar"]`、`[class*="_address"]`、`[class*="_frame"]` | `--dsw-alias-bg-base`；地址栏 `--dsw-alias-bg-layer-1`；变更态 `bg-layer-2` | 无 | **L1 面板 / L0 webview**（iframe 内容不可控，必须保持宿主框不透明） |
| 终端（Terminal） | 右栏终端 tab / 工具终端 | `[data-slot="sidebar.right.pane.tab"]`（terminal 类型）、`[data-terminal]`（工具内）、`[data-sidebar-right-guide-entry]` | `[class*="_main"]`、`[class*="_titleRow"]`、`[class*="_description"]` | `--dsw-alias-bg-base`；xterm 自绘不透明 | 无 | **L0/L1**（xterm 调色板需 ≥84% 底板） |
| 文档预览（Markdown/代码/图片/HTML/PDF/Office） | 点文件/演示文件/计划文档 | `[data-document-preview]`、`[data-textpreview-wrap]`（+`-path`、`-page`、`-line`、`-state`、`-plain`、`-changed`、`-more`）、`[data-code-preview]`、`[data-code-block-content]`、`[data-image-preview]`、`[data-html-preview]`、`[data-document-markdown]`、`[data-document-frontmatter]`、`[data-document-zoom-*]`、`[data-office-font-warning]`、`[data-slot^="sidebar.right.tab.document"]` | 包内 `[class*="_body"]`、`[class*="_frame"]`、`[class*="_header"]`、`[class*="_path"]`、`[class*="_status"]` | Markdown：透明；PDF body：`--dsw-alias-bg-document-preview`；frontmatter：`--dsw-alias-bg-layer-1`；缩放面板：`bg-layer-1/2` | 无 | **L3 面板**；内容区按类型：代码/PDF/Office **近不透明**，图片 **L0** |
| 右栏引导页（Guide） | 空右栏 / Add → guide | `[data-sidebar-right-guide]`、`[data-sidebar-right-guide-entry]`、`[data-sidebar-right-mode]`、`[data-sidebar-right-tab]`、`[data-slot="sidebar.right.tab.guide"]`、`[data-slot="sidebar.right.tab.guide.entry"]` | `[class*="_entry"]`、`[class*="_hero"]` | entry 卡：`--dsw-alias-bg-layer-1` | 无 | **L2** |

### 4.6 设置窗口 / 插件页面 / 其它主面板

| 表面 | 触发 | 高稳定性 hook | 中稳定性 hook | 当前背景 token | 现有 blur | 建议玻璃等级 |
|---|---|---|---|---|---|---|
| 设置窗口遮罩 | 侧栏「设置」/ `Mod+,` | `[role="presentation"]`（portal root）内的 mask；父级 `:has([role="dialog"][data-shortcut-modal="settings"])` | `[class*="_mask"]`（限定在该 portal 内） | `--dsw-alias-bg-mask-1` + `backdrop-filter: var(--dsw-mask-blur)`（当前 `none`） | **通道存在、默认关** | **L3**（建议开 `--dsw-mask-blur`，见 §6.3） |
| 设置窗口面板 | 同上 | **`[role="dialog"][aria-modal="true"][data-shortcut-modal="settings"]`**、`[role="dialog"]:has([data-slot="settings.section"])` | `[class*="_panel"]`（SettingsRoot） | `--dsw-alias-bg-layer-2` + radius `--dsw-radius-panel` + `--dsw-elevation-prominent`；800×800 上限 | 无 | **L3** |
| 设置左导航 | 打开设置 | `[data-slot="settings.header"]`、`[data-slot="settings.section"]`（导航投影）、`[data-modal-autofocus]`、`[aria-current="true"]` | `[class*="_nav"]`、`[class*="_navCell"]`、`[class*="_navLabel"]` | 透明；hover `--dsw-specific-sidebar-nav-item-hover`；active `--dsw-specific-sidebar-nav-item-active` | 无 | **L3 内嵌**（跟随面板；行不单独上模糊） |
| 设置内容区 | 切换 section | `[data-slot="settings.section"]`、`[data-slot="settings.general.item"]`、`[data-slot="settings.plugins.tab"]`、`[data-slot="settings.models"]`、`[data-slot="settings.theme"]`、`[data-slot="settings.account"]` | `[class*="_options"]`、`[class*="_section"]` | 透明（面板底 `bg-layer-2`） | 无 | **L3** |
| 设置卡片（官方插件卡/模型行/主题卡） | General/Models/Plugins 页 | `[data-slot="settings.general.item"]`、`[data-slot="settings.plugins.tab"]`、`[data-plugin-*]`（插件页） | `[class*="_card"]`、`[class*="_rowCard"]`、`[class*="_cardContent"]` | `--dsw-alias-settings-card-fill`（= `bg-layer-2`）+ `--dsw-alias-settings-card-stroke`（=`border-l4`） | 无 | **L2**（在 L3 面板内的卡片可略透） |
| 设置表单行 / 输入框 | 编辑配置 | 表单控件在 primitives；行容器 `[class*="_row"]`（各 section 包） | `[class*="_field"]`、`[class*="_label"]`、`input`、`textarea`、`select` | 行底透明 + 底边 `.5px --dsw-alias-border-l2`；输入底 `--dsw-alias-bg-layer-1` | 无 | **L0**（输入控件保持不透明） |
| 插件管理页（Plugins，main 面板） | 侧栏「插件」 | `[data-slot="main"]` + **`section[data-plugin-panel]`**、`[data-plugin-group]`、`[data-plugin-item]`、`[data-plugin-row]`、`[data-plugin-rows]`、`[data-plugin-status]`、`[data-plugin-scope]`、`[data-plugin-tab]`、`[data-plugin-highlight]` | `[class*="_page"]`、`[class*="_cards"]`、`[class*="_group"]`、`[class*="_toolbar"]`、`[class*="_pageTabs"]` | 页面底透明（吃 centerCol 的 `bg-base`）；卡片 `--dsw-alias-settings-card-fill` | 无 | **L1 页面 + L2 卡片** |
| 插件详情页（bundle / row / official） | 点插件卡 | **`[data-plugin-detail="<pkg>"]`**、`[data-plugin-rows]`、`[data-plugin-config]`、`[data-plugin-row-detail]`、`[data-plugin-item-detail]`、`[data-plugin-name]`、`[data-slot="plugins.bundle.config"]`、`[data-slot="plugins.row.config"]`、`[data-slot="plugins.detail.section"]`、`[data-slot="plugins.detail.actions"]`、`[data-slot="plugins.detail.badge"]` | `[class*="_detail"]`、`[class*="_detailSection"]`、`[class*="_detailTop"]`、`[class*="_crumb"]` | 透明 + 卡片 `settings-card-fill`；输入 `bg-layer-3` | 无 | **L2** |
| 插件市场（Discover tab + 条目详情） | Plugins → Discover | `[data-plugin-tab]`、`[data-market-entry]`、`[data-market-detail]`、`[data-market-version]`、`[data-slot="plugins.tab"]` | `[class*="_card"]`、`[class*="_detail"]`、`[class*="_facts"]`、`[class*="_versions"]` | 卡片透明、hover `--dsw-alias-interactive-bg-hover`；详情区透明 | 无 | **L2** |
| 安装对话框（含向导/进度） | Install / 更新 / 取消 | `[role="dialog"][aria-modal="true"]` + `[data-install-phase]`、`[data-install-approval]`、`[data-install-registry]`、`[data-install-guide]`、`[data-install-subject]`、`[data-modal-autofocus]` | `[class*="_installDialog"]`、`[class*="_wizard"]`、`[class*="_installBody"]` | `--dsw-alias-bg-layer-2`（primitives Dialog）+ 内部 `bg-layer-3` 字段 | 通道（mask 默认 none） | **L3** |
| 自动化任务页（Schedule） | 侧栏「自动化任务」 | `[data-slot="main"]`；页内 `[data-session-schedule-task]`、`[data-session-schedule-tasks]`、`[data-schedule-reminder-entry]`、`[data-detail-tab]`、`[data-menu-field]` | `[class*="_page"]`、`[class*="_pageContent"]`、`[class*="_listPane"]`、`[class*="_detail"]`、`[class*="_ruleCard"]` | 页面 `--dsw-alias-bg-base`；通知/行 hover 用 `--dsw-alias-interactive-bg-hover`；规则卡 `bg-layer-1` | 无 | **L1 页面 + L2 卡** |
| 技能中心 / MCP 连接器 / 其它 main 面板 | 侧栏对应入口 | `[data-slot="main"]`；各包自有 data-*（如 cordis 的 `[data-cordis-panel]`、`[data-cordis-row]`，skill 的 `[data-slot="tool.call.toolview"]` 卡） | 各包 `[class*="_page"]`、`[class*="_panel"]` | 多为 `--dsw-alias-bg-base` / `bg-layer-1` | 无 | **L1 页面 + L2 卡** |
| 主面板底部槽（shell.bottom） | 当前为空 | `[data-shell-bottom]` | `[class*="_bottomRow"]` | `--dsw-alias-bg-base` | 无 | **L1**（占用者自决，默认留空） |

### 4.7 浮层与系统表面

| 表面 | 触发 | 高稳定性 hook | 中稳定性 hook | 当前背景 token | 现有 blur | 建议玻璃等级 |
|---|---|---|---|---|---|---|
| 菜单 / 下拉（MenuSurface） | 点・右键・快捷键 | **`[data-menu-material="translucent"]`**、`[data-menu-material]`、`[data-menu-backing]`（darwin portal）、`[data-menu-field]`、`[role="menu"]`、`[aria-haspopup]` | `[class*="_surface"]`、`[class*="_material"]`、`[class*="_backing"]`、`[class*="_list"]`、`[class*="_item"]`、`[class*="_submenu"]` | 材质层：`--dsw-menu-surface-fill`（浅 `#f8f9fa94` / 深 `#43454a73`）；darwin：`--dsw-specific-menu` `#f8f9faf0` / `#303136f0` | **有**：`backdrop-filter: var(--dsw-menu-backdrop-filter)` = `blur(40px) saturate(150%)` | **L3（已玻璃，只调参）** |
| 会话内自绘弹出（模型选择 / 权限 / 日程 picker / 子代理菜单 / stat dialog） | 点对应 trigger | `[data-model-id]`、`[data-provider-id]`、`[data-selection-focus]`、`[data-menu-field]`、`[data-slot="conversation.input.model"]`、`[data-slot="sidebar.right.tab.menu.item"]` | `[class*="_menu"]`、`[class*="_panel"]`、`[class*="_root"]` | 多为 `--dsw-specific-menu`；部分 `::before` 承载 + `--dsw-menu-backdrop-filter` | **部分有**（走菜单通道） | **L3** |
| Tooltip（primitives Tooltip） | hover / focus | **`[role="tooltip"]`**（全 asar 仅此一处，primitives 写死） | `[class*="_bubble"]`（**必须排除**，见 §9.2）、`[class*="_label"]` | `--dsw-alias-tooltip-bg`（浅 `#2c2c2e` / 深 `#43454a`）；文字固定 `--dsw-static-neutral-bluish-00` | 无 | **L0 保持不透明**（红名单） |
| Hovercard（悬停预览 244px） | hover 引用/时间/链接 | 无专属属性（primitives Hovercard） | `[class*="_card"]`（hovercard 模块）、`[class*="_preview"]`、`[data-closing]` | `--dsw-hovercard-bg: #2C2C2E`（**写死深底**，两主题同值）+ `--dsw-shadow-lv3` | 无 | **L0**（白字深底，禁止洗成浅底） |
| 会话内预览浮卡（turn preview） | hover 右侧/左侧 | `[data-turn-trigger]` 兄弟？实际为 `[class*="_preview"]:has(> [class*="_previewPrompt"])`（WE 已验证写法） | `[class*="_previewPrompt"]`、`[class*="_previewResponse"]` | `--dsw-alias-bg-layer-1` + `--dsw-elevation-panel` | 无 | **L2** |
| Toast | 复制/归档/安装结果等 | 无专属属性（primitives Toast） | `[class*="_toast"]`（primitives）；`role=status` 内容 | `--dsw-alias-toast-bg`（浅 `neutral-bluish-800` / 深 `750`）+ `--dsw-alias-toast-label`（固定白字）+ `--dsw-shadow-lv3` | 无 | **L2，但保持足够不透明（≥85%）** |
| 确认弹窗（primitives Dialog / Confirmation） | 删除/卸载/清理/覆盖等 | **`[role="dialog"][aria-modal="true"]`**、`[data-shortcut-modal]`（仅部分）、`[aria-label]`、`[data-modal-autofocus]` | `[class*="_dialog"]`、`[class*="_content"]`、`[class*="_header"]`、`[class*="_footer"]`、`[class*="_confirmation"]`、`[class*="_warning"]` | 面板 `--dsw-alias-bg-layer-2` + `--dsw-elevation-prominent`；遮罩 `--dsw-alias-bg-mask-1` + mask-blur | 通道（默认 none） | **L3** |
| 功能对话框（反馈 / 快捷参考 / 模型删除 / Agent 预设 / 日程冲突 / 目录选择器） | 对应动作 | 同 primitives：`[role="dialog"][aria-modal="true"]`；专属：`[data-shortcut-modal="shortcuts"]`、`[data-modal-autofocus]`、`[data-detail-tab]`、`[data-menu-field]` | `[class*="_dialog"]`、`[class*="_confirmDialog"]`、`[class*="_guideDialog"]`、`[class*="_dialogBody"]` | `bg-layer-2` + prominent；内部字段 `bg-layer-3` / `bg-layer-1` | 通道 | **L3** |
| 图片灯箱（ImageLightbox） | 点消息图片/查看原图 | **`[role="dialog"][aria-modal="true"]`**（primitives 灯箱，`aria-label=预览图`）；无 `data-shortcut-modal` | `[role="dialog"][aria-modal="true"]:has(> [class*="_stage"])`、`[class*="_backdrop"]`、`[class*="_stage"]`、`[class*="_mask"]`、`[class*="_image"]`、`[class*="_close"]` | 遮罩 `--dsw-alias-bg-mask-1` + mask-blur；图片容器 `--dsw-specific-input-major` + `radius-lg` + prominent | 通道（默认 none） | **L3 遮罩**；图片 **L0** |
| 目录选择器（Directory picker） | 选择工作区目录 | `[role="dialog"][aria-modal="true"]` + `[data-modal-autofocus]`；包内 `[class*="_dialog"]` 加宽到 680×500 | `[class*="_header"]`、`[class*="_crumbBar"]`、`[class*="_crumb"]`、`[class*="_row"]`、`[class*="_footer"]` | primitives Dialog `bg-layer-2`；loading float `bg-layer-2` | 通道 | **L3** |
| 命令面板 / 斜杠菜单（input-trigger / commands） | 输入 `/`、`@`、`#`，或点模型 | `[data-trigger-menu]`、`[data-source]`、`[data-overflow-below]`、`[data-slot="conversation.input.overlay"]`、`[role="listbox"]`、`[role="option"]` | `[class*="_card"]`、`[class*="_viewport"]`、`[class*="_row"]`、`[class*="_item"]`、`[class*="_sectionTitle"]` | 卡片 box-shadow prominent + 无底色（依赖 menu material / `--dsw-specific-menu`）；`_menu::after` 渐变遮底用 `--dsw-specific-menu` | 走菜单通道时 **有** | **L3** |
| 拖拽文件遮罩（DropOverlay） | 拖文件进窗口 | 无 data 属性；`[class*="_mask"]` + `--dsw-alias-bg-mask-drop` | `[class*="_mask"]`（attachment 包）、`[class*="_illustration"]` | `--dsw-alias-bg-mask-drop`（浅 `#ffffffb3` / 深 `#272730b3`） | **有**：`blur(10px)` | **L3**（可统一到 mask 通道） |
| Dock 拖拽 scrim | 拖 tab 到边缘 | `[data-dockkit-strip]`/pane 拖拽态 | `[class*="_dockScrim"]` | `color-mix(in srgb, var(--dsw-alias-bg-base) 72%, transparent)` | **有**：`blur(6px)` | **L1/L2** |
| 右栏不可用占位 | 宽度不足自动关闭 | `[data-sidebar-right-unavailable]`、`[data-sidebar-right-toggle]` | `[class*="_unavailable"]`、`[class*="_placeholderInk"]` | 透明 | 无 | **L0** |
| 连接/更新状态 pill | 断线/有新版本 | `[data-slot="sidebar.settings"]` 附近、`[data-slot="settings.trigger"]`；状态语义 `role="status"` | settings-general 包内 `[class*="_indicator"]`、`[class*="_badge"]` | 警告色 `--dsw-alias-state-warn-tertiary` / 成功 `state-success-tertiary` | 无 | **L2**（小胶囊，可玻璃化） |

---

## 5. 设置窗口与详情页结构（容器 / 遮罩 / 卡片 / 通道）

### 5.1 设置窗口（ui-settings-general `SettingsRoot`）

```
(document.body 旁的 React portal)
└─ div.<hash>_overlay            role="presentation"   position:fixed; inset:0; z-index:1000
   ├─ div.<hash>_mask            aria-hidden="true"    position:absolute; inset:var(--dsh-frame-chrome-top,0px) 0 0;
   │                                                   background: var(--dsw-alias-bg-mask-1);
   │                                                   backdrop-filter: var(--dsw-mask-blur)   ← 唯一现成通道
   └─ div.<hash>_panel           role="dialog" aria-modal="true"
       │                         data-shortcut-modal="settings"
       │                         width:800px; height:min(800px, 100vh - 2*max(24px, --dsh-frame-overlay-top));
       │                         border-radius: var(--dsw-radius-panel); background: var(--dsw-alias-bg-layer-2);
       │                         box-shadow: var(--dsw-elevation-prominent); overflow:hidden
       ├─ nav.<hash>_nav         宽 188px；title + navList（可独立滚动）
       │   ├─ div.<hash>_navTitle  [data-modal-autofocus]（无选中项时）
       │   └─ button.<hash>_navCell[aria-current="true"] [data-modal-autofocus]
       ├─ div.<hash>_header      标题行 + 关闭按钮
       └─ div.<hash>_options     内容列，overflow-y:auto；渲染 [data-slot="settings.section"] 选中项
```

**高稳定选择器（首选）**

- 整个弹窗：`[role="dialog"][aria-modal="true"][data-shortcut-modal="settings"]`
- 兜底（WE 用过）：`[role="dialog"]:has([data-slot="settings.section"])`
- 遮罩：`[role="presentation"]:has(> [role="dialog"][data-shortcut-modal="settings"]) > [class*="_mask"]`（**必须限定在设置 portal 内**，否则会命中所有 primitives Dialog 的 mask）
- 导航当前项：`[data-shortcut-modal="settings"] [aria-current="true"]`
- 内容页：`[data-shortcut-modal="settings"] [data-slot="settings.section"]`

**`--dsw-mask-blur` 通道（本次改造最省事的一条）**

- 定义处：`dsh-client-ui-theme` 的 `gradient-shadow-text` 串，`body{… --dsw-mask-blur:none; --dsw-menu-backdrop-filter:blur(40px) saturate(150%)}`。两主题共用一个 `body` 块，**当前值 `none`**。
- 消费方（全仓共 4 处，已逐条核过）：
  1. primitives Modal 遮罩：`._mask_o6lrb_18 { backdrop-filter: var(--dsw-mask-blur) }`（`background: var(--dsw-alias-bg-mask-1)` 在 `::after`）
  2. primitives 图片灯箱遮罩：`._mask_19zw2_19 { background: var(--dsw-alias-bg-mask-1); backdrop-filter: var(--dsw-mask-blur) }`
  3. 设置窗口遮罩：`SettingsRoot ._mask { background: var(--dsw-alias-bg-mask-1); backdrop-filter: var(--dsw-mask-blur) }`
  4. **`settings-account` 的 onboarding 背景：`._blurred { filter: var(--dsw-mask-blur) }`** ← 注意这里是 `filter`，不是 `backdrop-filter`
- 结论：在 `body` 上把 `--dsw-mask-blur` 设成 `blur(8~12px)`，可**一次覆盖** 1–3；第 4 处会把 onboarding 页面背景一起糊掉（若不想，用 `body:not([data-ds-onboarding])` 之类守卫或单独覆盖）。
- **陷阱**：primitives `Modal` 有 `backdropBlur` 属性（默认 `true`），传 `false` 时给遮罩打 **inline `backdrop-filter:none`**，inline 优先于变量 ⇒ 这类弹窗不吃通道。全仓仅 `settings-account` 的桌面 onboarding 用了 `backdropBlur:false`（headless 全屏浮层），其余 Dialog 都吃通道。若要「绝对统一」，需对 `[class*="_mask"]` 用 `backdrop-filter: blur(...) !important` 并显式豁免该 onboarding。

### 5.2 设置页面内容结构（section / slot 关系）

| slot key | 提供方 | 在设置窗口中的位置 | 稳定 hook |
|---|---|---|---|
| `settings.section` | 各 feature 包（General / Models / Built-in plugins / Account / Theme …） | 导航投影 + 内容页 | `[data-slot="settings.section"]` |
| `settings.header` | 设置壳 | 导航顶部标题 | `[data-slot="settings.header"]` |
| `settings.general.item` | 各 feature（Appearance、Coding Tools、版本行…） | General 页的行 | `[data-slot="settings.general.item"]` |
| `settings.plugins.tab` | 内置插件清单 / 市场等 | Built-in plugins 页的 tab 行 | `[data-slot="settings.plugins.tab"]` |
| `settings.models` / `.footer` / `.onboarding` | 模型页 / 引导 | Models 页 | `[data-slot="settings.models"]`、`[data-slot="settings.onboarding"]` |
| `settings.theme` | 主题包 | Appearance 行/页 | `[data-slot="settings.theme"]` |
| `settings.account` | 账户包 | Account 页（含 onboarding 全屏浮层） | `[data-slot="settings.account"]` |
| `settings.launcher` / `settings.trigger` | 设置壳 / 侧栏 | 侧栏底部设置入口 | `[data-slot="sidebar.settings"]`、`[data-slot="settings.trigger"]`、`[data-slot="settings.launcher"]` |
| `settings.collapse.*` / `settings.transcript.*` / `settings.performance.*` | chat 包 | General 里的行为行 | 行文本槽（非视觉锚点） |

> 设置内容页内的「卡片」统一读 `--dsw-alias-settings-card-fill`（=`--dsw-alias-bg-layer-2`）与 `--dsw-alias-settings-card-stroke`（=`--dsw-alias-border-l4`），这两个 token 定义在 `ui-theme` 的 base.css 里，**改这两个 token 就能一次改所有设置卡片底色**（无需逐类名）。

### 5.3 插件管理页 / 详情页 / 市场页

```
[data-slot="main"] → section[data-plugin-panel]          ← 全局页面（不属任何 Session）
├─ pageHead / pageTabs（Installed | Discover | 插件注册的 tab data-plugin-tab）
├─ 主列表：cards → [data-plugin-group] → [data-plugin-item] / [data-plugin-row]
├─ 详情：div[data-plugin-detail="<pkg>"]
│   ├─ DetailTop（面包屑 [class*="_crumb"]）
│   ├─ [data-plugin-rows]            （bundle 的 row 列表）
│   ├─ [data-plugin-config]          → slot plugins.item / plugins.bundle.config / plugins.row.config
│   └─ [data-plugin-detail] 的 sections → plugins.detail.actions / badge / section
├─ 安装对话框：[role="dialog"][aria-modal="true"] + [data-install-phase]
└─ 市场（Discover）：[data-plugin-tab] → [data-market-entry] → [data-market-detail]
```

- **页面底**不单独上色：它吃 `--dsw-alias-bg-base`（centerCol）。所以「插件页背景玻璃化」= 改页面底/centerCol，无需选中 `[data-plugin-panel]`。
- **卡片**统一读 `--dsw-alias-settings-card-fill`，与设置卡片同一 token；改 token 即全改。
- 详情页与列表页是**同一页面的切换**（`ctx.pluginNavigation`），不是路由/弹窗 ⇒ 没有独立 URL 或 overlay。

### 5.4 右栏（文档预览 / 文件 / 浏览器 / 终端）

```
[data-rightbar-col]
└─ [data-sidebar-right-panel="push|fullscreen"][data-sidebar-right-session][aria-hidden 收起时]
   └─ [data-sidebar-right-panel] > dockkit split tree
      └─ [data-dockkit-host="dock"][data-dockkit-column="0"]
         └─ [data-dockkit-pane][data-dockkit-pane-active][data-dockkit-content]
            ├─ [data-dockkit-strip] > [data-dockkit-strip-tabs]、[data-dockkit-strip-chrome]
            └─ [data-dockkit-pane] body → [data-slot="sidebar.right.pane.tab"]
                └─ [data-document-preview] / [data-files-root] / 浏览器 / 终端
```

- 面板底色 = `--dsw-alias-bg-base`（dockkit `._tabHost:not(._float)`），**没有独立 header 行**，控制都挤在 strip 的 chrome 位。
- 收起时**容器仍挂在布局里**，只用 `aria-hidden` + 子元素 `visibility:hidden` ⇒ 任何上色规则**必须**带 `[data-sidebar-right-open]`，否则收起后仍有一块板（WE #107）。
- 文档预览的类型差异：Markdown 透明、PDF 读 `--dsw-alias-bg-document-preview`、代码/Office 近不透明、图片不铺底。

---

## 6. 交互清单（改造时不能破坏的部分）

### 6.1 状态类

| 状态 | 机制 | 用到的元素（举例） | 改玻璃时的注意 |
|---|---|---|---|
| hover | `:hover` + `--dsw-alias-interactive-bg-hover`（浅 `#2631480f` / 深 `#ffffff14`）、accent 版 `-hover-accent` | 所有菜单行、面板行、按钮、卡片 | 半透明底上再叠 `hover` 会二次提亮 ⇒ 在玻璃面上把 hover 改成 `color-mix` 低 alpha |
| active/选中 | `--dsw-alias-interactive-bg-active`；`[aria-current="true"]`、`[aria-selected="true"]`、`[data-active]`、`[data-selected]`、`[data-panelActive]` | 导航、tab、行 | 选中底色别用不透明 token，否则玻璃面出现"补丁" |
| focus | `:focus-visible` + `--dsw-focus-ring-width:2px` + `--dsw-focus-ring-color`（fallback 品牌蓝）；`html[data-input-modality=pointer]` 时透明 | 全部可聚焦元素 | 玻璃化不要 `outline:none`；焦点环在透明底上需保证 3:1 |
| disabled | `:disabled` + `--dsw-alias-label-dimmed`、`pointer-events:none`、部分 `opacity` | 按钮、输入、菜单项 | 别给禁用态加 blur/滤镜，会额外开销且无意义 |
| expanded | `[aria-expanded]`、`[data-expanded]`、`[data-open]`、`[data-collapsed]`、`[data-expanded-mode]` | 思考条、工具行、详情、Todo | 展开态常把 `position:sticky` header 变成实底（`bg-base`），玻璃化时那条要单独给 `--dsg` 底板 |
| dragging | `[data-dragging]`、`[data-animating]`、`[data-rightbar-instant]`、`[data-panning]` | 宽度把手、右侧栏、轨迹平移 | 拖拽期间宿主关过渡；不要在拖拽元素上加 `transform/filter` 类动画 |
| streaming | `[data-streaming]`、`[data-running]`、`[data-shimmer-decoration]` | 思考摘要、工具标题 | shimmer 与 backdrop-filter 叠加会掉帧，模糊交给静态 `::before` |
| 无 backdrop 支持 | `@supports not (backdrop-filter: …)` | 需自带降级板 | 降级必须近不透明（GLASS-SPEC §5.4） |
| 减少动效 | `@media (prefers-reduced-motion: reduce)` | 全仓广泛使用 | 新玻璃过渡也要跟随 |

### 6.2 滚动容器（模糊/底色要挂在**不滚动的父层**或 `::before` 上）

| 容器 | hook |
|---|---|
| 会话滚动 | `[data-conversation-scroll]`（`scrollbar-gutter:stable`） |
| 设置内容 | `[data-shortcut-modal="settings"] [class*="_options"]` |
| 右栏 pane | `[data-dockkit-pane]`（`overflow:auto`） |
| 文档预览 | `[data-textpreview-wrap]` / `[data-textpreview-body]` / `[data-document-zoom-scrollport]` |
| 轨迹 | `[data-trajectory-scroll]`、表格内 `[class*="_tablePane"]` |
| 插件页 | `[data-plugin-panel]`（`overflow:auto`） |
| 工具详情/终端 | `[class*="_bodyScroll"]`、`[data-terminal]` 内部 |
| 提问卡 / 审批卡 | `[data-question-scroll]`、`[data-approval-scroll]` |
| 菜单 | `[data-menu-material] [class*="_list"]`（`--dsh-scrollbar-*` 局部覆盖） |

### 6.3 `position: fixed` 元素清单（**给祖先加 `backdrop-filter` 会让它们改锚**）

| fixed 元素 | 所属 | 受影响祖先（危险） | 安全做法 |
|---|---|---|---|
| 图片灯箱 root、所有 Modal/Dialog、设置窗口 overlay、Toast、Tooltip、模型选择菜单、stat dialog、Dockkit 浮动面板、DropOverlay、`[data-hovercard]` | primitives / 各包 | 它们的祖先若被加 blur | 这些元素自身 fixed 到 viewport；**不要**给它们的 body/祖先加 blur |
| `.dsh-browser-seat-wrap`（外部插件塞进 composer 卡的 fixed 按钮） | 外部插件 | **`[data-composer-card]`** | 模糊写 `[data-composer-card]::before`（伪元素无后代） |
| Windows 左栏「收起/展开侧边栏」「收起态新建会话」按钮 | 壳层（`position:fixed`） | **左栏列** | 模糊写 `div:has(> [data-slot="sidebar"])::before`（WE #131） |
| 会话 header 内 fixed 动作？ | — | 未发现 | — |
| `[data-menu-backing]`（darwin 菜单背板） | primitives | 菜单 surface | backing 本身 fixed，勿给 surface 再加 blur 之外的东西 |
| 右栏全屏面板 | sidebar-right | 其祖先（frame/track） | 别在 frame/rightbarCol 上加 blur；面板自身可 blur，但要抬 `z-index: var(--dsh-dockkit-dock-layer)`（WE #150） |

---

## 7. 风险清单

### 7.1 哈希类名（第一风险）

- 全仓类名 99% 是构建哈希（`.Dc7zOa_*`、`._6nhg2_*`、`._12mhf_1`），**跨构建必漂**。
- 可用形态只有三种：
  1. **源码属性**（`data-*`、`role`、`aria-*`、slot key）← 首选；
  2. **类名后缀子串** `[class*="_bubble"]` ← 中稳定，漂了最多"该面不生效"；
  3. **库级全局类名**（`.md-code-block` / `.cm-editor` / `.xterm` / `.shiki`）← 稳定。
- WE 教训：**不要**把「已验证选择器」和「未验证选择器」放进同一个逗号列表（一条被拒整条规则丢弃）；哈希兜底要**另起一条规则**。
- 嵌套 `:has()`（`:has()` 里再 `:has()`）本壳层 Chromium 不接受（会抛异常），只写单层。
- **不要给 `[data-slot]` 锚点本身画皮**：renderer 给所有 slot 锚点写 `display:contents`（`ANCHOR_STYLE`），不生成盒子，背景/模糊/圆角全部画不出来。要用 `:has(> [data-slot=…])` 反向选父级。

### 7.2 白字 / 反色表面（玻璃化必炸）

| 面 | 证据 | 结论 |
|---|---|---|
| **Tooltip** | `--dsw-alias-tooltip-bg`（浅 `#2c2c2e` / 深 `#43454a`）+ 文字固定 `--dsw-static-neutral-bluish-00`（近白）；WE #161 实测 1.07–1.13:1 | **保持不透明**；所有 `[class*="_bubble"]` 规则必须 `:not([role="tooltip"])` |
| **Hovercard** | `--dsw-hovercard-bg:#2C2C2E` 写死（两主题同值）+ `--dsw-shadow-lv3` | 保持不透明；不要套"浅色玻璃" |
| **Toast** | `--dsw-alias-toast-bg`（深色实底）+ `--dsw-alias-toast-label` 白字 | 可玻璃化但 alpha 必须 ≥85%，或干脆不透明 |
| **Darwin 菜单 backing** | `[data-menu-backing]` 用 `--dsw-alias-bg-base` 实底垫在菜单 surface 下（为字体渲染） | 别删 backing；darwin 的菜单本身是 94% 不透明 |

### 7.3 对比度 / 可读性

- 正文三级文字：`--dsw-alias-label-primary/secondary/tertiary`（tertiary 浅色 `#81858c`、深色 `#adb2b8`）。玻璃后若底变亮/变花，tertiary 最先跌破 4.5:1 ⇒ L1 面的地板必须由 GLASS-SPEC 的 `floor` 兜住。
- 代码：Shiki 注释灰、字符串色按不透明底设计；WE 实测通透底上注释灰掉到 **1.7–2.3:1**。代码块/行内代码/终端/编辑器走 **L0 + ≥75–88% 底板**。
- Diff 行色（`--dsw-alias-file-diff-added-bg` 等）是**不透明专用色**，不要透明化。
- 图片/iframe：内容不可控 ⇒ 宿主框保持不透明或近不透明（浏览器 webview / HTML 预览 / PDF）。
- 状态色（warn/error/success）在玻璃上易发灰 ⇒ 提问卡/审批卡的 strip 保留 `state-warn-tertiary` 实底。

### 7.4 滚动条

- Chromium 原生滚动条**不绘制 backdrop blur**（WE 条纹探针结论）⇒ 不要让滚动容器自己带玻璃；
- 全仓滚动条读 `--dsh-scrollbar-*`（`thumb / thumb-hover / width / thumb-border / track-margin`），很多模块局部覆盖（如 `input-trigger` 6px、schedule 9px、会话列走 `--dsh-scrollbar-width`）⇒ 玻璃内滚动条建议**逐容器**覆盖 `--dsh-scrollbar-thumb` 为半透明，而不是全局改；
- 代码块 banner 吸顶 + 滚动时，sticky 板必须自身有底（见 §4.4）。

### 7.5 层叠 / 动画 / 性能

- `backdrop-filter` 自成层叠上下文：右栏全屏面板会被会话列内容反压（WE #150）⇒ 抬 `z-index: var(--dsh-dockkit-dock-layer)`（常态 10 / 全屏 40）。
- 大面积 `blur`（整页 800×800 + 40px）每帧重算；菜单已用 40px，**不要再给整页加 40px**；L1/L2 用 6–20px。
- 拖拽/平移路径上（`[data-dragging]`、`[data-rightbar-instant]`、轨迹 panning）不要挂/换 filter，会掉帧。
- `prefers-reduced-motion` 下关过渡（全仓惯例，新规则要跟随）。

### 7.6 事件与命中区

- 气泡/卡片的 `::before`/`::after` 玻璃层必须 `pointer-events:none`（否则吞掉选择文本、按钮点击、拖拽命中）。
- 拖拽文件遮罩已有 `pointer-events:none`（attachment `DropOverlay`）——玻璃层别破坏。
- 菜单 portal 在 body：`[role="menu"]` 的命中不受会话层影响；别用 `[data-chat-flow]` 作用域去限制菜单。
- 会话滚动容器上有 `scrollbar-gutter:stable` 与宽度把手；加 padding/边框会改宽度对齐（宽度把手按 `--dsh-chat-content-width` 算）。

---

## 8. `backdrop-filter` × fixed 包含块（实现前必读）

CSS 规范：元素一旦有非 `none` 的 `backdrop-filter`，它就成为其**后代的包含块**（含 `position:fixed` 后代）。本仓已踩过的具体事故：

| 面 | fixed 后代 | 事故 | 正确载体 |
|---|---|---|---|
| `[data-composer-card]` | 外部插件「AI 浏览器」按钮 `.dsh-browser-seat-wrap`（fixed） | 掉 ~522px、座位凭空多 543px 滚动 (#89) | `[data-composer-card]::before`（无后代） |
| `[data-composer-seat]` | 输入卡内的 fixed 后代 | 同上放大 | **座位不挂霜**（WE 明确撤回） |
| 左栏 `div:has(> [data-slot="sidebar"])` | Windows 收起/展开、收起态新建会话按钮（fixed） | 按钮被裁掉 (#131) | 列的 `::before`；列自身 `position:relative; z-index:0` |
| Windows 标题栏 frame `::before` | 无 | 需要与壳层伪元素逐像素对齐 | 颜色/底留 `::before`，**模糊另起 `::after`**（颜色要经过滤镜才有同一观感） |
| 右栏面板 | 无 fixed 后代，但会自成层叠 | 全屏时被会话内容反压 (#150) | 面板自身 blur + 抬 z-index |
| 思考触发条 `[data-turn-trigger]` | 无（WE 已核） | — | 元素自身可 blur |
| 轨迹内容区 | 无（WE 实测 0 条 fixed） | — | 元素/::before 均可 |
| 菜单 `[data-menu-material]` | 子菜单 absolute；darwin 另有 fixed backing（兄弟 portal） | — | 已用 `.material` 子层承载（`z-index:-1`） |

**通用法则**：能放 `::before` 就放 `::before`（伪元素没有 DOM 后代）；必须放在元素自身时，先确认该元素子树里没有 `position:fixed`。

---

## 9. 选择器白名单（给实现者）

### 9.1 高稳定性（源码写死，跨构建不变；优先用）

```
/* 壳层 / 布局 */
html[data-platform]
html[data-windows-titlebar]
[data-slot="root"] [data-slot="main"] [data-slot="sidebar"]
[data-sidebar-collapsed] [data-rightbar-col] [data-rightbar-collapsed]
[data-rightbar-fullscreen] [data-rightbar-instant]
[data-shell-bottom] [data-shell-leading] [data-shell-overlay]
div:has(> [data-slot="sidebar"])

/* 会话 */
[data-phase="hero"|"active"]
[data-conversation-content] [data-conversation-scroll] [data-conversation-region]
[data-conversation-tabs] [data-conversation-header-leading] [data-conversation-header-corner]
[data-composer-seat] [data-composer-card] [data-composer-input] [data-composer-dock]
[data-composer-overlay] [data-composer-command] [data-composer-text-ref] [data-trigger-menu]
[data-width-handle][data-side]

/* 聊天流 */
[data-chat-flow] [data-chat-flow-kind] [data-chat-turn]
[data-chat-node-key] [data-chat-anchor-key] [data-chat-call-id] [data-chat-running]
[data-turn-trigger] [data-turn-process] [data-turn-process-member]
[data-disclosure-header] [data-disclosure-row] [data-expandable] [data-expanded]
[data-queue-dock] [data-goal-bar]

/* 卡片（座位接管 + 工具） */
[data-question-key] [data-question-scroll] [data-question-reply]
[data-plan-review-key] [data-plan-card] [data-plan-preview] [data-plan-artifacts]
[data-approval-key] [data-approval-scroll]
[data-slot="tool.call.toolview"] [data-tool] [data-state] [data-variant] [data-sample]
[data-read] [data-search] [data-diff] [data-terminal] [data-context-injection-body]
[data-code-block-banner] [data-code-wrap] [data-line-numbers]
[data-changed-files] [data-presented-file] [data-presented-files-row]
[data-review-file] [data-review-view] [data-review-wrap]

/* 右栏 / dockkit */
[data-sidebar-right-panel][data-sidebar-right-open]
[data-sidebar-right-session] [data-sidebar-right-toggle] [data-sidebar-right-tab]
[data-dockkit-strip] [data-dockkit-strip-tabs] [data-dockkit-strip-chrome]
[data-dockkit-host] [data-dockkit-column] [data-dockkit-pane] [data-dockkit-pane-active]
[data-dockkit-divider] [data-dockkit-float] [data-dockkit-float-active] [data-dockkit-content]
[data-document-preview] [data-textpreview-*] [data-code-preview] [data-code-block-content]
[data-image-preview] [data-html-preview] [data-document-markdown] [data-document-frontmatter]
[data-document-zoom-*] [data-files-*] [data-sidebar-right-guide] [data-sidebar-right-guide-entry]

/* 菜单 / 浮层 / 弹窗 */
[data-menu-material] [data-menu-material="translucent"] [data-menu-backing] [data-menu-field]
[role="menu"] [role="tooltip"] [role="dialog"][aria-modal="true"]
[data-shortcut-modal] [data-shortcut-modal="settings"] [data-modal-autofocus]
[data-install-phase] [data-install-approval] [data-install-registry] [data-install-guide]
[data-plugin-panel] [data-plugin-detail] [data-plugin-rows] [data-plugin-row] [data-plugin-tab]
[data-market-entry] [data-market-detail] [data-market-version]

/* 设置 */
[data-slot="settings.section"] [data-slot="settings.header"] [data-slot="settings.general.item"]
[data-slot="settings.plugins.tab"] [data-slot="settings.models"] [data-slot="settings.theme"]
[data-slot="settings.account"] [data-slot="sidebar.settings"] [data-slot="settings.trigger"]

/* 主题 / 平台 */
body[data-ds-dark-theme]
[data-ds-theme-source]
```

### 9.2 中稳定性（语义 token + 类名后缀子串 + 库级类名；必须带作用域/守卫）

```
body[data-ds-dark-theme] …                         /* 深浅分叉 */
[class*="_bubble"]:not([role="tooltip"])           /* 用户气泡；必须排除 tooltip */
[data-question-key] [class*="_card"]
[data-plan-review-key] [class*="_card"]
[data-approval-key] [class*="_card"]
[data-chat-flow] [class*="_preview"]:has(> [class*="_previewPrompt"])
[class*="_tablePane"] [class*="_overviewPreview"] [class*="_programPanel"]   /* 仅轨迹模块独有后缀 */
[class*="_toast"]  [class*="_dialog"]  [class*="_mask"]  [class*="_panel"]
[class*="_ioCard"] [class*="_tile"] [class*="_navCell"] [class*="_cardContent"]
[class*="_tab"] [class*="_tabActive"] [class*="_tabStrip"] [class*="_stripChrome"]
[class*="_scrollBody"] [class*="_composerSeat"] [class*="_hero"]
.md-code-block  .cm-editor  .xterm  .shiki        /* 库级全局类名，稳定 */
```

### 9.3 低稳定性 / 禁止

- **禁止**单独用完整哈希类名做锚点：`.Dc7zOa_*`、`.RlGAzG_*`、`._6nhg2_*`、`._12mhf_1`、`.cJsG2q_*`、`.xz4KEq_*`、`.Hqq-bq_*`、`.Fv-y6W_*` 等（只能作为「失败安全」的兜底，另起一条规则）。
- **禁止**：在 `[data-slot]` 锚点自身画背景/模糊（`display:contents`）。
- **禁止**：不带 `[data-sidebar-right-open]` 给 `[data-sidebar-right-panel]` 上色（收起后仍挂载，#107）。
- **禁止**：把 `[class*="_bubble"]` 用在 tooltip 上（白字压浅底）。
- **禁止**：嵌套 `:has()`；在逗号列表里混入未验证选择器。
- **禁止**：给 `[data-composer-card]`、左栏列、`[data-composer-seat]`、frame/titlebar 的**元素自身**挂 `backdrop-filter`（fixed 包含块）。
- **禁止**：让代码块/终端/编辑器/输入控件/图片内容透明化。

### 9.4 优先改造顺序（视觉收益 / 风险比）

| 优先级 | 面 | 理由 | 首发选择器 |
|---|---|---|---|
| **P0** | 页面底 + 左栏 + Windows 标题栏 | 第一眼观感；WE 已验证做法；风险已清（::before） | `body` / `div:has(> [data-slot="sidebar"])::before` / `[data-windows-titlebar] [class*="_frame"]::after` |
| **P0** | composer 输入卡 | 视觉焦点；必须 ::before | `[data-composer-card]::before` |
| **P0** | 右栏面板 | 大面积；必须 open 守卫 | `[data-sidebar-right-panel][data-sidebar-right-open]` |
| **P1** | 用户气泡 + 提问/计划/审批卡 | 内容主力，WE #66 已给方案 | `[class*="_bubble"]:not([role="tooltip"])`、`[data-question-key] [class*="_card"]` / `[data-plan-review-key] [class*="_card"]` / `[data-approval-key] [class*="_card"]` |
| **P1** | 对话画布 + 轨迹 | 大面积；轨迹缺霜（WE 结论） | `[data-conversation-scroll]`、`[class*="_tablePane"]` |
| **P1** | 设置窗口 + 菜单 | token 已就绪，改参数即可 | `[data-shortcut-modal="settings"]`、`[data-menu-material]` |
| **P2** | 插件页 / 市场 / 详情卡 | token 统一，收益中等 | `[data-plugin-panel]` + `--dsw-alias-settings-card-fill` |
| **P2** | 文档预览 / 文件树 / 终端 / 浏览器 | 可读性优先，先保不透明 | `[data-document-preview]`、`[data-files-root]`、`[data-terminal]` |
| **R 红名单** | tooltip / hovercard / toast / 代码块 / 终端编辑器 / diff 行 / 图片 | 对比度硬伤 | 不做（或仅 ≥85% 底板） |

---

## 10. 现有玻璃/半透明资产（不要重复造轮子）

| 资产 | 值 / 位置 | 覆盖了哪些面 | 建议怎么用 |
|---|---|---|---|
| `--dsw-menu-surface-fill` | 浅 `#f8f9fa94` / 深 `#43454a73`（`design_platform.css`） | 所有 MenuSurface（`[data-menu-material]`） | 菜单已玻璃；调透明度改这个 token |
| `--dsw-menu-backdrop-filter` | `blur(40px) saturate(150%)`（`dsh-client-ui-theme` gradient-shadow-text 串） | primitives 菜单 `.material`；部分会话内弹出 `::before` | 菜单通道；**不要**用更小值另起一套，先复用 |
| `--dsw-specific-menu` | = `--dsw-menu-surface-fill`；darwin 提到 `#f8f9faf0` / `#303136f0` | 各处自绘弹出（模型选择、日程 picker、TodoPanel、subagent menu、goal bar、cordis panel） | 改 token 即批量生效 |
| `--dsw-mask-blur` | 当前 `none`（`body` 上） | Dialog 遮罩、灯箱遮罩、设置遮罩、onboarding 背景 `filter`（4 处消费） | 一条通道升级全部模态遮罩；注意第 4 处是 `filter` |
| `--dsw-alias-bg-mask-1` / `-mask-3` / `-mask-photo` / `-mask-drop` | 浅 `#0000003d` / `#0000007a` / `#000000e0` / `#ffffffb3`；深 `#00000080` / … / `#272730b3` | 所有遮罩底 | 玻璃化时调 alpha，不要另造遮罩色 |
| `[data-menu-material]` + `.material` | `position:absolute; inset:0; z-index:-1; border-radius:inherit; background + backdrop-filter` | 菜单 | 这是"菜单玻璃"的现成实现范式（子层承载 blur，surface 保持 isolation） |
| `[data-menu-backing]`（darwin） | `position:fixed; position-anchor:…; background: var(--dsw-alias-bg-base)` | darwin 菜单背板（字体渲染用） | 保留，不要当玻璃层 |
| `_dockScrim` | `color-mix(in srgb, var(--dsw-alias-bg-base) 72%, transparent)` + `blur(6px)` | dockkit 拖拽提示 | 可复用为「轻霜」参考值 |
| DropOverlay | `--dsw-alias-bg-mask-drop` + `backdrop-filter: blur(10px)`（attachment 包） | 拖文件遮罩 | 已是玻璃样板 |
| onboarding 卡片 | `backdrop-filter: blur(32.609px)`（settings-account `kh1pJG_card`） | 账户引导卡片 | 大 blur 的孤例，不建议扩散 |
| darwin 左栏渐变 | `[data-platform=darwin] ._sidebarCol`：`linear-gradient(#7a9bf01a→0→#8f89b817) + color-mix(... 40%, transparent)` | macOS 左栏 | 玻璃化时别把这层渐变盖掉 |
| `--dsw-elevation-*` | `stroke = 0 0 0 .5px var(--dsw-elevation-stroke-color)`；panel / prominent / soft 三档 | 全局阴影/rim | 玻璃面直接用，别另造阴影 |
| `--dsw-radius-*` | xs4 / sm8 / md12 / lg16 / xl20 / panel28 | 全局圆角 | 玻璃面沿用（输入卡/设置是 28） |
| `--dsh-scrollbar-*` | thumb/width/border/track-margin | 所有滚动条 | 逐容器覆盖，不全局改 |

> WE 插件已经把这些面逐一接管过（见 `baseline/ui-theme/we-glass-*.css` 的注释，含每个选择器的实测结论）。新插件**优先复用它的选择器与门控语义**（`data-we-*` → 新 `data-dsg-*`），只把配方换成 GLASS-SPEC 的 `--dsg-*`。

---

## 附录 A · Token 速查

| 类别 | token | 浅色 | 深色 |
|---|---|---|---|
| 页面底 | `--dsw-alias-bg-base` | `neutral-bluish-00` `#fff` | `neutral-bluish-950` `#151517` |
| 侧栏底 | `--dsw-specific-sidebar-fill` | `neutral-bluish-50` `#f9fafb` | `neutral-bluish-900` `#1b1b1c` |
| 输入卡 | `--dsw-specific-input-major` | `#fff` | `neutral-bluish-850` `#2c2c2e` |
| 气泡 | `--dsw-specific-bubble` | `deepseek-50` `#edf3fe` | `neutral-bluish-850` `#2c2c2e` |
| 层 | `bg-layer-1/2/3` | `#fff` / `#fff` / `#fff` | `#232324` / `#2c2c2e` / `#353638` |
| 代码块 | `--dsw-alias-markdown-code-block` | `neutral-bluish-50` `#f9fafb` | `neutral-bluish-900` `#1b1b1c` |
| 代码 banner | `--dsw-alias-markdown-code-block-banner` | `#f9fafb` | `#2c2c2e` |
| 菜单材质 | `--dsw-menu-surface-fill` | `#f8f9fa94` | `#43454a73` |
| 菜单模糊 | `--dsw-menu-backdrop-filter` | `blur(40px) saturate(150%)` | 同值 |
| 遮罩模糊 | `--dsw-mask-blur` | `none` | `none` |
| 遮罩 | `--dsw-alias-bg-mask-1` | `#0000003d` | `#00000080` |
| tooltip 底 | `--dsw-alias-tooltip-bg` | `neutral-bluish-850` `#2c2c2e` | `neutral-bluish-750` `#43454a` |
| toast 底 | `--dsw-alias-toast-bg` | `neutral-bluish-800` `#353638` | `neutral-bluish-750` `#43454a` |
| hovercard 底 | `--dsw-hovercard-bg` | `#2C2C2E`（写死） | `#2C2C2E` |
| 设置卡片 | `--dsw-alias-settings-card-fill/stroke` | `bg-layer-2` / `border-l4` | 同 |
| 文档预览 | `--dsw-alias-bg-document-preview` | `neutral-bluish-100` | `neutral-bluish-950` |
| 圆角 | `--dsw-radius-*` | 4/8/12/16/20/28 | 同 |
| 阴影 | `--dsw-shadow-lv1/2/3`、`--dsw-elevation-panel/prominent/soft` | 见 `gradient-shadow-text` 串 | 同（stroke 换深色边） |
| 焦点 | `--dsw-focus-ring-width:2px`、`--dsw-focus-ring-color` | 品牌蓝 fallback | 同 |

## 附录 B · 布局变量（玻璃几何要对齐）

| 变量 | 值/来源 | 用途 |
|---|---|---|
| `--dsh-frame-top-clearance` | 48px（macOS）/ Windows caption 高 | 顶部预留 |
| `--dsh-frame-overlay-top` | clearance + 20px（全屏 20px） | 浮层顶距 |
| `--dsh-frame-chrome-top` | Windows caption 高（全屏 0） | 遮罩 `inset-top` |
| `--dsw-*`… `--dsh-windows-titlebar-height` | 壳层 | 标题栏 |
| `--dsh-chat-content-width` | `clamp(680px, 列宽*0.64, 920px)`（embedded: 100%-32px） | 对话列宽；宽度把手/卡片最大宽 |
| `--dsh-composer-card-max-width` | chat 宽 + 32px | 输入卡 |
| `--dsh-composer-side-clearance` / `--dsh-composer-dock-inset` | 16px / 8px（embedded 8/8） | 座位内缩进 |
| `--dsh-dockkit-dock-layer` / `--dsh-dockkit-float-layer` | 10 / 60（全屏 40） | 右栏层级 |
| `--dsh-scrollbar-width` | 5px（局部 6/9px） | 滚动条 |
| `--dsh-hover-preview-fade` | 由 JS 写入 ms | 悬停预览淡出 |
| `--we-*`（旧插件） | 见 WE CSS | 迁移映射用 |

## 附录 C · 复核方式（命令 / 看什么）

1. 抽取/审阅 CSS（只读，写临时目录）：
   - 用 `node tools/asar-extract.mjs <asar> <out> node_modules/@deepseek-ai/dsh-client-ui-chat/` 提取单包；
   - CSS 在 `lib/client.js` 的 `//#region \0dsh-css:` 后 `const css$N = "…";`（primitives 是 `_<local>_<hash>_<line>`；UI 包是 `<hash>_<local>`）。
2. 属性总表（本文依据）：
   - 每包 `lib/client.js` 中 `"data-…"` 与 `role: "…"`；核 slot key（`conversation.*`、`sidebar.*`、`settings.*`、`rightbar`、`main`、`shell.*`）。
3. 运行时骨架：`.ref/dom/surface-tree.txt`（含 `[data-chat-flow]`、`[data-composer-card]`、`[data-slot]`、dockkit 属性；注意该快照带插件注入节点 `dsg-*`，宿主部分仍有效）。
4. 截图：`pwsh -File tools/capture-dsh.ps1 [out]`（会激活 DSH 窗口，**少用**；现成基线 `baseline/screenshots/current-ui.png`）。
5. 验收时逐面过 §4 表格的「建议档位」，红名单（§9.3）不允许例外。
