# GLASS-SPEC — WE 玻璃质感 / 透明度 / 模糊 的完整提取与移植规格

> 产出：`glass-analyst`（task-2）。唯一写入范围：本文件。
> 输入：`dsh-plugin-wallpaper-engine@1.3.x` 源码（`lib/client.js`，4.5 MB，内联了 9 个样式域模块与全部 JS）、
> `lib/settings-schema.js`、`lib/glass-presets/*.json`、`README.md`、`baseline/plugins/wallpaper-engine.config.json`、
> `baseline/ui-theme/`（DSH 主题 token 与 WE 已提取样式表）、`baseline/reference/deepseek-web.png`、`baseline/screenshots/current-ui.png`。
> 目标读者：`dsh-skin-mistblue` 插件（新玻璃引擎）的实现者。文中所有数值都可在源码中复核，定位见 **附录 A**。

---

## 0. TL;DR —— 12 条硬结论

1. **配方不是"模糊 + 半透明"，是 5 层叠加**：染色底（token）＋ 顶部镜面高光渐变 ＋ `backdrop-filter`（blur/saturate/brightness/contrast）＋ 内高光/发丝边（inset shadow）＋ 外投影。少任何一层都会读成"平涂的纱"而不是玻璃（WE 把"缺霜"当成独立缺陷修过，见轨迹面板那段注释）。
2. **可读性下限（readability floor）是硬红线常量，不是滑杆**：浅色 `0.45`、深色 `0.59`（`READABILITY_FLOOR` / `READABILITY_FLOOR_DARK`）。它不读壁纸透明度，任何滑杆都不能把它降下来 —— 唯一能减薄它的是"玻璃保真度"（`glassFidelity`）。
3. **核心恒等式**：`effAlpha = floor + a·(1 − floor)`。其中 `a` 是该面的釉层 alpha（玻璃透明度滑杆算出来的值），`floor = 0.45|0.59 × fidelity`。因为 WE 的地板层颜色 **就是** 釉色（`--we-readability-base == --we-surface-tint-*`），所以**每个玻璃面的合成结果都是"一种纯色 + 一个 alpha"**，不存在两种颜色混出来的灰。
4. **透明度滑杆是一条线性曲线**：`a = max(0.10, 0.25 − p/100 × 0.15)` → p=0:0.25、20:0.22、50:0.175、80:0.13、100:0.10。**越大越透**。`0.10` 是下限，防"拉满变黑/变白"。
5. **模糊与饱和度解耦**：`--we-blur` 是 0–60px 的唯一滑杆；`--we-saturate` 是常量 `GLASS_SATURATE = 1.3`（样式表里 1.8 只是 JS 写值前的兜底）。耦合斜坡（`1.15 + blur×0.028`）在高半径会把壁纸残字放大成"彩色鬼影"，已被 `?we-saturate=legacy` 降级为 A/B 开关。brightness `1.04`、contrast `1.01` 全局钉死。
6. **保真度是"两段式"**：`weClampSurfaceColor(色, 主题, f)` 先用**满档地板**把釉色钳进亮度带（保证最坏壁纸下正文 ≥4.5:1，代码取 4.6 留 hex 舍入余量），再按 `f` **逐通道线性回退**到用户原色。`f=1` 逐位现状、`f=0` 原色直出，中间单调无悬崖。同一标量还喂 `--we-readability-floor`，一个旋钮管两半。
7. **暗色主题的釉层还要再乘 0.4（气泡 0.33）**：`rgba(tint, calc(--we-glass-alpha * 0.4))`。这只缩放釉色那一项，地板权重不动 —— 所以暗色不会"穿透"。
8. **透明靠 token，模糊只能靠元素选择器**：WE 的书面结论 —— "CSS-module 类名是构建哈希，重建就静默失效；`backdrop-filter` 无法表达成 token，所以模糊仍需元素选择器，但只挑**源码里写死的 data-\* 属性**"（`[data-composer-card]` 等）。
9. **`backdrop-filter` 会把元素变成 `position:fixed` 后代的包含块**：`[data-composer-card]` 里有"AI 浏览器座位"的 fixed 后代，模糊若画在卡片上会把它顶下去约 522px（issue #89）。修法：模糊搬到 `::before`（伪元素无后代），卡片本身 `backdrop-filter:none`。左栏（#131）、标题栏同理。
10. **降级有两条腿，缺一不可**：`@supports not (backdrop-filter)` 只挡"语法不支持"；**软件光栅器（swiftshader/llvmpipe/stack-gl）认语法但不出霜**，必须运行时探测（WebGL renderer 正则）挂 `data-we-glass-fallback`，把同一批面钉到 **92% 近不透明**并显式 `backdrop-filter:none`。
11. **宿主自带两条玻璃/模糊通道，别重复造**：`--dsw-mask-blur`（模态遮罩，主题值 `none`）与 `--dsw-specific-menu` + `--dsw-menu-backdrop-filter`（菜单，`blur(40px) saturate(150%)`）。接管方式是在 `body` 上重声明 token，而不是给菜单写自己的板子。
12. **当前用户配置的真实观感比配置项看起来"薄"得多**：`glassMode` 全 `inherit` ⇒ `settingsWindowTransparency 90 / Blur 8`、`floaters 90/8`、`leftSidebar 90/8`、`titlebar 100/60`、`thinkingTrigger 100/60`、`sidebarAlpha 85 / sidebarBlur 8` **全部不生效**；真正生效的是全局 `glassAlpha 80 → a=0.13`、`blur 9px`、`glassFidelity 35 → floor 0.1575`、`chatGlassFidelity 10 → chat floor 0.045`。逐项换算见 §4。

---

## 1. 玻璃配方（浅 / 深两套，可直接粘贴）

### 1.1 五层解剖

| 层 | 作用 | 实现 | WE 取值 |
|---|---|---|---|
| ① 染色底 | 让壁纸"化开"而不是"被涂掉" | `background-color`（**token**：`--dsw-specific-input-major` / `--dsw-specific-bubble` / `--dsw-alias-bg-layer-*` / 自绘面的 `color-mix`） | 地板色@floor + 釉色@a，见 §2.2 |
| ② 顶部镜面高光 | "湿玻璃"的唯一来源；纯 tint 只会显得脏 | `background-image: linear-gradient(180deg, …)`，顶部最亮、38% 处腰点、底部几乎归零 | 聊天面 `0.16 / 0.05@38% / 0.02`；面板 `0.10 / 0.03 / 0.05`；轨迹 `0.14 / 0.04 / 0.01`；深色面板 `0.07 / 0.02 / 0.03` |
| ③ 霜 | 把壁纸的低频色"熔"成柔光；同时压掉高频残字 | `backdrop-filter: blur() saturate() brightness() contrast()` | `blur(var(--we-blur)) saturate(1.3) brightness(1.04) contrast(1.01)`（设置窗口/浮层/左栏/标题栏用各自 blur） |
| ④ 内高光 + 发丝边 | "有厚度"的玻璃 | `box-shadow: inset 0 1px 0 …`（顶折射）＋ `inset 0 -1px 0 …`（底反光）＋ `inset 0 0 0 0.5px …`（发丝边） | `0.32 / 0.08 / 0.08`（聊天面）；面板按 `sheen × 0.32 / 0.08 / 0.06` |
| ⑤ 外投影 | 浮起关系 | `box-shadow: 0 …` | 卡片 `0 12px 40px rgba(0,0,0,0.12)`；设置窗 `0 24px 80px rgba(0,7,18,0.35)`；浮层提示 `0 18px 48px rgba(0,0,0,0.4)` |

> WE 原文（styles-shell.js 头注释）："The recipe is Apple-like, not a plain blur: LARGE-radius blur + a modest constant saturation + brightness/contrast lift … a top-weighted specular gradient — the sheen is what makes the surface read as 'wet glass', not a flat tint; a light, low-alpha base (not a dark one) so the wallpaper shows through; a 1px top refraction highlight + 0.5px hairline + soft elevation shadow for 'thick glass'."

### 1.2 推荐配方（新引擎默认值 · 浅色）

```css
/* ── 浅色 ──────────────────────────────────────────────────────────────
   tint  = 釉色（钳制后可读性底色，WE 默认 #ffffff）
   floor = READABILITY_FLOOR × fidelity = 0.45 × 1 = 0.45
   aN    = 该面的釉层 alpha（见 §4.4 三级表）                                */
body {
  /* 三级填充：合成结果 = 纯 tint + effAlpha */
  --dsg-fill-l1: color-mix(in srgb, #ffffff calc(0.45 * 100%),
                  rgba(255 255 255 / 0.12) calc((1 - 0.45) * 100%));   /* eff 51.6% */
  --dsg-fill-l2: color-mix(in srgb, #ffffff calc(0.45 * 100%),
                  rgba(255 255 255 / 0.40) calc((1 - 0.45) * 100%));   /* eff 67.0% */
  --dsg-fill-l3: color-mix(in srgb, #ffffff calc(0.45 * 100%),
                  rgba(255 255 255 / 0.72) calc((1 - 0.45) * 100%));   /* eff 84.6% */

  /* 霜：三级各自一个半径，饱和/亮度/对比全局常量 */
  --dsg-backdrop-l1: blur(20px) saturate(1.30) brightness(1.04) contrast(1.01);
  --dsg-backdrop-l2: blur(16px) saturate(1.30) brightness(1.04) contrast(1.01);
  --dsg-backdrop-l3: blur(10px) saturate(1.30) brightness(1.04) contrast(1.01);
  --dsg-backdrop-l3-dialog: blur(12px) saturate(1.30) brightness(1.04) contrast(1.01);  /* 大面积 dialog 用，勿复用菜单 24px */

  /* 镜面高光（顶部加权） */
  --dsg-sheen-l1: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03) 38%, rgba(255,255,255,0.02));
  --dsg-sheen-l2: linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05) 38%, rgba(255,255,255,0.02));
  --dsg-sheen-l3: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03) 38%, rgba(255,255,255,0.05));

  /* 内高光 / 发丝边 / 外投影（L2 为例，L1/L3 换外投影即可） */
  --dsg-bevel-l2:
    inset 0 1px 0 rgba(255,255,255,0.32),
    inset 0 -1px 0 rgba(255,255,255,0.08),
    inset 0 0 0 0.5px rgba(255,255,255,0.08),
    0 12px 40px rgba(0,0,0,0.12);
  --dsg-bevel-l1:
    inset 0 1px 0 rgba(255,255,255,0.24),
    inset 0 -1px 0 rgba(255,255,255,0.06),
    inset 0 0 0 0.5px rgba(255,255,255,0.06),
    0 8px 24px rgba(2,6,23,0.10);
  --dsg-bevel-l3:
    inset 0 1px 0 rgba(255,255,255,0.22),
    inset 0 0 0 1px rgba(255,255,255,0.06),
    0 24px 80px rgba(0,7,18,0.30);

  /* 边线（宿主 border token 用中性灰，避免染玻璃色相） */
  --dsg-border-hair: rgba(180,180,180,0.35);
}
```

```css
/* ── 深色 ──────────────────────────────────────────────────────────────
   tint = #0d1524（WE 深色地板兜底色；用户选了玻璃色则被钳制后的值取代）
   floor = 0.59 × fidelity                                                  */
body[data-ds-dark-theme] {
  --dsg-fill-l1: color-mix(in srgb, #0d1524 calc(0.59 * 100%),
                  rgba(13 21 36 / 0.16) calc((1 - 0.59) * 100%));       /* eff 65.6% */
  --dsg-fill-l2: color-mix(in srgb, #0d1524 calc(0.59 * 100%),
                  rgba(13 21 36 / 0.42) calc((1 - 0.59) * 100%));       /* eff 76.2% */
  --dsg-fill-l3: color-mix(in srgb, #0d1524 calc(0.59 * 100%),
                  rgba(13 21 36 / 0.72) calc((1 - 0.59) * 100%));       /* eff 88.5% */

  --dsg-sheen-l1: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02) 38%, rgba(255,255,255,0.01));
  --dsg-sheen-l2: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03) 38%, rgba(255,255,255,0.01));
  --dsg-sheen-l3: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02) 38%, rgba(255,255,255,0.03));

  --dsg-bevel-l2:
    inset 0 1px 0 rgba(255,255,255,0.14),
    inset 0 -1px 0 rgba(255,255,255,0.05),
    inset 0 0 0 0.5px rgba(255,255,255,0.08),
    0 12px 40px rgba(0,0,0,0.28);
  --dsg-bevel-l1:
    inset 0 1px 0 rgba(255,255,255,0.12),
    inset 0 -1px 0 rgba(255,255,255,0.04),
    inset 0 0 0 0.5px rgba(255,255,255,0.06),
    0 8px 24px rgba(0,0,0,0.20);
  --dsg-bevel-l3:
    inset 0 1px 0 rgba(255,255,255,0.12),
    inset 0 0 0 1px rgba(255,255,255,0.06),
    0 24px 80px rgba(0,0,0,0.45);

  --dsg-border-hair: rgba(255,255,255,0.10);
}
```

### 1.3 各面差异化配方（WE 原样，供逐面抄）

| 面 | 填充 | 高光 | 内高光/发丝/外投影 | 霜 |
|---|---|---|---|---|
| 输入卡 / 消息气泡 / 工具弹卡（同一张表） | token（`--dsw-specific-input-major` / `--dsw-specific-bubble`），见 §2.2 | `0.16 / 0.05@38% / 0.02` | `0.32 / 0.08 / 0.5px 0.08` + `0 12px 40px .12` | `blur(--we-blur) sat 1.3 bright 1.04 con 1.01`（输入卡在 `::before`） |
| 左栏 / 标题栏 / 右栏 / better-sidebar 面板 | `color-mix(地板 floor%, tint alpha%)` | 面板三档 `sheen-a/b/c`（浅 .10/.03/.05，深 .07/.02/.03）；标题栏**单停靠点** `sheen-a`（见 §5.6） | `sheen×0.32 / sheen×0.08 / sheen×0.06` | 左栏在 `::before`；标题栏在 `::after`；右栏直接 |
| 设置窗口（整窗 `[role=dialog]`） | 三层 token 用 `0.9 / 1.0 / 1.1` 层权重 | `0.10 / 0.03 / 0.05`（深 .07/.02/.03） | `0.22 / inset 0 0 0 1px 0.06` + `0 24px 80px rgba(0,7,18,.35)` | `blur(--we-settings-window-blur)`（用户 8px） |
| 轨迹面板 | 复用父层 token，**不再叠底** | `0.14 / 0.04@38% / 0.01` | `0.32 / 0.08 / 0.06`（无外投影） | `blur(--we-blur)` |
| 工具结果板（7 个锚点） | `--we-tool-glass-fill` = `rgba(tint, a + 0.06)`（**不过地板**） | `0.16 / 0.05@38% / 0.02` | — | `blur(--we-blur)` |
| 行内代码 / 新会话 / 导航胶囊 | `rgba(capsule-tint, 0.10)` | — | `border-color rgba(255,255,255,.14)` | `blur(--we-inline-code-blur)`（默认 8，用户 6） |
| 更新提示 / 仓库抽屉 | `color-mix(tint a×90%, 地板 max(floor,.82))` | `0.14 / 0.03@40% / 0.01` | `inset 0 1px 0 .18` + `0 18px 48px .4` + `1px solid rgba(255,255,255,.22)` | `blur(--we-floaters-blur) sat 1.2`（**注意：这里 sat 写死 1.2，不吃全局**） |
| 预设介绍模态（插件自有） | `rgba(18,20,26,0.82)`（恒定深色，白字） | — | `1px rgba(255,255,255,.16)` + `0 18px 48px .5` | `blur(18px) sat 1.2` |

---

## 2. 公式语义（readability floor / glassFidelity / chatGlassFidelity / transparency / blur）

### 2.1 三条互相独立的曲线

**(A) 全局玻璃透明度**（`glassAlpha`，0–100，"越大越透"）：

```
a = max(0.10, 0.25 − p/100 × 0.15)
    p=0→0.250  p=20→0.220  p=50→0.175  p=80→0.130  p=100→0.100
```

注释原文：`0% → ~0.25 (frosted, solid-ish), 60% → ~0.10`；下限 0.10 是"染色地板下限不再让颜色在拉满端消失，旧值 0.03 会让玻璃色份额塌到 ~1%、只剩主题底色 = 用户报的'拉满变黑/变白'"。

**(B) 每个玻璃面自己的透明度**（`glassMode[面] === 'custom'` 才读，否则读全局 `glassAlpha`）：

