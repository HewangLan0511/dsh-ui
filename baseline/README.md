# 基线快照（施工前）

本目录保存 2026-10-24 开始改造前的 DSH UI 状态，用于回滚。

- `profile/cordis.patch.yml`、`profile/package.json`：当前 `desktop` profile 的组合与依赖。
- `plugins/ui-liteglass.config.json`：liteglass 外观插件配置。
- `plugins/wallpaper-engine.config.json`：wallpaper-engine 当前玻璃/透明/模糊配置（本次模糊逻辑的参考源）。
- `ui-theme/*.css`：从 `app.asar` 的 `@deepseek-ai/dsh-client-ui-theme` 提取的主题样式表（`design_platform.css` 是颜色 token 的权威定义）。
- `ui-theme/we-*.css`：wallpaper-engine 的玻璃 CSS（chat / sidebar / controls-settings），用于复用其设计逻辑。
- `screenshots/current-ui.png`：改造前界面截图。
- `reference/deepseek-web.png`：用户提供的 DeepSeek 网页端参考图。

## 回滚方式

- Git：`git checkout baseline-v0 -- .`（恢复仓库内文件），或切回 tag `baseline-v0`。
- DSH 侧：按 `docs/OPERATIONS.md` 卸载 `dsh-ui-deepseek` bundle；profile 的原始 `cordis.patch.yml`/`package.json` 可直接从本目录覆盖回去。
