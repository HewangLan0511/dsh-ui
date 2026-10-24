# DSH × DeepSeek Web · 视觉设计规格（DESIGN-SPEC）

> 代号 **DSG · DeepSeek Glass**
> 目标：以 `baseline/reference/deepseek-web.png`（deepseek.com 网页端首屏）的视觉语言为基准，重做 DSH（DeepSeek Harness）桌面 / Web GUI —— 三栏主壳、设置窗口、弹窗、菜单、tooltip、工具卡、详情侧栏都适用，不是只复刻一个首页。
>
> | 项 | 值 |
> |---|---|
> | 基准参考图 | `baseline/reference/deepseek-web.png` · 2529×1329 px · DPR 1.5 → **1686×886 CSS px** |
> | 现状截图 | `baseline/screenshots/current-ui.png` · 1603×1028 px（深色、不透明、无氛围层） |
> | 现有 token 源 | `baseline/ui-theme/design_platform.css`、`base.css`、`gradient_shadow_text.css`、`scrollbar.css`、`shiki.css` |
> | 玻璃引擎契约 | `docs/GLASS-SPEC.md` §4.4（三级表）/ §6.2（公式）—— 本文件 §7 与之数值一致 |
> | 落点清单 | `docs/SURFACE-MAP.md`（每个面用哪个选择器） |
> | 主视觉基准 | **浅色**；深色是同一套逻辑的「暗色玻璃变体」，供 DSH 现有 dark 偏好使用 |
>
> 本文件所有数值可直接复制成 CSS。带 `📐` 的是**实测值**（从参考图逐像素量出来的），带 `🎛` 的是**设计取值**（实测值取整到设计栅格，或为在 DSH 上推广而新增）。

---

## 0. 这份文档怎么用

1. **写样式的人**：照 §9.4 把 `--dsg-*` 变量块粘贴进插件 `client.js` 的 CSS，再按 §8 逐组件落选择器；§12 是截图验收标准。
2. **做玻璃引擎的人**：§7.1 是唯一公式源（引用 `docs/GLASS-SPEC.md`），§7.2/§7.3 给两套预设（壁纸 / 无壁纸）。
3. **做验收的人**：§2.4 的 9 点取样表 + §12 清单，全部可截图后跑脚本量化比较。
4. 不要凭形容词争论：本文件里「柔和」「空气感」都已经被翻译成 alpha、blur 半径、ΔE 容忍度。

---

## 1. 设计原则（每条都带可执行判据）

| # | 原则 | 可执行判据 |
|---|---|---|
| P1 | **背景是主体，界面是贴在背景上的玻璃**。首屏 70% 以上面积是氛围层，没有任何实体面板。 | 空态首屏：氛围层可见面积 ≥ 65%；实体不透明元素面积 ≤ 8%。 |
| P2 | **分层靠「雾」，不靠「线」**。用 fill alpha + blur 区分层级，1px 实线只用于必须的输入框/表格。 | 相邻两级的 effAlpha 差 ≥ 0.10；同层内不使用 > 0.10 alpha 的边框。 |
| P3 | **大留白 + 单一视觉焦点**。一屏只有一个 hero 级字号（48px），其余全部 ≤ 24px。 | 同屏出现两个 ≥ 32px 的字号 = 违规。 |
| P4 | **文字永远比玻璃重要**。任何玻璃面板先保证正文 4.5:1，再谈透明度。 | 见 §7 / §12：最暗锚点上正文对比度 ≥ 4.5:1。 |
| P5 | **材质统一，表面分级**。整盘只用白釉（浅）/深釉（深）两种玻璃色，靠三级雾量拉开远近。 | 全应用玻璃 tint 只有 1 个（`--dsg-tint`），不允许多种带色玻璃。 |
| P6 | **中文标题要「慢」**：字重 600、字距 +0.125em、行高 1.25，让 4–8 个字撑起整个版面。 | Hero 字距 ≥ 0.10em，且 ≤ 0.16em；字重 ≥ 600。 |
| P7 | **动效只做「出现」，不做「表演」**。140–320ms，位移 ≤ 12px，缩放 ≤ 1.02。 | 无 duration > 400ms 的交互动效（氛围层漂移除外）。 |

---

## 2. 参考图量化基线（📐 全部实测）

### 2.1 测量方法

用 Pillow 逐像素扫描参考图，做了三类测量：① 墨迹包围盒（阈值 luminance < 100/150 分离标题与浅灰副标题）② 亮度一阶差分定位面板边缘 ③ 高通滤波 + 峰值检测求网格周期。所有数值同时换算到 CSS px（÷1.5）。

### 2.2 DPR 标定（为什么是 1.5）

三个独立锚点互相验证，都落在 DPR = 1.5：

| 锚点 | 实测（device px） | ÷1.5 | 结论 |
|---|---|---|---|
| 发送按钮蓝色圆 bbox | 45×45（含 AA 边约 48） | 32 | DeepSeek 标准 32px 圆形按钮 ✅ |
| 副标题行距（第 1 行墨顶 → 第 2 行墨顶） | 31 | 20.67 | 14px/20px 正文行高 ✅ |
| 输入框 placeholder 墨高 | 26（含逗号下延） | 17.3 | 16px 字号 ✅ |

因此：**视口 1686×886 CSS px**，后文所有 `px` 值均为 CSS px。

### 2.3 布局测量表

![参考图布局标注（device 空间叠加，数值为 CSS px）](assets/reference-annotated.png)

| 元素 | CSS 位置 / 尺寸 | 备注 |
|---|---|---|
| 顶栏内容带 | y 0–48，logo 左缘 x=311，logo 117×18 | logo 垂直中心 y=24 → 顶栏高 48，内容垂直居中 |
| 顶栏右侧 | 「获取 APP」+ 中文/EN 分段控件，右缘 x≈1375 | 左右对称留白 311 / 311 → 内容容器 ≈ 1064 宽居中 |
| 副标题 lede | 两行，墨迹 y 274–307，行高 20，字号 14 | 居中，最大行宽 ≈ 522 |
| **Hero 标题** | 墨迹 x 683–989（宽 306）、y 344–380（高 36.7） | 6 个字，**字身推进 54 / 字**，字距 6px |
| lede → 标题 | 墨底 307 → 墨顶 344 = 37 | |
| 标题 → composer | 墨底 380 → 面板顶 423 = 43 | |
| **Composer 面板** | x 477–1209（宽 732）、y 423–538（高 115）、r≈24 | 居中；宽 = 视口 43.4% |
| 面板内 placeholder | 墨迹 y 439–456，左内边距 ≈ 20 | 16px |
| 工具条（chips） | chip 高 ≈ 24–28（边界检测受限），y 501–525 | 「深度思考」白釉 chip、「智能搜索」蓝釉 chip |
| 发送按钮 | 32×32，中心 (1184, 513)，距面板右内边距 ≈ 13 | |
| composer → CTA 胶囊 | 面板底 538 → 胶囊顶 572 = 34 | |
| CTA 胶囊行 | 高 36、r=999、行 y 572–608、行宽 x 635–1053（418 居中） | 3 个胶囊，间距 ≈ 12 |
| 页面底部 | y 833 起为近中性白 #f6f6f7 | 雾气向下收尾 |

> 一句话结构：**顶栏 48 / lede 274 / 标题 344 / composer 423 / 胶囊 572**，重心在 y≈45%，上下留白比 1:1.4（上 274 : 下 278）。

### 2.4 氛围层 9 点取样（校准锚点）

这是复刻背景的**验收基准**。实现后用同样的 9 个 CSS 坐标在 1686×886 截图里取样，应满足 ΔE₀₀ ≤ 3 或单通道差 ≤ 6/255：

| y \ x | 80 | 267 | 467 | 667 | 843 | 1000 | 1200 | 1400 | 1600 |
|---|---|---|---|---|---|---|---|---|---|
| **20** | `#fcfdfe` | `#fcfdfe` | `#fcfdfe` | `#fcfdfe` | `#c5d2eb` | `#b5c5e5` | `#99afdb` | `#b5c5e5` | `#f2f5fb` |
| **120** | `#f2f7fc` | `#f3f7fc` | `#f3f7fc` | `#ecf2f9` | `#dce5f4` | `#cedbef` | `#d3def1` | `#d0dcf0` | `#d8e2f3` |
| **253** | `#eaf1f9` | `#eaf1f9` | `#e6eef8` | `#e4ecf7` | `#e8eff8` | `#eaf1f9` | `#e7eff8` | `#e7eff8` | `#e4ecf7` |
| **413** | `#d6e2f3` | `#c8d7ee` | `#bbcde9` | `#d6e2f3` | `#dde7f5` | `#e5eef8` | `#e5eef8` | `#e5eef8` | `#e5eef8` |
| **547** | `#dbe6f3` | `#cad8ed` | `#c0d0ea` | `#d6e1f1` | `#e5edf7` | `#e6eef7` | `#e6eef7` | `#e6eef7` | `#e6eef7` |
| **700** | `#d9e2f0` | `#dae3f0` | `#dae3f0` | `#e5ecf4` | `#ecf2f7` | `#edf2f7` | `#edf2f7` | `#edf2f7` | `#ebf0f6` |
| **833** | `#f6f6f7` | `#f6f6f7` | `#f6f6f7` | `#f7f6f8` | `#f8f7f8` | `#f8f7f8` | `#f8f7f8` | `#f8f7f8` | `#f8f7f8` |

读法（重要）：**右上角 y=20/x=1200 有一个很强的雾蓝核 `#99afdb`；左中 x=467/y=413–547 有第二条雾带 `#bbcde9`–`#c0d0ea`；底部收成中性暖白 `#f6f6f7`；顶部中央几乎纯白 `#fcfdfe`**。这就是 §6 背景 CSS 的四个必答项。

### 2.5 网格（📐 硬数值）

- 周期：高通峰值出现在 device x = 84, 196.5, 309, 421.5, 534, 646.5, 759 → 间距 **112.5 device = 75 CSS px**
- 线宽：1 CSS px（1.5 device，跨 2 个 device 像素）
- 对比：格线相对局部底色下沉 **≈4/255**，反解 alpha ≈ **0.03**（浅蓝灰线）
- 生效范围：全屏，但被雾气和白色顶光削弱；底部 20% 几乎不可见

### 2.6 关键元素实测色

| 元素 | 实测值 | 说明 |
|---|---|---|
| Hero 标题墨色 | `#243351`（中位 `#253451`） | 深蓝板岩，不是纯黑 |
| 副标题文字 | 最暗 `#717a85`，感知 `#6f7987` | |
| placeholder 墨 | 最暗 `#1e232c` | 接近正文黑，靠字重/字号弱化 |
| 品牌蓝（发送按钮 / 字标 / 智能搜索） | `#4176e6` **三处一致** | 与 DSH 现有 `--dsw-static-deepseek-500` 完全同值；官方品牌值 `#4D6BFE`（见 §3.1 说明） |
| composer 面板 | `rgba(255,255,255,0.34–0.40)`（4 点反解） | 见 §7.3 |
| 面板内 `深度思考` chip | 白釉 + 发丝边 | 未选中态 |
| `智能搜索` chip | 蓝釉 `rgba(77,107,254,.10)` + 蓝字 | 选中态 |
| CTA 胶囊 | 白釉 ≈ `rgba(255,255,255,.62)`，边框 ≈ `rgba(90,115,160,.18)` | 边框比底色**暗**，不是白边 |
| 底部 | `#f6f6f7` / `#f8f7f8` | 中性收尾 |

### 2.7 字体判定 —— 一处必须纠正的事实 ⚠️

任务简报里写「参考图里中文大标题用的是宋体/衬线风格」。**逐像素放大后这个描述与图不符**：

- 4× 放大裁切：`assets/` 同源数据（原始 2529×1329，裁 x 1180–1500 / y 440–590 后 ×4）
- 判据：`未` 的两横、`至` 的三横、`境` 的 `土` 侧边，**笔画粗细一致、收笔是平切矩形、无三角顿笔/无衬线装饰**；`之` 的捺尾是平切上挑，不是宋体的燕尾。
- 结论：参考图用的是**粗黑体（无衬线）**，字重 600–700（Source Han Sans / Noto Sans SC / PingFang SC 一类），font-size 48px、letter-spacing ≈ 6px（0.125em）。
- 自检：单字墨宽 37、墨高 36.7，推进 54 → 去掉字距后 em ≈ 48，墨高/em = 0.76（黑体典型值；宋体同字号会到 0.88 且横细竖粗）。

**处理方式**：两种都给出（§4.2）。DSH 的 Hero **默认走衬线栈**（满足项目「东方气质」的设计意图），并保留一行切换回「1:1 复刻参考图」的粗黑栈。这不是含糊，是明确的设计选择 + 可回退的工程量。

### 2.8 与 DSH 现状（current-ui.png）的差距

| 维度 | 现状 | 目标 |
|---|---|---|
| 画布 | 纯 `#151517` 平面，无氛围层 | 浅色雾蓝氛围层 + 75px 网格 + 3 处雾气核（§6） |
| 层级 | 靠 1px 边线 + 亮度差（#1b1b1c / #212123） | 靠 fill alpha（.29/.40/.66）+ blur（20/16/10） |
| 圆角 | 8/12/16 为主，输入卡 16 | 10/16/20/24，composer 24，窗口 24，胶囊 999 |
| 顶栏 | 三段：系统菜单 / 标题 / 操作，无玻璃 | 52px 一体顶栏，L2 玻璃，克制到只有 logo+标题+3 个动作 |
| Hero | 无（直接对话） | 空态 Hero：48px 大标题 + 20px lede + composer + 3 个 CTA 胶囊 |
| 字号 | 14 正文 / 13 小字 | 同上，加 48 Hero、20 副标题、11 caption，形成 8 级阶梯 |
| 阴影 | 几乎无（深色下不可见） | 三级玻璃阴影 + `inset 0 1px 0 rgba(255,255,255,.32)` 顶光 |
| 主色 | 品牌蓝只出现在发送按钮/高亮 | 品牌蓝成为唯一强调色：CTA、选中芯片、链接、focus ring |
| 信息密度 | 高（侧栏 340px、行高紧） | 侧栏 264、行高 1.6、gutter 8、面板内边距 16/20 |

---

## 3. 色彩系统

### 3.1 品牌蓝阶

参考图三处品牌蓝实测都是 `#4176e6`（= DSH 现有 `--dsw-static-deepseek-500`），官方品牌值是 `#4D6BFE`。两者在同一色相上相差一个明度档，视觉上同族。**决策**：CTA / 链接 / 选中态用 `#4d6bfe`（品牌真值），玻璃上的图标 / 次级强调 / 已经存在的 DSH token 保留 `#4176e6`。