```
a面 = max(0.10, 0.25 − p面/100 × 0.15)          // 与全局同形，同刻度
--we-settings-window-alpha / -blur                // settingsWindow
--we-floaters-alpha / -blur                       // floaters
--we-thinking-trigger-alpha / -blur               // thinkingTrigger
--we-left-sidebar-alpha / -blur                   // leftSidebar
--we-titlebar-alpha / -blur                       // titlebar（曲线逐字照抄左栏）
```

**(C) dsh-better-sidebar 侧栏**（唯一一条非线性曲线）：

```
sidebarAlpha   = max(0.015, 0.32 − p/100 × 0.305)      // p=0→0.320  p=60→0.137  p=85→0.061  p=100→0.0175
sidebarSheen   = min(1, sidebarAlpha / 0.2236)          // 釉光随透明度衰减（0.2236 = 12% 档的 alpha）
sidebarTint(%) = 20 + (100 − p)/100 × 28                // 色染权重 20%–48%，独立于 alpha（否则拉满档颜色失效）
sidebarSaturate= 1.15 + blur × 0.028                    // ⚠️ 侧栏这条是"耦合斜坡"，与全局的常量政策不同
```

**(D) 内容面（编辑器 / 终端）近不透明底**：

```
--we-content-surface-alpha = max(20, 100 − p × 0.8) + "%"   // p=0→100%  p=20→84%  p=100→20%
background-color: color-mix(in srgb, var(--we-content-surface-color) max(floor×100%, content-alpha), transparent)
```

> ⚠️ 这条映射是"整段 0–100 → 100%–20%"，p=100 仍留 20% 底 —— 注释写明"低于 ~40% 不透明度注释可读性会再次变差，留给用户自行权衡"。

**(E) 模糊**：`--we-blur = blur px`（0–60，0 = 关霜）。逐面 blur 走各自变量，量纲统一 0–60px，**无曲线**（"模糊类是直接量，只钳制不换算"）。

### 2.2 color-mix 地板数学（预乘推导，务必按这个实现）

WE 的写法（以 `--dsw-alias-bg-layer-2` 为例）：

```css
--dsw-alias-bg-layer-2: color-mix(in srgb,
  var(--we-readability-base) calc(var(--we-readability-floor) * 100%),
  color-mix(in srgb, var(--we-surface-tint-light, #fff) calc(var(--we-glass-alpha) * 1.0 * 100%), transparent) calc((1 - var(--we-readability-floor)) * 100%));
```

`color-mix` 在**预乘空间**插值，权重会乘上操作数自身 alpha。设地板为不透明色 `C_b`（alpha 1，权重 `F`）、釉色 `C_t`（alpha `a`，权重 `1−F`），则：

```
结果 alpha      = F + (1−F)·a
结果颜色（直通） = (F·C_b + (1−F)·a·C_t) / (F + (1−F)·a)
```

**在 WE 里 `C_b === C_t`（`--we-readability-base: var(--we-surface-tint-light)`）**，所以颜色恒等于 tint，只剩 alpha：

```
effAlpha = floor + a·(1 − floor) ≥ floor      ← 地板不可被滑杆击穿的全部数学
```

推论（写进新引擎的验收判据）：

- **每个玻璃面 = 一种纯色 + 一个 alpha**。不要指望"地板色"提供第二种颜色，它是同一色相的"不透明版本"。
- 想更透只能改 `a`，想更清晰只能改 `floor`（= 改 `fidelity`），二者正交。
- 深色下 `a` 再乘 `0.4`（气泡 `0.33`），**只缩放 `a` 那一项**，floor 不动 ⇒ 深色不会把地板"乘穿"。

### 2.3 `weClampSurfaceColor(hex, theme, fidelity)` 两段式（伪代码，可直接照抄）

```js
function clampSurfaceColor(hex, theme, fidelity) {
  const f = clamp01(fidelity ?? 1);
  const F = theme === 'dark' ? 0.59 : 0.45;                 // 满档地板权重（常量，与滑杆无关）
  const darkFactor = theme === 'dark' ? 0.4 : 1;            // 深色釉层因子
  const aMin = F + 0.10 * darkFactor * (1 - F);             // 最坏 alpha：地板 + 最透档釉 × 深色因子
  const passes = (c) => {                                   // 最坏背衬下正文对比度
    const comp = c.map(v => v * aMin + (theme === 'dark' ? 255 : 0) * (1 - aMin));
    const contrast = theme === 'dark' ? 1.05 / (lum(comp) + 0.05) : (lum(comp) + 0.05) / 0.05;
    return contrast >= 4.6;                                 // 4.6 而非 4.5：hex 量化留舍入余量
  };
  let clamped = rgb;
  if (!passes(rgb)) {                                       // 二分向"纯黑/纯白"压，直到过线
    const target = theme === 'dark' ? [0,0,0] : [255,255,255];
    let lo = 0, hi = 1;
    for (let i = 0; i < 12; i++) { const t = (lo+hi)/2;
      passes(mix(rgb, target, t)) ? hi = t : lo = t; }
    clamped = mix(rgb, target, hi);
  }
  // 第二段：向用户原色线性回退（f=1 逐位现状，f=0 原色直出，中间单调）
  return f >= 1 ? clamped : clamped.map((v, j) => v * f + rgb[j] * (1 - f));
}
```

常量出处：`READABILITY_FLOOR = 0.45`、`READABILITY_FLOOR_DARK = 0.59`，实测网格 `玻璃透明度 {0,15,30,45,60} × 主题 {light,dark} × 壁纸透明度 {0,50,90}`，最坏点 4.63:1（浅色 0.44194→0.45 在气泡最大透明度；深色 0.58136→0.59 在设置窗 layer-3 最透档）。

### 2.4 地板与保真度的分工（一个滑杆，两半）

```
--we-readability-floor      = 0.45|0.59 × --we-glass-fidelity     // 地板覆盖度
--we-chat-readability-floor = 0.45|0.59 × --we-chat-glass-fidelity // 仅气泡/输入卡/工具弹卡
tint                          = weClampSurfaceColor(色, 主题, fidelity) // 釉色回退幅度
```

- 两处**必须同源**，否则滑杆不再是"一个旋钮"（WE 有守卫 `F1c`：`floor` 声明必须紧跟 `base` 声明，插在中间会让整条可读性网格读到 null）。
- `chatGlassFidelity` **只作用对话栏的"框架面"**：气泡（`--dsw-specific-bubble`）、输入卡（`--dsw-specific-input-major`，含读同一 token 的工具弹卡）。**markdown 内容面（代码块 / 行内代码 / 标签 / 引用）不跟它**，跟全局 `glassFidelity`（用户口径："代码块不和输入框一起"）。
- 体验后果（用户配置 `glassFidelity 35 / chatGlassFidelity 10` 的实测换算见 §4）：保真度越低，釉色越接近用户原色、地板越薄、正文在最坏壁纸上越危险；`f=0` 时 `effAlpha = a`（纯釉层，无地板）。
- **新引擎的强制偏离：L3 的地板不乘 fidelity，且不需要新 token**。WE 只有一个地板常量（所有面同权），但新引擎有"A 预设只给 L1/L2 减薄、L3 恒为 B 档"的需求（§4.4b 护栏 #4）⇒ 做法就一行：`--dsg-fill-l1/l2` 的地板槽位读 `var(--dsg-floor)`（= base × fidelity），`--dsg-fill-l3` 的地板槽位直接读 `var(--dsg-floor-base-light|dark)`。红线没有被放松，而是把"L3 永不参与降薄"从纪律变成结构：**L3 根本没有可被 fidelity 影响的输入**（§6.4）。

### 2.5 滑杆 → 像素 / alpha 速查

| 设置项 | 范围 | 默认 | 映射 |
|---|---|---|---|
| `blur`（雾化） | 0–60 px | 16 | 直接当 px，无曲线；逐面 `*Blur` 同刻度 |
| `glassAlpha`（玻璃透明度） | 0–100 % | 20 | `max(0.10, 0.25 − p×0.15/100)` |
| `glassFidelity`（玻璃保真度） | 0–100 % | 100 | `f = p/100`；floor = 0.45/0.59 × f；tint 向原色回退 1−f |
| `chatGlassFidelity`（对话框玻璃保真度） | 0–100 % | 100 | 同上，仅对话栏框架面 |
| `scrim`（暗化） | 0–1 | 0.25 | `rgba(0,0,0,s)` 铺在壁纸上、UI 之下（`z-index:-1`） |
| `border`（边框） | 0–1 | 0.35 | `rgba(180,180,180,α)` → `--dsw-alias-border-l1/l2/l2-darkmode-thin` |
| `*Transparency`（逐面） | 0–100 % | 100 | 同 (A) 曲线 |
| `*Blur`（逐面） | 0–60 px | 60 | 直接当 px |
| `capsuleBlur`（胶囊） | 0–60 px | 8 | `--we-inline-code-blur` |
| `sidebarAlpha` | 0–100 % | 60 | `max(0.015, 0.32 − p×0.305/100)` |
| `sidebarContentAlpha` | 0–100 % | 38 | `max(20, 100 − p×0.8)%` |

---

## 3. 表面登记表

### 3.1 全部玻璃面（26 行）

tier 语义：**global** = 全局面（不受对话/窗口开关约束，吃全局 `--we-*`）；**chat** = 对话栏框架（吃 `--we-chat-*`）；**window** = 窗口/侧栏面（吃各自 `--*-alpha/-blur` + 全局地板）；**floaters** = 插件浮层。

| # | 面 | 稳定选择器 / token hook | tier | 透明度变量 | 模糊变量 | 备注 |
|---|---|---|---|---|---|---|
| 1 | 页面玻璃总锚点 | `body[data-we-glass-page]` | global | — | — | 与有无壁纸**正交**；恒挂，CSS 侧"这组规则画玻璃"的证书 |
| 2 | 宿主别名面（layer 1/2/3、抬高按钮、overlay、浮动/工具条按钮、引用/占位、border） | `body[data-we-glass-page]{ --dsw-alias-bg-layer-1/2/3, --dsw-alias-button-elevated-fill, --dsw-alias-bg-overlay, --dsw-alias-bg-module-platform, --dsw-alias-bg-multi-select, --dsw-alias-button-floating-fill, --dsw-alias-button-ghost-active-fill, --dsw-alias-button-tool-bar-fill, --dsw-alias-interactive-bg-active, --dsw-alias-interactive-bg-hover-solid, --dsw-alias-markdown-citation/placeholder }` | global | `--we-glass-alpha`（层权重 0.9/1.0/1.1/1.15/1.3/1.2） | —（这些面本身没有霜，靠父层） | 层权重沿用"角色分档"，每条都包地板 |
| 3 | 页面基色 / 左栏让开 | `body[data-we-wallpaper]{ --dsw-alias-bg-base, --dsw-specific-sidebar-fill }` + 深色孪生 + `[class*="_frame"] / [class*="_root"]` 兜底清底 | global | — | — | 宿主新构建主容器自带实心底 ⇒ token 清底会落空，必须**再清宿主容器类** |
| 4 | 输入卡 | `[data-composer-card]`（座位祖先 `[data-composer-seat]`） | chat | `--dsw-specific-input-major` | `blur(--we-blur)` 在 **`::before`** | 卡片本体 `backdrop-filter:none`；sheen+外投影在卡片上 |
| 5 | 消息气泡 | `[class*="_bubble"]:not([role="tooltip"])` | chat | `--dsw-specific-bubble` | `blur(--we-blur)` 在元素自身 | `_bubble` 是构建哈希后缀；`role="tooltip"` 豁免是**强制**的（#161） |
| 6 | 工具弹卡（提问 / 计划审阅 / 审批） | `[data-question-key] [class*="_card"]`、`[data-plan-review-key] [class*="_card"]`、`[data-approval-key] [class*="_card"]` | chat | 同 #4（读同一 token） | `blur(--we-blur)` | 必须用容器锚点收窄，裸 `[class*="_card"]` 会误伤 `_cardBody`/hovercard |
| 7 | 思考触发条 | `[data-turn-trigger]`（宿主 token `--dsw-alias-turn-trigger-bg` / `-hover`） | global | `--we-thinking-trigger-alpha` | `blur(--we-thinking-trigger-blur)` | 门下（`data-we-thinking-glass`）；**不清底、吃玻璃**；hover 档一起接管（权重 1.15） |
| 8 | 轨迹内容区 | `[class*="_tablePane"]`、`[class*="_overviewPreview"]`、`[class*="_programPanel"]` | global | 复用父层 token | `blur(--we-blur)` | **只补霜+釉，不再叠底**（叠底会让两层地板相乘） |
| 9 | 原生左栏 | `div:has(> [data-slot="sidebar"])` | window | `--we-left-sidebar-alpha` | `blur(--we-left-sidebar-blur)` 在 **`::before`** | 出口 div 带 `display:contents` 不生成盒子 ⇒ 必须 `:has()` 选**父元素**；`border-right: none` 显式写 |
| 10 | 桌面标题栏 | `html[data-windows-titlebar] … div[class*="pI_x6G_frame"]::before`（底/釉/配色）+ `::after`（模糊） | window | `--we-titlebar-alpha` | `blur(--we-titlebar-blur)` 在 `::after` | 必须拆两个伪元素，否则底色不过 saturate/brightness ⇒ 与左栏出色差 |
| 11 | 第三方侧栏面板 | `[data-dsh-better-sidebar] [class*="_panel"]`、`[class*="_boundaryError"]` | window | `--we-sidebar-tint`（色染权重） | `blur(--we-sidebar-blur)` | 总开关 `data-we-sidebar-glass` |
| 12 | 第三方侧栏内部 chrome | `[data-dsh-better-sidebar] [class*="_pane"/"_tabBar"/"_paneCard"/"_editorHeader"/"_explorerHeader"/"_gitHeader"/"_browserBar"/"_terminalWrap"]` | window | 色染 ×0.75（深色 ×0.65/0.5 分档） | —（霜只在根面板，一层） | "one blur per shell" |
| 13 | 官方右栏面板 | `[data-sidebar-right-panel][data-sidebar-right-open]` | window | `--we-sidebar-tint` | `blur(--we-sidebar-blur)` | **必须带 `[data-sidebar-right-open]`**；收起态显式清空（容器留在布局里，只隐藏子元素） |
| 14 | 右栏层级抬升 | 同上 + `z-index: var(--dsh-dockkit-dock-layer, 10)` | window | — | — | `backdrop-filter` 自成层叠上下文 ⇒ 全屏右栏会被输入卡/hero 穿透（#150） |
| 15 | 内容面（编辑器/终端） | `[data-dsh-better-sidebar] .cm-editor`、`.xterm`（+ 右栏内的同款） | window | `--we-content-surface-alpha` / `-color` | — | 近不透明（默认 84–88%），保护 shiki / ANSI 固定配色 |
| 16 | 设置窗口整窗 | `body[data-we-glass-window] [role="dialog"]:has([data-slot="settings.section"])` | window | `--we-settings-window-alpha`（层权重 0.9/1.0/1.1） | `blur(--we-settings-window-blur)` | 整窗 token 接管：nav active/hover、brand、button-primary、`--dsw-alias-label-primary-foreground`（按 accent 亮度选墨） |
| 17 | 设置窗口 accent 隔离 | 同上块内 `--we-accent: initial` | — | — | — | 防第三方分区拿 `--we-accent` 当**文字色** ⇒ 黄底黄字（#127）；块内消费改读 `--we-accent-src` |
| 18 | 插件源浮层（注册表） | `body[data-we-glass-floaters] [data-install-registry]` | floaters | —（底色归宿主） | `blur(--we-floaters-blur)` | 宿主 portal 到 `body`、实底无霜 ⇒ **只补霜不动底色** |
| 19 | 插件浮层（更新提示/仓库抽屉/预设介绍） | `.we-update-notice`、`.we-repo-panel--open`、`.we-preset-intro` | floaters | `--we-floaters-alpha`（见 §1.3） | `blur(--we-floaters-blur)`（预设介绍写死 18px sat 1.2） | 自有类名，不依赖宿主 |
| 20 | 宿主 Modal 遮罩 | `--dsw-mask-blur`（宿主遮罩自绘 `backdrop-filter: var(--dsw-mask-blur)`） | global | — | 重声明 token 为 `blur(--we-blur) saturate(1.3) brightness(1.04) contrast(1.01)` | 一次覆盖**所有** `role=dialog`/灯箱/设置 / 图片查看器，不必逐选择器补 |
| 21 | 菜单 / 下拉 / 悬停面板 | `--dsw-specific-menu` + `--dsw-menu-backdrop-filter`（宿主在 `*_panel`/`*_menu` 元素或它们的 `::before` 上消费） | window | 宿主值：浅 `#f8f9fa94`(58%)、深 `#43454a73`(45%)；darwin 覆写 `#f8f9faf0`/`#303136f0`(94%) | 宿主 `blur(40px) saturate(150%)` | **WE 完全不碰菜单**；新引擎要接就在 body 上重声明这两个 token，别给菜单画自己的板子 |
| 22 | Tooltip | `[role="tooltip"]`（宿主类名也是 `_bubble_*`） | **豁免** | 保持 `--dsw-alias-tooltip-bg` 不透明 | 不加霜 | 白字+深底；给玻璃会把对比度打到 1.07–1.13:1（#161） |
| 23 | 工具结果板（7 锚点） | `[data-chat-flow-kind="context"] [data-context-injection-body]`、`[data-terminal]`、`[data-tool="read"] [data-read]`、`[data-tool="grep"] [data-search="matches"]`、`[data-tool="glob"] [data-search="paths"]`、`[data-tool="write"] [data-diff]`、`[data-variant="others"] [class*="_ioCard"]` | chat | `--we-tool-glass-fill`（`a + 0.06`，**不过地板**） | `blur(--we-blur)` | 门：`data-we-thinking-glass`；同时把 `--dsw-alias-markdown-code-block(-banner)`、`--dsl-code-block-background` 置透明 |
| 24 | 代码块吸顶条 | `[data-chat-flow] .md-code-block > :has(> [data-code-block-banner])` | global | 地板 floor + 釉 `a×0.6` | `blur(--we-blur)` | 宿主 sticky 载体读 `--dsw-alias-bg-base`，被我们置透明后必须**重铺底板**，否则滚动时复制按钮直接压在正文上（#156④） |
| 25 | 胶囊族 | `[data-dsh-navbar] > button[data-vlln-load-older]`、`[data-slot="conversation.view"] button[class*="_toBottom"]`、`[data-slot="sidebar"] :not([class*="_collapsed"]) > button[class*="_newSession"]` | chat | `--we-capsule-glass-fill`（`rgba(capsule-tint, --we-inline-code-alpha=0.10)`） | `blur(--we-inline-code-blur) sat 1.3` | 局部重声明 `--dsw-alias-bg-layer-2` / `interactive-bg-hover` / `button-floating-fill` 保 hover/disabled |
| 26 | 滚动条 | `--dsw-alias-scrollbar-bg-l1/l2`、`hover-l1/l2`；`[data-conversation-scroll]::-webkit-scrollbar-thumb` | global / chat | 宿主 4 token 重声明：`color-mix(玻璃色 65%, 静态中性色)` | —（Chromium 原生滚动条**不画 backdrop blur**，实测"条纹探针"） | 65% 是 2026-10-12 从 40% 提上来的：40% 会把低饱和深色玻璃色的色相洗掉 |

