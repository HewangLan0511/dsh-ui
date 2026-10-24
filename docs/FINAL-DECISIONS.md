# FINAL-DECISIONS — 集成决策记录

本文件记录 Lead 在实现阶段对分析规格做的最终取舍，避免实现者/验收者按相互冲突的文档执行。
规格来源：`docs/DESIGN-SPEC.md`（设计）、`docs/GLASS-SPEC.md`（玻璃）、`docs/SURFACE-MAP.md`（落点）。

## 1. 玻璃填充（已落地在 00-foundation.css）

公式沿用 GLASS-SPEC：`effAlpha = floor + a·(1 − floor)`，`color-mix` 预乘实现。

| tier | 浅色 fill 生效值 | 深色 fill 生效值 | 用途 |
|---|---|---|---|
| L1 | ≈29% 白 | ≈39% 深蓝 | 页面底、对话画布、大容器（只染色不挂霜） |
| L2 | ≈40% 白 | ≈55% 深蓝 | 侧栏、标题栏、气泡、输入卡、工具卡、右栏面板 |
| **L3** | **≈84.6% 白** | **≈88.5% 深蓝** | 弹窗、设置窗口、详情卡、菜单、审批/计划/提问卡 |

- **决策：L3 地板不参与 fidelity 缩放**（`--dsg-floor-l3` = 满地板 0.45/0.59）。原因是用户明确要求“弹窗/显示卡/详情卡为了可读性增加卡面模糊”，L3 必须有足够底色托住文字；DESIGN-SPEC 的 A 档 L1/L2 缩放只用于内容面。
- 对应实现：`--dsg-a3 = 0.72`，`--dsg-floor-l3: var(--dsg-floor-base-light|dark)`。

## 2. 模糊梯度（与 DESIGN-SPEC §7.3 的 20/16/10 不同）

**最终：L1 6px / L2 16px / L3 24px**（均乘设置页的 `--dsg-blur` 倍率）。

理由：
1. 用户要求“弹窗、显示卡、详情卡需要为了增加可读性而增加卡面模糊” ⇒ 越浮起的阅读面越糊（L3 > L2 > L1），与 WE 的“文字密度反比”经验相反，但符合本产品诉求。
2. 大滚动内容面挂大半径 blur 会在滚动时每帧重算（GLASS-SPEC §5.9），所以 L1 取小值且仅用于卡片级元素，不给 `[data-conversation-region=chat]` 滚动容器挂霜。
3. L3=24px 用于弹窗/详情/菜单是面积可控的 Readability uplift，可接受。

## 3. 文字色

浅色使用 DESIGN-SPEC A 档加深 ramp：`#101728 / #333c4d / #5c6472 / #626a78`（正文与次要文字均 ≥4.9:1）。
深色沿用 foundation 的 `#eef3ff / #b9c6df / #93a3c0 / #7d8da9`。

## 4. 品牌蓝

- CTA/发送/选中/focus：`#4d6bfe`（`--dsg-blue`），hover `#3556f0`。
- DSH 原生 `--dsw-static-deepseek-500` 保持 `#4176e6`（参考图实测值，与既有 token 一致）。
- 未做实机取色对比；如后续要 1:1 对齐参考图，可把 `--dsg-blue` 调为 `#4176e6`（单变量）。

## 5. 字体

- UI：系统无衬线栈（DSH 默认），不改正文 14/24。
- Hero 大标题：按项目意图默认宋体展示栈（`"Noto Serif SC","Songti SC","SimSun",serif`），保留一行切回粗黑体的开关；DESIGN-SPEC §2.7 的证据表明参考图其实是粗黑体 — 两版都可交付，默认东方气质衬线。
- 标题字号/字距：48px / 500–600 字重 / 0.04–0.08em（衬线取小字距）；若切粗黑体则 0.125em。

## 6. 背景与壁纸

- 默认使用 CSS 氛围层（雾蓝渐变 + 75px 网格 + 极淡光斑），不依赖 wallpaper-engine。
- 若用户启用 wallpaper-engine 壁纸：建议在插件设置里把“氛围背景”设为“关闭”，避免双层背景。两者同时开启时，WE 的 body 行内 token 会与我们的 token 竞争；本插件不主动禁用 WE，只保证自身样式可回退。
- 背景图方案（可选增强）：后续可用生成式柔和云雾图作为最底层 image layer；默认不引入，避免喧宾夺主与包体增大。

## 7. 降级

- 语法降级：`@supports not (backdrop-filter)` → 92% 近不透明、无霜。
- 运行时降级：WebGL renderer 命中 swiftshader/llvmpipe/software 等 → `body[data-dsg-fallback]` → 同 92% 配方。
- `prefers-reduced-motion`：关闭光斑动画、把过渡压到 1ms。

## 8. 验收口径

以 `docs/DESIGN-SPEC.md §12` 的 16 条为基础，但第 2 条（blur 单调方向）按本文件第 2 节执行；玻璃 effAlpha 以本文件第 1 节表为基准（L3 84.6%/88.5%）。

## 9. 已知未验证

- 设置窗口/菜单/右栏/灯箱的几何与视觉：设置窗口已实机截图（`baseline/screenshots/settings-auto-open.png`），其余待实现后实机验证。
- 深色主题：需在设置里切深色后截图验证。
- 组件展开态（工具卡详情、思考展开、审批卡）：需在真实对话中触发后验证。
