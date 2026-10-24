# DSH × DeepSeek Web — UI 玻璃化重构

以 DeepSeek 网页端（deepseek.com）的视觉语言为基准，重构 DSH（DeepSeek Harness）桌面/Web GUI 的界面与交互：
整体透明、浅色空气感、大留白、柔光玻璃，弹窗/显示卡/详情卡按可读性分级加雾（backdrop blur）。

**状态：已交付。** 插件 **`dsh-skin-mistblue`（雾蓝）** 已安装并在 desktop profile 生效
（v1.6 及以前名为 `dsh-ui-deepseek`；v1.7 起改名，localStorage 有迁移，旧设置不丢）。
完整交付报告：[`docs/REPORT.md`](docs/REPORT.md)

## 仓库结构

```
baseline/            施工前快照（可回滚点）
  profile/           当前 profile 的 cordis.patch.yml / package.json 副本
  plugins/           ui-liteglass 与 wallpaper-engine 的当前配置
  ui-theme/          DSH 主题 token 样式表（从 app.asar 提取）与 WE 玻璃 CSS 参考
  screenshots/       施工前界面截图（current-ui.png）
  reference/         DeepSeek 网页端参考图
docs/                设计规格、玻璃引擎规格、DSH 页面/选择器清单、最终决策、报告
  assets/final/      最终效果截图（hero / chat light+dark / settings / trajectory）
plugin/              插件 dsh-skin-mistblue（雾蓝，本项目主要产物）
  src/styles/        00 基础+玻璃引擎 · 10 壳层 · 20 左栏 · 30 输入区 · 35 Hero · 40 内容 · 50 浮层 · 60 设置 · 95 插件设置页
  lib/client.js      构建产物（内联 CSS + React 设置页）
tools/               构建 / 截图 / 提取 / 归档脚本
```

## 设计目标（摘要）

- **视觉**：DeepSeek 蓝 `#4D6BFE`、雾蓝白渐变氛围背景 + 75px 极淡网格、超大留白、圆角胶囊、柔和分层阴影。
- **透明**：所有面板/卡片/浮层半透明，背景为 CSS 氛围层（可选：与 wallpaper-engine 壁纸共存）。
- **可读性分级加雾**：L1 内容面 29%（6px）/ L2 卡片 40%（16px）/ L3 弹窗·详情 84.6%（24px，大 dialog 12px）。数值复用 wallpaper-engine 的玻璃/透明/模糊公式（`effAlpha = floor + a·(1−floor)`）。
- **交互**：轻量动效（90–200ms）、hover 抬升/增亮、焦点环、胶囊按钮、发送按钮浮起；无夸张弹跳。

## 使用

- 插件已安装：设置 → 外观 → **外观 · DeepSeek** 可调：
  - 配色：浅色 / 深色 / 跟随系统（默认浅色，DeepSeek 参考图基准）
  - 氛围背景：极光 / 轻雾 / 关闭
  - 玻璃透明度、模糊强度、动效开关
- 直接修改 `plugin/src/styles/*.css` 后运行 `node tools/build-plugin.mjs`，已打开的页面会 HMR 热更新。

## 开发与回滚

```powershell
# 构建插件 client（CSS + JS 内联）
node tools/build-plugin.mjs

# 安装/更新：通过 DSH plugin_manager install_bundle，target 为 plugin 绝对路径
# 回滚到施工前快照
git checkout baseline-v0 -- .
# 或卸载 bundle（见 docs/OPERATIONS.md）
```

基线提交：`baseline-v0`；交付标签：`v1.0-ui`。

## 文档

- [交付报告](docs/REPORT.md)
- [DeepSeek 视觉规格](docs/DESIGN-SPEC.md)
- [WE 玻璃逻辑提取](docs/GLASS-SPEC.md)
- [DSH 表面/选择器清单](docs/SURFACE-MAP.md)
- [最终取舍](docs/FINAL-DECISIONS.md) · [实现契约](docs/UI-CONTRACT.md) · [构建/安装/回滚](docs/OPERATIONS.md)