### 3.2 可复用的 DSH 稳定 hook 白名单（含稳定性判断）

稳定性判断全部来自 WE 源码注释（"不许猜 CSS 模块哈希"是那仓的纪律），**不引用 `data-we-*`/`--we-*`（那是 WE 自己的命名空间）**。

| hook | 稳定性 | 代码依据 / 备注 | 建议用法 |
|---|---|---|---|
| `[data-composer-card]` | **高** | 源码写死（`dsh-client-ui-conversation` JSX `"data-composer-card": true`）；WE："authored in the shell source and survives rebuilds"；宿主还有 5 处 `.closest("[data-composer-card]")` 用它做锚 | L2 输入卡；**模糊必须挂 `::before`** |
| `[data-composer-seat]` | **高** | 源码写死（同文件 `"data-composer-seat": ""`）；WE："锚点取宿主源码里写死的 data-composer-seat / data-conversation-region" | 只做**纯配色**作用域（发送键 `--dsw-alias-button-info-fill`）；**不挂霜、不铺底板**（内有 fixed 后代 + 历史撤回） |
| `[data-slot="sidebar"]` | **高（需 `:has()`）** | slot 渲染器给每个出口盖 `data-slot="<slotKey>"`；出口带 `display:contents` **不生成盒子** ⇒ 只能 `div:has(> [data-slot="sidebar"])` 选父 | L2 左栏列；`border-radius` 也挂这里 |
| `[data-chat-flow]` | **高** | 源码写死 `"data-chat-flow": ""`（chat + conversation 两处）；WE 用作正文子树作用域 | 作用域锚（不要用来画板） |
| `[data-conversation-scroll]` | 高 | 宿主 CSS 里 `[data-conversation-scroll] .xxx` 与 `:has()` 双重使用 | 滚动条、滚动容器 |
| `[data-question-key]` | **高** | `"data-question-key": pending.key`（user-questions JSX） | 提问卡容器；`[data-question-key] [class*="_card"]` |
| `[data-plan-review-key]` | **高** | `"data-plan-review-key": pending.key`（user-questions） | 计划审阅卡容器 |
| `[data-approval-key]` | **高** | `"data-approval-key": pending.key`（approval JSX；conversation 里还有 `closest("[data-approval-key], iframe, .xterm, [inert]")` 的语义使用） | 审批卡容器 |
| `[data-turn-trigger]` | 高 | `"data-turn-trigger": true`（chat JSX） | 思考触发条 |
| `[data-sidebar-right-panel]` | 中高 | 宿主数据属性；**必须叠加 `[data-sidebar-right-open]`**（收起时容器仍在布局里） | 右栏面板 |
| `[data-slot="settings.section"]` | **高** | slot 出口盖章；WE 用 `[role="dialog"]:has([data-slot="settings.section"])` 锁定设置整窗 | 设置窗 |
| `role="dialog"` | 高（语义属性） | 宿主 Modal 契约；`--dsw-mask-blur` 通道挂在它的遮罩上 | L3 弹窗 |
| `role="tooltip"` | **高** | 全 asar 仅出现一次（`dsh-client-ui-chat` Tooltip） | **豁免令牌**（唯一的反向 hook） |
| `class*="_bubble"` | 中 | CSS Module 哈希后缀；WE："if that ever stops matching the bubble stays translucent, just without the blur"（失效=退化成"半透明无霜"，优雅降级） | L2 气泡；**必须带 `:not([role="tooltip"])`** |
| `class*="_card"` | 低（宽） | 会命中 `_cardBody`/hovercard 等；WE 明确只在三个容器锚点下用 | 只在 `[data-*-key]` 内使用 |
| `class*="_tablePane"/"_overviewPreview"/"_programPanel"` | 中 | WE 实测"全宿主只有轨迹模块在用"；`_details`/`_split` 别的模块也有 ⇒ 不碰 | 轨迹 |
| `class*="_panel"/"_pane"/"_tabBar"/…` | 中 | 只对 `[data-dsh-better-sidebar]` 子树用 | 第三方侧栏 |
| `.cm-editor` / `.xterm` | 高（库全局类） | WE："library-global class names (stable across the sidebar's builds)" | 内容面 |
| `.dshDesktopSidebarSurface` | 低（版本相关） | 壳层类；只在存在时生效，规则保留为无害兼容项 | 桌面壳兜底 |
| `div[class*="pI_x6G_frame"]` | **低（构建哈希子串）** | WE 明确：哈希漂移最坏后果是"本块不生效"，失败安全；**绝不许与已验证选择器放进同一逗号列表**（选择器列表一损俱损） | 仅 Windows 标题栏，独占一条规则 |
| `--dsw-mask-blur` | 高（宿主 token 通道） | 主题值 `none`；宿主遮罩元素自绘 `backdrop-filter: var(--dsw-mask-blur)` | 模态遮罩霜 |
| `--dsw-specific-menu` + `--dsw-menu-backdrop-filter` | 高（宿主 token 通道） | 宿主主题：`#f8f9fa94` / `#43454a73` + `blur(40px) saturate(150%)`；`html[data-platform=darwin] body` 用 (0,1,2) 特异度覆写成 94% | 菜单 |
| `[data-menu-material]` | 中 | 宿主只在其上改 `--dsw-elevation-stroke-color`（主题文件实测），**不是**菜单填充的必经锚点 | 如需可加，但不要依赖 |

### 3.3 WE 的门控属性（新引擎对应换 `data-dsg-*`，语义照抄）

| WE 属性 | 写者 | 含义 |
|---|---|---|
| `data-we-glass-page` | applyGlass，**恒挂** | 页面玻璃在算值（与壁纸无关）。新引擎建议 `data-dsg-glass` |
| `data-we-glass-chat` / `-window` / `-floaters` | applyGlass，**恒挂** | 三族面"画玻璃"的证书（没有"关掉回原生"的开关，见 §5.11） |
| `data-we-wallpaper` | syncLayers | 壁纸在台 ⇒ 页面/侧栏让开（透明） |
| `data-we-glass-fallback` | detectSoftwareRender() | 软件光栅 ⇒ 近不透明回退 |
| `data-we-thinking-glass` / `data-we-thinking-native` | applyEffects，互斥 | 思考块三挡（原生挡赢） |
| `data-we-left-sidebar` / `-radius` / `-square` | applyGlass | 左栏玻璃 / 圆角 / 直角 |
| `data-we-titlebar-glass` | applyGlass | 标题栏玻璃（乙类：关=恢复宿主不透明底） |
| `data-we-sidebar-glass` / `-follow` / `-fullclear` | applyGlass | 第三方侧栏玻璃 / 跟随全局 / 三态全透明 |
| `data-we-adapter="browser"\|"desktop-official"\|…` | 适配探测 | 只在对应宿主形态下启用桌面壳规则 |
| `body[data-ds-dark-theme]` | 宿主 | 深色主题孪生块（每条浅色映射必须有深色孪生，WE 守卫 G8 会判红） |

### 3.4 真实 DOM 对齐（`.ref/dom/surface-tree.txt` / `tree.json` 实测）

快照条件：`dark:false`、`dsg:"on"`、当前为**浅色 + 基础氛围层**（`div.dsg-atmosphere` 已存在），尚未加卡片玻璃。`tree.json.computed` 是那 20 个探针的**实测 computed 值**（bg / image / backdrop / radius / border / shadow / color / font / padding / overflow / position）。

**3.4.1 主壳树（已剥离 svg/span 噪音，`→` 后为实测 computed）**

```
body
├ div.dsg-atmosphere[aria-hidden]                     ← 氛围层（自家资产）
│   ├ i.dsg-aurora.dsg-aurora-a / -b / -c             ← 极光色斑
│   └ i.dsg-grid / i.dsg-grain                        ← 网格 / 颗粒
├ div > div[data-slot=root]
│ └ div.BynINW_frame[data-rightbar-collapsed=true]     → bg rgba(255,255,255,.34) · padding-top 40px · overflow hidden · position relative
│   ├ div.BynINW_sidebarCol                            → bg rgba(255,255,255,.34) · overflow hidden
│   │ └ div[data-slot=sidebar] → div._2H3hWW_root
│   │    ├ div._2H3hWW_logoRow[data-window-drag]       ← 品牌行（拖拽区）
│   │    ├ button._2H3hWW_newSession
│   │    ├ nav._2H3hWW_panelList > button._2H3hWW_panelRow[data-dsh-reorder]
│   │    ├ div[data-slot=sidebar.workspaces] > div._9lTDKa_root
│   │    │   ├ div._9lTDKa_sectionHeader（._9lTDKa_search / _9lTDKa_searchInput）
│   │    │   └ div._9lTDKa_listArea > div._9lTDKa_treeBody > div._9lTDKa_list[role=tree]
│   │    │       └ div._9lTDKa_groupSection > div.hIlkoa_projectRow[data-row-key=workspace:<uuid>][role=treeitem]
│   │    │           └ div.hIlkoa_sessionRow(.hIlkoa_selected)[data-row-key=session:<uuid>][role=treeitem]
│   │    └ div._2H3hWW_footArea > div._2H3hWW_settingsArea > [data-slot=sidebar.settings] > .wCInkW_triggerRow
│   ├ div.BynINW_centerCol                             → bg transparent · radius 16px 0 0 · overflow hidden
│   │ └ [data-slot=main] > [data-slot=main.conversation] > div.Dc7zOa_root[data-phase=active]
│   │    ├ header.Dc7zOa_header[data-window-drag]      ← .Dc7zOa_titleRow / .crumbs / .tabs > .Dc7zOa_tab(.tabActive)
│   │    ├ div.Dc7zOa_body[data-conversation-content][data-conversation-session=…][data-conversation-region=chat]
│   │    │   └ div.Dc7zOa_scrollBody[data-conversation-scroll]
│   │    │       └ [data-slot=conversation.session] > .Dc7zOa_viewArea > [data-slot=conversation.view]
│   │    │           └ .xz4KEq_frame > .xz4KEq_root > .xz4KEq_scroll > .xz4KEq_column[data-chat-flow]
│   │    │               └ .xz4KEq_flowItem[data-chat-flow-kind=user|assistant-step|tool-call|turn-process]
│   │    │                   └ [data-slot=conversation.chat.node]
│   │    │                       ├ .cJsG2q_userRow > .cJsG2q_userStack > .cJsG2q_bubble   → bg rgba(236,242,255,.62) · radius 20px
│   │    │                       ├ .WW4l1q_root[data-step-process] > .WW4l1q_title + .WW4l1q_content[data-chat-flow]
│   │    │                       │   └ .v5IAXa_root > ._3GBCTG_root[data-variant=think]（推理块）
│   │    │                       └ ._6O3mZG_callRow[data-chat-call-id] > [data-slot=tool.call.toolview] > .pFy1Ka_root[data-tool][data-variant]
│   │    └ div.Dc7zOa_composerSeat[data-composer-seat][data-conversation-region=composer]   → position **sticky** · image: 36px 透明渐变
│   │        ├ [data-slot=conversation.composer] > div[data-chain-overlay-fallback] > .Dc7zOa_composerStack
│   │        │   ├ [data-slot=conversation.input.dock] > .nJdiTq_dock[data-goal-bar] > .nJdiTq_bar   ← 目标条
│   │        │   └ [data-slot=conversation.composer.bar] > .RlGAzG_root > .RlGAzG_card[data-composer-card=true] → bg rgba(255,255,255,.62) · radius 28px · shadow 0 0 0 .5px rgba(56,88,158,.16) + 2 层柔影 · position relative
│   │        │        ├ .RlGAzG_overlayAnchor[data-composer-overlay]
│   │        │        ├ .RlGAzG_scroll[data-input-scroll] > .RlGAzG_input[data-composer-input][role=textbox]
│   │        │        ├ .RlGAzG_row > .RlGAzG_tools> .RlGAzG_add / .RlGAzG_modes > .dlU_AG_trigger（权限）
│   │        │        └ .RlGAzG_trailing > .RlGAzG_standardControls / .RlGAzG_activity / .RlGAzG_primary（发送/停止）
│   │        └ .RlGAzG_dock[data-composer-dock] > [data-slot=conversation.composer.dock]
│   │             ├ span.iq1doa_anchor[data-composer-stat=activity|usage] > button.iq1doa_pill
│   │             └ span._2WTFBq_root > button._2WTFBq_trigger（上下文用量）
│   ├ div.BynINW_rightbarCol[data-rightbar-col]
│   │ └ [data-slot=rightbar] > [data-slot=rightbar.session] > .OUqwTW_panel[data-sidebar-right-panel=push][aria-hidden=true]
│   │    └ .OUqwTW_panelBody > ._surface_6nhg2_125[data-dockkit-surface] > … > section._tabHost_[data-dockkit-pane]
│   │         ├ ._tabStrip_6nhg2_237[data-dockkit-strip][data-window-drag]（._tab_6nhg2_134[data-dockkit-tab]）
│   │         └ ._tabHostBody_6nhg2_181._paneBody_6nhg2_318
│   ├ div.BynINW_bottomRow[data-shell-bottom] > [data-slot=shell.bottom]
│   ├ div.BynINW_overlayLayer[data-shell-overlay] > [data-slot=shell.overlay]      ← 弹窗/浮层挂载点
│   └ div.BynINW_handle[data-side=sidebar]
├ span
├ div[data-dsh-genui-achievements=1]
├ div[data-windows-menu]                              ← Windows 原生菜单（保持不透明）
└ div[data-dsh-genui-achievements=1]
```

**3.4.2 表面 → 实测选择器 / 稳定 hook / 现状 / tier**