```css
/* 品牌蓝阶 —— 唯一的强调色，只允许出现在：CTA、选中芯片、链接、focus ring、发送按钮 */
--dsg-blue-50:  #eef3ff;   /* 选中芯片底、链接 hover 底 */
--dsg-blue-100: #dfe8ff;
--dsg-blue-200: #c3d2ff;
--dsg-blue-300: #9fb4ff;   /* 暗色主题的浅蓝字 */
--dsg-blue-400: #7b93ff;   /* 暗色主题的链接 */
--dsg-blue-500: #4d6bfe;   /* ★ 品牌主色（CTA 填充） */
--dsg-blue-600: #3d59e8;   /* CTA hover */
--dsg-blue-700: #3047c9;   /* CTA active */
--dsg-blue-800: #25389e;
--dsg-brand-ink: #2f49d9;  /* 浅底上的蓝字（对比度 4.6:1 on #eef3ff） */
```

### 3.2 中性 / 文字三级（浅色）

```css
--dsg-ink-950: #131a26;  /* 极少用，遮罩上的重字 */
--dsg-ink-900: #1c2532;  /* 正文主色（on L2 玻璃 13.9:1） */
--dsg-ink-800: #243351;  /* Hero 大标题（📐 实测 #243351） */
--dsg-ink-700: #36455c;
--dsg-ink-600: #4b5a6e;  /* 二级文字 / 副标题 */
--dsg-ink-500: #6e7c8f;  /* 三级文字 / caption */
--dsg-ink-400: #8a97a8;  /* placeholder / disabled 文字 */
--dsg-ink-300: #a9b4c2;  /* 图标弱态 */
--dsg-ink-200: #c8d2de;  /* 分隔线重 */
--dsg-ink-100: #e3e9f2;  /* 输入框边线 / 分隔线 */
--dsg-ink-50:  #f2f5f9;  /* 实底控件底 */
```

### 3.3 语义色（浅 / 深成对）

| 语义 | 浅色 | 深色 | 用途 |
|---|---|---|---|
| success | `#1f9d63` | `#4ed17e` | 运行完成、diff 新增 |
| warning | `#d98924` | `#f7ad31` | 权限提示、限额 |
| danger | `#d92d20` | `#f25a5a` | 删除、错误、diff 删除 |
| info | `= brand` | `= brand` | 系统提示 |
| running | `#4d6bfe` + 呼吸 | `#7b93ff` | 工具卡 running 状态 |

语义色**只做小面积**（图标、2px 状态点、8% 底），不做整块底色。

### 3.4 浅色主题完整 token（可直接粘贴）

```css
:root, body {
  /* ── 氛围层（§6） ─────────────────────────────── */
  --dsg-atmos-base:  #f4f7fc;
  --dsg-atmos-warm:  #f8f7f8;
  --dsg-mist-1:      rgba(120, 152, 219, 0.52);  /* 右上雾核 */
  --dsg-mist-2:      rgba(146, 178, 230, 0.46);  /* 左中雾带 */
  --dsg-mist-3:      rgba(196, 213, 238, 0.34);  /* 右侧薄雾 */
  --dsg-top-light:   rgba(255, 255, 255, 0.96);  /* 顶部白光 */
  --dsg-grid-size:   75px;
  --dsg-grid-line:   rgba(59, 91, 148, 0.045);   /* 📐 实测 ≈.03 */
  --dsg-glow-brand:  rgba(77, 107, 254, 0.10);   /* 发送/生成时的品牌光晕 */

  /* ── 表面（§7） ───────────────────────────────── */
  --dsg-tint:        #ffffff;
  --dsg-tint-rgb:    255, 255, 255;
  --dsg-floor:       0.45;                        /* GLASS-SPEC 红线 */
  --dsg-glass-fidelity: 0.55;                     /* 0–1；1.0 = 壁纸安全档 */
  --dsg-alpha-l1:    0.06;
  --dsg-alpha-l2:    0.20;
  --dsg-alpha-l3:    0.55;
  --dsg-fill-l1:     rgba(255,255,255,.29);
  --dsg-fill-l2:     rgba(255,255,255,.40);
  --dsg-fill-l3:     rgba(255,255,255,.66);
  --dsg-fill-solid:  #f7f9fc;                     /* tooltip/select/图片垫底 */

  /* ── 玻璃工艺 ─────────────────────────────────── */
  --dsg-blur-l1: 20px;  --dsg-blur-l2: 16px;  --dsg-blur-l3: 10px;
  --dsg-saturate: 1.30; --dsg-brightness: 1.04; --dsg-contrast: 1.01;
  --dsg-keyline:        inset 0 1px 0 rgba(255,255,255,.32);
  --dsg-keyline-bottom: inset 0 -1px 0 rgba(255,255,255,.08);
  --dsg-hairline:       inset 0 0 0 .5px rgba(255,255,255,.08);
  --dsg-line:           rgba(31,58,110,.10);      /* 非玻璃面的 1px 边线 */
  --dsg-line-strong:    rgba(31,58,110,.18);

  /* ── 阴影（与 GLASS-SPEC 同源） ───────────────── */
  --dsg-shadow-l1: 0 8px 24px rgba(2,6,23,.10);
  --dsg-shadow-l2: 0 12px 40px rgba(0,0,0,.12);
  --dsg-shadow-l3: 0 24px 80px rgba(0,7,18,.30);
  --dsg-shadow-brand: 0 6px 18px -6px rgba(77,107,254,.55);

  /* ── 文字 ─────────────────────────────────────── */
  --dsg-label-1: #1c2532;
  --dsg-label-2: #4b5a6e;
  --dsg-label-3: #6e7c8f;
  --dsg-label-4: #8a97a8;
  --dsg-label-invert: #ffffff;
  --dsg-link: #2f49d9;
  --dsg-focus: #4d6bfe;
}
```

### 3.5 深色主题完整 token（DeepSeek 暗色玻璃变体）

深色不是把浅色反相，而是：**更深的底、更暗的釉（`#0d1524`）、更低的 floor 生效面、同一套三级雾量逻辑**。品牌蓝提亮一档（`#6b86ff`）保证在深釉上仍 ≥ 4.5:1。

```css
body[data-ds-dark-theme],
[data-dsg-theme="dark"] {
  /* 氛围层 */
  --dsg-atmos-base:  #0a0e16;
  --dsg-atmos-warm:  #06090f;
  --dsg-mist-1:      rgba(28, 48, 92, 0.62);
  --dsg-mist-2:      rgba(24, 42, 82, 0.52);
  --dsg-mist-3:      rgba(40, 66, 120, 0.40);
  --dsg-top-light:   rgba(120, 150, 220, 0.10);
  --dsg-grid-line:   rgba(150, 180, 230, 0.045);
  --dsg-glow-brand:  rgba(107, 134, 255, 0.16);

  /* 表面：暗釉 */
  --dsg-tint:        #0d1524;
  --dsg-tint-rgb:    13, 21, 36;
  --dsg-floor:       0.59;
  --dsg-glass-fidelity: 0.55;
  --dsg-alpha-l1:    0.08;
  --dsg-alpha-l2:    0.34;
  --dsg-alpha-l3:    0.66;
  --dsg-fill-l1:     rgba(13,21,36,.38);
  --dsg-fill-l2:     rgba(13,21,36,.55);
  --dsg-fill-l3:     rgba(13,21,36,.77);
  --dsg-fill-solid:  #141b26;

  --dsg-keyline:        inset 0 1px 0 rgba(255,255,255,.14);
  --dsg-keyline-bottom: inset 0 -1px 0 rgba(255,255,255,.04);
  --dsg-hairline:       inset 0 0 0 .5px rgba(255,255,255,.08);
  --dsg-line:           rgba(255,255,255,.08);
  --dsg-line-strong:    rgba(255,255,255,.14);

  --dsg-shadow-l1: 0 8px 24px rgba(0,0,0,.45);
  --dsg-shadow-l2: 0 12px 40px rgba(0,0,0,.55);
  --dsg-shadow-l3: 0 24px 80px rgba(0,7,18,.70);
  --dsg-shadow-brand: 0 6px 18px -6px rgba(77,107,254,.65);

  --dsg-label-1: #eef2f8;   /* on L2 15.4:1 */
  --dsg-label-2: #b6c0cf;
  --dsg-label-3: #8b95a5;
  --dsg-label-4: #6b7688;
  --dsg-label-invert: #0a0e16;
  --dsg-link: #7b93ff;
  --dsg-focus: #7b93ff;
}
```

---

## 4. 字体系统

### 4.1 三个字体栈（含 fallback，必须整串照抄）

```css
/* ── UI 无衬线（正文/控件/表格/所有非标题文本） ── */
--dsg-font-ui:
  -apple-system, BlinkMacSystemFont,
  "Segoe UI Variable Text", "Segoe UI",
  "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei",
  "Noto Sans SC", "Source Han Sans SC",
  "Helvetica Neue", Arial, sans-serif,
  "Apple Color Emoji", "Segoe UI Emoji";

/* ── Hero 衬线（默认展示字体：大标题、空态 slogan、设置页大标题） ── */
--dsg-font-serif:
  "Noto Serif SC", "Source Han Serif SC", "Source Han Serif CN",
  "Songti SC", "STSong", "STSongti-SC-Regular",
  "SimSun", "宋体", serif;

/* ── 参考图复刻用粗黑（切换项，见 §4.2） ── */
--dsg-font-sans-display:
  "Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;

/* ── 等宽（代码、路径、token、日志） ── */
--dsg-font-mono:
  "SF Mono", "JetBrains Mono", "Fira Code", "Cascadia Code", Consolas,
  "Liberation Mono", Menlo, Courier, monospace,
  "PingFang SC", "Microsoft YaHei";

/* 映射到 DSH 现有字体变量（覆盖 design_platform / base.css） */
--dsw-font-family: var(--dsg-font-ui);
--dsh-font-family-text-default: var(--dsg-font-ui);
--dsw-font-family-brand: var(--dsg-font-ui);        /* 原 Montserrat 与中文混排不协调，弃用 */
--ds-font-family-code: var(--dsg-font-mono);
```

**加载策略（重要，别踩坑）**：

1. **不要 `@import` 远程字体**（离线桌面场景会白屏 1–3s，且中文字库 10MB+）。
2. 衬线栈优先命中系统已有字体：macOS 有 `Songti SC`、Windows 有 `SimSun`。若两者都没有（Linux），退化到 `serif`，中文会落到 Noto Serif CJK（多数发行版已装）。
3. 若产品决定内置一份 CJK 展示字：只对 Hero 用 `font-display: swap` + 子集化（仅 slogan 常用字 + `探索未至之境`），体积压到 < 60KB。**正文永远用系统字体**。

### 4.2 Hero 字体决策

| 方案 | 栈 | 字重/字距/行高 | 观感 | 适用 |
|---|---|---|---|---|
| **A. 宋体展示（默认推荐）** | `--dsg-font-serif` | 600 / **0.04em** / 1.28 | 横细竖粗、有东方与书卷气；大字号下更有记忆点 | DSH 品牌空态、设置页页眉、欢迎页 |
| B. 参考图 1:1 复刻 | `--dsg-font-sans-display` | 600 / **0.125em** / 1.25 | 与截图逐像素接近；字距大、现代、克制 | 需要和 deepseek.com 视觉连续的营销页/新手引导 |
| C. UI 无衬线 | `--dsg-font-ui` | 600 / 0.02em | 最安全但最平淡 | 面板内的小标题（16–20px） |

切换只需一行：

```css
/* 1:1 复刻参考图（默认是 A） */
--dsg-font-display: var(--dsg-font-sans-display);
/* 默认：宋体展示 */
--dsg-font-display: var(--dsg-font-serif);
```

⚠️ 衬线在 **< 24px** 会糊，所以 `--dsg-font-display` **只许用于 ≥ 28px 的展示文本**；面板标题一律 `--dsg-font-ui` 600。

### 4.3 字号阶梯（8 级，全部 px / 行高 px / 字距 em）

| 级 | token | size / line | weight | tracking | 用途 |
|---|---|---|---|---|---|
| Hero | `--dsg-fs-hero` | `clamp(40px, 5.2vw, 60px)` / 1.25 | 600 | 0.04em (A) / 0.125em (B) | 首页/空态大标题（📐参考 48px） |
| H1 | `--dsg-fs-h1` | 32 / 44 | 600 | 0.01em | 设置页、欢迎页标题 |
| H2 | `--dsg-fs-h2` | 24 / 34 | 600 | 0.01em | 面板标题、对话框标题 |
| H3 | `--dsg-fs-h3` | 20 / 28 | 600 | 0.005em | 卡片标题、Hero 副标题（📐 lede 是 14，但 DSH 空态副标题升 20） |
| Lede | `--dsg-fs-lede` | 16 / 26 | 400 | 0.01em | 空态副标题、对话框说明 |
| Body | `--dsg-fs-body` | 14 / 24 | 400 | 0 | 正文、输入框、菜单项（DSH 现有基准） |
| Small | `--dsg-fs-small` | 12 / 18 | 400 | 0.01em | 时间戳、元信息、胶囊按钮 |
| Caption | `--dsg-fs-caption` | 11 / 16 | 500 | 0.02em | 角标、计数、kbd |
| Code | `--dsg-fs-code` | 12 / 19 | 400 | 0 | 代码块、行内代码 |

```css
--dsg-fs-hero: clamp(40px, 5.2vw, 60px);
--dsg-fs-h1: 32px; --dsg-fs-h2: 24px; --dsg-fs-h3: 20px;
--dsg-fs-lede: 16px; --dsg-fs-body: 14px; --dsg-fs-small: 12px;
--dsg-fs-caption: 11px; --dsg-fs-code: 12px;
--dsg-lh-hero: 1.25; --dsg-lh-h1: 1.375; --dsg-lh-h2: 1.42;
--dsg-lh-body: 1.71; --dsg-lh-small: 1.5;
--dsg-tracking-hero-serif: 0.04em;
--dsg-tracking-hero-sans: 0.125em;
```

> 与 DSH 现有 `--dsw-font-*` 的关系：现有阶梯（xl-24 / l-20 / m-18 / base-16 / s-14 / xs-13 / xxs-12 / xxxs-11）**保留不动**，只在插件里覆写 `--dsw-font-family` 与新增 `--dsg-fs-*` 给 Hero/lede。正文 14/24 不变 —— 这是最省改动的做法。

### 4.4 排版细则

- **中文不加 `text-transform`**，不做 letter-spacing 负值。
- **中英混排**：中英之间不插空格（由字体渲染），但 `code`/数字前后用 `margin-inline: 2px`。
- **数字**：表格/统计用 `font-variant-numeric: tabular-nums`。
- **正文最大行宽 72ch**（≈ 620px @14px）；超过时居中约束 `--dsg-content-max-w: 760px`。
- **标题 `text-wrap: balance`**，正文 `text-wrap: pretty`。
- **禁用 600 以下的衬线**；禁用 `font-weight: 300` 浅色主题（浅底上会发虚）。