## 状态

- [x] 仓库初始化 + 基线快照
- [x] 设计规格 / 玻璃引擎规格 / 页面清单
- [x] 插件骨架 + 安装链路 + 设置页
- [x] 壳层（背景、侧栏、标题栏、输入区、Hero）
- [x] 内容面（消息、工具卡、代码块、轨迹、deliverables）
- [x] 浮层（弹窗、设置、详情、菜单、通知、tooltip 豁免）
- [x] 浅色/深色双主题 + 降级策略 + 动效
- [x] 视觉验收（截图）+ 交互保持（fixed 浮层/命中区/滚动）
- [x] 对话页顶层 header 悬浮玻璃条（v1.4-ui）
- [x] 右侧边栏玻璃化：文件浏览器 / 上下文洞察共享对话背景（v1.5-ui）
- [x] 拖动分栏性能优化（resize guard）+ 设置页中文（v1.6-ui）
- [x] 改名 `dsh-skin-mistblue`（雾蓝），旧配置迁移（v1.7-ui）
- [x] 收起态标题栏：图标几何/中性色、隐藏更新蓝点、tooltip 不再被玻璃染色（v1.8-ui）
- [x] 所有悬停 tooltip 玻璃化（含图表悬停卡可读性），v1.10 调整为几乎不透明（v1.9-ui / v1.10-ui）
- [ ] 可选后续：菜单/审批卡/右栏文档预览的人工视觉复核；壁纸共存回归；生成式云雾背景

## 2026-10-24 追加修复：Windows 标题栏

顶部原生标题栏（「应用 / 编辑」菜单条 + 窗口控制按钮）已与玻璃 UI 统一：
不透明探针色 + 网页侧同色实体条 + 主题切换主动重同步 + 官方鲸标图标。
原理与像素验证见 [`docs/REPORT.md`](docs/REPORT.md) 第 9 节；修复文件 `plugin/src/styles/12-windows-titlebar.css`。
新增交付标签：`v1.1-ui`。

## 2026-10-24 追加：对话页顶层玻璃 header

对话页顶部（会话标题 + 智能体 chips + tab 行）从通栏乳白横条改为**悬浮玻璃条**，
与输入框同一套材质语言：内缩 + 18px 圆角、17% 白填充 + 24px 霜、顶部镜面高光 + 发丝边、
底部内侧厚度阴影 + 外投影；中列顶部另加淡蓝雾作为衬光，让「透明 / 模糊」真正可见。
深色同构、窄窗与无霜/软件光栅化有回退。原理与实机截图见
[`docs/REPORT.md`](docs/REPORT.md) 第 10 节；实现文件 `plugin/src/styles/10-shell.css`。
新增交付标签：`v1.4-ui`。

## 2026-10-24 追加：右侧边栏玻璃化

右栏（文件浏览器 / 上下文洞察，含打开 tab 后的界面）原来是一块叠了好几层半透明白的「白板」：
面板壳被 60-settings 与 10-shell 各画一遍玻璃，dockkit 的 panelBody / surface / tabHost / paneBody
又各带一层底。现在玻璃只保留 `::before` 一层（浅 18% 白 / 深 46% `#0d1524`、22px 霜），
所有中间容器清零，氛围层直接透上来 —— 右栏与对话区共享同一张背景，列表/统计卡在玻璃上自然分层。
原理、采样与浅深两套截图见 [`docs/REPORT.md`](docs/REPORT.md) 第 11 节；
实现文件 `plugin/src/styles/60-settings.css` §4 与 `plugin/src/styles/10-shell.css` §4。
新增交付标签：`v1.5-ui`。

## 2026-10-24 追加：拖动分栏性能 + 设置页中文

