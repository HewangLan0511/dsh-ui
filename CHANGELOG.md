# Changelog

本项目的版本分两套：`vX.Y-ui` 是界面迭代里程碑（git tag），`1.x` 是插件对外的发布版本。
插件版本在 `plugin/package.json`；界面里程碑与发布版本的关系如下。

## 1.0.5 — 2026-10-25

- **去掉会话 tab 的重复 tooltip**：宿主给「对话 / 轨迹 / 上下文 / 画廊 / 编队」每个 tab 的
  可见文字又包了一层 Tooltip，悬停会弹出一个同名的白釉玻璃药丸，看起来像多出来一个 tab。
  新增 `initTabTooltipGuard`：在 document 捕获阶段对
  `[data-conversation-tabs] [role="tab"]` 的 pointerover / mouseover / focusin
  执行 stopImmediatePropagation，只挡 tooltip 触发，tab 点击、:hover 样式、键盘切换都不变。
- 本次发布后仓库只保留最新的 GitHub Release（更早的 v1.0.0–v1.0.4 Release 已删除）。
- 发布：`dsh-skin-mistblue@1.0.5`（tag `v1.17-ui`）。

## v1.17-ui — 会话 tab 重复 tooltip

## 1.0.4 — 2026-10-24

左栏顶部与标题栏 / 主体之间的颜色过渡柔和化（纯 CSS）：

- 左栏列填充从近纯白改为 **10–14% 标题栏色（#dfeafd）混合** 的冷调玻璃，
  不再像一张白纸贴在蓝色界面上。
- 左栏 ::before 增加 **顶部 176px 竖向渐变**：0px 直接等于标题栏实体色 #eaf1fb，
  56px 半透明，176px 完全透明 —— 标题栏到品牌行的水平接缝在数值上消失
  （改前 y=60 处 255,255,255 vs 标题栏 235,242,251；改后 233→235→238→241→250 平滑过渡）。
- 标题栏底部分隔发丝线从 0.14 alpha 降到 0.06，只留一线，不再抢视线。
- 「新会话」胶囊从平铺白块改为**竖向白釉渐变**（0.66→0.36）+ 柔边，
  在冷调左栏上仍能作为可点玻璃芯片被识别，hover 时提亮。
- 深色模式同步：填充混入 #16304f，顶部渐变对齐深色标题栏 #0b1322，胶囊用低透明白渐变。
- 发布：`dsh-skin-mistblue@1.0.4`（tag `v1.16-ui`）。

## v1.16-ui — 左栏顶部与标题栏的颜色过渡

## 1.0.3 — 2026-10-24

四项体验修复（纯客户端，不改宿主）：

- **设置页主题切换**：配色高亮此前读 `snapshot.id`（并不存在）→ 恒为「浅色」；改为读
  `theme.getTheme().preference`，设置行加 React state 并在 `emit()` / `theme/change`
  时刷新；首次激活不再强写 `light`、不再用 localStorage 与 DSH 原生 Appearance 打架。
- **MCP 连接器页顶部白块**：页面本体在宿主同源 iframe 里，主文档 CSS 进不去；利用 iframe
  自带的 `#dsh-theme-bridge`（首帧抄父页面 body 的 `--dsw-alias-*`），在
  `:has(.mcpConnectorMarketPanel)` 期间把 `--dsw-alias-bg-overlay` 改成蓝白玻璃，
  顶部不再是一条纯白板。
- **MCP「推荐」卡片黄边**：同一桥把 `--dsw-alias-state-warn-primary`（iframe 的 `--warn`）
  从 amber 改成蓝灰 `#64748b`（深色 `#9aa8c2`），与其它卡片发丝边同色系；面板自身磨砂底固定。
- **竖线虚影**：`22-drag-smooth.css` 删掉全高列的 `will-change: width` 与
  width/transform 过渡（合成层边缘在 125%/150% 缩放下漏 1px 背景 → 竖缝）；
  `initResizeGuard` 改为只在命中分隔条/光标为 resize 的手柄时才置
  `data-dsg-resizing`（选字不再误触发材质降级），并在真拖分隔条时打
  `data-dsg-dragging-divider` 供可选的宽度追赶。