---

## 5. 尺度系统

### 5.1 间距（4px 栅格，外加 6/10 两个半档）

```css
--dsg-space-0: 0;    --dsg-space-1: 4px;  --dsg-space-2: 6px;
--dsg-space-3: 8px;  --dsg-space-4: 10px; --dsg-space-5: 12px;
--dsg-space-6: 16px; --dsg-space-7: 20px; --dsg-space-8: 24px;
--dsg-space-9: 32px; --dsg-space-10: 40px; --dsg-space-11: 48px;
--dsg-space-12: 64px;
```

固定用法（不要自由发挥）：面板内边距 16/20；列表项内边距 `10px 12px`；卡片间距 12；区块间距 24；页面级留白 40–64。

### 5.2 圆角阶梯

| token | 值 | 用在哪 |
|---|---|---|
| `--dsg-radius-xs` | 4px | 角标、kbd |
| `--dsg-radius-sm` | 8px | 小 chip、菜单项、tooltip |
| `--dsg-radius-md` | 10px | 按钮、输入框、nav item、工具卡 |
| `--dsg-radius-lg` | 12px | 代码块、图片、内嵌卡片 |
| `--dsg-radius-xl` | 16px | 卡片、消息气泡、详情卡 |
| `--dsg-radius-2xl` | 20px | 侧栏/主面板、设置分区 |
| `--dsg-radius-composer` | 24px | composer、Hero 大面板 |
| `--dsg-radius-window` | 24px | 设置窗口、对话框（📐参考 24） |
| `--dsg-radius-pill` | 999px | 胶囊按钮、chip、开关、头像 |

```css
--dsg-radius-xs: 4px;  --dsg-radius-sm: 8px;  --dsg-radius-md: 10px;
--dsg-radius-lg: 12px; --dsg-radius-xl: 16px;  --dsg-radius-2xl: 20px;
--dsg-radius-composer: 24px; --dsg-radius-window: 24px; --dsg-radius-pill: 999px;
/* 覆盖 DSH 现有阶梯：panel 28 → 24，其余对齐 */
--dsw-radius-xs: 4px; --dsw-radius-sm: 8px; --dsw-radius-md: 12px;
--dsw-radius-lg: 16px; --dsw-radius-xl: 20px; --dsw-radius-panel: 24px;
```

> `corner-shape: superellipse(1.5)` 保持开启（`corner_shape.css` 已有）：它让 20–24px 大圆角看起来更像「软胶」而不是「几何圆弧」，是参考图那种柔和边角的隐藏功臣。仅在支持该属性的 Chromium 上生效，无回退成本。

### 5.3 阴影阶梯

**玻璃面板用**（来自 GLASS-SPEC，深色按 §3.5 覆写）：

```css
--dsg-shadow-l1: 0 8px 24px rgba(2,6,23,.10);   /* L1 内容面 */
--dsg-shadow-l2: 0 12px 40px rgba(0,0,0,.12);   /* L2 卡片 / composer / 侧栏 */
--dsg-shadow-l3: 0 24px 80px rgba(0,7,18,.30);  /* L3 弹窗 / 菜单 */
```

**控件用小阴影**（按钮、输入、chip；不要给控件套 l2/l3）：

```css
--dsg-shadow-btn:   0 1px 2px rgba(23,42,84,.08);
--dsg-shadow-btn-hi:0 4px 12px -2px rgba(23,42,84,.14), 0 1px 2px rgba(23,42,84,.06);
--dsg-shadow-input: inset 0 1px 2px rgba(23,42,84,.04);
--dsg-shadow-brand: 0 6px 18px -6px rgba(77,107,254,.55);
```

### 5.4 描边

| token | 浅色 | 深色 | 用在哪 |
|---|---|---|---|
| `--dsg-line` | `rgba(31,58,110,.10)` | `rgba(255,255,255,.08)` | 输入框、表格、分段控件 |
| `--dsg-line-strong` | `rgba(31,58,110,.18)` | `rgba(255,255,255,.14)` | hover / focus 前的强调边 |
| `--dsg-hairline` | `inset 0 0 0 .5px rgba(255,255,255,.08)` | 同 | **玻璃面板的内发丝边（中性白，不带色）** |
| `--dsg-line-dash` | `rgba(31,58,110,.20)` | `rgba(255,255,255,.18)` | 拖拽区、空态占位框 |

> 玻璃面板**不要**用蓝色 `rgba(31,58,110,…)` 描边：那会把玻璃染成「彩色塑料」。蓝色只作为**非玻璃面**的 border token 存在（GLASS-SPEC §5 同样结论）。

---

## 6. 氛围层（背景）

### 6.1 浅色：完整可粘贴 CSS

```css
/* 挂在 shell 最底层容器上（DSH: html/body 或 #root 的 ::before 更安全，见 §7.6） */
body {
  background-color: var(--dsg-atmos-base);
  background-image:
    /* ① 顶部白光：把顶栏区域压到近白 #fcfdfe */
    radial-gradient(120% 62% at 50% -14%,
      rgba(255,255,255,.97) 0%, rgba(255,255,255,.55) 42%, rgba(255,255,255,0) 68%),
    /* ② 右上雾核：#99afdb（§2.4 最蓝锚点） */
    radial-gradient(46% 40% at 71% 1%,
      rgba(120,152,219,.58) 0%, rgba(120,152,219,.20) 55%, rgba(120,152,219,0) 78%),
    /* ③ 左中雾带：#bbcde9 → #c0d0ea */
    radial-gradient(40% 42% at 28% 50%,
      rgba(146,178,230,.55) 0%, rgba(146,178,230,.22) 58%, rgba(146,178,230,0) 82%),
    /* ④ 右侧薄雾 */
    radial-gradient(52% 46% at 100% 62%,
      rgba(196,213,238,.40) 0%, rgba(196,213,238,0) 72%),
    /* ⑤ 底部中性暖白收尾：#f6f6f7 */
    radial-gradient(100% 46% at 50% 112%,
      rgba(248,247,248,.98) 0%, rgba(248,247,248,.70) 40%, rgba(248,247,248,0) 70%),
    /* ⑥ 垂直基色：白 → 雾蓝 → 中性白 */
    linear-gradient(178deg,
      #fbfcfe 0%, #eef4fb 24%, #e3ecf7 46%, #dfe9f6 58%,
      #e9eff7 74%, #f4f4f5 90%, #f8f7f8 100%);
  background-attachment: fixed;   /* 滚动时氛围层不动 */
  background-repeat: no-repeat;
}
```

### 6.2 网格层（独立 element 或 ::after，不占布局）

```css
/* 75px 网格 + 从中心向外的显隐遮罩：中间清晰、四角/底部淡出 */
.dsg-grid,
body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(to right, var(--dsg-grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--dsg-grid-line) 1px, transparent 1px);
  background-size: var(--dsg-grid-size) var(--dsg-grid-size);
  background-position: 56px 56px;   /* 📐 实测对齐：线在 x ≡ 56 (mod 75) */
  -webkit-mask-image:
    radial-gradient(120% 96% at 50% 22%, #000 0%, #000 46%, rgba(0,0,0,.55) 72%, transparent 100%);
          mask-image:
    radial-gradient(120% 96% at 50% 22%, #000 0%, #000 46%, rgba(0,0,0,.55) 72%, transparent 100%);
}
```

> 网格是**纹理不是线框**：alpha 0.045、1px、75px 周期。人眼在 40–60% 缩放时能感到"纸感"，但截图里几乎数不出格子 —— 这就是参考图的效果。

### 6.3 深色：完整可粘贴 CSS

```css
body[data-ds-dark-theme] {
  background-color: #0a0e16;
  background-image:
    radial-gradient(120% 62% at 50% -14%,
      rgba(120,150,220,.13) 0%, rgba(120,150,220,0) 62%),
    radial-gradient(50% 44% at 72% 2%,
      rgba(28,48,92,.85) 0%, rgba(28,48,92,0) 76%),
    radial-gradient(44% 46% at 26% 52%,
      rgba(24,42,82,.80) 0%, rgba(24,42,82,0) 80%),
    radial-gradient(56% 50% at 100% 66%,
      rgba(40,66,120,.55) 0%, rgba(40,66,120,0) 74%),
    radial-gradient(100% 48% at 50% 114%,
      rgba(6,9,15,.98) 0%, rgba(6,9,15,0) 70%),
    linear-gradient(180deg, #06090f 0%, #0b1117 26%, #0e1622 52%, #0b1018 78%, #06090f 100%);
  background-attachment: fixed;
}
```

深色网格：`--dsg-grid-line: rgba(150,180,230,.045)`；`background-position` 同上。

### 6.4 光晕与云雾规则

| 层 | 允许数量 | 尺寸 | 强度 | 动效 |
|---|---|---|---|---|
| 顶部白光 | 1 | 120%×62% | .97 → 0 | 无 |
| 雾核（蓝） | 2 | 40–46% 半径 | alpha .55–.58 | 无（静态） |
| 薄雾 | 1 | 52% | .34–.40 | 无 |
| 底部暖白 | 1 | 100%×46% | .98 → 0 | 无 |
| 品牌光晕（生成中） | 1 | 360px 圆 | `--dsg-glow-brand` | 呼吸 3.2s |

- **雾核必须不对称**：右上强、左中中、其余无。四个角都晕 = 塑料感。
- 生成中/思考中的品牌光晕只出现在 composer 底部或 Hero 后方，`filter: blur(60px)`，不铺满屏。
- 禁止：`filter: blur()` 大面积作用在固定层（会掉帧）；用渐变的柔和边缘代替。

### 6.5 性能与回退

1. 氛围层只允许 **1 个绘制层**（一个 element 的 `background-image` 多层）—— 6 个 `radial-gradient` 在同一 `background-image` 里，合成一次。
2. **不要**给背景加 `backdrop-filter`；背景是画出来的，不是模糊出来的。
3. 低端机降级：`@media (prefers-reduced-transparency: reduce)` 或 `@media (max-width: 900px)` 时删掉雾核，只留线性基色（省 40% 合成成本）。
4. `background-attachment: fixed` 在部分 Chromium 版本会导致整页重绘；如果滚动掉帧，改为 `position: fixed` 的独立层（z-index:-1）。

---

## 7. 玻璃系统（三级可读性分级）

> **数值契约来自 `docs/GLASS-SPEC.md` §4.4 / §6.2，本文件与之逐条一致。** 任何冲突以 GLASS-SPEC 为准，并回来改本文件。

### 7.1 公式（唯一来源）

```
effAlpha = floor + alpha × (1 − floor)

fill = color-mix(in srgb,
         var(--dsg-tint) calc(var(--dsg-floor) × 100%),
         rgba(var(--dsg-tint-rgb), var(--dsg-alpha-lN)) calc((1 − var(--dsg-floor)) × 100%))
```

常量（GLASS-SPEC 实测提取）：

| 常量 | 浅色 | 深色 | 说明 |
|---|---|---|---|
| `floor`（可读性红线） | **0.45** | **0.59** | 最差壁纸像素上正文 ≥ 4.63:1；被 `--dsg-glass-fidelity` 缩放，**不可为负** |
| tint | `#ffffff` | `#0d1524` | 全应用唯一玻璃色 |
| `saturate` | 1.30 | 1.30 | **固定不爬梯**（高半径 + 高饱和 = 彩色鬼影） |
| `brightness` | 1.04 | 1.04 | 固定 |
| `contrast` | 1.01 | 1.01 | 固定 |

```css
--dsg-backdrop: blur(var(--dsg-blur-lN)) saturate(var(--dsg-saturate))
                brightness(var(--dsg-brightness)) contrast(var(--dsg-contrast));
```

### 7.2 预设 B：壁纸共存档（= GLASS-SPEC 原表，逐字）

| 级 | 归属 | alpha 浅/深 | floor | effAlpha 浅/深 | blur |
|---|---|---|---|---|---|
| **L1 内容面** | 对话画布、页面级容器、工具结果底板 | 0.12 / 0.16 | .45 / .59 | **51.6% / 65.6%** | 20px |
| **L2 卡片** | 侧栏、composer、气泡、工具卡、详情卡 | 0.40 / 0.42 | .45 / .59 | **67.0% / 76.2%** | 16px |
| **L3 浮层** | 弹窗、设置窗口、右栏详情、菜单 | 0.72 / 0.72 | .45 / .59 | **84.6% / 88.5%** | 10px |
| L3 子权重 | 菜单/浮层 ×1.00、dialog ×1.10、玻璃上的按钮 ×1.15 | | | 上限 **0.92** | |

### 7.3 预设 A：参考图档（**DSH 默认，无壁纸时**）

为什么需要第二档：参考图 composer 实测 effAlpha 只有 **0.34–0.40**，而壁纸档的 L2 是 0.67 —— 直接套会让面板变成奶白实心，丢掉「空气感」。DSH 的背景是**有界的 CSS 氛围层**（最暗锚点 `#99afdb`），不是照片壁纸，所以可以把 floor 按 `--dsg-glass-fidelity: 0.55` 缩放：

| 级 | alpha 浅/深 | fidelity 后的 floor | **effAlpha 浅/深** | blur | 直接可用的 fill |
|---|---|---|---|---|---|
| L1 | 0.06 / 0.08 | .2475 / .3245 | **29% / 38%** | 20px | `rgba(255,255,255,.29)` / `rgba(13,21,36,.38)` |
| L2 | 0.20 / 0.34 | .2475 / .3245 | **40% / 55%** | 16px | `rgba(255,255,255,.40)` / `rgba(13,21,36,.55)` |
| L3 | 0.55 / 0.66 | .2475 / .3245 | **66% / 77%** | 10px | `rgba(255,255,255,.66)` / `rgba(13,21,36,.77)` |

**安全性证明（不是感觉）**：浅色最坏情况 = 0.40 白压在 `#99afdb` 上 → 面板呈 `#c1cee6`，正文 `#1c2532` 对比度 **9.8:1** ≫ 4.5:1。所以参考图档仍然守住红线，只是把余量从「照片级」降到「氛围层级」。

![三级玻璃示意（浅色，预设 A）](assets/glass-tiers-light.png)

![三级玻璃示意（深色，预设 A）](assets/glass-tiers-dark.png)

![同一块 L2 卡片的两档：参考图档 vs 壁纸档](assets/glass-preset-compare.png)

**切换逻辑**

```css
/* 默认：DSH 自己的 CSS 氛围层 → 参考图档 */
:root { --dsg-glass-fidelity: .55; }

/* 与 wallpaper-engine 共存 / 用户选了照片壁纸 → 壁纸档 */
html[data-dsg-has-wallpaper] { --dsg-glass-fidelity: 1; }
/* 老用户手动覆盖 */
html[data-dsg-glass-fidelity="100"] { --dsg-glass-fidelity: 1; }
```

