# 皮肤插件命名建议（NAMING）

给这套「雾蓝白 + 液态玻璃 + 大留白」的 DSH 皮肤插件起名。当前仓库/包名
`dsh-ui-deepseek` 是内部工程名（带品牌词、偏长），若要作为皮肤发布/分享，建议换成
不占用商标、可检索、能一眼记住的名字。

## 命名原则

1. 2–4 个汉字 / 2 个音节：口播、输入、记忆成本低。
2. 意象来自 DeepSeek 的「海 · 鲸 · 深蓝」+ 本皮肤的「雾 · 玻璃 · 光」。
3. 不直接使用 `DeepSeek` 商标词（发布到公开 registry 时避免审核/抢注风险）。
4. 中英成对，中英音近或意近，便于 `locale/zh.json · en.json` 双侧文案。
5. 先 `npm view <name>` 查重再用。

## 首选

| 项 | 值 |
|---|---|
| 中文名 | **澜镜** |
| 英文名 | **Lan Mirror** |
| npm 包 | `dsh-skin-lanmirror`（备选 `dsh-ui-lanmirror`） |
| 插件 id / 设置页 | `dsh-ui-lanmirror` / 「外观 · 澜镜」 |
| Slogan | 一层雾蓝色的玻璃，把 DeepSeek 的海雾带进 DSH。 |

理由：**澜**承接 DeepSeek 的海/深蓝意象（也与「深度求索」的水面感一致），
**镜**点出液态玻璃与反光；两个字都能直接联想到水 + 透明，且「澜镜」不是常见词组，
搜索干扰低，中英读音（Lán Jìng / Lan Mirror）都顺口。

## 备选（按风格分流）

| 中文 | 英文 | 气质 | 适合的侧重点 |
|---|---|---|---|
| **霜见** | Frostline | 清冷、克制 | 强调「雾/霜」质感与可读性 |
| **雾蓝** | Mistblue | 直白、轻盈 | 强调浅色氛围层、蓝色雾核 |
| **璃光** | Glasslight | 明亮、通透 | 强调玻璃高光与液态反光 |
| **白澜** | Whitripple | 安静、留白 | 强调大留白与空气感 |
| **澄** | Clarity | 极简、单字 | 极简品牌向，适合做成图标字标 |

## 不推荐

- `deepseek-glass` / `dsh-ui-deepseek`：公开分发时占用品牌词，且名字长、难记。
- `玻璃拟态` / `glassmorphism` / `极光`：通用词或已被大量占用，检索会沉底。
- 纯拼音（`wulan` / `shuangjian`）：容易与地名/人名撞车。

## 改名成本（如果选定了）

需要同步的位置：根 `README.md`、`plugin/package.json` 的 `name`、
`plugin/cordis.patch.yml` 的插件行 id、desktop profile 的依赖/`bundles` 列表、
`docs/*` 里的插件名、设置页标题文案（`client-template.js` 的 `T()`）。
代码内部 `data-plugin="dsh-ui-deepseek"`、`data-plugin-css`、localStorage key
（`dsh-ui-deepseek/config`、`/color`）可以保留旧值以免用户配置丢失，或写一次迁移。