- **拖动卡顿**：拖动左右分栏时每帧重排，几十个 `backdrop-filter` 玻璃面（尤其逐个挂霜的消息气泡）
  每帧重采样 backdrop，是掉帧主因。现在 client 在指针拖动 >4px 时给 `<html>` 打
  `data-dsg-resizing`，CSS 只在拖动期间卸掉霜与超大外投影（背后是平滑氛围层，观感几乎无差），
  松手立即恢复，静止/拖动结束外观不变。
- **设置页中文**：语言检测从「模块加载时缓存」改为每次读取 DSH `locale` 服务 / `<html lang>` /
  `navigator.language`，未知时默认中文，并订阅 `locale/change` 即时重渲染。
- 单元测试 `node tools/test-plugin-logic.mjs` 覆盖 drag guard 与 i18n 选择；
  原理见 [`docs/REPORT.md`](docs/REPORT.md) 第 12 节。
- 新增交付标签：`v1.6-ui`。

## 2026-10-24 追加：改名为 `dsh-skin-mistblue`（雾蓝）

- 插件正式定名 **dsh-skin-mistblue / 雾蓝（Mistblue）**：包名、bundle patch、模块 id、
  设置页标题（「外观 · 雾蓝」）、locale 文案全部切换；
- localStorage 键改为 `dsh-skin-mistblue/*`，并保留对旧键 `dsh-ui-deepseek/*` 的一次性读取迁移，
  旧配置/配色不会丢；
- 命名候选与取舍记录在 [`docs/NAMING.md`](docs/NAMING.md)；
- 安装：desktop profile 通过 `plugin_manager` 以 link 方式重装为
  `dsh-skin-mistblue` → 本仓库 `plugin/`。
- 新增交付标签：`v1.7-ui`。

## 2026-10-24 追加：收起态标题栏修复

- **新建会话图标错位/过蓝**：基础胶囊规则（38px 高、margin、品牌蓝 svg）漏进了收起态
  28×28 的标题栏按钮；现在收起态把几何完全交回宿主，图标 16px、中性墨色，hover 才提亮。
- **展开/折叠图标上的蓝点**：那是 DSH 的桌面更新徽标（`sidebar.toggle.badge`）；
  收起态隐藏该徽标，更新提示仍保留在展开态 footer 的「新版本」胶囊。
- **悬停时的“黑色阴影”**：其实是这两个按钮的 tooltip 被悬浮玻璃 header 盖住并染色；
  现在只在 tooltip 挂载时提升侧栏列的层叠，让 tooltip 正常浮在最上层。
- 实现：`plugin/src/styles/20-sidebar.css` §7、`plugin/src/styles/21-collapsed-titlebar.css`；
  截图与根因见 [`docs/REPORT.md`](docs/REPORT.md) 第 14 节。
- 新增交付标签：`v1.8-ui`。

## 2026-10-24 追加：悬停 tooltip 全面玻璃化

- **图表详情卡透字**：`上下文趋势` 的悬停卡原来读 `--dsw-alias-bg-layer-2`（40% 白）且不挂霜，
  坐标轴文字会透出来、坐标标记还会压到卡上；现在统一为 96% 填充 + 17.6px 霜（v1.10 起几乎不透明），
  并把 `z-index` 提到 40。
- **全部悬停 tooltip 换装**：`[role='tooltip']` 从"不透明深底白字"改为
  几乎不透明的 94% 玻璃（16px 霜 + 釉 + 发丝边 + 轻投影），文字改用主题墨色；
  快捷键 pill、无霜降级（98%）一并处理。
- **v1.10 调整**：v1.9 的 74%/78% 在实机上仍偏透，按用户要求把填充率提到
  **94% / 96%**（图表卡），只保留 ~4% 通透镜面感，彻底杜绝"透字"。
- 验证台：`tools/tooltip-preview.mjs`（真实 CSS 层叠 + headless Edge 截图），
  浅/深色效果见 [`docs/REPORT.md`](docs/REPORT.md) 第 15 节。
- 新增交付标签：`v1.9-ui`；随后按用户要求改成"几乎不透明"，标签 `v1.10-ui`。