### 7.4 表面归属表（对号入座，不要自创分级）

| # | 表面 | 级 | 选择器 / hook（以 SURFACE-MAP 为准） |
|---|---|---|---|
| 1 | 对话内容画布 | L1 | `[data-chat-flow]`、`[data-slot="conversation"]` |
| 2 | 页面级容器 / 工作区 | L1 | 主壳内容区 |
| 3 | 工具结果底板（长输出） | L1 | tool result plate |
| 4 | 左侧栏 | L2 | `[data-slot="sidebar"]` |
| 5 | 顶栏 | L2 | `[data-dsh-navbar]` |
| 6 | composer 卡片 | L2 | `[data-composer-card]`（内层 `[data-composer-seat]` 不再叠玻璃） |
| 7 | 消息气泡（用户/助手带框时） | L2 | `class*="_bubble"` |
| 8 | 工具卡（可折叠） | L2 | tool card |
| 9 | 详情卡 / 右栏详情 | L2 | `[data-slot="sidebar-right"]` |
| 10 | 右侧栏容器 | L2 | 同 9 |
| 11 | 设置窗口 | L3 | `role="dialog"` 且含 `settings` |
| 12 | 弹窗 / 审批 / 计划确认 | L3 | `[data-approval-key]`、`[data-plan-review-key]`、`[data-question-key]`、`role="dialog"` |
| 13 | 菜单 | L3 ×1.00 | `[data-menu-material]`、`--dsw-menu-backdrop-filter` 消费点 |
| 14 | 命令面板 / 选择器浮层 | L3 ×1.00 | 同上 |
| 15 | 详情/预览侧栏（文档预览） | L3 | `[data-slot="sidebar-documentpreview"]` |
| 16 | **tooltip** | **L0 不玻璃化** | `role="tooltip"`、`[role="tooltip"] *` |
| 17 | **原生 select 弹层行** | **L0** | `select` 及 popup row token |
| 18 | 代码块 / 行内代码 | 见 §8.9（内容面，半实底） | markdown code |
| 19 | 图片 / 附件预览 | 实底 `--dsg-fill-solid` | 不得透出背景 |
| 20 | 遮罩 scrim | `rgba(10,16,28,.32)` + `blur(2px)` | `[data-dsg-scrim]`、`--dsw-mask-blur` |

### 7.5 顶光 / 发丝边 / 阴影（玻璃的「工艺」三件套）

```css
/* 每个玻璃面板都必须同时挂这三样，缺一就变成「半透明色块」 */
.dsg-glass {
  background: var(--dsg-fill-lN);
  -webkit-backdrop-filter: var(--dsg-backdrop);
          backdrop-filter: var(--dsg-backdrop);
  box-shadow:
    var(--dsg-keyline),        /* inset 0 1px 0 rgba(255,255,255,.32) —— 上沿反光 */
    var(--dsg-keyline-bottom), /* inset 0 -1px 0 rgba(255,255,255,.08) */
    var(--dsg-hairline),       /* inset 0 0 0 .5px rgba(255,255,255,.08) */
    var(--dsg-shadow-lN);      /* 外阴影 */
}

/* 额外的"釉光"（大面板可选，模拟玻璃厚度）：180deg 三停高光 */
.dsg-sheen-l1::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: linear-gradient(180deg,
    rgba(255,255,255,.10) 0%,
    rgba(255,255,255,.03) 38%,
    rgba(255,255,255,.02) 100%);
}
.dsg-sheen-l2::before { /* .16 / .05@38% / .02 */ }
.dsg-sheen-l3::before { /* .10 / .03@38% / .05 */ }
body[data-ds-dark-theme] .dsg-sheen-l1::before,
body[data-ds-ds-dark-theme] .dsg-sheen-l3::before { opacity: .65; } /* 深色整体 ×0.65 */
```

⚠️ 顶光 alpha 上限 **.32（浅）/.14（深）**。做到 .55–.70 就不是玻璃，是白色高光条（GLASS-SPEC §5 实测过）。

### 7.6 工程陷阱（会毁掉整套视觉的）

1. **`backdrop-filter` 会创建包含块** → 内部 `position: fixed` 的子元素（菜单、tooltip、拖拽层）会相对面板定位而不是视口。对策：浮层渲染到 `body`/portal，不要留在玻璃容器里；或浮层用 `data-dsg-portal` 挂载点。
2. **模糊必须由 `::before` 承载时**，`::before` 要 `z-index:-1` + 父级 `isolation: isolate`，否则会盖住文字。
3. **不要把 `backdrop-filter` 加在滚动容器上**（每帧重算，滚动直接掉到 30fps）。要模糊就模糊「容器外壳」，内容层单独滚动。
4. **无 `backdrop-filter` 回退**：`@supports not (backdrop-filter: blur(1px))` → 用实底 `color-mix(in srgb, var(--dsg-tint) 82%, transparent)` 替换 fill。
5. **嵌套玻璃 = 雾上加雾**：composer 里不要再放玻璃 chip 的 `backdrop-filter`，chip 用纯色 fill（`.10/.16`），否则一个输入框叠 3 层模糊。规则：**同一条视线上最多 2 层 backdrop-filter**（L2 容器 + L3 浮层）。
6. **tooltip 必须不透明**：宿主 tooltip 是深底浅字，玻璃化后实测对比度掉到 1.07–1.13:1（GLASS-SPEC §5）。保持 `--dsg-fill-solid` 或直接沿用 `--dsw-alias-tooltip-bg`，只换圆角/阴影/字体。
7. **原生 `<select>` 弹层是独立文档**：行底色需不透明，否则 Chromium 回退到浅色画布 → 浅字浅底。用 `--dsg-fill-solid` + `--dsg-label-1`。
8. **`color-mix` 在预乘空间插值**：`color-mix(in srgb, tint 40%, rgba(tint,.55) 60%)` 的等效 alpha 不是 0.4+0.6×0.55，按 §7.1 公式算，别手推。
9. **滚动条要跟随玻璃**：透明面板上的深色滚动条会像贴了胶带，用 §8.13 的低对比 thumb。

---

## 8. 组件规格

> 所有规格卡里：**浅色值 / 深色值** 成对给出；没有特别说明的尺寸对两套主题相同。
> 几何默认值来自 DSH 桌面 GUI（三栏、52 顶栏、264 侧栏）；参考图只提供视觉语言（颜色、玻璃、圆角、字体、留白比例），不直接照搬首屏的 311px 大留白 —— 那是营销页的居中容器，不是 App 外壳。

### 8.1 外壳与栅格

```
┌────────────────────────────────────────────────────────────────┐ ← 8px 外边距
│ ┌──────────┐  ┌────────────────────────────────┐  ┌─────────┐ │
│ │ 顶栏 52  │  │ 顶栏 52（铺满内容列）          │  │         │ │
│ ├──────────┤  ├────────────────────────────────┤  │ 右栏    │ │
│ │          │  │  L1 对话画布                   │  │ 320     │ │
│ │ 左栏 264 │  │  ┌──────────────┐              │  │ L2      │ │
│ │ L2 r20   │  │  │ 消息 max 760 │              │  │ r20     │ │
│ │          │  │  └──────────────┘              │  │         │ │
│ │          │  │  ┌──────────────────────────┐  │  │         │ │
│ │          │  │  │ composer 760×~120 r24 L2 │  │  │         │ │
│ │          │  │  └──────────────────────────┘  │  │         │ │
│ └──────────┘  └────────────────────────────────┘  └─────────┘ │
└────────────────────────────────────────────────────────────────┘
```

```css
--dsg-header-h: 52px;
--dsg-sidebar-w: 264px;          /* clamp(232px, 22vw, 320px) */
--dsg-rail-w: 320px;             /* clamp(280px, 26vw, 400px) */
--dsg-gutter: 8px;               /* 面板之间的缝，露出氛围层 */
--dsg-content-max-w: 760px;      /* 消息列最大宽 */
--dsg-composer-max-w: 760px;     /* 📐参考 732 @1686 视口 → 43% 视口宽 */
--dsg-shell-radius: 20px;
--dsg-panel-pad: 16px;           /* 面板内边距；对话框用 24 */

.dsg-shell {
  display: grid;
  grid-template-columns: var(--dsg-sidebar-w) minmax(0, 1fr) auto;
  gap: var(--dsg-gutter);
  padding: var(--dsg-gutter);
  height: 100vh; /* 桌面端 100dvh */
  background: transparent;         /* 氛围层在 body 上 */
}
```

- 面板之间**一定有 8px 缝**，让氛围层透出来 —— 这是「玻璃贴在一起」的关键，合并成一整块就退化成灰色板。
- 面板 r=20，窗口 r=24；两者不要混用（窗口比面板大一号）。
- 中栏**没有面板底**（L1 只是极淡的一层 29% 白釉 + 20px blur），消息内容直接浮在氛围层上。

### 8.2 顶栏

| 属性 | 值 |
|---|---|
| 高度 | 52px（紧凑模式 44） |
| 玻璃 | L2：`--dsg-fill-l2` + `--dsg-blur-l2` + 底部 `1px --dsg-line` |
| 内边距 | `0 12px 0 16px` |
| 左区 | 侧栏开合按钮 28×28（ghost）+ 标题区 |
| 标题 | 14/20 500 `--dsg-label-1`，过长省略号，左侧可带 20×20 会话图标 |
| 右区 | 3 个 32×32 ghost 按钮（历史/分享/更多），gap 4 |
| 拖拽区 | 空区 `-webkit-app-region: drag`，按钮区 `no-drag` |
| 滚动 | `position: sticky; top: 0; z-index: 20` |

```css
.dsg-header {
  height: var(--dsg-header-h);
  display: flex; align-items: center; gap: 8px;
  padding: 0 12px 0 16px;
  background: var(--dsg-fill-l2);
  -webkit-backdrop-filter: blur(var(--dsg-blur-l2)) saturate(var(--dsg-saturate)) brightness(var(--dsg-brightness));
          backdrop-filter: blur(var(--dsg-blur-l2)) saturate(var(--dsg-saturate)) brightness(var(--dsg-brightness));
  box-shadow: var(--dsg-keyline), var(--dsg-keyline-bottom), var(--dsg-hairline);
  border-radius: var(--dsg-shell-radius) var(--dsg-shell-radius) 0 0;
  -webkit-app-region: drag;
}
.dsg-header :is(button, a, input) { -webkit-app-region: no-drag; }
```

> 现状 `current-ui.png` 的顶栏是「系统菜单 / 标题 / 操作」三段且无玻璃；改成一体 52px、按钮降到 32px、图标 16px、`--dsg-label-3` 90% 透明度，视觉噪音立刻少一半。

### 8.3 左侧栏

| 项 | 规格 |
|---|---|
| 宽 | 264（232–320 可拖拽） |
| 玻璃 | L2（`--dsg-fill-l2` / blur 16） |
| 内边距 | 12px；区块之间 16px |
| 新对话按钮 | 36 高、r10、**品牌填充 `#4d6bfe`**、白字 13/20 500、`--dsg-shadow-brand` |
| 导航项 | 34 高、r10、`padding 0 10px`、图标 16、文字 13/20 |
| 导航项 hover | `background: rgba(31,58,110,.06)`（深色 `rgba(255,255,255,.06)`） |
| 导航项 active | `background: rgba(77,107,254,.12)`、文字 `--dsg-brand-ink`、左侧 2px `#4d6bfe`（内缩 6px，r999） |
| 分组标题 | 11/16 500 `--dsg-label-3`、`letter-spacing .04em`、上边距 16 |
| 会话列表项 | 32 高、r8；hover 同上；当前会话同 active 但底色减半 |
| 底部用户行 | 40 高、头像 24 r999、名称 13/20、右侧「新版本」小胶囊 11/14 |
| 滚动 | 中间区 `overflow-y: auto`，滚动条见 §8.13 |

```css
.dsg-nav-item {
  height: 34px; border-radius: 10px; padding: 0 10px;
  display: flex; align-items: center; gap: 10px;
  font: 500 13px/20px var(--dsg-font-ui);
  color: var(--dsg-label-2);
  transition: background-color 140ms var(--dsg-ease-standard), color 140ms var(--dsg-ease-standard);
}
.dsg-nav-item:hover { background: rgba(31,58,110,.06); color: var(--dsg-label-1); }
.dsg-nav-item[aria-current="true"] {
  background: rgba(77,107,254,.12);
  color: var(--dsg-brand-ink);
  box-shadow: inset 2px 0 0 #4d6bfe;
}
```

### 8.4 右栏 / 详情卡

| 项 | 规格 |
|---|---|
| 宽 | 320（280–400），可关闭 |
| 容器 | L2，r20，与左栏同款 |
| 头部 | 44 高，标题 13/20 500，右侧关闭 24×24 ghost |
| 内容区 | padding 16，卡片间距 12 |
| 内嵌卡片 | r16、`--dsg-fill-l2`、**不再叠 backdrop-filter**（避免雾上加雾），用 `box-shadow: --dsg-shadow-btn` |
| 键值行 | 左 `--dsg-label-3` 12/18、右 `--dsg-label-1` 13/20，行高 32，分隔线 `--dsg-line` |
| 文档预览 | 实底 `--dsg-fill-solid` + 内 padding 20，**不允许透出背景**（文字密集） |

### 8.5 Hero / 空态

参考图首屏的 DSH 版：一个视觉焦点、一句副标题、一个输入框、三个入口。

| 元素 | 值 |
|---|---|
| 容器 | 居中，max-width 760，垂直位置：内容重心在视口 42–46% 高度（📐 参考 45%） |
| 标题 | `clamp(40px, 5.2vw, 60px)` / 1.25 / 600 / `--dsg-ink-800`；宋体档 tracking `.04em`，黑体档 `.125em` |
| 标题与副标题间距 | 24px（📐 参考 37 是 lede 在上，DSH 反过来） |
| 副标题 | 20/32 400 `--dsg-label-2`，max-width 560，居中，`text-wrap: balance` |
| 标题→composer | 40px |
| composer→CTA 胶囊 | 28px（📐 参考 34） |
| CTA 胶囊 | 36 高、r999、`--dsg-fill-l2`、1px `--dsg-line`、13/20 500、图标 16、gap 12、hover 抬 1px |
| 入场 | 标题 0ms / 副标题 +60ms / composer +120ms / 胶囊 +180ms，`translateY(8px)→0` + opacity，240ms `--dsg-ease-out` |