- 发布：`dsh-skin-mistblue@1.0.3`（tag `v1.15-ui`）。

## v1.15-ui — 主题切换 / MCP 页面融合 / 竖线虚影

## 1.0.2 — 2026-10-24

拖动换位改用 **HTML5 原生 drag & drop**（1.0.1 的 pointer 事件方案在宿主
tooltip/click 处理下不稳定，实测拖不动，且偶尔把普通点击当成拖动结束）：

- 行设 `draggable`，`dragstart / dragover / drop / dragend` 全程接管：
  dragover 高亮落点行，drop 时按落点前后的行改 CSS `order`，顺序仍持久化到
  `localStorage: dsh-skin-mistblue/panel-order`；
- 原生 DnD 不会产生 click，点击打开/再次点击返回逻辑保持原样；
  drop 后 120ms 内吞掉可能的合成 click，避免误开面板；
- 面板列表区域禁用文本选择，拖动失败也不会把整页字选中。
- 发布：`dsh-skin-mistblue@1.0.2`（tag `v1.14-ui`）。

## 1.0.1 — 2026-10-24

左侧面板列表增强（纯客户端，不改宿主）：

- **拖动换位**：`插件 / 上下文洞察 / MCP 连接器 …` 可按住上下拖动重排，
  用每行 CSS `order` 实现（不动 DOM，React key / 命中区不变），顺序存
  `localStorage: dsh-skin-mistblue/panel-order`，重排后自动重放。
- **再次点击返回**：点击已打开的选项再次点击 → `layout.selectPanel(null)` 回到会话；
  打开面板前会记住来自哪个会话 tab（供回退）。
- 修复：普通点击被误判为拖动结束而吞掉（只有真正拖动过才吞 click）。
- 新增 `23-panel-reorder.css`（拖动中的行样式 + cursor）与对应 `initSidebarEnhancer`。
- 发布：`dsh-skin-mistblue@1.0.1`。

## 1.0.0 — 2026-10-24

首个对外发布版本，汇总全部界面迭代并补齐发布物料：

- 仓库 README 重写为发布向（特性 / 安装 / 设置 / 结构 / 开发 / 文档 / 许可）
- 新增 `LICENSE`（MIT）、`CHANGELOG.md`、`docs/RELEASE.md`、`plugin/README.md`
- `plugin/package.json`：版本 `1.0.0`、移除 `private`、补 `license`/`keywords`/`files`
- 新增 `tools/release.mjs`：构建 + `npm pack` + 源码 zip + SHA-256 校验和
- 文档预览改为不透明纸面（`--dsg-doc-paper` + `--dsw-alias-bg-document-preview` 映射 +
  含预览的面板/dockkit 容器一并做实），修复预览文字与对话区叠字
- 新增 git tag `v1.0.0`（此前界面里程碑 v1.0-ui … v1.12-ui 全部保留）

## v1.13-ui — 左侧面板列表拖动换位 + 二次点击返回

- `initResizeGuard`：pointerdown 命中 `[data-dockkit-divider]` 时**立即**摘掉玻璃材质
  （不再等 4px 位移），拖动第一帧就轻量化
- 新增 `22-drag-smooth.css`：拖动期间移动边改为 `transition: width 90ms linear`
  有界跟随（快速甩动摊到多帧、不瞬移），dockkit host/divider/split/cell/pane/surface
  统一关掉过渡与动画，会话区 `overflow-anchor: none` 避免滚动补偿造成错位
- 不拦截 pointermove：宿主 pointerup 提交仍按真实坐标，松手宽度永远贴合光标

## v1.11-ui — 文档预览不透明

- 新增 `--dsg-doc-paper`（浅 `#ffffff` / 深 `#0c1322`），并把宿主
  `--dsw-alias-bg-document-preview` 映射到它
