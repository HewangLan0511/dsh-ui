# REPORT — DeepSeek 网页端视觉语言在 DSH 上的落地

> 交付日期：2026-10-24 ｜ 基线：`baseline-v0`（施工前快照）｜ 实现：`dsh-ui-deepseek` 插件（已安装到 desktop profile）

## 0. 一句话结论

以 deepseek.com 的「雾蓝空气感 + 液态玻璃」为视觉基准，把 DSH Web GUI 全量重构为透明玻璃界面：
**画布透明 + 75px 网格 + 三处雾核光晕**，**三级可读性玻璃**（内容面 29% / 卡片 40% / 弹窗·详情 84.6% 填充），
卡片与浮层按「阅读优先级」分级加雾（6 / 16 / 24px，弹窗大面单独 12px），
并完整保留 DSH 原有交互、命中区与固定浮层行为。

## 1. 设计逻辑是怎么分析出来的

方法：对用户提供的 deepseek.com 首屏截图做逐像素反解（Pillow 墨迹包围盒、一阶差分找边、高通找网格、双背景反解 alpha），
再用 3 个独立锚点交叉验证 DPR=1.5（发送键 32px / 行高 14–20 / placeholder 16px），得到 1686×886 CSS 视口下的实测值。
完整过程与数值见 [`DESIGN-SPEC.md`](DESIGN-SPEC.md)（§2 为量化基线，§2.4 为 9 点取色表）。

提炼出的 6 条设计逻辑：

1. **单一强色**：整个页面只有一个高饱和色 —— DeepSeek 蓝（实测 `#4176e6`，官方 `#4D6BFE`）。发送键、选中、链接、focus ring 用它，其它全部是蓝灰色阶。
2. **空气感来自「大留白 + 低对比边界 + 雾化背景」**，不是来自细边框：参考图没有 1px 分隔线，层级靠 0.5px 发丝、弥散阴影和玻璃反光。
3. **背景是一张有结构的图**：顶部近白、右上雾核、左中雾带、底部中性白，外加 75px 工程网格（alpha≈0.045）；不是纯色/纯渐变。
4. **玻璃不是「模糊+半透明」，是 5 层叠加**：染色底 + 顶部镜面高光 + 霜（backdrop-filter）+ 内高光/发丝边 + 外投影（下节详述）。
5. **排版靠「一个大数字」**：Hero 48px/600/0.1em 标题（实测为粗黑体，非宋体），正文 14/24 保持紧凑；重心约 45–54%。
6. **交互克制**：圆角胶囊、hover 轻微抬亮/抬升、90–200ms 过渡；没有夸张动效与弹跳。

## 2. 玻璃逻辑：复用 wallpaper-engine 的提取

完整提取见 [`GLASS-SPEC.md`](GLASS-SPEC.md)（§1 配方、§2 公式、§3 表面登记、§5 陷阱、§6 契约）。
落地到本插件的核心是三条恒等式与一张三级表：

```
effAlpha = floor + a · (1 − floor)        floor = 0.45（浅）/ 0.59（深）× fidelity
五层      = fill + sheen + backdrop-filter + bevel/hairline + shadow
模糊与饱和度解耦：saturate 1.30 / brightness 1.04 / contrast 1.01 恒定
```

| tier | 用途 | 浅色 fill | 深色 fill | blur |
|---|---|---|---|---|
| L1 | 页面画布、内容容器、工具结果板 | 29% | 39% | 6px（仅小面；滚动容器不挂霜） |
| L2 | 侧栏、标题栏、气泡、输入卡、工具卡、右栏 | 40% | 55% | 16px |
| L3 | 弹窗、设置、详情卡、菜单、审批/计划/提问卡 | **84.6%** | **88.5%** | 24px（dialog 大面 12px） |