```css
.dsg-hero-title {
  font: 600 var(--dsg-fs-hero) / var(--dsg-lh-hero) var(--dsg-font-display);
  letter-spacing: var(--dsg-tracking-hero-serif);
  color: var(--dsg-ink-800);
  text-wrap: balance;
}
.dsg-hero-sub {
  font: 400 20px/32px var(--dsg-font-ui);
  color: var(--dsg-label-2);
  max-width: 560px; margin: 24px auto 0; text-align: center; text-wrap: pretty;
}
@keyframes dsg-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.dsg-hero > * { animation: dsg-rise 240ms var(--dsg-ease-out) both; }
.dsg-hero > *:nth-child(2) { animation-delay: 60ms; }
.dsg-hero > *:nth-child(3) { animation-delay: 120ms; }
.dsg-hero > *:nth-child(4) { animation-delay: 180ms; }
```

### 8.6 Composer（最重要的一块）

结构：**外壳卡（L2）→ 输入区 → 工具条**，三层不叠玻璃。

| 属性 | 值 |
|---|---|
| 最大宽 | 760（📐参考 732） |
| 最小高 | 120（📐参考 115） |
| 圆角 | 24 |
| 填充 | `--dsg-fill-l2`（参考档 `rgba(255,255,255,.40)`）+ `backdrop-filter: blur(16px) saturate(1.3) brightness(1.04)` |
| 阴影 | `--dsg-keyline` + `--dsg-shadow-l2`；展开时切 `--dsg-shadow-l3` |
| 内边距 | `18px 20px 14px` |
| textarea | 16/26、`min-height: 28px`、`max-height: 40vh`、透明底、`resize: none`、placeholder `--dsg-label-4` |
| 工具条高 | 32 |
| chip | 28 高、r999、`padding 0 10px`、12/18、gap 6 |
| chip 未选 | 白釉 `rgba(255,255,255,.55)`、边 1px `--dsg-line`、文字 `--dsg-label-2` |
| chip 选中（如「智能搜索」） | 蓝釉 `rgba(77,107,254,.10)`、边 1px `rgba(77,107,254,.22)`、文字 `#4d6bfe` |
| 发送按钮 | 32×32、r999、`#4d6bfe`、白色箭头 18、`--dsg-shadow-brand` |
| 发送按钮 disabled | `rgba(77,107,254,.28)`、无阴影、箭头白 90% |
| 发送按钮 hover/active | `#3d59e8` / `#3047c9` + `scale(.96)` |
| focus | 容器 `box-shadow: 0 0 0 2px rgba(77,107,254,.28), --dsg-keyline, --dsg-shadow-l3` |
| 底部安全区 | 距窗口底 24（有 dock/taskbar 时 32） |
| sticky | `position: sticky; bottom: 24px`，消息在其下方穿行时**不要**给它加不透明遮罩 |

```css
.dsg-composer {
  width: min(var(--dsg-composer-max-w), calc(100% - 48px));
  margin: 0 auto; padding: 18px 20px 14px;
  border-radius: 24px;
  background: var(--dsg-fill-l2);
  -webkit-backdrop-filter: blur(var(--dsg-blur-l2)) saturate(var(--dsg-saturate)) brightness(var(--dsg-brightness)) contrast(var(--dsg-contrast));
          backdrop-filter: blur(var(--dsg-blur-l2)) saturate(var(--dsg-saturate)) brightness(var(--dsg-brightness)) contrast(var(--dsg-contrast));
  box-shadow: var(--dsg-keyline), var(--dsg-hairline), var(--dsg-shadow-l2);
  transition: box-shadow 200ms var(--dsg-ease-standard), transform 200ms var(--dsg-ease-standard);
}
.dsg-composer:focus-within {
  box-shadow: 0 0 0 2px rgba(77,107,254,.28), var(--dsg-keyline), var(--dsg-shadow-l3);
}
.dsg-composer textarea {
  width: 100%; border: 0; background: transparent; resize: none; outline: none;
  font: 400 16px/26px var(--dsg-font-ui); color: var(--dsg-label-1);
  min-height: 28px; max-height: 40vh;
}
.dsg-composer textarea::placeholder { color: var(--dsg-label-4); }
.dsg-send {
  width: 32px; height: 32px; border-radius: 999px; border: 0;
  display: grid; place-items: center; color: #fff;
  background: #4d6bfe; box-shadow: var(--dsg-shadow-brand);
  transition: background-color 140ms var(--dsg-ease-standard), transform 140ms var(--dsg-ease-spring);
}
.dsg-send:hover { background: #3d59e8; }
.dsg-send:active { background: #3047c9; transform: scale(.96); }
.dsg-send:disabled { background: rgba(77,107,254,.28); box-shadow: none; }
```

> 参考图里 composer 的「透」来自背景本身浅（**不是 alpha 高**）。所以正确做法是 alpha 0.40 + blur 16，而不是 alpha 0.70 + blur 40；后者在 DSH 的雾蓝背景上会糊成一团白。

### 8.7 消息气泡

| 角色 | 规格 |
|---|---|
| 用户 | 右对齐，max-width 78%，`background: rgba(77,107,254,.10)`（深色 `.16`）、r16（右下角 r6）、`padding 10px 14px`、14/24 `--dsg-label-1`；**不叠 backdrop-filter**（气泡嵌在 L1 上，L1 已在模糊） |
| 助手 | 无气泡无边框，直接落在 L1 上：`padding 4px 0`、14/24、`--dsg-label-1`、最大宽 760 |
| 头像 | 24×24 r999，只在助手首条出现，距文本 10 |
| 元信息行 | 时间 11/16 `--dsg-label-4`；操作按钮（复制/重生成）默认 `opacity:0`，行 hover 时 `opacity:1`，32×24 ghost |
| 消息间距 | 用户↔助手 24；助手↔助手 20；整轮之间 40 |
| 引用块 | 左侧 2px `--dsg-line-strong` + `padding-left 12` + `--dsg-label-2` |
| 代码/Tool 卡 | 见 §8.8 / §8.9，**缩进在助手正文列内**，不再有多余外边距 |

```css
.dsg-msg-user {
  align-self: flex-end; max-width: 78%;
  padding: 10px 14px; border-radius: 16px 16px 6px 16px;
  background: rgba(77,107,254,.10);
  font: 400 14px/24px var(--dsg-font-ui); color: var(--dsg-label-1);
}
.dsg-msg-assistant {
  max-width: var(--dsg-content-max-w);
  padding: 4px 0; font: 400 14px/24px var(--dsg-font-ui); color: var(--dsg-label-1);
}
.dsg-msg-meta { opacity: 0; transition: opacity 140ms var(--dsg-ease-standard); }
.dsg-msg:hover .dsg-msg-meta, .dsg-msg:focus-within .dsg-msg-meta { opacity: 1; }
```

### 8.8 工具卡（可折叠）

| 项 | 规格 |
|---|---|
| 容器 | L2、r12、`padding 0`、`overflow: hidden`、`box-shadow: --dsg-keyline, --dsg-hairline`（**不再加外阴影**，它嵌在内容里） |
| 头部 | 40 高、`padding 0 12px`、图标 16 `--dsg-label-3`、标题 13/20 500、右侧状态 + chevron |
| 状态 | running=品牌蓝呼吸点（8px，`animation: dsg-pulse 1.6s infinite`）；done=`--dsg-success`；error=`--dsg-danger` |
| 标题行 hover | `background: rgba(31,58,110,.04)` |
| chevron | 14，`transition: transform 200ms var(--dsg-ease-standard)`，展开旋转 180° |
| 展开体 | `padding: 0 12px 12px`；`grid-template-rows: 0fr → 1fr` 做高度过渡（不要用 `max-height: 9999px`） |
| 长输出 | 展开体内 `max-height: 420px; overflow: auto`；超过时底部渐隐 `mask-image` |
| 嵌套约束 | 工具卡内部**禁止**再来一层 backdrop-filter；内部代码块用纯 fill |

```css
.dsg-tool {
  border-radius: 12px; overflow: hidden;
  background: var(--dsg-fill-l2);
  box-shadow: var(--dsg-keyline), var(--dsg-hairline);
}
.dsg-tool-head {
  display: flex; align-items: center; gap: 8px;
  height: 40px; padding: 0 12px; cursor: pointer;
  font: 500 13px/20px var(--dsg-font-ui); color: var(--dsg-label-1);
  transition: background-color 140ms var(--dsg-ease-standard);
}
.dsg-tool-head:hover { background: rgba(31,58,110,.04); }
.dsg-tool-body { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 240ms var(--dsg-ease-out); }
.dsg-tool[data-open] .dsg-tool-body { grid-template-rows: 1fr; }
.dsg-tool-body > div { overflow: hidden; }
@keyframes dsg-pulse { 0%,100% { opacity: 1 } 50% { opacity: .35 } }
```

### 8.9 代码块

| 项 | 值 |
|---|---|
| 容器 | r12、`background: rgba(255,255,255,.55)`（深色 `rgba(13,21,36,.62)`）、1px `--dsg-line`、`overflow: hidden` |
| 顶栏 | 34 高、`padding 0 10px 0 12px`、语言标签 11/16 500 `--dsg-label-3`、右侧图标按钮 24×24 |
| 正文 | `padding: 10px 0`、mono 12/19、`--dsg-label-1`、横向滚动 12px 内边距 |
| 行号 | 11/19 `--dsg-label-4`、右对齐、`min-width: 32px`、不带分隔线 |
| 高亮 | 见下表；**低饱和**，因为背景是半透明白，高饱和会脏 |
| 复制 | hover 显示，kbd 提示 `Ctrl/⌘ C` |
| 嵌套 | 代码块里的 `backdrop-filter` 一律去掉（内容面不需要） |

```css
.dsg-code {
  border-radius: 12px; overflow: hidden;
  background: rgba(255,255,255,.55);
  border: 1px solid var(--dsg-line);
}
.dsg-code-head {
  height: 34px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 10px 0 12px; font: 500 11px/16px var(--dsg-font-ui); color: var(--dsg-label-3);
}
.dsg-code pre {
  margin: 0; padding: 10px 12px; overflow: auto;
  font: 400 12px/19px var(--dsg-font-mono); color: var(--dsg-label-1);
}
```

语法色（覆盖 `shiki.css`，浅色为玻璃底优化版）：

| token | 浅色 | 深色 |
|---|---|---|
| constant | `#2f5fd0` | `#7b93ff` |
| string | `#1a7f5a` | `#5ad39a` |
| comment | `#8a97a8` | `#6b7688` |
| keyword | `#b02a63` | `#f08bb4` |
| parameter | `#b45309` | `#ffb066` |
| function | `#6b46c1` | `#b79dff` |
| punctuation | `#4b5a6e` | `#8b95a5` |
| link | `#2f49d9` | `#8fb2ff` |
| line-highlight bg | `rgba(77,107,254,.08)` | `rgba(123,147,255,.12)` |

### 8.10 设置对话框

| 项 | 值 |
|---|---|
| 尺寸 | 960×640（min 720×520，max 90vw×85vh） |
| 圆角 | 24 |
| 玻璃 | **L3**：`--dsg-fill-l3` + blur 10 + `--dsg-shadow-l3` |
| scrim | `rgba(10,16,28,.32)` + `backdrop-filter: blur(2px)`；深色 `rgba(0,0,0,.48)` |
| 结构 | 左导航 200（`padding 16`、分组标题 11/16、项 34 高 r8）+ 右侧内容（`padding 24 28`） |
| 分区 | 标题 20/28 600 + 说明 12/18 `--dsg-label-3` + 卡片组 |
| 设置卡片 | r16、`rgba(255,255,255,.34)`（**不是 l2**，比外层浮层更透一点才分得开）、内边距 16 |
| 设置行 | 高 48（双行 64）、左侧 label 14/22 + desc 12/18、右侧控件 |
| 分隔 | 行内 `1px --dsg-line`，最后一行无 |
| 底部操作 | 右对齐、gap 8、主按钮 36 |
| 入场 | scrim 180ms 淡入；面板 220ms `translateY(8px) scale(.99)→1` + opacity |
| 关闭 | Esc / 点 scrim / 右上 32 ghost；关闭 160ms 反向 |

```css
.dsg-dialog {
  width: min(960px, 90vw); height: min(640px, 85vh);
  border-radius: 24px; overflow: hidden;
  display: grid; grid-template-columns: 200px minmax(0, 1fr);
  background: var(--dsg-fill-l3);
  -webkit-backdrop-filter: blur(var(--dsg-blur-l3)) saturate(var(--dsg-saturate)) brightness(var(--dsg-brightness));
          backdrop-filter: blur(var(--dsg-blur-l3)) saturate(var(--dsg-saturate)) brightness(var(--dsg-brightness));
  box-shadow: var(--dsg-keyline), var(--dsg-hairline), var(--dsg-shadow-l3);
  animation: dsg-dialog-in 220ms var(--dsg-ease-out) both;
}
@keyframes dsg-dialog-in {
  from { opacity: 0; transform: translateY(8px) scale(.99); }
  to   { opacity: 1; transform: none; }
}
.dsg-scrim {
  position: fixed; inset: 0; background: rgba(10,16,28,.32);
  -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px);
  animation: dsg-fade-in 180ms var(--dsg-ease-standard) both;
}
```

### 8.11 菜单 / tooltip / 浮层 / toast

| 组件 | 玻璃级 | 规格 |
|---|---|---|
| 菜单 / 命令面板 | **L3 ×1.00** | min-width 200、r12、`padding 6`、item 32 高 r8、图标 16、快捷键 11/16 `--dsg-label-4` 右对齐、分组标题 11/16 `--dsg-label-3` + 上边距 6、分隔线 1px `--dsg-line` + 上下 4 |
| 菜单动画 | | 160ms：`opacity 0→1` + `translateY(-4px)→0` + `scale(.98)→1`，`--dsg-ease-out`；关闭 120ms |
| **tooltip** | **L0 不玻璃化** | 实底 `#1c2532`（深色主题 `#2a3342`），文字 `#f4f7fb`，12/18、`padding 5px 9px`、r8、`max-width 280px`、`--dsg-shadow-btn`；延迟 400ms 出现，100ms 消失 |
| toast | L3 但**实底** | 深底浅字（浅色主题也用深底，保证对比）：`#1c2532` 文字 `#f4f7fb`、r12、`padding 10px 14px`、13/20、底部居中距 24、3.2s 自动消失；成功/错误左侧 3px 语义色条 |
| 下拉选择（非原生） | L3 ×1.00 | 同菜单；选中项左侧 `✓` + `rgba(77,107,254,.12)` |
| 原生 `<select>` 弹层行 | L0 | `background: var(--dsg-fill-solid)` + `color: var(--dsg-label-1)` |
| 悬浮操作条（选中文字后） | L2 | 32 高、r8、`padding 0 6px`、图标按钮 24×24 |