| # | 面 | 实测锚点（类名 = CSS Module 哈希，仅诊断用） | 首选稳定 hook | 现状 computed | tier |
|---|---|---|---|---|---|
| S1 | 应用外框（整窗底） | `.BynINW_frame` | `[data-slot="root"] > div`（结构）；`data-rightbar-collapsed` 只在开合时存在 | `rgba(255,255,255,.34)`，无 backdrop、无圆角 | **L1** |
| S2 | 左栏列 | `.BynINW_sidebarCol` | `div:has(> [data-slot="sidebar"])`（= sidebarCol，`:has` 单层可用） | `rgba(255,255,255,.34)` | **L2**（列本身） |
| S3 | 左栏内容根 | `._2H3hWW_root` | `[data-slot="sidebar"] > div`（一层） | 透明（继承列底） | 继承 L2 |
| S4 | 左侧栏行（会话/工作区） | `.hIlkoa_projectRow` / `.hIlkoa_sessionRow` | `[role="treeitem"][data-row-key^="workspace:"]` / `^="session:"`（`role=treeitem` 是 ARIA 契约，`data-row-key` 前缀稳定） | 透明；仅 hover/selected 有 tint | 继承 L2（**不单独加霜**） |
| S5 | 左栏列表容器 | `._9lTDKa_listArea` / `._9lTDKa_treeBody` / `._9lTDKa_groupSection` | 无稳定 hook ⇒ 不碰（靠列底） | 透明 | 继承 |
| S6 | 侧栏页脚 / 设置入口 | `._2H3hWW_footArea` / `._2H3hWW_settingsArea` / `.wCInkW_triggerRow` | `[data-slot="sidebar.settings"]`、`[data-slot="settings.launcher"]` | 透明 | 继承 L2 |
| S7 | 中列 | `.BynINW_centerCol` | `div:has(> [data-slot="main"])`（单层 `:has`） | transparent + `radius 16px 0 0` | **L1**（不要在这里再叠 fill，见 3.4.4） |
| S8 | 会话头 | `header.Dc7zOa_header`（`.titleRow`/`.crumbs`/`.tabs`/`.tab`） | `[data-slot="conversation.header"] > header`；tab 契约 `role=tab` + `[data-conversation-tabs]` | 透明；`[class*=_header]` 探针 231 个（**该后缀不可用**） | **L2**（sticky 头，需霜） |
| S9 | 会话体 / 滚动容器 | `.Dc7zOa_body` / `.Dc7zOa_scrollBody` | `[data-conversation-region="chat"]`、`[data-conversation-scroll]` | transparent；position relative | L1 |
| S10 | 消息流 | `.xz4KEq_frame/root/scroll/column` | `[data-slot="conversation.view"]`、`[data-chat-flow]` | transparent | L1 |
| S11 | 用户气泡 | `.cJsG2q_bubble` | `[class*="_bubble"]:not([role="tooltip"])`（哈希后缀，降级安全）；宿主 CSS 底 = `var(--dsw-specific-bubble)` | `rgba(236,242,255,.62)`，radius 20 | **L2** |
| S12 | 消息行/动作 | `.cJsG2q_userRow`、`.xD_KDq_actions` | `[data-slot="conversation.chat.node"]`、`[data-clock]` | 透明 | 继承（不碰 hover 命中区） |
| S13 | 过程组 / 步骤条 | `.WW4l1q_root` / `._title` / `._body` / `._content` | `[data-step-process]`、`[data-process-activity]`、`[data-chat-flow-kind="turn-process"]` | 透明 | **L2**（可给极淡底，勿加霜：内部有 `[data-shimmer]`） |
| S14 | 推理块 | `._3GBCTG_root[data-variant=think]`；`._row_k7ery_26[data-disclosure-row]` | `[data-variant="think"]`、`[data-disclosure-row]` | 透明 | L1（正文区，透明即可） |
| S15 | 工具行 | `.pFy1Ka_root[data-tool][data-variant][data-state]`；`.pFy1Ka_row` | `[data-slot="tool.call.toolview"] > div[data-tool]`、`[data-disclosure-row]` | 透明 | L1（展开后 `[data-tool=…]` 面板见 §3.1#23） |
| S16 | 输入座位 | `.Dc7zOa_composerSeat[data-composer-seat]` | `[data-composer-seat]` | **sticky**，36px 透明渐变底 | **不画**（只允许纯色 token 改写，见 §5.1） |
| S17 | 输入卡 | `.RlGAzG_card[data-composer-card]` | `[data-composer-card]` | `rgba(255,255,255,.62)`，radius 28，0.5px 冷色发丝边（box-shadow 实现） | **L2** |
| S18 | 输入卡内部（工具行/发送/权限） | `.RlGAzG_row/.tools/.add/.modes/.trailing/.standardControls/.activity/.primary` | `[data-slot="conversation.input.*"]`、`[data-composer-input]`、`[data-composer-overlay]` | 透明 | 继承 L2（**不加霜**） |
| S19 | 输入 dock / 统计胶囊 | `.RlGAzG_dock[data-composer-dock]`、`.iq1doa_pill`、`._2WTFBq_trigger` | `[data-composer-dock]`、`[data-composer-stat]`、`[aria-haspopup="dialog"]` | 透明，hover 才着色 | **L2 子档**（胶囊：`a+0.06`） |
| S20 | 目标条 | `.nJdiTq_bar`（`[data-goal-bar]`） | `[data-goal-bar]` | 透明（宿主 `--dsw-specific-menu` + `--dsw-menu-backdrop-filter` 在 `::before`） | **L3 子档**（菜单通道） |
| S21 | 右栏列 | `.BynINW_rightbarCol` | `[data-rightbar-col]` | transparent | L1（列本身） |
| S22 | 右栏面板 | `.OUqwTW_panel[data-sidebar-right-panel=push][aria-hidden=true]` | `[data-sidebar-right-panel]` + **开合条件改用 `:not([aria-hidden="true"])`**（见 3.4.3） | 透明（收起态） | **L2 / 全屏态 L3** |
| S23 | 右栏 dockkit 内容 | `._surface_6nhg2_125[data-dockkit-surface]`、`section._tabHost_[data-dockkit-pane]`、`._tabStrip_6nhg2_237[data-dockkit-strip]`、`._paneBody_6nhg2_318` | `[data-dockkit-surface]`、`[data-dockkit-pane]`、`[data-dockkit-strip]`、`[data-dockkit-pane-active]` | 透明 | **L2**（用户新加入的 `[data-dockkit-*]` 是最稳的一层） |
| S24 | 底部条 / 浮层挂载 | `.BynINW_bottomRow` / `.BynINW_overlayLayer` | `[data-shell-bottom]`、`[data-shell-overlay]` | 透明 | L1 / L3 容器 |
| S25 | 氛围层 | `div.dsg-atmosphere[aria-hidden]` + `i.dsg-aurora-a/b/c`、`i.dsg-grid`、`i.dsg-grain` | `.dsg-atmosphere`（自家类名，稳定） | 已存在 | **背衬，不是玻璃面**（禁止加 backdrop-filter） |
| S26 | 原生菜单 | `div[data-windows-menu]` | `[data-windows-menu]` | — | L3，保持不透明 |

**3.4.3 三类（L1 / L2 / L3）在 DSH 上的真实对应**

| tier | 真实元素（可直接写进选择器） | 载体策略 |
|---|---|---|
| **L1 内容面** | `[data-slot="root"] > div`（frame）· `div:has(> [data-slot="main"])`（centerCol）· `[data-conversation-region="chat"]` · `[data-conversation-scroll]` · `[data-slot="conversation.view"]` · `[data-chat-flow]` · `[data-variant="think"]` · `[data-disclosure-row]` · `[data-slot="tool.call.toolview"]` · `[data-shell-bottom]` | **只染色不挂霜**（画布级 blur 每帧重算；柔焦由 `.dsg-atmosphere` 资产提供）。L1 的"面"大多是 `position:static/relative` 的容器 ⇒ 无 fixed 包含块风险 |
| **L2 卡片 / 工具卡** | `[data-composer-card]`（`::before` 霜）· `[class*="_bubble"]:not([role="tooltip"])`（自身霜）· `div:has(> [data-slot="sidebar"])`（`::before` 霜）· `[data-rightbar-col] [data-sidebar-right-panel]:not([aria-hidden="true"])` · `[data-dockkit-pane]`/`[data-dockkit-surface]` · `[data-slot="conversation.header"] > header` · `[data-composer-dock]` · `[data-composer-stat]`/`.iq1doa_pill` · `[data-step-process]`（只染色，不加霜） | 6 个真锚点 + 3 个哈希后缀（`_bubble`/`_card`/`_panel`）；带 fixed 后代的（卡片/列/头）**一律 `::before`** |
| **L3 弹窗 / 详情** | `[data-shell-overlay] :is([role="dialog"], .wCInkW_overlay)`（设置/灯箱/通用 Modal）· `:has(> [data-slot="settings.section"])`（设置整窗）· `[data-sidebar-right-panel][data-sidebar-right-mode="fullscreen"]` 全屏右栏 · 菜单通道 `--dsw-specific-menu`+`--dsw-menu-backdrop-filter`（`.q7hbua_menu`/`._3tUStW_list`/`._2WTFBq_panel`/`.zf92ZW_panel:before`/`.CVUQCW_panel`/`.oXE0lW_menu:before` 等）· `[data-windows-menu]`（原生，不透明）· 文档预览 / 全屏面板 | 弹窗本体可挂霜；**遮罩**走 `--dsw-mask-blur`；菜单只改 token；原生菜单与 `<select>` 弹层保持不透明 |

**3.4.4 快照与 WE 时代假设的 5 处修正（实现前必读）**

1. `[data-sidebar-right-open]` **在本构建 0 命中**（WE 注释里的那个属性不存在）。开合实况：`.OUqwTW_panel[data-sidebar-right-panel="push"]` 收起时 `aria-hidden="true"`，frame 上有 `data-rightbar-collapsed="true"`。⇒ 门控写成 `[data-sidebar-right-panel]:not([aria-hidden="true"])`（外加 `[data-rightbar-col]` 限定）；不要再等 `data-sidebar-right-open`。
2. `[data-menu-material]` **0 命中**（该属性在本构建里只被主题用来改 elevation 描边色）。⇒ 菜单接入只走两个 token（`--dsw-specific-menu` / `--dsw-menu-backdrop-filter`），**不要**把 `[data-menu-material]` 当前置条件。
3. **输入座位是 `position:sticky`，但不与滚动区重叠**：`[data-composer-seat]`（`Dc7zOa_composerSeat`）是 `[data-conversation-region="chat"]`（`Dc7zOa_body`，内含 `[data-conversation-scroll]`）的**兄弟节点** ⇒ 输入卡背后只有 L1 面 + 氛围层（受控背衬）。这正是 §4.4b 允许 A 预设覆盖 composer 的实测依据；若将来座位改成覆盖式（WE 那种），必须回 B。
4. **不要在 centerCol 上再叠一层填色**：`.BynINW_centerCol` 已经是 `transparent + radius 16px 0 0`，玻璃只画在 frame（`.34` 白）与卡片上；在 centerCol 再加 fill 会让地板相乘（§2.2 的 `eff = floor + a(1−floor)` 只对单层成立，两层叠就是 `1−(1−e1)(1−e2)`）。
5. **现状 vs 两个预设的差距**（浅色，实测 vs 目标）：

   | 面 | 现状 computed | A 预设 | B 预设 | 建议 |
   |---|---|---|---|---|
   | 外框 / 左栏列 | `rgba(255,255,255,.34)` | 可保留 0.30–0.34（L1 29.3% 偏低，取 0.32） | **0.516** | A 保留现状；B 提高 |
   | 输入卡 | `rgba(255,255,255,.62)` | **0.398**（参考图口径，比现状薄 0.22） | 0.670 | 先落 A 的三条护栏（§4.4b）再降；否则维持 0.62 |
   | 气泡 | `rgba(236,242,255,.62)` | 0.32–0.40（正文优先，取 0.40） | 0.670 | 同上；气泡比输入卡再低 20% |
   | 会话头 / dock 胶囊 | 透明 | 0.40（L2） | 0.67 | 现在没有玻璃，是最大观感缺口 |
   | 右栏面板 | 收起态（透明） | 0.40 | 0.67 | 展开后才画；收起态必须显式 `background:none; backdrop-filter:none` |

**3.4.5 本快照的缺口清单（需另采一态再对齐）**

`role="dialog"`、菜单展开态、`md-code-block` / `[data-code-block-banner]`、`[data-terminal]` / `[data-diff]` / `[data-search]`、`[data-question-key]` / `[data-plan-review-key]` / `[data-approval-key]`、`[data-turn-trigger]`、`[data-presented-file]` / `[data-changed-files]` / `[data-vcp-*]`、`[data-context-injection-body]`、tooltip —— 当前 DOM 里**均为 0 命中**（这一态没有打开弹窗/菜单，也没有代码块与提问卡）。本文件的注册表已按**宿主源码 + asar CSS** 给出这些面的锚点；实现到它们之前，请补一次"打开设置 + 展开菜单 + 有代码块 + 有提问卡"的快照复核（`tree.json.probes` 里那几个 `[class*="_card"]=2 / `_panel`=19 会显著变化）。

---

## 4. 当前配置 → 具体 CSS 值 + 三级加雾建议

### 4.1 解析用户配置（`baseline/plugins/wallpaper-engine.config.json`）

**关键发现（实现者最容易踩）**：`glassMode` 里**每一面都是 `inherit`**（`sidebar`/`sidebarContent`/`settingsWindow`/`conversation`/`thinkingTrigger`/`floaters`），且 **`leftSidebar` / `titlebar` 两个键根本不在 `glassMode` 里**（`GLASS_MODE_DEFAULTS` 只为非 `panelOff` 的子项生成键）。按 `glassValue(面, 参数, 自有值, 全局值)`：

```js
// glassMode[面] === 'custom' ? 该面自己的键 : 全局键
```

⇒ 下面这些配置项**当前全部无效**（被全局值覆盖）：

| 配置项 | 配置值 | 实际生效值 | 原因 |
|---|---|---|---|
| `settingsWindowTransparency` / `settingsWindowBlur` | 90 / 8 | `glassAlpha 80` / `blur 9` | `glassMode.settingsWindow = inherit` |
| `floatersTransparency` / `floatersBlur` | 90 / 8 | 80 / 9 | `floaters = inherit` |
| `thinkingTriggerTransparency` / `thinkingTriggerBlur` | 100 / 60 | 80 / 9 | `thinkingTrigger = inherit` |
| `leftSidebarTransparency` / `leftSidebarBlur` | 90 / 8 | 80 / 9 | `glassMode.leftSidebar` 不存在 ⇒ 非 custom |
| `titlebarTransparency` / `titlebarBlur` | 100 / 60 | 80 / 9 | `glassMode.titlebar` 不存在 ⇒ 非 custom |
| `sidebarAlpha` / `sidebarBlur` / `sidebarFollowGlobal` | 85 / 8 / true | 80 / 9 | `glassMode.sidebar = inherit`（注意：`applyGlass` 的值解析只看 `glassMode`，`sidebarFollowGlobal` 只控制 CSS 属性 `data-we-sidebar-follow`） |
| `glassColor` / `glassFidelity` | `#533b78` / 35 | 生效 | 全局 |
| `chatGlassFidelity` / `conversationColor` | 10 / `#ffffff` | 生效 | `conversation = custom` |
| `sidebarContentAlpha` / `sidebarContentColor` | 20 / `#252044` | 生效（84% / `#252044`） | `sidebarContent = custom` |

### 4.2 换算结果（用 §2 公式复算，可直接用作验收基准）

```
glassAlpha 80        → --we-glass-alpha = 0.13
glassFidelity 35     → f = 0.35；floor 浅 = 0.45×0.35 = 0.1575；深 = 0.59×0.35 = 0.2065
chatGlassFidelity 10 → f_c = 0.10；chat floor 浅 = 0.045；深 = 0.059
blur 9               → --we-blur = 9px；--we-saturate = 1.3；--we-glass-brightness = 1.04
border 0.9           → --we-border-alpha = 0.9（rgba(180,180,180,0.9) 的近实线灰边）
scrim 0.5            → --we-scrim-color = rgba(0,0,0,0.5)
capsuleBlur 6        → --we-inline-code-blur = 6px
```

**釉色（两段式钳制 + 回退）**：

| 主题 | 原色 | 满档钳制值 f=1 | 用户 f=0.35 输出 | 说明 |
|---|---|---|---|---|
| 浅 | `#533b78` | `#ebe8ef`（压向白直到 4.6:1） | **`#8877a2`** | 35% 靠钳制色、65% 靠原色 ⇒ 淡紫灰 |
| 深 | `#533b78` | `#211830`（压向黑） | **`#422f5f`** | 深紫 |
| 对话栏 | `#ffffff` | `#ffffff`（白本就过线） | `#ffffff` | 气泡/输入卡纯白釉 |