- **L3 地板不参与 fidelity 缩放**：用户明确要求「弹窗/显示卡/详情卡为了可读性增加卡面模糊」，阅读型浮层不能为了通透牺牲文字。
- 与 wallpaper-engine 的区别：WE 的 blur 反比于文字密度（内容面 20px、dialog 10px）；本插件按用户诉求改为**正比于阅读优先级**（L3 > L2 > L1），并在大 dialog 上保留低半径以免整窗重绘。
- 复用了 WE 的工程结论：`backdrop-filter` 会造成 fixed 包含块（composer 的霜挂 `::before`）、tooltip 的 `_bubble` 必须 `:not([role="tooltip"])`、菜单只走 `--dsw-specific-menu` token 通道、无 GPU 时 92% 近不透明降级。

## 3. 从首页推广到 DSH 全部界面

| DSH 界面 | 处理 |
|---|---|
| 主壳 frame / 三栏 | 全透明；仅中列一层 L1 白釉（顶部 20px 圆角），让氛围层成为唯一背衬 |
| Windows 标题栏 | `frame::before` 画底色 + `::after` 承载 L1 霜（伪元素无后代，不破坏 fixed 收起按钮） |
| 会话 header | 56 CSS px，L2 玻璃 + 1px 蓝灰发丝底边；tab 13px、蓝字 + 2.5px 圆角下划线 |
| 左栏 | `div:has(> [data-slot="sidebar"])::before` 承载 L2 霜 + 右缘发丝/内投影；新会话白釉胶囊、行 hover/选中蓝柔光、搜索胶囊 |
| 输入区 | 座位不铺底不挂霜；输入卡 L2 + 28px 圆角 + `::before` 霜；15px 输入、760 CSS 宽、蓝色圆形发送键、工具行胶囊、dock/goal bar 同宽 |
| Hero | 48px 标题 + 蓝鲸标 + 「预览版」蓝胶囊 + workspace/preset 胶囊 + 760 composer，重心 ~54% |
| 对话内容 | 用户气泡 L2（`:not([role=tooltip])` 全覆盖）、思考/工具折叠胶囊 L2、工具结果高不透明平板、代码块高不透明底 + sticky banner、行内码、deliverables/plan/轨迹卡 |
| 浮层 | dialog L3 + 12px 大面霜、提问/计划/审批卡 L3、菜单 token 通道 + 12px 圆角、tooltip 保持不透明深底白字、toast 实底、灯箱只修饰 chrome |
| 设置 | 整窗 L3 + 12px 霜、左导航胶囊、设置卡/表单 L2、插件管理/市场/详情卡 L2、右栏面板 L2 + 收起守卫、文档预览纸面 |
| 轨迹 | timeline 彩条保留、行 hairline、表格 L2 平板（不挂霜，保滚动性能） |

## 4. 实现架构

- 一个可安装的 DSH bundle：`dsh-ui-deepseek`（本地 link 安装到 desktop profile，已生效）。
- 无构建期依赖：CSS 源码在 `plugin/src/styles/*.css`，`node tools/build-plugin.mjs` 将其内联进 `plugin/lib/client.js`（内联样式表 + React 设置页）。
- 运行时：`html[data-dsg="on"]` 注入氛围层；通过 token 覆盖 + 少量稳定选择器（`[data-composer-card]`、`[data-slot="sidebar"]`、`[data-chat-flow]`、`[role="dialog"]`、`data-shortcut-modal=settings` 等）实现，不修改任何 DSH 自带包。
- 设置页：设置 → 外观 → **外观 · DeepSeek**，可调色彩模式（浅/深/跟随系统）、氛围背景（极光/轻雾/关）、玻璃透明度、模糊强度、动效开关，即时生效并存本机。
- 开发链路：改 CSS → build → client HMR 自动热更新（2–4s）；截图工具带**前台隐私守卫**（DSH 不在前台则拒绝截图）。
- 开发期使用的 DOM 快照/受控导航 hook 已在交付前移除（`lib/client.js` 现无 dev 代码），仓库保留 `tools/` 与 `docs/` 供复现。