- `[data-document-preview]` / `[data-textpreview-state]` / `[data-code-preview]` 等纸面
  改为**完全不透明**（原来 `--dsg-code-banner` 的 95% 仍会透字）
- 预览所在的面板/dockkit 容器（`[data-sidebar-right-panel]`、`[data-dockkit-pane|content|surface|host]`、
  `[data-slot='sidebar-documentpreview']`、全屏 dialog/overlay）用 `:has([data-document-preview])`
  一并做实，避免"纸外仍透"的边角叠字


## v1.10-ui — tooltip 几乎不透明

- tooltip 填充率 74% / 78% → **94% / 96%**（图表卡），深色 94% / 96%
- 无 `backdrop-filter` 降级 98%；保留 16px 霜 + 釉 + 发丝边，~4% 通透镜面感

## v1.9-ui — 悬停 tooltip 全面玻璃化

- 新增统一工具提示玻璃配方：`[role='tooltip']`、`.lc-tip`、`.lc-chart-tip`、`*_chart-tip`
- 图表悬停卡加厚填充 + `z-index: 40`，修复坐标文字透出/压卡
- 快捷键 pill 改中性底；无霜环境高填充兜底
- 新增验证台 `tools/tooltip-preview.mjs` 与 `tools/shot-pw.ps1`（可截被遮挡窗口）

## v1.8-ui — 收起态标题栏三处修复

- 「新建会话」+ 号错位/过蓝：收起态几何交回宿主（28×28、无 margin、16px 中性图标）
- 隐藏展开按钮右上角的桌面更新蓝点（`sidebar.toggle.badge`）
- 悬停"黑色阴影"实为 tooltip 被悬浮玻璃 header 盖住：仅在 tooltip 挂载时抬升侧栏层叠

## v1.7-ui — 改名 `dsh-skin-mistblue`（雾蓝）

- 包名、bundle 行（id `mistblue`）、模块 id、设置页标题、locale、effect 标签全部切换
- localStorage 键迁移：`dsh-ui-deepseek/*` → `dsh-skin-mistblue/*`（一次性回退读取）
- 文档同步；desktop profile 通过 `plugin_manager` 重装

## v1.6-ui — 拖动性能 + 设置页中文

- resize guard：指针拖动 >4px 时 `data-dsg-resizing`，临时卸霜与超大投影
- 设置页语言不再模块级缓存，跟随 DSH locale 即时切换
- `tools/test-plugin-logic.mjs` 覆盖 drag guard 与 i18n（9/9）

## v1.5-ui — 右侧边栏玻璃化

- 右栏（文件浏览器 / 上下文洞察）与对话区共享同一背景
- 玻璃只保留一层 `::before`，dockkit 中间容器透明化，面板圆角/发丝边

## v1.4-ui — 对话页悬浮玻璃 header

- 会话标题 + 智能体 chips + tab 行改为内缩 18px 圆角悬浮玻璃条
- 中列顶部加淡蓝雾衬光，深色同构，窄窗/无霜回退

## v1.3-ui — Windows 标题栏重叠修复

- 去掉重复的侧栏 panel 图标
- 收起态菜单起点交回宿主 `84px`，避开两个 28px 标题栏按钮

## v1.2-ui — 标题栏菜单条透明化

- `div[data-windows-menu]` 透明、线性 panel 图标、与主题同色

## v1.1-ui — Windows 标题栏统一

- 不透明探针色 + 网页侧同色实体条，消除原生 overlay 叠黑
- 官方鲸标图标；主题切换时主进程重同步 caption 颜色

## v1.0-ui — 首次交付

- 玻璃引擎 L1/L2/L3、氛围背景、壳层/侧栏/输入区/Hero/内容面/浮层
- 设置页（配色、氛围、透明度、模糊、动效）、浅深双主题、降级策略
- 构建 / 截图 / 提取工具链，`baseline-v0` 施工前快照

---

更细的根因、采样与逐轮截图见 [`docs/REPORT.md`](docs/REPORT.md)。