**每面有效不透明度 `effAlpha = floor + a·(1−floor)`**（`a = 0.13`；深色釉项再 ×0.4，气泡 ×0.33）：

| 面 / token | 层权重 | 浅色 eff | 深色 eff |
|---|---|---|---|
| `--dsw-alias-bg-layer-1` | 0.9 | 25.6% | 24.4% |
| `--dsw-alias-bg-layer-2` | 1.0 | 26.7% | 24.8% |
| `--dsw-alias-bg-layer-3` | 1.1 | 27.8% | 25.2% |
| `--dsw-alias-button-elevated-fill` | 1.15 | 28.4% | 25.4% |
| `--dsw-alias-bg-overlay` | 1.3 | 30.0% | 26.0% |
| `--dsw-alias-bg-multi-select` | 1.2 | 28.9% | 25.6% |
| `--dsw-specific-input-major`（输入卡/工具弹卡） | chat floor 0.045 | **16.9%** | **10.8%** |
| `--dsw-specific-bubble`（气泡） | chat floor 0.045 | **14.4%** | **9.9%** |
| 代码块 / 行内码 / 标签 / 引用 | 全局 floor 0.1575 | 17.1–17.6% | 21.1–21.4% |
| `--we-tool-glass-fill`（工具结果板） | 无地板 | 19.0% | 7.8% |

> 读法：用户现在看到的"淡紫 + 很薄"来自三件事叠加：**釉色被回退成淡紫**（f 0.35）、**地板只剩 15.75%**、**对话栏地板只剩 4.5%** ⇒ 气泡/输入卡几乎只剩 10–17% 的白罩，在花壁纸上必然文字重叠（这正是本任务要修的核心问题）。

### 4.3 用户配置的等价 CSS（可直接粘贴，字面量版）

```css
/* baseline/plugins/wallpaper-engine.config.json 的等效结果（浅色） */
body {
  --we-glass-alpha: 0.13;
  --we-glass-fidelity: 0.35;
  --we-chat-glass-fidelity: 0.10;
  --we-readability-floor: 0.1575;          /* 0.45 × 0.35 */
  --we-chat-readability-floor: 0.045;      /* 0.45 × 0.10 */
  --we-readability-base: #8877a2;
  --we-chat-readability-base: #ffffff;
  --we-surface-tint-light: #8877a2;
  --we-chat-surface-tint-light: #ffffff;
  --we-surface-tint-rgb-light: 136 119 162;
  --we-chat-surface-tint-rgb-light: 255 255 255;
  --we-blur: 9px;
  --we-saturate: 1.3;
  --we-glass-brightness: 1.04;
  --we-border-alpha: 0.9;
  --we-scrim-color: rgba(0, 0, 0, 0.5);
  --we-inline-code-blur: 6px;
  --we-capsule-tint-rgb: 255 255 255;
  --we-settings-window-alpha: 0.13;        /* inherit ⇒ 全局 */
  --we-settings-window-blur: 9px;
  --we-left-sidebar-alpha: 0.13;
  --we-left-sidebar-blur: 9px;
  --we-titlebar-alpha: 0.13;
  --we-titlebar-blur: 9px;
  --we-floaters-alpha: 0.13;
  --we-floaters-blur: 9px;
  --we-thinking-trigger-alpha: 0.13;
  --we-thinking-trigger-blur: 9px;
  --we-sidebar-alpha: 0.0608;              /* 0.32 − 0.8×0.305（inherit ⇒ 用全局 80 算） */
  --we-sidebar-sheen: 0.2717;
  --we-sidebar-tint: 24.2%;
  --we-sidebar-blur: 9px;
  --we-sidebar-saturate: 1.402;
  --we-content-surface-alpha: 84%;
  --we-content-surface-color: #252044;
}
body[data-ds-dark-theme] {
  --we-readability-floor: 0.2065;
  --we-chat-readability-floor: 0.059;
  --we-readability-base: #422f5f;
  --we-surface-tint-dark: #422f5f;
  --we-surface-tint-rgb-dark: 66 47 95;
}
```

### 4.4 三级加雾建议（新引擎，`fidelity = 100`；与 DESIGN-SPEC §7 同一张表）

**统一常量**：`tint` 浅 `#ffffff` / 深 `#0d1524`；`floor` 浅 `0.45` / 深 `0.59`；`saturate 1.30`、`brightness 1.04`、`contrast 1.01`、`border-hair rgba(180,180,180,·)`。

| tier | 面 | 釉层 alpha（浅/深） | **有效不透明度 eff**（浅/深） | blur | sheen（顶光） | 外投影 |
|---|---|---|---|---|---|---|
| **L1 内容面** | 聊天画布 / 页面容器 / 工具结果板 / 推理行 | 0.12 / 0.16 | **51.6% / 65.6%** | 20px | .10/.03@38%/.02 | `0 8px 24px rgba(2,6,23,.10)` |
| **L2 卡片 / 工具卡** | 输入卡、消息气泡、提问/计划/审批卡、侧栏、内容卡 | 0.40 / 0.42 | **67.0% / 76.2%** | 16px | .16/.05@38%/.02 | `0 12px 40px rgba(0,0,0,.12)` |
| **L3 弹窗 / 详情 / 设置** | dialog、设置整窗、右栏全屏、文档预览 | 0.72 / 0.72 | **84.6% / 88.5%** | dialog 10–14（用 `--dsg-blur-l3-dialog`）／菜单 20–24（`--dsg-blur-l3`） | .10/.03@38%/.05 | `0 24px 80px rgba(0,7,18,.30)` |
| L3 子权重 | 菜单/气泡层 ×1.00、dialog ×1.10、玻璃上的按钮 ×1.15 | — | 上限 **92%** | 同 L3 | 同 L3 | 同 L3 |

**为什么 blur 是"越低层越糊"而不是"越浮越糊"**：对比度由 alpha 提供，不靠 blur；blur 只负责"化开壁纸"。WE 的实测取值就是反比于文字密度 —— 输入卡 9px、设置窗 8px、侧栏 8px、胶囊 8px、聊天全局 16px（上限 60）。**给 800px 的文字密集 dialog 上 32px 模糊，既不加对比度，又让整块面板每帧重算**（见 §5.9）。

**允许区间（实现可在区间内自选，超出要登记）**：L1 大面**不挂霜**，仅页面级小面（header / sticky 条）6–8px；L2 14–18px；L3 菜单/下拉/hovercard 20–24px；L3 dialog / 设置窗 / 文档预览 **10–14px**。与 live 实现的对照见 §6.4b。

**必须保持更高不透明度（红名单，禁止降到 L1/L2）**：

| 面 | 原因 | 建议下限 |
|---|---|---|
| 代码块 / 行内代码 / 标签 / 引用底 | 前景是 shiki 固定配色（注释灰、字符串色），实测在通透底上掉到 1.7–2.3:1 | 地板 ≥0.75（或保持 WE 的 floor 公式 + 不为它们另开独立 alpha 档） |
| 编辑器 / 终端（`.cm-editor` / `.xterm`） | One Dark/Light 与 xterm 调色板按不透明底设计 | ≥84%，WE 默认 88% |
| 设置窗口 | 整窗都是可点文字，且覆盖宿主全部原生分区 | ≥85% |
| 菜单 / 下拉 | 选项文字紧贴、命中区小，且宿主的 `--dsw-specific-menu` 在 darwin 已被提到 94% | ≥86%（深色 ≥90%） |
| Tooltip | 深底白字，玻璃化会白字压浅底 | 保持不透明 |
| 原生 `<select>` 弹层 | Chromium 弹层是独立文档：底色不透明才取色、文字继承 select 墨色 | 不透明 `--we-popup-row-bg` + 对比墨 `-ink` |
| 工具结果板（diff / 终端输出） | 用户要"读代码"，不是看玻璃 | 保持 `a+0.06` 的平铺板 + 地板兜底，别开独立透明档 |

### 4.4b 两个预设：A「参考图/氛围」与 B「壁纸共存」

§4.4 那张表是 **B 预设**（有壁纸或有任意内容在背后掠过时用），也是红线基准。参考图实测的有效 alpha 只有 **0.35–0.40**（composer 卡），比 B 的 0.670 薄 —— 那不是"参考图更透"，而是**背衬不同**：参考图的玻璃背后只有**我们自己画的、亮度有界的雾气层**，而 B 要防的是**任意壁纸像素/任意内容**。所以正确的做法是承认两个预设，把差异写死成"背衬契约"，而不是吵一个数字。

**A 预设（无壁纸 / 受控氛围 / 仅 in-flow 面）**

```
fidelity_A = 0.55  ⇒  floor_A 浅 = 0.45 × 0.55 = 0.2475；深 = 0.59 × 0.55 = 0.3245
alpha：L1 0.06 / L2 0.20（浅）  L1 0.10 / L2 0.26（深）
L3 面（dialog / 菜单 / 悬停面板）**不参与 A**，继续用 B（floor 0.45/0.59 + alpha 0.72）
```

| tier | A 有效 alpha（浅/深） | 对照参考图 |
|---|---|---|
| L1 内容面 | **29.3% / 39.2%** | 页面雾气几乎全透，只有一层极淡白纱 |
| L2 卡片（composer / 气泡 / 工具卡） | **39.8% / 50.0%** | 与实测 0.35–0.40 吻合（合成后 ≈`#f2f6fb`） |
| L3 浮层（dialog / 菜单） | **84.6% / 88.5%（= B，不许降）** | 参考图没有对应面；浮层背后可能是任意内容 |

**A 预设的四条护栏（缺一条就会在真实数据上翻车）**

1. **只给 in-flow 面**。A 的合法性来自"背后是我们自己的氛围层"：composer 与消息流在 DSH 里是同一 flex 列的**兄弟节点**（宿主 `.RlGAzG_root` 在列内、`.xz4KEq_scroll` 在上，不是重叠定位）⇒ 卡片背后的背衬有界。任何**浮在内容之上**的面（dialog、菜单、hovercard、lightbox、右栏全屏、sticky 代码条）背衬无界 ⇒ 必须用 B。判据：`position: fixed|sticky` 或 `overlay` 语义 ⇒ B。
2. **氛围层亮度夹紧**：A 只在"氛围层最暗像素 ≥ 约 `#404040` 等效亮度"时成立。推导：`eff=0.398` 的白纱下，正文 `#1c2532` 要 ≥4.5:1 需要合成通道 ≥0.55 ⇒ 背衬通道 ≥`(0.55 − 0.398)/0.602 ≈ 0.2525`。参考图的雾气最暗点 `#99afdb`（通道 0.60–0.86）远超这条线；**一旦换成真实照片壁纸或高对比插画，立刻切 B**。
3. **文字灰阶必须压深**：A 的 `eff=0.398` 下，主题原生的 tertiary `#6e7278` 在最亮雾气区只有 **4.39:1**（差 0.11 就不合格）、在最暗雾气区只剩 **3.1:1**。WE 对壁纸模式做的就是"整条灰阶压深"，A 必须照做：primary `#101728` / secondary `#333c4d` / tertiary `#5c6472` / caption `#626a78`（≥4.9:1）。纯 A + 原生灰阶 = 不可交付。
4. **L3 不许跟着 A 降**：`L3 = 0.66`（若强行套 A）对正文尚可（4.6–6.5:1），但二级/三级文字、hover 提亮态、以及"深色主题菜单压在亮图上"只剩 4.78:1 的临界值，没有余量。要么 L3 用 B，要么把遮罩暗化保持 `--dsw-alias-bg-mask-1`（浅 `#0000003d` / 深 `#00000080`）且菜单/下拉单独抬到 ≥0.80。

**预设切换（CSS 侧，纯属性驱动；L3 靠"fill-l3 不读 `--dsg-floor`"自动保住，见 §6.4）**

```css
/* B：壁纸 / 任意内容背衬（默认；JS 写 data-dsg-has-wallpaper 或 data-dsg-exposure） */
body[data-dsg-glass] { --dsg-fidelity: 1; }

/* A：受控氛围（无壁纸、氛围层是自家资产、且当前面无任意内容背衬）。
   只动 L1/L2 的两个旋钮：地板减薄（--dsg-floor 只被 fill-l1/l2 读）+ 釉量。
   L3 不在此列：fill-l3 的地板槽位直接读 --dsg-floor-base-*，与 fidelity 无关
   ⇒ 弹窗/菜单恒为 B 档，不需要为它写任何覆盖。 */
body[data-dsg-glass][data-dsg-atmosphere]:not([data-dsg-has-wallpaper]) {
  --dsg-fidelity: 0.55;
  --dsg-a1: 0.06;
  --dsg-a2: 0.20;
}
body[data-ds-dark-theme][data-dsg-glass][data-dsg-atmosphere]:not([data-dsg-has-wallpaper]) {
  --dsg-a1: 0.10;
  --dsg-a2: 0.26;
}
```

> **为什么 L3 必须读 base 而不是 `--dsg-floor`**：A 的一个 `--dsg-fidelity: .55` 若同时作用于 L3，会把对话框/菜单的地板一起减薄（正好违反护栏 #4）。让 `fill-l3` 的地板槽位直接读 `--dsg-floor-base-light|dark`，**L3 就没有任何可被 fidelity 影响的输入** —— 这是"L3 不随 A 降"从纪律变成结构的最小实现（一行差异、零新 token；实测 live 代码目前仍读 `--dsg-floor`，需改这一行，见 §6.4b）。

> **给 DESIGN-SPEC 的引用口径**：§4.4 = 红线基准（B）；§4.4b = 参考图预设（A）。两者共用同一个公式与同一组常量（0.45/0.59、1.30/1.04/1.01），差异只在 `fidelity` 与 tier alpha，且 A 有三面护栏（in-flow、氛围亮度下限、压深灰阶）。序列化的默认值建议：**`glassFidelity: 100`、`data-dsg-atmosphere` 由"是否垫了自家氛围层"自动决定**（不是用户开关），这样"有壁纸 ⇒ 自动回 B"无需用户理解两个预设。

**A 预设的氛围层契约（本机已存在，实测 `div.dsg-atmosphere[aria-hidden]`）**

`.ref/dom` 快照里氛围层已经是真实 DOM：`div.dsg-atmosphere` 下挂 `i.dsg-aurora-a/b/c`（极光色斑）+ `i.dsg-grid`（网格）+ `i.dsg-grain`（颗粒）。它是 A 预设的**唯一背衬**，因此必须遵守四条：

```css
.dsg-atmosphere {           /* 背衬层，不是玻璃面 */
  position: fixed; inset: 0; z-index: -1;   /* 必须在 UI 之下、页面底之上 */
  pointer-events: none;
  backdrop-filter: none !important;          /* 它自己不能吃霜（无背衬可采样） */
  filter: none;                              /* 常驻 filter 会把整层顶成离屏合成层 */
}
/* 亮度地板（A 预设护栏 #2 的落点）：把最暗像素钉在 ≈#404040 等效亮度以上 */
.dsg-atmosphere i { pointer-events: none; }
.dsg-grid, .dsg-grain { opacity: .04; }      /* 网格/颗粒 ≤0.05，否则拉低最暗像素 → A 的地板失效 */
.dsg-aurora { opacity: .55; }                /* 色斑只允许"变亮"，不允许出深色斑 */
body[data-ds-dark-theme] .dsg-aurora { opacity: .35; }   /* 深色档同理：最亮像素别顶到刺眼 */
```

判据（可脚本化）：截 `document.body` 背景（隐藏 UI），取最暗像素的 sRGB 通道值 `m`；A 预设要求 `m ≥ 0.2525`（即不比 `#404040` 更暗），否则必须强制切 B（`data-dsg-fidelity=1`）。这条就是 §4.4b 护栏 #2 的可测形式。

---

## 5. 工程陷阱（每条：症状 → 根因 → 修法）

### 5.1 `backdrop-filter` 制造 fixed 包含块（最高危）

