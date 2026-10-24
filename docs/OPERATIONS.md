# OPERATIONS — 安装 / 更新 / 回滚

当前 profile：`desktop`（`C:\Users\baiyu\.dsh\profiles\desktop`）。
插件已通过 `plugin_manager install_bundle` 以本地 link 方式安装：`dsh-ui-deepseek` → 本仓库 `plugin/`。

## 构建

```powershell
cd C:\Users\baiyu\Desktop\dsh-ui
node tools/build-plugin.mjs
```
- 修改 `plugin/src/styles/*.css` 或 `plugin/src/client-template.js` 后必须构建。
- 构建产物 `plugin/lib/client.js` 由 client-modules 以 HMR 推送到已打开的页面（2–4 秒）。页面无需刷新；若长时间未生效，检查 DSH 是否仍运行。

## 安装 / 重装

```powershell
# 通过 DSH 插件管理器（推荐；本会话已执行过一次）
# plugin_manager install_bundle { target: "C:\Users\baiyu\Desktop\dsh-ui\plugin" }
```
- 本插件是本地 link，构建产物变化走 HMR；**修改 host half（lib/index.js）或 package.json 需要重启 DSH**。
- 插件入口：设置 → 外观 · DeepSeek（`settings.section`，id `dsh-ui-deepseek`）。

## 截图验证

```powershell
& .\tools\capture-dsh.ps1 -OutPath baseline\screenshots\<name>.png
```
会激活 DSH 主窗口后截取窗口区域（PNG）。用 `read_image` 查看。

## 回滚

1. **只回滚代码**（保留插件安装状态，样式 HMR 恢复）：
   ```powershell
   git checkout baseline-v0 -- plugin/ docs/ tools/
   node tools/build-plugin.mjs
   ```
2. **完全回滚界面**（移除插件 bundle）：
   ```powershell
   # 在 DSH 插件管理器中停用/移除 dsh-ui-deepseek；或
   # plugin_manager remove_bundle { target: "dsh-ui-deepseek" }
   ```
   移除后页面回到基线视觉（颜色模式可能仍为您切换的浅色；可在 设置 → 外观 改回）。
3. **恢复 profile 原始组合**：用 `baseline/profile/cordis.patch.yml` 与 `baseline/profile/package.json` 覆盖 `C:\Users\baiyu\.dsh\profiles\desktop\` 下同名文件（先备份），重启 DSH。
4. **恢复 wallpaper-engine / liteglass 配置**：`baseline/plugins/*.json` 覆盖回
   `C:\Users\baiyu\.dsh-wallpaper-engine\config.json`、`C:\Users\baiyu\.dsh\ui-liteglass\config.json`。

> 注意：本次改造把 DSH 颜色模式一次性切到浅色（DeepSeek 参考图基准）。回滚后如需深色，在 设置 → 外观 里改回。
