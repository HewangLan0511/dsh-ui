# 发布清单（npm + GitHub）

目标：把 `dsh-skin-mistblue@1.0.0` 发布到 npm，并把仓库推上 GitHub、打 Release。
本机当前状态：npm 未登录（`npm whoami` → ENEEDAUTH）、仓库未配置 remote、没有 `gh` CLI。
下面 3 个步骤里，**登录类操作需要你本人完成**，其余已准备好。

## 0. 发布前检查（已由 `node tools/release.mjs` 自动执行）

```powershell
node tools/release.mjs
```

它会：

1. 构建 `plugin/lib/client.js`（11 个 CSS 内联）；
2. 跑 `tools/test-plugin-logic.mjs`（9/9 PASS，drag guard + i18n）；
3. `npm pack` 生成 `dist/dsh-skin-mistblue-1.0.0.tgz`（只含 `files` 白名单：
   `lib/`、`locale/`、`icon.svg`、`cordis.patch.yml`、`README.md`、`LICENSE`）；
4. `git archive` 生成 `dist/dsh-skin-mistblue-1.0.0-src.zip`；
5. 写 `dist/SHA256SUMS.txt`。

发布前确认：

- `plugin/package.json`：`version: 1.0.0`、`license: MIT`、**没有** `private: true`；
- `LICENSE` 在仓库根与 `plugin/` 各一份（npm 包内读取 `plugin/LICENSE`）；
- 工作区干净（`git status`），HEAD 即要发布的提交。

## 1. 上传 npm（已完成 · 2026-10-24）

- 包：`dsh-skin-mistblue@1.0.0`，`latest` 指向 1.0.0，public；
- 包页：<https://www.npmjs.com/package/dsh-skin-mistblue>；
- 安装：`npm install dsh-skin-mistblue`（DSH 里按 bundle 加载，设置页出现「外观 · 雾蓝」）；
- 校验：tarball shasum `3536f9225c2562a52807ed80f7cd58fafd79f52a`，9 个文件；
  从 npm 安装后的 `lib/client.js` SHA-256 与仓库构建产物一致。

> 过程记录：web 登录落下的 npm token 没有发布权限（403），
> 最终用 npmjs.com 生成的 access token 完成发布。
> registry 里还留着一个早期占位版本 `0.0.0-stage`（不是 `latest`，不会被 `npm install` 选中；
> 如需清理可 `npm deprecate dsh-skin-mistblue@0.0.0-stage "placeholder"`）。

```powershell
# 后续版本发布（在 plugin/ 目录）
npm version patch --no-git-tag-version
npm publish --access public
```

- 24 小时内可撤：`npm unpublish dsh-skin-mistblue@1.0.0 --force`（不推荐，撤包会影响已安装用户）。

## 2. 上传 GitHub（已完成 · 2026-10-24）

- 仓库：`https://github.com/HewangLan0511/dsh-ui`（**私有**，可一键改公开）；
- `main` 与全部 tag（`v1.0.0`、`v1.0-ui` … `v1.12-ui`、`baseline-v0`）已推送；
- Release：`https://github.com/HewangLan0511/dsh-ui/releases/tag/v1.0.0`
  （附件 `dsh-skin-mistblue-1.0.0.tgz` / `-src.zip` / `SHA256SUMS.txt` 已上传）；
- `plugin/package.json` 的 `repository` / `homepage` / `bugs` 已指向该仓库。

```powershell
# 之后本地改动再推送
cd C:\Users\baiyu\Desktop\dsh-ui
git push origin main
git push --tags
```

> 想公开仓库时：GitHub → Settings → General → Danger Zone → Change visibility → Public。
> 公开前请留意 `baseline/` 里有本机 profile 快照与界面截图。

> `repository` 字段已写入包内；`npm publish` 后 npm 页面会显示源码链接。

## 3. 发布后验收

```powershell
# 1) npm 元数据
npm view dsh-skin-mistblue version license keywords

# 2) 在 DSH 里重新安装（Bundle / 插件管理页，spec 填 dsh-skin-mistblue）
#    设置页应出现「外观 · 雾蓝」，标题「雾蓝玻璃外观」

# 3) 本地已验证的等效检查
node tools/test-plugin-logic.mjs
```

## 回滚

- npm：`npm unpublish`（24h 内）或发布 `1.0.1` 回退代码；
- GitHub：`git revert <commit>` 推回，或把 Release/tag 删除后重发；
- 本机 profile：按 [`OPERATIONS.md`](OPERATIONS.md) 移除 bundle，或
  `git checkout baseline-v0 -- .` 回到施工前快照。

## 产物位置

| 文件 | 用途 |
|---|---|
| `dist/dsh-skin-mistblue-1.0.0.tgz` | npm 包 / GitHub Release 附件 |
| `dist/dsh-skin-mistblue-1.0.0-src.zip` | 源码快照（含 docs、baseline、tools） |
| `dist/SHA256SUMS.txt` | 两个产物的 SHA-256 |

`dist/` 已在 `.gitignore` 中忽略，不会进仓库。
