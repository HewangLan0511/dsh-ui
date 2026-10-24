# UI-CONTRACT — 实现契约（Lead 维护，实现者必读）

本文件定义 `dsh-ui-deepseek` 插件的实现边界、玻璃变量、文件所有权与验收方式。
规格依据：`docs/DESIGN-SPEC.md`、`docs/GLASS-SPEC.md`、实时 DOM 快照 `.ref/dom/surface-tree.txt`。

## 1. 文件所有权（并行开发，禁止跨界写）

| 文件 | 所有者 | 内容 |
|---|---|---|
| `plugin/src/client-template.js` | Lead | 插件 JS：样式注入、氛围层、设置页、颜色模式 |
| `plugin/src/styles/00-foundation.css` | Lead | 玻璃引擎变量 + DSH token 映射 + 氛围层 |
| `plugin/src/styles/95-settings-panel.css` | Lead | 插件设置页自身样式 |
| `plugin/src/styles/10-shell.css` | shell-dev | 主壳/三栏/标题栏/标签页/右栏外壳/bottom row |
| `plugin/src/styles/20-sidebar.css` | shell-dev | 左栏全部：brand、新会话、面板列表、工作区/会话列表、footer、设置入口、收起态 |
| `plugin/src/styles/30-composer.css` | shell-dev | 输入区：composer seat/card/input/toolbar/send、dock 胶囊、goal bar |
| `plugin/src/styles/35-hero.css` | shell-dev | 空会话 Hero：品牌标记、大标题、lede、workspace/preset 控件 |
| `plugin/src/styles/40-content.css` | surfaces-dev | 对话流：消息行/气泡、思考条、工具调用卡/结果板、代码块/行内码、diff、deliverables、轨迹 |
| `plugin/src/styles/50-overlays.css` | surfaces-dev | 浮层：dialog/modal、菜单、popover、toast、审批/提问/计划卡、图片灯箱、命令面板、tooltip 豁免 |
| `plugin/src/styles/60-settings.css` | surfaces-dev | 设置窗口、设置卡片/行、插件页/市场/详情、右栏详情、文档预览、目录选择器 |
| `plugin/lib/client.js` | 构建产物 | 由 `node tools/build-plugin.mjs` 生成，勿手改 |
| `docs/*`、`tools/*`、`baseline/*` | Lead / 分析员 | 不要改 |

需要改别人的文件时，先给 Lead 发消息说明，不要直接写。

## 2. 构建与热更新

```powershell
node tools/build-plugin.mjs     # 合并 src/styles/*.css（按文件名排序）→ lib/client.js
```
- 构建后 2–4 秒，页面经 client HMR 自动热更新（无需重启/刷新）。
- 截图验证（会激活 DSH 窗口，注意与其他人错开）：
  ```powershell
  & .\tools\capture-dsh.ps1 -OutPath baseline\screenshots\<名字>.png
  ```
  然后 `read_image` 查看。每次改完必须至少截一张图确认无回归。

## 3. 玻璃引擎变量（`00-foundation.css` 已提供，直接消费）

| 变量 | 用途 |
|---|---|
| `--dsg-fill-l1 / -l2 / -l3` | 三级“填充色”（已含可读性地板，白/深蓝同色系，直接用作 background-color） |
| `--dsg-backdrop-l1 / -l2 / -l3` | 三级 `backdrop-filter` 完整值 |
| `--dsg-backdrop-panel` | 大面板用低半径霜 |
| `--dsg-sheen-l1 / -l2 / -l3` | 顶部镜面高光 `background-image` |
| `--dsg-bevel-l1 / -l2 / -l3` | 内高光 + 发丝边 + 外投影 `box-shadow` |
| `--dsg-border-hair` | 玻璃边线 |
| `--dsg-radius-card / -modal / -composer` | 20 / 24 / 28px |
| `--dsg-motion-dur`、`--dsg-ease` | 动效时长与缓动 |
| `--dsg-blue`、`--dsg-blue-strong`、`--dsg-blue-soft`、`--dsg-blue-ring` | DeepSeek 蓝与状态 |
| `--dsg-header-radius / -fill / -backdrop / -sweep` | 会话 header 悬浮玻璃条（10-shell.css 自建：18px 圆角、17%/47% 填充、24px 霜、镜面扫光）；header 的霜必须仍挂 `::before` |
| `--dsg-panel-fill / -backdrop` | 右栏面板玻璃（10-shell.css 自建：浅 18% 白 / 深 46% `#0d1524`、22px 霜）；**玻璃只允许画在面板 `::before` 一次**，本体与 dockkit 中间层必须透明（否则层层叠白） |