- **症状**：输入卡里的"AI 浏览器"按钮掉到卡片下方约 522px；左栏收起/展开按钮"消失"；座位多出 543px 幻影滚动。
- **根因**：CSS 规范 —— 非 `none` 的 `backdrop-filter`（以及 `filter`/`transform`/`will-change`/`contain`）让元素成为其后代 `position:fixed` 的**包含块**。`[data-composer-card]` 内有 `position:fixed` 的浏览器座位；左栏两个按钮也是 fixed。
- **修法**：模糊搬到**伪元素**（无哑后代，永不成为包含块）：
  ```css
  body[data-dsg-glass] [data-composer-card] { backdrop-filter: none; }
  body[data-dsg-glass] [data-composer-card]::before {
    content: ""; position: absolute; inset: 0; border-radius: inherit;
    pointer-events: none; z-index: -1;
    backdrop-filter: var(--dsg-backdrop-l2);
  }
  ```
  父元素需要 `position: relative`（宿主卡片自带）与 `z-index: 0`（把 `::before` 圈在内部，否则它会退到卡片底色之下/壁纸之后）。落点：卡片→`::before`；左栏→`::before`；标题栏→`::after`（**不能**和底色同层，见 §5.6）。
- **不变量**：`[data-composer-seat]` **不挂任何霜、不铺底板**（座位里就有 `[data-composer-card]`，且 WE 已按用户口径整条撤回过"座位底板"，其令牌进了"重开即红"的回收名单）。

### 5.2 Tooltip 白字反色

- **症状**：悬浮提示变成浅底白字（对比度 1.07–1.13:1，全白一片）。
- **根因**：宿主 Tooltip 的类名也是 `_bubble_*`（与消息气泡共享后缀约定），但它是独立浮层：底 `--dsw-alias-tooltip-bg`（浅 `neutral-bluish-850`、深 `750`），文字固定近白；一旦被 `[class*="_bubble"]` 的玻璃规则命中，底变浅、字不变。
- **修法**：**每条** `[class*="_bubble"]` 规则都带 `:not([role="tooltip"])`（WE 为此加了守卫 F2dN，并明确"作用域"与"豁免"是两件事）。判据用宿主语义属性 `role="tooltip"`，而不是 `[data-chat-flow]` 作用域 —— 浮层可能渲染在触发元素旁，不在会话流里。

### 5.3 菜单通道 `--dsw-menu-backdrop-filter`

- **症状**：菜单半透明但没有霜；或菜单被自己画的板子盖住；或 darwin 上怎么改都不透。
- **根因**：宿主菜单不是"裸 div"，它消费 `--dsw-specific-menu`（浅 `#f8f9fa94`、深 `#43454a73`）+ `backdrop-filter: var(--dsw-menu-backdrop-filter)`（`blur(40px) saturate(150%)`），而且**两种画法并存**：直接 `background` + `backdrop-filter`（`*_panel`/`*_menu`）或画在 `::before` 上（`*_panel:before{ background: var(--dsw-specific-menu); backdrop-filter: var(--dsw-menu-backdrop-filter) }`）。菜单是 `position:fixed` 的 body 级 portal ⇒ token 覆盖必须写在 `body` 层。**darwin 有更高特异度的覆写**：`html[data-platform=darwin] body { --dsw-specific-menu: #f8f9faf0 }`（(0,1,2)），普通 `body{}`（(0,1,0)）压不过。
- **修法**（二选一，别混）：
  1. **只调参数**：`body { --dsw-specific-menu: <你的 fill>; --dsw-menu-backdrop-filter: blur(24px) saturate(140%) }`，若要覆盖 darwin，选择器至少 `html[data-platform=darwin] body[data-dsg-glass]`；
  2. **完全不碰**，让宿主菜单保持原样（WE 的做法 —— 它一处都没改菜单）。
- **禁止**：给 `*_panel` 另画一块自己的玻璃板（会与宿主 `::before` 双层叠加，边缘出现双发丝边）。

### 5.4 无 `backdrop-filter` 的两条降级腿

- **腿 A（语法不支持）**：`@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))` ⇒ 全部玻璃面钉到 **92% 近不透明**、`background-image: none`、`backdrop-filter: none`，并把整窗令牌（`--dsw-alias-bg-layer-1/2/3`、`--dsw-alias-button-elevated-fill`、markdown 家族、`--dsw-specific-*`）钉回不透明面板色。
- **腿 B（语法支持但不出霜，必须有）**：`@supports` 对"软件光栅器"永远为真（Chromium 认属性但忽略效果）⇒ 玻璃只剩"半透明 + 无霜 = 过透"。运行时探测：
  ```js
  // WebGL renderer/vendor 命中 /swiftshader|software|llvmpipe|softpipe|microsoft basic render|angle \(software|stack-gl/i
  // 或者根本拿不到 webgl 上下文
  → document.body.setAttribute('data-dsg-fallback','1')
  ```
  CSS 侧把同一批面用 `body[data-dsg-fallback]` 再挂一遍 92% 配方（+ 显式 `backdrop-filter: none`）。给用户留手动覆盖：`?dsg-glassfallback=on|off`。**探测只跑一次并缓存**，且必须 `try/catch` + WebGL 上下文用 `WEBGL_lose_context` 释放。

### 5.5 玻璃后必须有"不透明背衬"

- **症状**：`backdrop-filter` 写了但完全没效果 / 壁纸视频上出现白闪。
- **根因**：`backdrop-filter` 采样的是元素**背后已绘制的像素**；若背后大面积透明（Electron 窗口透明 / 页面底色被置透明），合成器在该区域直接不模糊 —— WE 实测"玻璃后文字透出（composer 区高频能量 +90%）"。另外给 `<video>` 常驻 `filter: blur(0px)` 会强制离屏滤镜层，产生周期性白闪。
- **修法**：① 壁纸层**垫原生底色**（浅纯白/深纯黑，`--we-wallpaper-fade-bg`），透明度只作用在媒体叶子上；② `filter` 只在 blur>0 时才写（默认 `none`）；③ 任何"过场"都不让中间态透明。

### 5.6 盒尺寸相关的"声明相同但色差可见"

- **症状**：标题栏（40px）与左栏（1111px）用**逐字相同**的三段渐变釉，交界处仍有一条肉眼可见的台阶（0.05 白釉差）。
- **根因**：渐变停靠点是**百分比**（0%/38%/100%），装进高度差 27.8 倍的盒子算出不同强度："声明逐字相同 ⇒ 无色差"对**盒子相对**的声明不成立。
- **修法**：窄条面（标题栏）只用**单停靠点**（`sheen-a` 恒定）；或把渐变改成 `linear-gradient(180deg, rgba(...,a), rgba(...,a) 48px, rgba(...,b) 100%)` 用 px 停靠。

### 5.7 backdrop-filter 自成层叠上下文

- **症状**：右栏全屏时，输入卡与 hero 标题"穿透"玻璃面板叠在侧栏上。
- **根因**：`backdrop-filter` 让面板自成层叠上下文（`z-index:auto` 档）⇒ 面板内部依赖 `--dsh-dockkit-dock-layer` 的 dock 单元层级被困住，整个面板作为原子跌回 `auto`，被根层叠上下文里 `z-index:1/7` 的输入卡反压。
- **修法**：玻璃开启时给面板本身 `z-index: var(--dsh-dockkit-dock-layer, 10)`；玻璃关闭/回退档（`backdrop-filter:none`）不需要抬升，保持原生顺序。

### 5.8 装饰顺序：底色必须在"霜的上层"

- **要理解的一步**：把 blur 放在 `::before`（`z-index:-1`）时，绘制顺序是 **壁纸 → 卡片底色 → ::before（对"壁纸+底色"做模糊）**。底色本身是中性色 ⇒「模糊(壁纸 ⊕ 底色)」与「先滤壁纸再压底色」数学等价（模糊与滤镜都是线性算子）。**不要**为了"让底色更清"把 blur 放到元素自身 —— 那会同时触发 §5.1。

### 5.9 性能限制（实测/注释来源）

1. **一张大面一个 blur**：第三方侧栏"one blur per shell"——霜只挂根面板，内部 chrome 只换底色。
2. **不要给滚动容器上大半径 blur**：滚动时每帧重算 backdrop，且 Chromium 会在滚动中降级；WE 的聊天画布**完全不加** backdrop-filter（只靠壁纸层自身柔化 + scrim）。
3. **别留常驻合成层**：`transform: none`（默认值不写）、`will-change` 只在需要的那两帧（`--we-layer--repaint`）、`opacity:1` 不写（Blink 对 `opacity:1` 不建层，写了反而多一层）。
4. **整窗 blur（设置对话框 800px）是最贵的一笔**：设置窗 blur 建议 ≤12px；不要同时给遮罩（`--dsw-mask-blur`）和对话框各开一个大半径（遮罩那层已经模糊过壁纸，对话框再模糊一次几乎无视觉收益、价格翻倍）—— 二选一：遮罩开霜 + 对话框高 alpha，或对话框开霜 + 遮罩只用暗化色。
5. **原生滚动条不吃 backdrop-filter**（实测条纹探针）⇒ 滚动条只做颜色，别指望霜。
6. **行内元素跨行**：`display:inline` 的胶囊挂 backdrop-filter 时，模糊会覆盖**所有行盒的并集**（一行代码变整列一条雾）。修法：`[data-variant="think"]` / `_thinkBody` 内的行内码**只关霜、保留底色**（宿主的 `box-decoration-break: clone` 会按行切底色）。

### 5.10 `color-mix` 的百分比槽位必须带单位

- **症状**：内容面底色规则整条失效，编辑器回退成"纯透明毛玻璃"。
- **根因**：`color-mix(in srgb, X calc(var(--x) * 100%), transparent)` 里若 `--x` 是**裸数字**（如 `88`）而不是 `88%`，整个 `color-mix` 无效 ⇒ 声明被丢弃。
- **修法**：JS 写变量时就带 `"%"`：`--we-content-surface-alpha: 84%`。

### 5.11 同一元素上不能"写 `initial` 来撤销"

- **症状**：关掉独立配置后旧值继续生效（"没接受全局"）；或某个块里 `var(--x)` 全部塌进兜底。
- **根因**：变量一旦被写到 `document.body.style` 就永久"已定义"，CSS 的 `var(--x, 兜底)` 不会回落；而在**同一元素**上把 `--x: initial` 再 `var(--x, fallback)` 会得到 guaranteed-invalid，整条声明失效。
- **修法**：① 每档都**算出正确值并写出**（"不写 ≠ 撤销"）；② 需要"块内屏蔽"时用另一条变量（`--we-accent-src` 供块内消费，`--we-accent: initial` 只防泄漏）。

### 5.12 宿主类名 / token 消费链的版本漂移

- 宿主主容器可能"自带实心底、不再读 `--dsw-alias-bg-base`"⇒ 只清 token 会让整片盖住背景层（画面在播、控制台零报错）。修法：token 清底 **+** 清宿主容器类（`[class*="_frame"]`/`[class*="_root"]`，`background: transparent !important`）互为保险。
- 选择器列表**一损俱损**：一个浏览器不接受的选择器会让整条规则连同能命中的一起丢弃（现象与"锚点没选对"完全一样）。**已验证的选择器绝不与未验证的放进同一个逗号列表**；嵌套 `:has(:has())` 本壳层 Chromium 不接受。
- 样式表顺序：DSH 会把主题调色板（`design_platform.css`）作为后置样式表注入 `<head>`，同特异度下宿主胜 ⇒ 所有"壁纸/玻璃要赢"的声明需要**深色孪生选择器**把特异度抬到 (0,2,1) 以上。

### 5.13 极性与语义陷阱

- `data-ds-dark-theme` 是**宿主**属性，玻璃的深色孪生必须挂在它上面（不是 `prefers-color-scheme`）。
- `--dsw-alias-label-primary-foreground` 必须按 accent 亮度重选（`weAccentInk`），否则"浅色 accent + 浅色主题墨 = 白底黄钮"。
- 浅色主题下压在壁纸上的灰阶会掉对比：WE 在壁纸激活时把 `label-primary/secondary/tertiary/caption/dimmed` 整条压深（`#000/#282a2e/#46494f/#6e7278`）。

---

## 6. 变量契约 `--dsg-*`（给新玻璃引擎）

### 6.1 命名规则

```
--dsg-<类别>[-<面或主题>][-<tier>]
类别：tint / floor / alpha / blur / sat / bright / contrast / fill / backdrop / sheen / bevel / border / mask / menu / scroll / sheen
面/tier：l1 l2 l3（三级）｜ light dark（主题）｜ menu dialog popover
```
- **不要复用 `--we-*`**（WE 的命名空间，且它把值写在 `body` 行内样式里，同级样式表压不过）。
- **优先复用 DSH token 名**做"消费面"（`--dsw-specific-input-major` 等），自有变量只做"来源"。
- **L3 的地板槽位必须绕过 fidelity**（`--dsg-fill-l3` 直接读 `--dsg-floor-base-light|dark`，不读 `--dsg-floor`）：L1/L2 = base × fidelity，L3 = base 满值。任何"只给内容面/卡片减薄"的预设（A 预设）都只许动 `--dsg-fidelity` 与 `--dsg-a1/a2`，不许给 L3 写覆盖。

### 6.2 token 表（默认值）

| token | 默认 | 说明 |
|---|---|---|
| `--dsg-tint-light` / `--dsg-tint-dark` | `#ffffff` / `#0d1524` | 钳制后的釉色（`weClampSurfaceColor` 的输出） |
| `--dsg-tint-rgb-light` / `-dark` | `255 255 255` / `13 21 36` | 空格三元组，供 `rgb()`/`rgba()` |
| `--dsg-fidelity` | `1` | 0–1，玻璃保真度。**只喂 L1/L2 的地板（`--dsg-floor`）与釉色回退**，不碰 L3 |
| `--dsg-floor-base-light` / `-dark` | `0.45` / `0.59` | WE 实测常量，**不许调**（调了 4.5:1 判据失效） |
| `--dsg-floor` | `calc(base × fidelity)` | L1/L2 地板。**L3 不读它**（`fill-l3` 直接读 `--dsg-floor-base-*`）⇒ A 预设减薄不了弹窗 |
| `--dsg-a1/a2/a3`（别名 `--dsg-alpha-l1/l2/l3`，两个名字等价） | `0.12 / 0.40 / 0.72` | 三级釉层 alpha（"雾量"滑杆）；`aN` 是实现里的规范名 |
| `--dsg-blur-l1/l2/l3` | `20px / 16px / 10px` | 雾化半径，0 = 关霜；**L1 大面不挂霜**，20px 只给页面级小面（实际推荐 6–8px） |
| `--dsg-blur-l3-dialog` | `12px` | dialog / 设置窗 / 文档预览**专属**雾半径（10–14px）；**不许复用菜单的 `--dsg-blur-l3`（20–24px）**，见 §6.4b |
| `--dsg-sat` / `--dsg-bright` / `--dsg-contrast` | `1.30` / `1.04` / `1.01` | **全局常量，不做分档** |
| `--dsg-fill-l1/l2/l3` | `color-mix(...)` | 三级填充（已含地板） |
| `--dsg-backdrop-l1/l2/l3` | `blur(...) saturate(...) brightness(...) contrast(...)` | 完整 `backdrop-filter` 值 |
| `--dsg-sheen-l1/l2/l3` | 三段渐变 | 顶部镜面高光 |
| `--dsg-bevel-l1/l2/l3` | 组合 box-shadow | 内高光 + 发丝边 + 外投影 |
| `--dsg-border-hair` | `rgba(180,180,180,0.35)` | 宿主 border token 用 |
| `--dsg-menu-fill` / `--dsg-menu-filter` | `rgba(255,255,255,0.86)` / `blur(24px) saturate(140%)` | 菜单通道（覆盖 `--dsw-*` 的那两个 token） |
| `--dsg-mask-filter` | `blur(16px) saturate(1.2)` | 模态遮罩（写进 `--dsw-mask-blur`） |
| `--dsg-scroll-thumb` / `-hover` | `color-mix(tint 65%, neutral-300)` / `… neutral-400` | 滚动条（深色取 600/500/400） |
| `--dsg-fallback` | 由属性表达 | `body[data-dsg-fallback]` ⇒ 92% 近不透明 |

### 6.3 选择器清单（tier → token → 元素 hook）

> **本表已按 `.ref/dom` 实测快照校对**（明细与逐元素 computed 见 §3.4）。与 WE 时代相比的两处改动：右栏门控由 `[data-sidebar-right-open]` 改为 `:not([aria-hidden="true"])`；菜单不再期待 `[data-menu-material]`。