```css
.dsg-menu {
  min-width: 200px; padding: 6px; border-radius: 12px;
  background: var(--dsg-fill-l3);
  -webkit-backdrop-filter: blur(var(--dsg-blur-l3)) saturate(var(--dsg-saturate)) brightness(var(--dsg-brightness));
          backdrop-filter: blur(var(--dsg-blur-l3)) saturate(var(--dsg-saturate)) brightness(var(--dsg-brightness));
  box-shadow: var(--dsg-keyline), var(--dsg-hairline), var(--dsg-shadow-l3);
  animation: dsg-menu-in 160ms var(--dsg-ease-out) both;
}
@keyframes dsg-menu-in {
  from { opacity: 0; transform: translateY(-4px) scale(.98); }
  to   { opacity: 1; transform: none; }
}
.dsg-menu-item {
  height: 32px; border-radius: 8px; padding: 0 8px;
  display: flex; align-items: center; gap: 8px;
  font: 400 13px/20px var(--dsg-font-ui); color: var(--dsg-label-1);
}
.dsg-menu-item:hover { background: rgba(31,58,110,.06); }

/* tooltip 例外：绝不加 backdrop-filter */
.dsg-tooltip {
  background: #1c2532; color: #f4f7fb; border-radius: 8px;
  padding: 5px 9px; font: 400 12px/18px var(--dsg-font-ui);
  box-shadow: var(--dsg-shadow-btn); max-width: 280px;
}
```

### 8.12 控件（按钮 / 输入 / 开关 / 标签 / 分段 / 复选）

**按钮**

| 变体 | 高 | 内边距 | 圆角 | 字体 | 浅色 | 深色 |
|---|---|---|---|---|---|---|
| primary | 36 | `0 14px` | 10 | 13/20 500 | 底 `#4d6bfe` 字白，`--dsg-shadow-brand` | 同 |
| primary hover/active | | | | | `#3d59e8` / `#3047c9` | 同 |
| secondary | 32 | `0 12px` | 10 | 13/20 500 | 底 `rgba(255,255,255,.55)` 边 `--dsg-line` 字 `--dsg-label-1` | 底 `rgba(13,21,36,.55)` |
| ghost | 32 | `0 10px` | 10 | 13/20 500 | 透明，hover `rgba(31,58,110,.06)` | hover `rgba(255,255,255,.06)` |
| danger-ghost | 32 | `0 10px` | 10 | 13/20 500 | 透明，hover `rgba(217,45,32,.08)`，字 `#d92d20` | 字 `#f25a5a` |
| icon | 32×32 | 0 | 10 | — | ghost；图标 16 | |
| pill | 36 | `0 16px` | 999 | 13/20 500 | 同 secondary，hover 抬 1px | |

**输入**

| 项 | 值 |
|---|---|
| 高 | 32（单行）/ 36（大号） |
| 圆角 | 10 |
| 底 | `rgba(255,255,255,.55)`；focus 提到 `.72` |
| 边 | 1px `--dsg-line`；focus `0 0 0 2px rgba(77,107,254,.28)` + 边 `#4d6bfe` |
| 文字 | 14/22 `--dsg-label-1`；placeholder `--dsg-label-4` |
| 错误 | 边 `#d92d20` + `0 0 0 2px rgba(217,45,32,.18)` + 12/18 错误文案 |

**开关**

| 项 | 值 |
|---|---|
| 尺寸 | 40×22（轨）/ 18×18（拇指，r999） |
| 关 | 轨 `rgba(31,58,110,.16)`，拇指 `#fff`，阴影 `0 1px 2px rgba(0,0,0,.18)` |
| 开 | 轨 `#4d6bfe`，拇指 `#fff` |
| 过渡 | `background 160ms`, `transform 200ms var(--dsg-ease-spring)` |
| focus | `0 0 0 2px rgba(77,107,254,.28)` |

**标签 / 徽标**

```css
.dsg-tag {
  height: 22px; padding: 0 8px; border-radius: 6px;
  font: 500 11px/22px var(--dsg-font-ui); letter-spacing: .02em;
  background: rgba(31,58,110,.06); color: var(--dsg-label-2);
}
.dsg-tag[data-tone="brand"]   { background: rgba(77,107,254,.12); color: #2f49d9; }
.dsg-tag[data-tone="success"] { background: rgba(31,157,99,.12);  color: #1a7f5a; }
.dsg-tag[data-tone="danger"]  { background: rgba(217,45,32,.10);  color: #c02318; }
```

**分段控件（顶栏 中文/EN 那种）**

- 容器 32 高、r999、底 `rgba(31,58,110,.06)`、内边距 3
- 段 26 高、r999、12/18 500；选中：底 `rgba(255,255,255,.85)` + `--dsg-shadow-btn` + 字 `--dsg-label-1`；未选 `--dsg-label-3`
- 指示块滑动 200ms `--dsg-ease-out`

**复选 / 单选**：16×16、r4（复选）/ r999（单选）、边 1px `--dsg-line-strong`、选中底 `#4d6bfe` + 白勾、focus 环同输入。

**kbd**：`padding 1px 5px`、r4、11/16 mono、底 `rgba(31,58,110,.06)`、边 1px `--dsg-line`、字 `--dsg-label-3`。

### 8.13 滚动条

| 项 | 浅色 | 深色 |
|---|---|---|
| 宽 | 6px（细）/ 8px（主区） | 同 |
| thumb | `rgba(31,58,110,.16)` | `rgba(255,255,255,.16)` |
| thumb hover | `rgba(31,58,110,.28)` | `rgba(255,255,255,.26)` |
| track | 透明 | 透明 |
| 圆角 | 999（`corner-shape: round` 保留） | |
| 自动隐藏 | 静止 800ms 后 `opacity: .55`，hover 恢复 1 | |

```css
body {
  --dsh-scrollbar-width: 6px;
  --dsh-scrollbar-thumb: rgba(31,58,110,.16);
  --dsh-scrollbar-thumb-hover: rgba(31,58,110,.28);
  --dsh-scrollbar-thumb-border: 0px;
  --dsh-scrollbar-track-margin: 0px;
}
::-webkit-scrollbar-thumb { border-radius: 999px; background-clip: content-box; }
```

---

## 9. DSH token 映射表

> 左列 = DSH 现有 token（`baseline/ui-theme/design_platform.css` 等）；右列 = 新值。
> **插件实现方式**：不改宿主 CSS 文件，在插件注入的样式里对 `body` / `body[data-ds-dark-theme]` 覆写同名变量即可（宿主已把所有组件写成消费 token，纯覆写就能换肤）。

### 9.1 `--dsw-alias-*` 映射

| token | 现浅色 | **新浅色** | **新深色** | 备注 |
|---|---|---|---|---|
| `--dsw-alias-bg-base` | `#fff` | `#f1f5fb` | `#0a0e16` | 只作 overscroll 兜底色，真正背景见 §6 |
| `--dsw-alias-bg-layer-1` | `#fff` | `rgba(255,255,255,.29)` | `rgba(13,21,36,.38)` | L1 内容面 |
| `--dsw-alias-bg-layer-2` | `#fff` | `rgba(255,255,255,.40)` | `rgba(13,21,36,.55)` | L2 卡片 |
| `--dsw-alias-bg-layer-3` | `#fff` | `rgba(255,255,255,.66)` | `rgba(13,21,36,.77)` | L3 浮层 |
| `--dsw-alias-bg-overlay` | `#e9ecf2` | `rgba(255,255,255,.66)` | `rgba(13,21,36,.77)` | 浮层底 |
| `--dsw-alias-bg-mask-1` | `#0000003d` | `rgba(10,16,28,.32)` | `rgba(0,0,0,.48)` | 主 scrim |
| `--dsw-alias-bg-mask-2` | `#0000001f` | `rgba(10,16,28,.16)` | `rgba(0,0,0,.28)` | 轻遮罩 |
| `--dsw-alias-bg-mask-3` | `#0000007a` | `rgba(10,16,28,.48)` | `rgba(0,0,0,.60)` | 重遮罩 |
| `--dsw-alias-bg-skeleton` | `#0000000a` | `rgba(31,58,110,.06)` | `rgba(255,255,255,.06)` | 骨架 |
| `--dsw-alias-border-l1` | `#0000000a` | `rgba(31,58,110,.10)` | `rgba(255,255,255,.08)` | |
| `--dsw-alias-border-l2` | `#0000001a` | `rgba(31,58,110,.14)` | `rgba(255,255,255,.10)` | |
| `--dsw-alias-border-l3` | `#0000001f` | `rgba(31,58,110,.18)` | `rgba(255,255,255,.14)` | |
| `--dsw-alias-border-l4` | `#00000029` | `rgba(31,58,110,.24)` | `rgba(255,255,255,.20)` | elevation stroke 用 |
| `--dsw-alias-label-primary` | `#0f1115` | `#1c2532` | `#eef2f8` | 13.9:1 / 15.4:1 |
| `--dsw-alias-label-secondary` | `#61666b` | `#4b5a6e` | `#b6c0cf` | |
| `--dsw-alias-label-tertiary` | `#81858c` | `#6e7c8f` | `#8b95a5` | |
| `--dsw-alias-label-caption` | `#adb2b8` | `#8a97a8` | `#6b7688` | |
| `--dsw-alias-label-dimmed` | `#e1e5ee` | `#c8d2de` | `#262e3a` | |
| `--dsw-alias-label-primary-foreground` | `#fff` | 不变 | 不变 | 只用在品牌底上 |
| `--dsw-alias-label-primary-inverted` | `#fff` | 不变 | 不变 | |
| `--dsw-alias-label-shimmer` | 30% 黑 | `rgba(28,37,50,.20)` | `rgba(255,255,255,.28)` | 骨架微光 |
| `--dsw-alias-brand-primary` | `#0f1115` | `#1c2532` | `#eef2f8` | 品牌文字色 |
| `--dsw-alias-brand-text` | `#0f1115` | `#1c2532` | `#eef2f8` | |
| `--dsw-alias-brand-primary-new-colorprimary-new-color` | `#4176e6` | `#4d6bfe` | `#6b86ff` | 品牌强调色 |
| `--dsw-alias-button-primary-fill` | 黑 | `#4d6bfe` | `#4d6bfe` | 主按钮 |
| `--dsw-alias-button-primary-hover` | `#43454a` | `#3d59e8` | `#5f7bff` | |
| `--dsw-alias-button-primary-dimmed` | `#ebeef2` | `rgba(77,107,254,.28)` | `rgba(77,107,254,.28)` | disabled |
| `--dsw-alias-button-contrast-fill` | `#61666b` | `#1c2532` | `#eef2f8` | |
| `--dsw-alias-button-elevated-fill` | `#fff` | `rgba(255,255,255,.55)` | `rgba(13,21,36,.62)` | |
| `--dsw-alias-button-floating-fill` | `#fff` | `rgba(255,255,255,.46)` | `rgba(13,21,36,.60)` | 浮动按钮 |
| `--dsw-alias-button-floating-hover` | `#f1f3f5` | `rgba(255,255,255,.62)` | `rgba(255,255,255,.08)` | |
| `--dsw-alias-button-ghost-active-fill` | `#ebeef2` | `rgba(31,58,110,.08)` | `rgba(255,255,255,.08)` | |
| `--dsw-alias-button-ghost-active-border` | `#979da6` | `rgba(31,58,110,.18)` | `rgba(255,255,255,.14)` | |
| `--dsw-alias-button-ghost-active-hover` | `#e9ecf2` | `rgba(31,58,110,.12)` | `rgba(255,255,255,.12)` | |
| `--dsw-alias-button-info-fill` | `#4176e6` | `#4d6bfe` | `#6b86ff` | |
| `--dsw-alias-button-info-hover` | `#5686fe` | `#3d59e8` | `#7b93ff` | |
| `--dsw-alias-button-tool-bar-fill` | `#54555780` | `rgba(31,58,110,.10)` | `rgba(255,255,255,.10)` | 悬浮工具条 |
| `--dsw-alias-button-tool-bar-hover` | `#54555799` | `rgba(31,58,110,.16)` | `rgba(255,255,255,.16)` | |
| `--dsw-alias-button-tool-bar-fill-invisible` | `#1f1f1f5c` | `transparent` | `transparent` | |
| `--dsw-alias-interactive-bg-hover` | `#2631480f` | `rgba(31,58,110,.06)` | `rgba(255,255,255,.06)` | |
| `--dsw-alias-interactive-bg-hover-solid` | `#f1f3f5` | `rgba(31,58,110,.07)` | `rgba(255,255,255,.07)` | |
| `--dsw-alias-interactive-bg-hover-accent` | `#26314824` | `rgba(77,107,254,.10)` | `rgba(123,147,255,.14)` | |
| `--dsw-alias-interactive-bg-hover-danger` | `#ec13130d` | `rgba(217,45,32,.06)` | `rgba(242,90,90,.10)` | |
| `--dsw-alias-interactive-bg-active` | `#2631481a` | `rgba(31,58,110,.10)` | `rgba(255,255,255,.10)` | |
| `--dsw-alias-link` | `#4176e6` | `#2f49d9` | `#7b93ff` | 浅底 4.6:1 |
| `--dsw-alias-tooltip-bg` | `#212123` | `#1c2532`（**实底**） | `#2a3342`（**实底**） | 禁止玻璃化 |
| `--dsw-alias-toast-bg` | `#353638` | `#1c2532` | `#2a3342` | |
| `--dsw-alias-toast-label` | `#fff` | `#f4f7fb` | `#f4f7fb` | |
| `--dsw-alias-switch-thumb` | `#fff` | `#fff` | `#eef2f8` | |
| `--dsw-alias-scrollbar-bg-l1` | `#e5e5e5` | `rgba(31,58,110,.16)` | `rgba(255,255,255,.16)` | |
| `--dsw-alias-scrollbar-bg-l2` | `#e5e5e5` | `rgba(31,58,110,.16)` | `rgba(255,255,255,.16)` | |
| `--dsw-alias-scrollbar-hover-l1` | `#d4d4d4` | `rgba(31,58,110,.28)` | `rgba(255,255,255,.26)` | |
| `--dsw-alias-scrollbar-hover-l2` | `#d4d4d4` | `rgba(31,58,110,.28)` | `rgba(255,255,255,.26)` | |
| `--dsw-alias-markdown-code-block` | `#fafafa` | `rgba(255,255,255,.55)` | `rgba(13,21,36,.62)` | |
| `--dsw-alias-markdown-code-block-banner` | `#f5f6f7` | `rgba(255,255,255,.62)` | `rgba(13,21,36,.70)` | |
| `--dsw-alias-markdown-inline-code` | `#f5f5f5` | `rgba(31,58,110,.06)` | `rgba(255,255,255,.08)` | |
| `--dsw-alias-markdown-citation` | `#ebeef2` | `rgba(31,58,110,.06)` | `rgba(255,255,255,.08)` | |
| `--dsw-alias-markdown-tag` | `#f1f3f5` | `rgba(31,58,110,.05)` | `rgba(255,255,255,.07)` | |
| `--dsw-alias-markdown-placeholder` | `#f5f6f7` | `rgba(31,58,110,.05)` | `rgba(255,255,255,.07)` | |
| `--dsw-alias-markdown-code-segment-selected` | `#fff` | `rgba(255,255,255,.70)` | `rgba(255,255,255,.10)` | |
| `--dsw-alias-markdown-code-segment-unselected` | `#f1f3f5` | `transparent` | `transparent` | |
| `--dsw-alias-state-business-primary` | `#4176e6` | `#4d6bfe` | `#6b86ff` | |
| `--dsw-alias-state-business-tertiary` | `#e4edfd` | `rgba(77,107,254,.12)` | `rgba(77,107,254,.20)` | |
| `--dsw-alias-state-error-primary` | `#ec1313` | `#d92d20` | `#f25a5a` | |
| `--dsw-alias-state-success-primary` | `#22c55e` | `#1f9d63` | `#4ed17e` | |
| `--dsw-alias-state-warn-primary` | `#f59e0b` | `#d98924` | `#f7ad31` | |
| `--dsw-alias-state-warn-label` | `#dd8629` | `#b06a15` | `#f7ad31` | |
| `--dsw-alias-state-idle-primary` | `#d4d4d4` | `#c8d2de` | `#4d5769` | |
| `--dsw-alias-turn-trigger-bg` | `#fafafa` | `rgba(31,58,110,.05)` | `rgba(255,255,255,.07)` | 思考触发条 |
| `--dsw-alias-turn-trigger-bg-hover` | `#2631480f` | `rgba(31,58,110,.08)` | `rgba(255,255,255,.10)` | |
| `--dsw-alias-menu-group-header-fill` | `#f8f9faf0` | `rgba(250,251,253,.92)` | `rgba(20,27,38,.92)` | |