**分级使用规则**
- L1（内容面/大容器）：`--dsg-fill-l1` +（可选）`--dsg-backdrop-l1`；大滚动容器**不要**挂 backdrop-filter（性能）。
- L2（卡片/气泡/输入卡/侧栏面板）：`fill-l2` + `backdrop-l2` + `sheen-l2` + `bevel-l2`。
- L3（弹窗/详情/设置/菜单）：`fill-l3` + `backdrop-l3` + `sheen-l3` + `bevel-l3`。
- 用户要求：**弹窗/显示卡/详情卡的模糊要明显强于内容面**（L3 > L2 > L1）。

**硬约束（来自 GLASS-SPEC §5）**
1. `backdrop-filter` 会产生 fixed 包含块：`[data-composer-card]` 的霜放 `::before`，卡片本身 `backdrop-filter:none`；左栏/标题栏同理用伪元素；`[data-composer-seat]` 不铺底板、不挂霜。
2. 每条 `[class*="_bubble"]` 规则必须带 `:not([role="tooltip"])`；tooltip 保持原生不透明深底白字。
3. 菜单不要自绘新板：只改 `--dsw-specific-menu` / `--dsw-menu-surface-fill` / `--dsw-menu-backdrop-filter`（foundation 已设），或用 `[role="menu"]` 一类稳定容器做轻量补充；避免与宿主 `::before` 双层叠加。
4. 大滚动容器（`[data-conversation-region="chat"]`、`.xz4KEq_scroll`）不要挂 backdrop-filter；只在**卡片/浮层**上挂。
5. 代码块/行内码/终端保持高不透明（≥ `--dsg-fill-l2`，必要时再加一层白底），不要为了通透牺牲代码可读性。
6. 不要动 `position:fixed` 元素的祖先链上的 `backdrop-filter/transform/filter`。

## 4. 稳定选择器优先级

1. **A 级（源码写死，首选）**：`[data-composer-card]`、`[data-composer-seat]`、`[data-conversation-region="chat"|"composer"]`、`[data-chat-flow]`、`[data-slot="..."]`、`[data-question-key]`、`[data-plan-review-key]`、`[data-approval-key]`、`[data-turn-trigger]`、`[role="dialog"]`、`[role="tooltip"]`、`[data-rightbar-col]`、`[data-sidebar-right-session]`。
2. **B 级（类名后缀约定，CSS Modules 稳定半边）**：`[class*="_frame"]`、`[class*="_sidebarCol"]`、`[class*="_centerCol"]`、`[class*="_header"]`、`[class*="_bubble"]`、`[class*="_composerSeat"]`、`[class*="_card"]`、`[class*="_panel"]`、`[class*="_row"]` 等；必须与 A 级或作用域选择器组合，避免误伤。
3. **C 级（整串哈希类名，禁止）**：如 `.BynINW_frame`、`.RlGAzG_card`、`._2H3hWW_root` —— 只可用于**一次性验证**，不得写进交付 CSS；请改用 `[class*="_frame"]` 等后缀法，或从 `.ref/dom/surface-tree.txt` 找对应 A 级 hook。

## 5. 视觉基线（与参考图对齐）

- 画布：雾蓝白氛围层（foundation 已实现），浅色为默认。
- 圆角：卡片 20、弹窗/设置 24、composer 28、胶囊 999。
- 阴影：不要黑色硬阴影；用 `--dsg-bevel-*` 的蓝调柔影。
- 文字：主 `#16202f` / 次 `#4d5b73` / 弱 `#6b7a93`；深色对应已定义。
- 动效：150–200ms，`--dsg-ease`；hover 轻微抬升/增亮，不做夸张位移。
- 强调色：DeepSeek 蓝只用于 CTA、选中、链接、focus ring、发送按钮。

## 6. 验收（每个实现者自检）

- [ ] 浅色 + 深色切换（设置里或原生外观）都不破版、不丢对比度。
- [ ] composer 可以输入、发送按钮可点、附件/模型/权限等控件布局正常；fixed 浮层（如浏览器座位）没有错位。
- [ ] 左栏折叠/展开、会话切换、滚动正常；hover/active 反馈仍在。
- [ ] 卡片展开/收起、代码复制按钮、工具卡打开详情正常。
- [ ] 弹窗打开时文字清晰，背景内容不穿透干扰阅读。
- [ ] 没有横向滚动条、没有双发丝边、没有“白底白字”。
- [ ] 截图对比 `baseline/reference/deepseek-web.png`：留白、圆角、蓝色强调、层叠关系一致。