| tier | token（优先） | 元素 hook（模糊载体，均已实测存在） |
|---|---|---|
| L1 | `--dsw-alias-bg-base`、`--dsw-alias-turn-trigger-bg`、`--dsw-alias-markdown-code-block(-banner)` | `[data-slot="root"] > div`（frame）· `div:has(> [data-slot="main"])`（centerCol）· `[data-conversation-region="chat"]` · `[data-conversation-scroll]` · `[data-chat-flow]` · `[data-variant="think"]` · `[data-disclosure-row]` · `[data-slot="tool.call.toolview"]` · `[data-turn-trigger]` · `.md-code-block` |
| L2 | `--dsw-specific-input-major`、`--dsw-specific-bubble`、`--dsw-specific-sidebar-fill`、`--dsw-alias-bg-layer-1` | `[data-composer-card]::before` · `[class*="_bubble"]:not([role="tooltip"])` · `div:has(> [data-slot="sidebar"])::before` · `[data-slot="conversation.header"] > header` · `[data-composer-dock]`/`[data-composer-stat]` · `[data-rightbar-col] [data-sidebar-right-panel]:not([aria-hidden="true"])` · `[data-dockkit-pane]`/`[data-dockkit-surface]` · `[data-question-key] [class*="_card"]`、`[data-plan-review-key] [class*="_card"]`、`[data-approval-key] [class*="_card"]`（本快照未出现，按源码锚点预留） |
| L3 | `--dsw-alias-bg-layer-2/3`、`--dsw-specific-menu` | `[data-shell-overlay] :is([role="dialog"], .wCInkW_overlay)` · `:has(> [data-slot="settings.section"])` · `[data-sidebar-right-panel][data-sidebar-right-mode="fullscreen"]` · `--dsw-mask-blur` · `--dsw-menu-backdrop-filter` |
| 豁免 | `--dsw-alias-tooltip-bg`、`--we-popup-row-bg/-ink` 同款 | `[role="tooltip"]`、原生 `<select>`、`[data-windows-menu]` → 保持不透明 |

### 6.4 可直接粘贴的 CSS（浅/深 + 降级 + 与 WE 共存）

```css
/* ═══════════════════════════════════════════════════════════════════
   DSG 玻璃引擎 —— 契约实现（v1）。由实现者粘贴，JS 只需写 §6.2 的
   --dsg-tint* / --dsg-fidelity / --dsg-alpha-l* / --dsg-blur-l*。
   ═══════════════════════════════════════════════════════════════════ */

/* ── 1) 来源变量：默认值（浅色） ─────────────────────────────────── */
body {
  --dsg-tint-light: #ffffff;
  --dsg-tint-dark:  #0d1524;
  --dsg-tint-rgb-light: 255 255 255;
  --dsg-tint-rgb-dark: 13 21 36;
  --dsg-fidelity: 1;

  --dsg-floor-base-light: 0.45;   /* WE READABILITY_FLOOR（实测，勿改） */
  --dsg-floor-base-dark:  0.59;
  --dsg-floor: calc(var(--dsg-floor-base-light) * var(--dsg-fidelity));   /* 只喂 L1/L2 */

  --dsg-tint: var(--dsg-tint-light);
  --dsg-tint-rgb: var(--dsg-tint-rgb-light);

  /* 釉量：L1/L2/L3。实现里的规范名是 --dsg-a1/a2/a3，这里两个名字都给（互为别名） */
  --dsg-alpha-l1: 0.12;  --dsg-a1: var(--dsg-alpha-l1);
  --dsg-alpha-l2: 0.40;  --dsg-a2: var(--dsg-alpha-l2);
  --dsg-alpha-l3: 0.72;  --dsg-a3: var(--dsg-alpha-l3);

  --dsg-blur-l1: 20px;
  --dsg-blur-l2: 16px;
  --dsg-blur-l3: 10px;
  --dsg-blur-l3-dialog: 12px;   /* dialog / 设置窗 / 文档预览专用；菜单仍用 --dsg-blur-l3 */

  --dsg-sat: 1.30;
  --dsg-bright: 1.04;
  --dsg-contrast: 1.01;

  --dsg-backdrop-l1: blur(var(--dsg-blur-l1)) saturate(var(--dsg-sat)) brightness(var(--dsg-bright)) contrast(var(--dsg-contrast));
  --dsg-backdrop-l2: blur(var(--dsg-blur-l2)) saturate(var(--dsg-sat)) brightness(var(--dsg-bright)) contrast(var(--dsg-contrast));
  --dsg-backdrop-l3: blur(var(--dsg-blur-l3)) saturate(var(--dsg-sat)) brightness(var(--dsg-bright)) contrast(var(--dsg-contrast));
  --dsg-backdrop-l3-dialog: blur(var(--dsg-blur-l3-dialog)) saturate(var(--dsg-sat)) brightness(var(--dsg-bright)) contrast(var(--dsg-contrast));

  /* 填充：地板 + 釉层（eff = floor + a·(1-floor)）。
     ⚠️ 「L3 不随 A 预设减薄」**不需要新 token**：L3 的地板槽位直接读 base 常量
        （浅色 --dsg-floor-base-light / 深色块换成 --dsg-floor-base-dark），
        于是一个 --dsg-fidelity: .55 只影响 L1/L2，L3 恒为满值。 */
  --dsg-fill-l1: color-mix(in srgb, var(--dsg-tint) calc(var(--dsg-floor) * 100%),
                  rgba(var(--dsg-tint-rgb) / var(--dsg-a1)) calc((1 - var(--dsg-floor)) * 100%));
  --dsg-fill-l2: color-mix(in srgb, var(--dsg-tint) calc(var(--dsg-floor) * 100%),
                  rgba(var(--dsg-tint-rgb) / var(--dsg-a2)) calc((1 - var(--dsg-floor)) * 100%));
  --dsg-fill-l3: color-mix(in srgb, var(--dsg-tint) calc(var(--dsg-floor-base-light) * 100%),
                  rgba(var(--dsg-tint-rgb) / var(--dsg-a3)) calc((1 - var(--dsg-floor-base-light)) * 100%));

  /* 镜面高光 */
  --dsg-sheen-l1: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.03) 38%, rgba(255,255,255,.02));
  --dsg-sheen-l2: linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.05) 38%, rgba(255,255,255,.02));
  --dsg-sheen-l3: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.03) 38%, rgba(255,255,255,.05));

  /* 内高光 / 发丝边 / 外投影 */
  --dsg-bevel-l1: inset 0 1px 0 rgba(255,255,255,.24), inset 0 -1px 0 rgba(255,255,255,.06),
                  inset 0 0 0 .5px rgba(255,255,255,.06), 0 8px 24px rgba(2,6,23,.10);
  --dsg-bevel-l2: inset 0 1px 0 rgba(255,255,255,.32), inset 0 -1px 0 rgba(255,255,255,.08),
                  inset 0 0 0 .5px rgba(255,255,255,.08), 0 12px 40px rgba(0,0,0,.12);
  --dsg-bevel-l3: inset 0 1px 0 rgba(255,255,255,.22), inset 0 0 0 1px rgba(255,255,255,.06),
                  0 24px 80px rgba(0,7,18,.30);

  --dsg-border-hair: rgba(180,180,180,.35);
  --dsg-mask-filter: blur(16px) saturate(1.2);
  --dsg-menu-filter: blur(24px) saturate(140%);
  --dsg-menu-fill: rgba(255,255,255,.86);
}

/* ── 2) 深色孪生（每条浅色声明都要有） ───────────────────────────── */
body[data-ds-dark-theme] {
  --dsg-floor: calc(var(--dsg-floor-base-dark) * var(--dsg-fidelity));
  --dsg-tint: var(--dsg-tint-dark);
  --dsg-tint-rgb: var(--dsg-tint-rgb-dark);
  /* L3 的地板槽位在深色块里也换成 base-dark（同一行差异，无新 token） */
  --dsg-fill-l3: color-mix(in srgb, var(--dsg-tint-dark) calc(var(--dsg-floor-base-dark) * 100%),
                  rgba(var(--dsg-tint-rgb-dark) / var(--dsg-a3)) calc((1 - var(--dsg-floor-base-dark)) * 100%));

  --dsg-sheen-l1: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.02) 38%, rgba(255,255,255,.01));
  --dsg-sheen-l2: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.03) 38%, rgba(255,255,255,.01));
  --dsg-sheen-l3: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.02) 38%, rgba(255,255,255,.03));

  --dsg-bevel-l1: inset 0 1px 0 rgba(255,255,255,.12), inset 0 -1px 0 rgba(255,255,255,.04),
                  inset 0 0 0 .5px rgba(255,255,255,.06), 0 8px 24px rgba(0,0,0,.20);
  --dsg-bevel-l2: inset 0 1px 0 rgba(255,255,255,.14), inset 0 -1px 0 rgba(255,255,255,.05),
                  inset 0 0 0 .5px rgba(255,255,255,.08), 0 12px 40px rgba(0,0,0,.28);
  --dsg-bevel-l3: inset 0 1px 0 rgba(255,255,255,.12), inset 0 0 0 1px rgba(255,255,255,.06),
                  0 24px 80px rgba(0,0,0,.45);

  --dsg-border-hair: rgba(255,255,255,.10);
  --dsg-menu-fill: rgba(28,29,34,.90);
  --dsg-mask-filter: blur(16px) saturate(1.1);
}

/* ── 3) 消费面映射：优先改 token（重建免疫） ──────────────────────── */
body[data-dsg-glass] {
  /* L1 内容面 */
  --dsw-alias-bg-base: var(--dsg-fill-l1);
  --dsw-alias-turn-trigger-bg: var(--dsg-fill-l1);
  --dsw-alias-turn-trigger-bg-hover: var(--dsg-fill-l2);
  /* L2 卡片面 */
  --dsw-specific-input-major: var(--dsg-fill-l2);
  --dsw-specific-bubble: var(--dsg-fill-l2);
  --dsw-specific-sidebar-fill: var(--dsg-fill-l2);
  --dsw-alias-bg-layer-1: var(--dsg-fill-l2);
  /* L3 浮层面 */
  --dsw-alias-bg-layer-2: var(--dsg-fill-l3);
  --dsw-alias-bg-layer-3: var(--dsg-fill-l3);
  --dsw-alias-bg-overlay: var(--dsg-fill-l3);
  /* 边线 / 滚动条 */
  --dsw-alias-border-l1: var(--dsg-border-hair);
  --dsw-alias-border-l2: var(--dsg-border-hair);
  --dsw-alias-scrollbar-bg-l1: var(--dsg-scroll-thumb);
  --dsw-alias-scrollbar-bg-l2: var(--dsg-scroll-thumb);
  --dsw-alias-scrollbar-hover-l1: var(--dsg-scroll-thumb-hover);
  --dsw-alias-scrollbar-hover-l2: var(--dsg-scroll-thumb-hover);
  /* 宿主模糊通道 */
  --dsw-mask-blur: var(--dsg-mask-filter);
}

/* ── 4) 元素 hook：只负责 backdrop-filter 与装饰 ───────────────────── */
/* L2：输入卡（模糊必须在 ::before，见 §5.1） */
body[data-dsg-glass] [data-composer-card] {
  position: relative;
  background-image: var(--dsg-sheen-l2);
  box-shadow: var(--dsg-bevel-l2);
  backdrop-filter: none;
}
body[data-dsg-glass] [data-composer-card]::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  pointer-events: none; z-index: -1;
  backdrop-filter: var(--dsg-backdrop-l2);
  -webkit-backdrop-filter: var(--dsg-backdrop-l2);
}

/* L2：气泡（Tooltip 豁免必须写死） */
body[data-dsg-glass] [class*="_bubble"]:not([role="tooltip"]) {
  background-image: var(--dsg-sheen-l2);
  box-shadow: var(--dsg-bevel-l2);
  backdrop-filter: var(--dsg-backdrop-l2);
  -webkit-backdrop-filter: var(--dsg-backdrop-l2);
}

/* L2：工具弹卡（只在三个容器锚点下） */
body[data-dsg-glass] [data-question-key] [class*="_card"],
body[data-dsg-glass] [data-plan-review-key] [class*="_card"],
body[data-dsg-glass] [data-approval-key] [class*="_card"] {
  background-image: var(--dsg-sheen-l2);
  box-shadow: var(--dsg-bevel-l2);
  backdrop-filter: var(--dsg-backdrop-l2);
  -webkit-backdrop-filter: var(--dsg-backdrop-l2);
}

/* L2：左栏（出口 display:contents ⇒ 选父元素；模糊在 ::before） */
body[data-dsg-glass] div:has(> [data-slot="sidebar"]) {
  position: relative; z-index: 0;
  background-color: var(--dsg-fill-l2);
  background-image: var(--dsg-sheen-l2);
  box-shadow: var(--dsg-bevel-l2);
  border-right: none;
}
body[data-dsg-glass] div:has(> [data-slot="sidebar"])::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  pointer-events: none; z-index: -1;
  backdrop-filter: var(--dsg-backdrop-l2);
  -webkit-backdrop-filter: var(--dsg-backdrop-l2);
}

/* L3：dialog / 设置窗 —— 用**专属**的 12px 雾，不许复用菜单的 24px（§6.4b） */
body[data-dsg-glass] [role="dialog"] {
  background-image: var(--dsg-sheen-l3);
  box-shadow: var(--dsg-bevel-l3);
  backdrop-filter: var(--dsg-backdrop-l3-dialog);
  -webkit-backdrop-filter: var(--dsg-backdrop-l3-dialog);
}

/* L3：菜单通道（改 token，不画板） */
body[data-dsg-glass] {
  --dsw-specific-menu: var(--dsg-menu-fill);
  --dsw-menu-backdrop-filter: var(--dsg-menu-filter);
}
html[data-platform="darwin"] body[data-dsg-glass] {   /* 压过宿主 (0,1,2) 的 94% 覆写 */
  --dsw-specific-menu: var(--dsg-menu-fill);
}

/* 豁免：Tooltip 永远不吃霜 */
body[data-dsg-glass] [role="tooltip"] {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* ── 5) 降级：语法不支持 ──────────────────────────────────────────── */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  body[data-dsg-glass] {
    --dsg-fill-l1: color-mix(in srgb, var(--dsg-tint) 92%, transparent);
    --dsg-fill-l2: var(--dsg-fill-l1);
    --dsg-fill-l3: var(--dsg-fill-l1);
    --dsw-mask-blur: none;
    --dsw-menu-backdrop-filter: none;
  }
  body[data-dsg-glass] [data-composer-card],
  body[data-dsg-glass] [role="dialog"],
  body[data-dsg-glass] [class*="_bubble"]:not([role="tooltip"]),
  body[data-dsg-glass] [data-question-key] [class*="_card"],
  body[data-dsg-glass] [data-plan-review-key] [class*="_card"],
  body[data-dsg-glass] [data-approval-key] [class*="_card"] {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
}

/* ── 6) 降级：软件光栅（JS 探测挂属性） ──────────────────────────── */
body[data-dsg-fallback] {
  --dsg-fill-l1: color-mix(in srgb, var(--dsg-tint) 92%, transparent);
  --dsg-fill-l2: var(--dsg-fill-l1);
  --dsg-fill-l3: var(--dsg-fill-l1);
}
body[data-dsg-fallback] [data-composer-card]::before,
body[data-dsg-fallback] [class*="_bubble"]:not([role="tooltip"]),
body[data-dsg-fallback] [role="dialog"],
body[data-dsg-fallback] div:has(> [data-slot="sidebar"])::before,
body[data-dsg-fallback] [data-question-key] [class*="_card"],
body[data-dsg-fallback] [data-plan-review-key] [class*="_card"],
body[data-dsg-fallback] [data-approval-key] [class*="_card"] {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  background-image: none;
}
```

### 6.4b 与 live 实现的对齐（2026-10-24，`plugin/src/styles/00-foundation.css`）

规范与已落地实现必须只有一份。逐项对照后，**需要改代码的只有第 2 条（一行）**，其余是实现已经正确、本文档向它对齐命名：

| # | 项 | live 实现 | 本规格 | 处置 |
|---|---|---|---|---|
| 1 | 变量命名 | `--dsg-floor`（单值）+ `--dsg-a1/a2/a3` | 同一语义，`--dsg-aN` 为规范名，`--dsg-alpha-lN` 为等价别名 | **文档已对齐**（§6.2 / §6.4）；实现无需动 |
| 2 | L3 地板 | `--dsg-fill-l3` 读 `--dsg-floor` ⇒ A 预设下 L3 变成 `.2475 + .72×.7525 ≈ 79%`（应按 `.45` 地板算到 `.846`） | `fill-l3` 的地板槽位必须读 `--dsg-floor-base-light|dark` | **P0，改一行的代码**：`calc(var(--dsg-floor) * 100%)` → `calc(var(--dsg-floor-base-light) * 100%)`，深色块 → `--dsg-floor-base-dark`。否则"L3 恒为 B 档"失效（正是 §4.4b 护栏 #4） |
| 3 | 模糊阶梯 | `--dsg-blur-l1: 6px`、`--dsg-blur-l3: 24px` | 推荐 20 / 16 / 10 | **按面重映射即可，不必改数值**（见下） |
| 4 | 饱和度 / 亮度 / 对比度 | 1.30 / 1.04 / 1.01（全局常量） | 同 | 一致 |
| 5 | 菜单 / 遮罩通道 | `--dsg-menu-fill .86` / `--dsg-menu-filter` / `--dsg-mask-filter` | 同 | 一致 |