### 9.2 `--dsw-specific-*` 映射

| token | 现浅色 | **新浅色** | **新深色** | 备注 |
|---|---|---|---|---|
| `--dsw-specific-bubble` | `#edf3fe` | `rgba(255,255,255,.40)` | `rgba(13,21,36,.55)` | 气泡 L2；用户气泡再叠 `--dsg-bubble-user` |
| `--dsw-specific-bubble-highlight` | `#d3e2ff` | `rgba(77,107,254,.16)` | `rgba(123,147,255,.22)` | |
| `--dsw-specific-input-major` | `#fff` | `rgba(255,255,255,.40)` | `rgba(13,21,36,.55)` | composer 外壳 |
| `--dsw-specific-login-input` | `#f9fafb` | `rgba(255,255,255,.55)` | `rgba(13,21,36,.62)` | |
| `--dsw-specific-sidebar-fill` | `#f9fafb` | `rgba(255,255,255,.34)` | `rgba(13,21,36,.52)` | 侧栏 |
| `--dsw-specific-sidebar-nav-item-hover` | `#f1f3f5` | `rgba(31,58,110,.06)` | `rgba(255,255,255,.06)` | |
| `--dsw-specific-sidebar-nav-item-active` | `#ebeef2` | `rgba(77,107,254,.12)` | `rgba(123,147,255,.16)` | |
| `--dsw-specific-sidebar-nav-item-active-accent` | `#e4edfd` | `#4d6bfe` | `#7b93ff` | 左侧强调条 |
| `--dsw-specific-menu` | `rgba(248,249,250,.58)` | `rgba(255,255,255,.72)` | `rgba(13,21,36,.80)` | 配合 `--dsw-menu-backdrop-filter` |
| `--dsw-menu-surface-fill` | `#f8f9fa94` | `rgba(255,255,255,.72)` | `rgba(13,21,36,.80)` | |
| `--dsw-specific-selector` | `#f5f6f7` | `rgba(255,255,255,.55)` | `rgba(13,21,36,.62)` | 分段/选择器底 |
| `--dsw-specific-tip` | `#f5f6f7` | `rgba(255,255,255,.66)` | `rgba(13,21,36,.77)` | 提示条（**非 tooltip**） |

### 9.3 其它（阴影 / 圆角 / 字体 / 动效 / shiki）

| token | 现 | **新** |
|---|---|---|
| `--dsw-shadow-lv1` | `0 2px 4px #0000000d` | `0 8px 24px rgba(2,6,23,.10)` |
| `--dsw-shadow-lv2` | `0 4px 12px …` | `0 12px 40px rgba(0,0,0,.12)` |
| `--dsw-shadow-lv3` | `0 0 1px …` | `0 24px 80px rgba(0,7,18,.30)` |
| `--dsw-shadow-lv1-blur` | `0 4px 12px #00000005` | `0 1px 2px rgba(23,42,84,.06)` |
| `--dsw-elevation-stroke-color` | `--dsw-alias-border-l4` | 不变（值随 9.1 更新） |
| `--dsw-elevation-panel/prominent/soft` | 现有公式 | 保留公式，`--dsw-elevation-stroke` 改 `0 0 0 .5px rgba(255,255,255,.08)` 用于玻璃面 |
| `--dsw-menu-backdrop-filter` | `blur(40px) saturate(150%)` | `blur(10px) saturate(1.30) brightness(1.04) contrast(1.01)` |
| `--dsw-mask-blur` | `none` | `blur(2px)` |
| `--dsw-focus-ring-width` | `2px` | `2px`（不变） |
| `--dsw-alias-settings-card-fill` | `--bg-layer-2` | `rgba(255,255,255,.34)` / `rgba(13,21,36,.48)` |
| `--dsw-alias-settings-card-stroke` | `--border-l4` | `rgba(31,58,110,.10)` / `rgba(255,255,255,.10)` |
| `--dsw-radius-panel` | `28px` | `24px` |
| `--dsw-font-family` | 系统无衬线 | `var(--dsg-font-ui)`（§4.1 整串） |
| `--dsw-font-family-brand` | Montserrat | `var(--dsg-font-ui)`（中英混排更稳） |
| `--ds-font-family-code` | 现有 | `var(--dsg-font-mono)`（加 Cascadia Code） |
| `--ds-ease-in-out` | `cubic-bezier(.4,0,.2,1)` | 不变（新增 `--dsg-ease-out`） |
| `--ds-transition-duration` | `.2s` | `.2s`；新增 `--dsg-dur-fast: 140ms` |
| `--dsh-scrollbar-width` | `5px` | `6px` |
| `--dsh-scrollbar-thumb` | `--dsw-alias-scrollbar-bg-l1` | 不变（值随 9.1 更新） |
| `--shiki-token-*` | §8.9 表 | 按 §8.9 覆写 8 个色 |
| `--dsw-alias-onboarding-card-fill` | 80% 白 | `rgba(255,255,255,.55)` / `rgba(13,21,36,.62)` |

### 9.4 需要插件新增的 `--dsg-*` 变量（完整契约）

```css
:root {
  /* ── 品牌 ─────────────────────────────────────────────── */
  --dsg-brand: #4d6bfe;            --dsg-brand-hover: #3d59e8;
  --dsg-brand-active: #3047c9;     --dsg-brand-ink: #2f49d9;
  --dsg-brand-soft: rgba(77,107,254,.10);
  --dsg-brand-soft-strong: rgba(77,107,254,.16);

  /* ── 玻璃契约（必须与 GLASS-SPEC §6.4 同名同义） ───────── */
  --dsg-tint: #ffffff;             --dsg-tint-rgb: 255,255,255;
  --dsg-floor: 0.45;               --dsg-glass-fidelity: 0.55;
  --dsg-alpha-l1: 0.06;            --dsg-alpha-l2: 0.20;   --dsg-alpha-l3: 0.55;
  --dsg-fill-l1: rgba(255,255,255,.29);
  --dsg-fill-l2: rgba(255,255,255,.40);
  --dsg-fill-l3: rgba(255,255,255,.66);
  --dsg-fill-solid: #f7f9fc;
  --dsg-blur-l1: 20px;             --dsg-blur-l2: 16px;    --dsg-blur-l3: 10px;
  --dsg-saturate: 1.30;            --dsg-brightness: 1.04; --dsg-contrast: 1.01;
  --dsg-keyline: inset 0 1px 0 rgba(255,255,255,.32);
  --dsg-keyline-bottom: inset 0 -1px 0 rgba(255,255,255,.08);
  --dsg-hairline: inset 0 0 0 .5px rgba(255,255,255,.08);
  --dsg-sheen-l1: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.03) 38%, rgba(255,255,255,.02));
  --dsg-sheen-l2: linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.05) 38%, rgba(255,255,255,.02));
  --dsg-sheen-l3: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.03) 38%, rgba(255,255,255,.05));

  /* ── 线条 / 阴影 ──────────────────────────────────────── */
  --dsg-line: rgba(31,58,110,.10);        --dsg-line-strong: rgba(31,58,110,.18);
  --dsg-shadow-l1: 0 8px 24px rgba(2,6,23,.10);
  --dsg-shadow-l2: 0 12px 40px rgba(0,0,0,.12);
  --dsg-shadow-l3: 0 24px 80px rgba(0,7,18,.30);
  --dsg-shadow-btn: 0 1px 2px rgba(23,42,84,.08);
  --dsg-shadow-brand: 0 6px 18px -6px rgba(77,107,254,.55);

  /* ── 氛围层 ───────────────────────────────────────────── */
  --dsg-atmos-base: #f4f7fc;  --dsg-atmos-warm: #f8f7f8;
  --dsg-mist-1: rgba(120,152,219,.52);
  --dsg-mist-2: rgba(146,178,230,.46);
  --dsg-mist-3: rgba(196,213,238,.34);
  --dsg-top-light: rgba(255,255,255,.96);
  --dsg-grid-size: 75px;      --dsg-grid-line: rgba(59,91,148,.045);
  --dsg-glow-brand: rgba(77,107,254,.10);

  /* ── 尺寸 ─────────────────────────────────────────────── */
  --dsg-header-h: 52px;       --dsg-sidebar-w: 264px;
  --dsg-rail-w: 320px;        --dsg-gutter: 8px;
  --dsg-content-max-w: 760px; --dsg-composer-max-w: 760px;
  --dsg-shell-radius: 20px;   --dsg-panel-pad: 16px;
  --dsg-control-h: 32px;      --dsg-control-h-lg: 36px;
  --dsg-send-size: 32px;      --dsg-avatar-size: 24px;

  /* ── 圆角 ─────────────────────────────────────────────── */
  --dsg-radius-xs: 4px;       --dsg-radius-sm: 8px;   --dsg-radius-md: 10px;
  --dsg-radius-lg: 12px;      --dsg-radius-xl: 16px;  --dsg-radius-2xl: 20px;
  --dsg-radius-composer: 24px; --dsg-radius-window: 24px; --dsg-radius-pill: 999px;

  /* ── 字体 ─────────────────────────────────────────────── */
  --dsg-font-ui: -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI",
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei",
    "Noto Sans SC", "Source Han Sans SC", "Helvetica Neue", Arial, sans-serif;
  --dsg-font-serif: "Noto Serif SC", "Source Han Serif SC", "Source Han Serif CN",
    "Songti SC", "STSong", "SimSun", "宋体", serif;
  --dsg-font-sans-display: "Noto Sans SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  --dsg-font-mono: "SF Mono", "JetBrains Mono", "Fira Code", "Cascadia Code", Consolas,
    "Liberation Mono", Menlo, monospace, "PingFang SC", "Microsoft YaHei";
  --dsg-font-display: var(--dsg-font-serif);   /* 换成 --dsg-font-sans-display 即 1:1 复刻参考图 */
  --dsg-fs-hero: clamp(40px, 5.2vw, 60px);
  --dsg-fs-h1: 32px;  --dsg-fs-h2: 24px;  --dsg-fs-h3: 20px; --dsg-fs-lede: 16px;
  --dsg-fs-body: 14px; --dsg-fs-small: 12px; --dsg-fs-caption: 11px; --dsg-fs-code: 12px;
  --dsg-lh-hero: 1.25; --dsg-lh-body: 1.71;
  --dsg-tracking-hero-serif: 0.04em; --dsg-tracking-hero-sans: 0.125em;

  /* ── 文字语义 ─────────────────────────────────────────── */
  --dsg-label-1: #1c2532; --dsg-label-2: #4b5a6e;
  --dsg-label-3: #6e7c8f; --dsg-label-4: #8a97a8;
  --dsg-label-invert: #fff; --dsg-link: #2f49d9; --dsg-focus: #4d6bfe;

  /* ── 动效 ─────────────────────────────────────────────── */
  --dsg-dur-instant: 90ms; --dsg-dur-fast: 140ms;
  --dsg-dur-base: 200ms;   --dsg-dur-slow: 320ms;
  --dsg-ease-standard: cubic-bezier(.2,.8,.2,1);
  --dsg-ease-out: cubic-bezier(.22,1,.36,1);
  --dsg-ease-in-out: cubic-bezier(.4,0,.2,1);
  --dsg-ease-spring: cubic-bezier(.34,1.56,.64,1);
}

/* 深色：只覆写差异项，别重写整套 */
body[data-ds-dark-theme] {
  --dsg-tint: #0d1524; --dsg-tint-rgb: 13,21,36;
  --dsg-floor: 0.59;
  --dsg-alpha-l1: 0.08; --dsg-alpha-l2: 0.34; --dsg-alpha-l3: 0.66;
  --dsg-fill-l1: rgba(13,21,36,.38);
  --dsg-fill-l2: rgba(13,21,36,.55);
  --dsg-fill-l3: rgba(13,21,36,.77);
  --dsg-fill-solid: #141b26;
  --dsg-keyline: inset 0 1px 0 rgba(255,255,255,.14);
  --dsg-keyline-bottom: inset 0 -1px 0 rgba(255,255,255,.04);
  --dsg-line: rgba(255,255,255,.08); --dsg-line-strong: rgba(255,255,255,.14);
  --dsg-shadow-l1: 0 8px 24px rgba(0,0,0,.45);
  --dsg-shadow-l2: 0 12px 40px rgba(0,0,0,.55);
  --dsg-shadow-l3: 0 24px 80px rgba(0,7,18,.70);
  --dsg-atmos-base: #0a0e16; --dsg-atmos-warm: #06090f;
  --dsg-mist-1: rgba(28,48,92,.62); --dsg-mist-2: rgba(24,42,82,.52);
  --dsg-mist-3: rgba(40,66,120,.40);
  --dsg-top-light: rgba(120,150,220,.10);
  --dsg-grid-line: rgba(150,180,230,.045);
  --dsg-label-1: #eef2f8; --dsg-label-2: #b6c0cf;
  --dsg-label-3: #8b95a5; --dsg-label-4: #6b7688;
  --dsg-link: #7b93ff; --dsg-focus: #7b93ff;
  --dsg-brand: #6b86ff; --dsg-brand-hover: #7b93ff; --dsg-brand-ink: #9fb4ff;
  --dsg-brand-soft: rgba(123,147,255,.16);
}
```

---

## 10. 动效

