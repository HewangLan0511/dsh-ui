# DSH × DeepSeek Web — UI 玻璃化重构

以 DeepSeek 网页端（deepseek.com）的视觉语言为基准，重构 DSH（DeepSeek Harness）桌面/Web GUI 的界面与交互：
整体透明、浅色空气感、大留白、柔光玻璃，弹窗/显示卡/详情卡按可读性分级加雾（backdrop blur）。

**状态：已交付。** 插件 `dsh-ui-deepseek` 已安装并在 desktop profile 生效。
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
plugin/              插件 dsh-ui-deepseek（本项目主要产物）
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
- [ ] 可选后续：菜单/审批卡/右栏文档预览的人工视觉复核；壁纸共存回归；生成式云雾背景

## 2026-10-24 追加修复：Windows 标题栏

顶部原生标题栏（「应用 / 编辑」菜单条 + 窗口控制按钮）已与玻璃 UI 统一：
不透明探针色 + 网页侧同色实体条 + 主题切换主动重同步 + 官方鲸标图标。
原理与像素验证见 [`docs/REPORT.md`](docs/REPORT.md) 第 9 节；修复文件 `plugin/src/styles/12-windows-titlebar.css`。
新增交付标签：`v1.1-ui`。