**模糊的"按面"口径（既然实现已经有 6 与 24 两个端点，就别改数字，改映射）**：

| 面 | 用哪个 blur token | 目标值 | 说明 |
|---|---|---|---|
| L1 页面级大面 | **不挂霜** | — | 画布级 backdrop 每帧重算（§5.9）；`--dsg-blur-l1: 6px` 只给"页面级小面板"（如 header、sticky 条）用 |
| L2 卡片 / 输入卡 / 气泡 | `--dsg-blur-l2` | 14–18px（默认 16） | 文字密度中等 |
| L3 菜单 / 下拉 / hovercard / 小浮层 | `--dsg-blur-l3` | 20–24px | 面积小、文字短；宿主菜单默认就是 `blur(40px)`，24 是"比宿主更克制" |
| L3 dialog / 设置整窗 / 文档预览 | **`--dsg-backdrop-l3-dialog`**（=`--dsg-blur-l3-dialog`，**12px**，已登记进 §6.2/§6.4） | 10–14px | 大面积 + 整窗文字；24px 在这里只烧 GPU 不加对比度 |

即：**"L1 6 / L2 16 / L3 24" 不是错，只是把 L3 的 24 用在了 menu 一类；只要 dialog 本体不吃 24px，就与本规格兼容。** 若实现不愿新增 `-dialog` 变量，就按"dialog 用 L2 的 16px"处理（16 在 10–14 的推荐区间上方，代价可接受）。

---

### 6.5 与 wallpaper-engine 同时启用：冲突矩阵与处理建议

WE 会把值**写在 `body` 行内样式**（`document.body.style.setProperty`），行内样式对同名自定义属性优先级最高；它同时改写的 token 与我们的重合面很大。冲突矩阵：

| 通道 | WE 写入 | DSG 若也写 | 结果 |
|---|---|---|---|
| `--dsw-alias-bg-layer-1/2/3` | 玻璃配方（`body[data-we-glass-page]`） | 玻璃配方 | 后声明/更高特异度胜，但**行内 `--we-*` 只影响 WE 自己的 color-mix**，token 仍是样式表之间比特异度 ⇒ 谁的 `body` 规则更具体谁赢，且**翻转主题/开关时会打架** |
| `--dsw-specific-input-major` / `-bubble` | 是 | 是 | 同上；气泡与输入卡会吃到两套地板 |
| `--dsw-mask-blur` | 是（`body[data-we-glass-page]`） | 是（`body[data-dsg-glass]`） | 同特异度 (0,1,1) ⇒ 样式表注入顺序决定成败（**不可接受**） |
| `--dsw-specific-menu` / `--dsw-menu-backdrop-filter` | **不碰** | 是 | 无冲突（WE 留白） |
| `--dsw-alias-scrollbar-*` | 是 | 是 | 冲突，同上 |
| `--dsw-alias-border-l1/l2` | 是 | 是 | 冲突（WE 用 `rgba(180,180,180,α)`） |
| `::before` 载体 | 输入卡 / 左栏 | 输入卡 / 左栏 | **同一伪元素只能有一份规则生效** ⇒ 其中一家的 `backdrop-filter` 被丢弃（"一家开、一家关"看起来像随机 bug） |
| `data-we-glass-fallback` vs `data-dsg-fallback` | 各探测各的 | — | 两套 92% 回退同时命中，重复但无害 |
| 壁纸层 / 氛围层 | `.we-layer`(z-index:-2) + `.we-scrim`(-1) | 自己的氛围层 | 需约定 z-index 与"谁画 scrim" |

**建议（按推荐度排序）**：

1. **检测后整体让路（推荐）**：启动时（以及用一个 `MutationObserver` 监听 `body` 属性）检测 `document.body.hasAttribute('data-we-glass-page')`：为真 ⇒ 写 `data-dsg-yield="we"` 并**不启用**自己的玻璃（保留氛围层可选）。
   ```css
   /* 只在 WE 不在场时生效 —— 纯 CSS 兜底，不依赖 JS 时序 */
   body[data-dsg-glass]:not([data-we-glass-page]) { /* 全部玻璃规则 */ }
   body[data-we-glass-page] [data-dsg-owned] { /* 不画 */ }
   ```
   理由：WE 的行内变量无法被样式表覆盖 ⇒ 一旦两边都算，必有一半面的观感与面板数值对不上（"面板写 90，屏幕不是 90"）。
2. **互斥开关**：设置里写"玻璃引擎：本插件 / Wallpaper Engine / 关闭"，默认自动探测。这比隐式让路更可解释。
3. **只补 WE 不覆盖的面**（次选）：WE 完全不碰**菜单通道**、**Tooltip**、**原生 select 弹层**、**胶囊 hover 的 `--dsw-alias-button-floating-hover`**；DSG 可以只做这些，且把 tier 参数从 WE 的解析值反推：
   ```js
   const cs = getComputedStyle(document.body);
   const weFloor = parseFloat(cs.getPropertyValue('--we-readability-floor')) || 0.45;
   const weAlpha = parseFloat(cs.getPropertyValue('--we-glass-alpha')) || 0.13;
   // 让 DSG 的 L2 与 WE 的输入卡同观感：alpha_l2 = weAlpha
   ```
   这条只用于"混合模式"，必须接受"两级引擎各管一半"的维护成本。
4. **命名与属性隔离**（无论哪种模式都要做）：自有属性一律 `data-dsg-*`、自有变量一律 `--dsg-*`；**不要**在样式表里给 `--we-*` 赋值（行内值会赢，造成"写了不生效"的假象）；不要 `import`/`@import` WE 的样式表。
5. **z-index 约定**：氛围层 `-2`（对应 WE `.we-layer`）、scrim `-1`（对应 `.we-scrim`）、UI 本体 `0+`；若两套都画氛围层，让 WE 的优先（它的 `html` 兜底色 + 媒体滤镜链更完整）。

---

## 7. 与 DeepSeek 参考图 / 现状截图的视觉校准

### 7.1 参考图读数（`baseline/reference/deepseek-web.png`，2529×1329，DPR≈1.5 → 1686×886 CSS）

| 面 | 读数 | 换算成我们的 tier |
|---|---|---|
| 页面背景 | 白→淡蓝雾（`#eef3fa`→`#dde7f4`），极淡 24px 网格（约 `rgba(31,58,110,0.035)`，线宽 1px），无高频纹理 | 氛围层（不是玻璃面）：建议"雾 + 网格"两层，网格 alpha ≤0.05 |
| 输入 composer | 大圆角（≈24px）近白卡，估 `rgba(255,255,255,0.55–0.62)`，边框 ≈`rgba(31,58,110,0.08)`，投影极软（≈`0 10px 30px rgba(31,58,110,0.06)`） | 这正对应我们 **L2 = 67%** 的档位（参考图背景很平，0.55 就够；本引擎壁纸可能更花 ⇒ 取 0.67） |
| 胶囊按钮 | 半透明白（≈0.62）+ 1px 冷色发丝边 | L2 的"玻璃上的按钮"子档（×1.15） |
| 主标题 | 深墨（≈`#1f2d4d`）、极细字重、大字号、字距略开 | 玻璃越透越要**压深文字**；WE 的做法是壁纸激活时把灰阶整条压深（§5.13） |
| 顶栏 | 几乎透明，只有 logo 与文字 | L1（51.6%）或直接透明 |
| 图标/链接 | DeepSeek 蓝 `#4D6BFE` 系 | 与玻璃无关，走 accent token |

### 7.2 现状截图（`baseline/screenshots/current-ui.png`）

深色、几乎**全哑光**：页面底/侧栏/输入卡/气泡都是实色（≈`#1a1a1a`~`#242424`），只有色调深浅差；输入卡圆角 ≈16px，无发丝边、无霜。⇒ 本次改造的观感跃迁点在："**把实色换成 65–85% 的同色相半透明 + 一层霜 + 一条顶部镜面高光**"，而不是"加模糊"。

### 7.3 具体校准建议（哪些面更透 / 更雾）

| 面 | 参考图倾向 | 本引擎取值 | 理由 |
|---|---|---|---|
| 页面 / 聊天画布 | 最透（背景本来就该看见） | L1 **51.6% / 65.6%**，**不加 backdrop-filter**（画布级 blur 贵且滚动重算） | 柔焦交给氛围层资产；画布靠 scrim 压暗 |
| 输入 composer | 参考图最"实"的一块 | L2 **67% / 76%**，blur 16px，sheen 最强（.16） | 打字目标 + 高频内容在其背后（对话在向上滚） |
| 消息气泡 | 参考图无气泡（官网是单栏），按"正文可读"取 | L2 同档，alpha 比输入卡**再低 20%**（WE 的 0.8 权重） | 气泡承担长正文，玻璃感让位可读性 |
| 代码块 / 工具结果 | 参考图无 | 地板 ≥75%，**不要**用 L1 | shiki 固定前景（§4.4 红名单） |
| 侧栏 | 参考图无 | L2 **67%**，竖向**不画分割线**（画了就把整块玻璃切成两半） | WE 现场口径 |
| 菜单 / 下拉 | 参考图无 | L3 子档 **86–90%**，blur 24px | 小命中区 + 短文字，最怕花背景 |
| 设置窗 / 详情 | 参考图无 | L3 **84.6% / 88.5%**，blur 10–12px | 整窗读文字；模糊别超 12px |
| Tooltip / select 弹层 | — | 不透明 | §5.2 / 红名单 |
| 发丝边 | 冷灰蓝 | 玻璃板内用中性白（.06–.08）；宿主 border token 用 `rgba(180,180,180,α)` 或设计给的冷色 | 板内白线不染玻璃色相；border token 才承载品牌色 |
| 背景氛围 | 白蓝雾 + 极淡网格 | `--dsg-ambient`: 两层 `radial-gradient` + 1px 网格，alpha ≤0.05；深色版用深蓝紫雾 | 玻璃的"通透"感一半来自背景低频 |

### 7.4 验收清单（可量化，实现完逐条过）

1. `getComputedStyle` 读到的 `--dsg-fill-l2` 合成后 alpha ∈ [0.65, 0.78]（浅）/ [0.74, 0.80]（深）；`--dsg-fill-l3` ∈ [0.83, 0.90]。
2. 每个玻璃面 `backdrop-filter` **只出现一次**（卡片本体 none、`::before` 有值）；`[data-composer-card]` 里 fixed 子元素仍相对视口定位（`getBoundingClientRect().top` 与占位元素一致）。
3. `body` 上**没有**任何 `--we-*` 赋值（避免行内值冲突）。
4. 每条 `[class*="_bubble"]` 规则都带 `:not([role="tooltip"])`（grep 计数：`_bubble` 出现次数 == 带豁免次数）。
5. 关掉 GPU（`?dsg-glassfallback=on`）后所有玻璃面 alpha ≥0.90，且控制台无报错。
6. 对比度抽检：正文色 vs 合成后表面（最坏背衬 = 浅色纯黑 / 深色纯白）≥4.5:1；浅色地板 0.45、深色 0.59 未被滑杆击穿。
7. 设置窗打开时同时存在的 `backdrop-filter` 数量 ≤3（遮罩 / 对话框 / 侧栏），避免叠加性能悬崖。
8. 滚动聊天流 1000px，无 backdrop 区域重绘导致的掉帧（DevTools Performance：`Composite Layers` 每帧 ≤1 次）。
9. **L3 未随 A 减薄**：`--dsg-fidelity: .55` 时，`getComputedStyle(body)` 的 `--dsg-floor` = `.2475`（深色 `.3245`），而 `--dsg-fill-l3` 的合成 alpha 仍 ≥0.84 —— 证明 `fill-l3` 读的是 `--dsg-floor-base-*` 而不是 `--dsg-floor`。
10. **变量名两套等价**：`--dsg-a1/a2/a3` 与 `--dsg-alpha-l1/l2/l3` 指向同一值（实现里两组都可能被写，读任一组都应得到同一数字）。

---

## 附录 A · 源定位索引（按 token/字符串搜索，行号会随版本漂移）

`client.js` 内联了 9 个样式域模块，注释里自带模块名（可直接搜）：

| 内容 | 搜索锚 |
|---|---|
| 玻璃配方总锚点 / 宿主别名映射 / 可读性下限常量 | `styles-base.js`、`READABILITY_FLOOR`、`body[data-we-glass-page]` |
| 输入卡 / 气泡 / 工具弹卡 / 轨迹 / 思考触发条 / 座位 | `styles-shell.js`、`[data-composer-card]`、`_bubble`、`[data-turn-trigger]` |
| 左栏 / 标题栏 / better-sidebar / 右栏 / 内容面 | `styles-sidebar.js`、`div:has(> [data-slot="sidebar"])`、`pI_x6G_frame` |
| 统一控件 token / 设置整窗玻璃 / 插件源浮层 | `styles-chrome.js`、`[role="dialog"]:has([data-slot="settings.section"])` |
| 软件渲染回退 | `styles-ext` 段、`data-we-glass-fallback` |
| 透明度/保真度曲线、逐面变量写值 | `function applyGlass`、`glassValue(`、`weClampSurfaceColor`、`weAccentInk` |
| 全局玻璃量（`--we-glass-*` / `--we-surface-tint-*`） | `function applyEffects`、`--we-glass-alpha` |
| 软件光栅探测 | `detectSoftwareRender`、`SOFT_RENDER_RE` |
| 默认值 / 量程 / 子面登记表 | `const DEFAULTS`、`const KINDS`、`GLASS_CHILDREN`、`GLASS_MODE_DEFAULTS` |
| 额外补雾化的选择器（`::before` 载体范式） | `weExtraGlassCss`、`extraGlassSelectors` |

宿主侧证据（用于复核 token 消费关系）：

| 事实 | 位置 |
|---|---|
| `[data-composer-card]` / `[data-composer-seat]` 源码写死 | `.ref/asar/dsh/node_modules/@deepseek-ai/dsh-client-ui-conversation/lib/client.js` |
| `[data-question-key]` / `[data-plan-review-key]` | `dsh-client-ui-user-questions/lib/client.js` |
| `[data-approval-key]` | `dsh-client-ui-approval/lib/client.js` |
| `[data-turn-trigger]` / `role="tooltip"` / 气泡 `.cJsG2q_bubble` | `dsh-client-ui-chat/lib/client.js` |
| 设置遮罩 `backdrop-filter: var(--dsw-mask-blur)`、面板 `--dsw-alias-bg-layer-2` | `dsh-client-ui-settings-general/lib/client.js` |
| 菜单 `--dsw-specific-menu` + `--dsw-menu-backdrop-filter`（直接 / `::before` 两种画法） | `dsh-client-ui-cordis`、`-conversation`、`-chat`、`-schedule`、`-subagent`、`-goal` |
| 菜单/遮罩 token 默认值 + darwin 覆写 | `baseline/ui-theme/gradient_shadow_text.pretty.css`、`design_platform.pretty.css` |
| 滚动条 token 通道 | `baseline/ui-theme/scrollbar.css` |

## 附录 B · 术语

- **floor（可读性地板）**：任何文字面的最低不透明覆盖度，浅 0.45 / 深 0.59（× fidelity）。
- **fidelity（玻璃保真度）**：0–100%，同时减薄地板覆盖度并把釉色向用户原色回退；唯一能击穿地板的旋钮。
- **釉层 alpha（a）**：该面额外叠加的染色权重，由透明度滑杆的 `max(0.10, 0.25 − p×0.15/100)` 得出。
- **effAlpha**：最终不透明度 = `floor + a·(1−floor)`；玻璃面板唯一需要验收的数字。
- **tint（釉色）**：钳制后的玻璃颜色；WE 里它同时充当"地板色"，所以玻璃面永远是单色 + alpha。
- **tier**：L1 内容面 / L2 卡片 / L3 浮层；决定 `a`、`blur`、`sheen`、外投影，不决定 `saturate/brightness/contrast`（那三个是全局常量）。
- **载体（carrier）**：承载 `backdrop-filter` 的伪元素（`::before` / `::after`），用来规避 fixed 包含块。