| 场景 | 时长 | 缓动 | 变换 |
|---|---|---|---|
| hover（按钮/项/卡片） | 140ms | `--dsg-ease-standard` | `background-color` / `color` |
| 按下（按钮/发送） | 90ms | `--dsg-ease-spring` | `transform: scale(.96)` |
| 焦点环出现 | 120ms | `--dsg-ease-standard` | `box-shadow` |
| 菜单/浮层进入 | 160ms | `--dsg-ease-out` | opacity + `translateY(-4px)` + `scale(.98)` |
| 菜单/浮层退出 | 120ms | `--dsg-ease-standard` | 反向 |
| 对话框进入 | 220ms | `--dsg-ease-out` | opacity + `translateY(8px)` + `scale(.99)` |
| scrim 淡入 | 180ms | `--dsg-ease-standard` | opacity |
| 工具卡展开 | 240ms | `--dsg-ease-out` | `grid-template-rows 0fr→1fr` |
| 侧栏开合 | 260ms | `--dsg-ease-out` | `width` + 内容 `opacity` 延迟 60ms |
| Hero 入场 | 240ms + 60ms 级联 | `--dsg-ease-out` | `translateY(8px)→0` + opacity |
| 发送按钮 → 生成中 | 200ms | `--dsg-ease-spring` | 箭头淡出、loading 环淡入 |
| 思考中光晕 | 3.2s 循环 | `ease-in-out` | opacity `.45→.8` |
| 骨架 shimmer | 1.6s 循环 | `linear` | `background-position -200%→200%` |
| toast 进出 | 200/160ms | `--dsg-ease-out` | `translateY(12px)→0` |

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important; animation-iteration-count: 1 !important;
    transition-duration: 1ms !important; scroll-behavior: auto !important;
  }
}
```

**禁止**：整页淡入、路由切换白闪、`transition: all`、弹窗缩放入场超过 1.02、hover 位移超过 2px、氛围层动画（会让 GPU 常年 30% 以上）。

---

## 11. 从现状到目标的改造清单

按依赖顺序执行（每一步都可独立验收）：

| # | 步骤 | 落点 | 验收 |
|---|---|---|---|
| 1 | 注入 §9.4 变量块（浅/深各一段）+ §4.1 字体栈覆写 | 插件 CSS 最前 | 现有界面立刻变浅色但布局不变；无文字消失 |
| 2 | 上氛围层 + 网格（§6.1/6.2） | `body` 背景 + 一个 `::after` | §2.4 九点取样 ΔE ≤ 3；滚动不掉帧 |
| 3 | 外壳栅格（§8.1）：8px 缝、r20、三栏宽度 | `.dsg-shell` | 面板之间能看到氛围层透出 |
| 4 | 玻璃三级（§7）：先 L2（侧栏/顶栏/composer），再 L3（菜单/弹窗），最后 L1 | 逐面替换 `background` + 加 `backdrop-filter` | 每级 effAlpha 与 §7.3 表一致（DevTools 读 computed） |
| 5 | composer 重做（§8.6） | `[data-composer-card]` | 宽 760、高 ≥120、r24、发送 32、focus 环正确 |
| 6 | 消息 / 工具卡 / 代码块（§8.7–8.9） | chat flow 内 | 代码块不透出背景噪点；工具卡展开无跳动 |
| 7 | 设置窗口 / 弹窗 / 菜单（§8.10–8.11） | `role="dialog"`、menu 面 | L3 生效且 tooltip 仍未玻璃化 |
| 8 | 控件统一（§8.12）：按钮高度、圆角、seg、switch | 全局 | 全应用按钮只有 32/36 两种高度 |
| 9 | 滚动条 / 焦点环 / 动效（§8.13/§10） | 全局 | 无 `transition: all`；reduced-motion 生效 |
| 10 | Hero 空态（§8.5） | 新会话空态 | 只有一处 ≥ 40px 字号；三胶囊对齐 |

**与现有插件的关系**：`ui-liteglass`（背景 off / panelOpacity 1）与 `wallpaper-engine` 的玻璃若同时启用，会出现**双写 `background` + 双重 blur**。上线 DSG 时：或停用 WE 玻璃（保留壁纸，`[data-dsg-has-wallpaper]` 切到壁纸档，§7.3），或停用 ui-liteglass 的面板透明度。不要三套同时改同一批选择器。

---

## 12. 验收清单（15 条，全部可截图量化）

> 准备：1686×886 视口（或等比），DPR 1.5，浅色主题，空态首屏；深色项重复一遍。

| # | 检查项 | 方法 | 通过标准 |
|---|---|---|---|
| 1 | 氛围层 9 点校准 | 在 §2.4 的 9 个坐标取样（x 80/267/467/667/843/1000/1200/1400/1600，y 20/120/253/413/547/700/833） | 每点 ΔE₀₀ ≤ 3（或单通道 ≤ 6/255） |
| 2 | 网格周期与强度 | 截取 x 100–800 / y 100–500 波段做高通峰值检测 | 周期 75±1px；格线相对底色下沉 3–6/255；底部 20% 不可见 |
| 3 | Hero 字号与字距 | 量墨迹：标题墨高 ÷ 0.76（黑体档）= 字号 | 字号在 clamp 区间内；字距 0.10–0.16em（黑体档）；宋体档 0.03–0.06em |
| 4 | 只有一处展示级字号 | 全屏扫描字号 | ≥ 40px 的文本块数量 = 1 |
| 5 | composer 几何 | 量 bbox | 宽 760±2 / 高 ≥120 / r24±1 / 发送钮 32±1 |
| 6 | composer 填充 | 取面板中部与外部背景各 1 点，反解 alpha | effAlpha 0.38–0.42（参考档）；面板色差 ≤ 8/255 |
| 7 | 三级 effAlpha | DevTools 读 L1/L2/L3 面板 `background-color` 的 alpha | 0.29/0.40/0.66 ±0.02（浅）；0.38/0.55/0.77 ±0.02（深） |
| 8 | blur 分级单调 | 读三层 `backdrop-filter` | L1 20 / L2 16 / L3 10 px，且 saturate 全为 1.30 |
| 9 | 正文对比度 | 取 L1/L2/L3 上正文与最暗氛围锚点 | ≥ 4.5:1（目标值：L2 13.9:1，最坏 9.8:1） |
| 10 | 顶光不刺眼 | 截图看面板上沿 | 顶光条亮度不超过面板 +20/255；alpha ≤ .32（浅）/.14（深） |
| 11 | tooltip 未玻璃化 | 读 `role="tooltip"` 计算样式 | `background-color` alpha = 1；文字对比度 ≥ 7:1 |
| 12 | 浮层不受包含块影响 | 在滚动区内打开菜单/tooltip | 位置相对视口正确；滚动时跟随锚点，不偏移 |
| 13 | 滚动条 | 滚一个长文档 | 宽 6px；thumb alpha ≤ .20；hover 变深；无轨道白块 |
| 14 | 动效预算 | Performance 面板 + 代码搜索 | 无 `transition: all`；交互 duration ≤ 320ms；滚动 ≥ 55fps |
| 15 | 浅/深双主题完整 | 切换 `data-ds-dark-theme` | 无「白块残留 / 黑字压暗底」；所有 L1/L2/L3 均按 §3.5 取值 |

补充（可选截图项）：`prefers-reduced-motion: reduce` 下无位移；125% / 200% 系统缩放下布局不破；窗口宽 1024 时侧栏可收起、composer 仍 760 或按 `100% - 48px`。

---

## 13. 未验证与风险（如实说明）

| 项 | 状态 | 说明 |
|---|---|---|
| deepseek.com 真实 CSS 数值 | **未取到** | 站点是 SPA，样式由 JS 注入，Network 无 `.css` 请求，`<style>` 混在 137KB HTML 里不可按规则检索；在用户已登录的浏览器上做 DOM 抓取风险高，未做。因此 §2 全部数值来自**截图逐像素反解**，不是 computed style。 |
| 品牌蓝精确值 | **有冲突未定论** | 截图三处实测 `#4176e6`，与官方品牌 `#4D6BFE` 不符（疑色彩管理/截图链路偏移）。本文件两者都保留：CTA 用 `#4d6bfe`，既有 token 保留 `#4176e6`。建议做一次实机取色再定稿。 |
| DPR 假设 | **推定 1.5** | 由 32px 发送钮 / 14-20 行高 / 16px placeholder 三锚点交叉验证；若真实为 2.0，则所有绝对 px 应按比例缩放，但比例关系（43% 宽、75px 网格等）不变。 |
| Hero 字体衬线 vs 黑体 | **已给结论** | 参考图实测为黑体（§2.7 有 4× 证据）；项目要求东方气质 → 默认衬线 + 一行切回黑体。需产品拍板。 |
| 玻璃数值 | **已对齐** | 采用 `docs/GLASS-SPEC.md` §4.4/§6.2 的公式与常量；参考图档（§7.3）是在其公式上把 fidelity 缩放 0.55 的本文件推导，已与 glass-analyst 沟通确认。若 GLASS-SPEC 定稿数值与此不同，以 GLASS-SPEC 为准并回改 §7.3/§9.4。 |
| 组件几何（设置窗口、右栏、菜单） | **设计目标值，非实测** | 参考图只有首屏，没有这些界面；尺寸取自 DSH 现状截图与常规桌面 GUI 惯例，实现时允许 ±4px 调整。 |
| tooltip 对比度 1.07–1.13:1 | **引用他人实测** | 来自 glass-analyst 的 GLASS-SPEC，我未独立复测；结论（tooltip 不玻璃化）与我的判断一致。 |
| 真实渲染验证 | **未做** | 本会话不允许安装/修改 DSH 插件、不碰 profile，因此没有在真实 GUI 里渲染这套 CSS。§12 的检查项需要在实现后实机跑一遍。 |
| 动态壁纸共存 | **未验证** | `[data-dsg-has-wallpaper]` 切到壁纸档的逻辑是按 GLASS-SPEC 推的，需与 WE 插件联调。 |

---

## 附录 A · 最小可用 tokens.css 骨架

```css
/* ============ DSG · DeepSeek Glass ｜ 最小可用骨架 ============ */
/* 1) 字体 */
body {
  --dsw-font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC",
    -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --ds-font-family-code: "JetBrains Mono", "SF Mono", Consolas, monospace;
}
/* 2) 氛围层 */
body {
  background-color: #f4f7fc;
  background-image:
    radial-gradient(120% 62% at 50% -14%, rgba(255,255,255,.97) 0%, rgba(255,255,255,.55) 42%, rgba(255,255,255,0) 68%),
    radial-gradient(46% 40% at 71% 1%, rgba(120,152,219,.58) 0%, rgba(120,152,219,.20) 55%, rgba(120,152,219,0) 78%),
    radial-gradient(40% 42% at 28% 50%, rgba(146,178,230,.55) 0%, rgba(146,178,230,.22) 58%, rgba(146,178,230,0) 82%),
    radial-gradient(52% 46% at 100% 62%, rgba(196,213,238,.40) 0%, rgba(196,213,238,0) 72%),
    radial-gradient(100% 46% at 50% 112%, rgba(248,247,248,.98) 0%, rgba(248,247,248,.70) 40%, rgba(248,247,248,0) 70%),
    linear-gradient(178deg, #fbfcfe 0%, #eef4fb 24%, #e3ecf7 46%, #dfe9f6 58%, #e9eff7 74%, #f4f4f5 90%, #f8f7f8 100%);
  background-attachment: fixed; background-repeat: no-repeat;
}
body::after {
  content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(to right, rgba(59,91,148,.045) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(59,91,148,.045) 1px, transparent 1px);
  background-size: 75px 75px; background-position: 56px 56px;
  -webkit-mask-image: radial-gradient(120% 96% at 50% 22%, #000 0%, #000 46%, rgba(0,0,0,.55) 72%, transparent 100%);
          mask-image: radial-gradient(120% 96% at 50% 22%, #000 0%, #000 46%, rgba(0,0,0,.55) 72%, transparent 100%);
}
/* 3) 三级玻璃（消费点示例，实际按 SURFACE-MAP 的选择器套用） */
.dsg-l1 {
  background: rgba(255,255,255,.29);
  -webkit-backdrop-filter: blur(20px) saturate(1.30) brightness(1.04) contrast(1.01);
          backdrop-filter: blur(20px) saturate(1.30) brightness(1.04) contrast(1.01);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.32), inset 0 0 0 .5px rgba(255,255,255,.08),
              0 8px 24px rgba(2,6,23,.10);
}
.dsg-l2 {
  background: rgba(255,255,255,.40);
  -webkit-backdrop-filter: blur(16px) saturate(1.30) brightness(1.04) contrast(1.01);
          backdrop-filter: blur(16px) saturate(1.30) brightness(1.04) contrast(1.01);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.32), inset 0 -1px 0 rgba(255,255,255,.08),
              inset 0 0 0 .5px rgba(255,255,255,.08), 0 12px 40px rgba(0,0,0,.12);
}
.dsg-l3 {
  background: rgba(255,255,255,.66);
  -webkit-backdrop-filter: blur(10px) saturate(1.30) brightness(1.04) contrast(1.01);
          backdrop-filter: blur(10px) saturate(1.30) brightness(1.04) contrast(1.01);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.32), inset 0 0 0 .5px rgba(255,255,255,.08),
              0 24px 80px rgba(0,7,18,.30);
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .dsg-l1 { background: rgba(255,255,255,.78); }
  .dsg-l2 { background: rgba(255,255,255,.86); }
  .dsg-l3 { background: rgba(255,255,255,.92); }
}
/* 4) 深色 */
body[data-ds-dark-theme] {
  background-color: #0a0e16;
  background-image:
    radial-gradient(120% 62% at 50% -14%, rgba(120,150,220,.13) 0%, rgba(120,150,220,0) 62%),
    radial-gradient(50% 44% at 72% 2%, rgba(28,48,92,.85) 0%, rgba(28,48,92,0) 76%),
    radial-gradient(44% 46% at 26% 52%, rgba(24,42,82,.80) 0%, rgba(24,42,82,0) 80%),
    radial-gradient(56% 50% at 100% 66%, rgba(40,66,120,.55) 0%, rgba(40,66,120,0) 74%),
    linear-gradient(180deg, #06090f 0%, #0b1117 26%, #0e1622 52%, #0b1018 78%, #06090f 100%);
}
body[data-ds-dark-theme] .dsg-l1 { background: rgba(13,21,36,.38); }
body[data-ds-dark-theme] .dsg-l2 { background: rgba(13,21,36,.55); }
body[data-ds-dark-theme] .dsg-l3 { background: rgba(13,21,36,.77); }
```

---

*文档结束。数值来源：§2 截图实测 + `docs/GLASS-SPEC.md` §4.4/§6.2 契约 + DSH 现有 token 表。任何改动请同步更新 §12 验收清单。*
