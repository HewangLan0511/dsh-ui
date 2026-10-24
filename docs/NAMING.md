# 皮肤插件命名建议（NAMING）

> **决定（2026-10-24）：采用 `dsh-skin-mistblue` /「雾蓝 / Mistblue」。**
> 已在 v1.7 完成改名、安装与配置迁移；本文件保留候选清单作为决策记录。

给这套「雾蓝白 + 液态玻璃 + 大留白」的 DSH 皮肤插件起名。工程名
`dsh-ui-deepseek`（v1.6 及以前）带品牌词、偏长，作为皮肤发布/分享时换成
不占用商标、可检索、能一眼记住的名字。

## 命名原则

1. 2–4 个汉字 / 2 个音节：口播、输入、记忆成本低。
2. 意象来自 DeepSeek 的「海 · 鲸 · 深蓝」+ 本皮肤的「雾 · 玻璃 · 光」。
3. 不直接使用 `DeepSeek` 商标词（发布到公开 registry 时避免审核/抢注风险）。
4. 中英成对，中英音近或意近，便于 `locale/zh.json · en.json` 双侧文案。
5. 先 `npm view <name>` 查重再用。

## 已采用

| 项 | 值 |
|---|---|
| 中文名 | **雾蓝** |
| 英文名 | **Mistblue** |
| npm 包 | `dsh-skin-mistblue` |
| 插件 id / 设置页 | `dsh-skin-mistblue` / 「外观 · 雾蓝」 |
| Slogan | 把 DeepSeek 的海雾，做成 DSH 的一层玻璃。 |

理由：直白命中浅色氛围层与蓝色雾核，中英同名同义（Mist + Blue），
读起来轻、拼写简单，作为皮肤名不会喧宾夺主。

## 其他候选（按风格分流）

| 中文 | 英文 | 气质 | 适合的侧重点 |
|---|---|---|---|
| **澜镜** | Lan Mirror | 海雾 + 镜面 | 强调液态玻璃与反光（首轮推荐） |
| **霜见** | Frostline | 清冷、克制 | 强调「雾/霜」质感与可读性 |
| **璃光** | Glasslight | 明亮、通透 | 强调玻璃高光与液态反光 |
| **白澜** | Whitripple | 安静、留白 | 强调大留白与空气感 |
| **澄** | Clarity | 极简、单字 | 极简品牌向，适合做成图标字标 |

## 不推荐

- `deepseek-glass` / `dsh-ui-deepseek`：公开分发时占用品牌词，且名字长、难记。
- `玻璃拟态` / `glassmorphism` / `极光`：通用词或已被大量占用，检索会沉底。
- 纯拼音（`wulan` / `shuangjian`）：容易与地名/人名撞车。

## 改名清单（v1.7 已全部执行）

需要同步的位置：根 `README.md`、`plugin/package.json` 的 `name`、
`plugin/cordis.patch.yml` 的插件行 id、desktop profile 的依赖/`bundles` 列表、
`docs/*` 里的插件名、设置页标题文案（`client-template.js` 的 `T()`）。
代码内部 `data-plugin` / `data-plugin-css` 已切到 `dsh-skin-mistblue`；
localStorage 键改为 `dsh-skin-mistblue/*`，并保留一次性读取迁移自
`dsh-ui-deepseek/config`、`/color`，旧设置不丢。