## 5. 验证

实机截图（1603×1028，DPR 1.25）：

| 场景 | 截图 |
|---|---|
| 施工前（深色原生） | [`assets/final/before.png`](assets/final/before.png) |
| Hero（浅色） | [`assets/final/hero.png`](assets/final/hero.png) |
| 对话（浅色） | [`assets/final/chat-light.png`](assets/final/chat-light.png) |
| 对话（深色） | [`assets/final/chat-dark.png`](assets/final/chat-dark.png) |
| 设置 · 账号 | [`assets/final/settings-account.png`](assets/final/settings-account.png) |
| 设置 · 内置插件 | [`assets/final/settings-plugins.png`](assets/final/settings-plugins.png) |
| 轨迹页 | [`assets/final/trajectory.png`](assets/final/trajectory.png) |

已验证：浅/深双主题、Hero、对话、设置窗两页、插件卡网格、轨迹表、composer/goal bar/dock 布局、fixed 元素未错位、无横向滚动、无白底白字、代码/日志可读。
未实机验证（静态实现 + CSS 复核）：菜单/tooltip/toast、提问/计划/审批卡、图片灯箱、右栏文档预览、工具行展开详情、hover/focus 真实态、左栏收起态。原因：本会话无法可靠注入真实鼠标/键盘事件；可后续由人工或自动化测试补齐。

## 6. 回滚

1. **代码级**：`git checkout baseline-v0 -- .`（或切 tag `baseline-v0`）。
2. **界面级**：在 DSH 插件管理器停用/移除 `dsh-ui-deepseek`，刷新后恢复原生 UI。
3. **完整恢复**：用 `baseline/profile/` 覆盖 profile 的 `cordis.patch.yml`/`package.json`，用 `baseline/plugins/` 覆盖 liteglass 与 wallpaper-engine 配置，重启 DSH。
4. 颜色模式在本次改造中一次性切到浅色；如需深色，在 设置 → 外观 改回。

详见 [`OPERATIONS.md`](OPERATIONS.md)。

## 7. 已知问题与限制

- **dsh-pet 桌宠浮层**会遮挡左栏 brand/HARNESS 与部分对话内容；它是独立的透明置顶窗口（外部插件），本插件无法通过 CSS 控制，建议在 dsh-pet 设置里调整位置/大小。
- 顶部「应用 / 编辑」是 Windows 原生菜单栏，无法随主题玻璃化。
- 参考图真实 computed style 未能获取（deepseek.com 为 SPA，CSS 由 JS 注入），数值来自截图反解；`#4d6bfe` vs 实测 `#4176e6` 的差异保留在 `FINAL-DECISIONS.md §4`，改 `--dsg-blue` 单变量即可切换。
- 设置/深色最终截图拍摄于最后一次 60-settings 微调之前（差异为细节级），其余截图均基于最终构建。
- 菜单/tooltip/审批卡等未展开态未实机验证；代码按稳定 hook 与 token 通道实现，若宿主升级导致类名后缀变化，只需补 `docs/SURFACE-MAP.md` 白名单里的选择器。

## 8. 文档索引

- [`DESIGN-SPEC.md`](DESIGN-SPEC.md) — DeepSeek 视觉规格（实测基线、token、组件、验收）
- [`GLASS-SPEC.md`](GLASS-SPEC.md) — WE 玻璃/透明/模糊逻辑提取与移植契约
- [`SURFACE-MAP.md`](SURFACE-MAP.md) — DSH 60+ 表面 × 稳定选择器 × 玻璃等级
- [`FINAL-DECISIONS.md`](FINAL-DECISIONS.md) — 最终取舍（blur 方向、L3 地板、文字 ramp、品牌蓝、字体）
- [`UI-CONTRACT.md`](UI-CONTRACT.md) — 实现契约与硬约束
- [`OPERATIONS.md`](OPERATIONS.md) — 构建/安装/回滚
 