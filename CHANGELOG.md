# Changelog

本项目的版本分两套：`vX.Y-ui` 是界面迭代里程碑（git tag），`1.0.0` 是插件对外的发布版本。
插件版本在 `plugin/package.json`；界面里程碑与发布版本的关系如下。

## 1.0.0 — 2026-10-24

首个对外发布版本，汇总全部界面迭代并补齐发布物料：

- 仓库 README 重写为发布向（特性 / 安装 / 设置 / 结构 / 开发 / 文档 / 许可）
- 新增 `LICENSE`（MIT）、`CHANGELOG.md`、`docs/RELEASE.md`、`plugin/README.md`
- `plugin/package.json`：版本 `1.0.0`、移除 `private`、补 `license`/`keywords`/`files`
- 新增 `tools/release.mjs`：构建 + `npm pack` + 源码 zip + SHA-256 校验和
- 文档预览改为不透明纸面（`--dsg-doc-paper` + `--dsw-alias-bg-document-preview` 映射 +
  含预览的面板/dockkit 容器一并做实），修复预览文字与对话区叠字
- 新增 git tag `v1.0.0`（此前界面里程碑 v1.0-ui … v1.11-ui 全部保留）

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
