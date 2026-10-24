# OPERATIONS — 安装 / 更新 / 回滚

当前 profile：`desktop`（`C:\Users\baiyu\.dsh\profiles\desktop`）。
插件已通过 `plugin_manager install_bundle` 以本地 link 方式安装：`dsh-skin-mistblue` → 本仓库 `plugin/`。

## 构建

```powershell
cd C:\Users\baiyu\Desktop\dsh-ui
node tools/build-plugin.mjs
```
- 修改 `plugin/src/styles/*.css` 或 `plugin/src/client-template.js` 后必须构建。
- 构建产物 `plugin/lib/client.js` 由 client-modules 以 HMR 推送到已打开的页面（2–4 秒）。页面无需刷新；若长时间未生效，检查 DSH 是否仍运行。
- 若 DSH 桌面端以**非 development** 方式启动（「应用/编辑」菜单里没有「刷新页面」、F12 无效），
  其页面不会热重载；此时改完 CSS/JS 后需要**重启一次 DSH**（或让宿主重新加载页面）才可见。
  本仓库 `v1.6-ui` 之后即遇到这种情况：`plugin/lib/client.js` 已是最新构建，界面需重启后生效。

## 安装 / 重装

```powershell
# 通过 DSH 插件管理器（推荐；本会话已执行过一次）
# plugin_manager install_bundle { target: "C:\Users\baiyu\Desktop\dsh-ui\plugin" }
```
- 本插件是本地 link，构建产物变化走 HMR；**修改 host half（lib/index.js）或 package.json 需要重启 DSH**。
- 插件入口：设置 → 外观 · 雾蓝（`settings.section`，id `dsh-skin-mistblue`）。
- 改名前（`dsh-ui-deepseek`，v1.6 及以前）需要先从 profile 移除旧 bundle；
  v1.7 起新名字已通过 `plugin_manager` 重装，旧依赖/bundle 行已清理。

## 截图验证

```powershell
& .\tools\capture-dsh.ps1 -OutPath baseline\screenshots\<name>.png
```
会激活 DSH 主窗口后截取窗口区域（PNG）。用 `read_image` 查看。

- 窗口被其他应用挡住、又不想抢焦点时，用 `tools/shot-pw.ps1`（`PrintWindow`，可截被遮挡窗口）：
  ```powershell
  & .\tools\shot-pw.ps1 -OutPath .ref\screenshots-archive\shot.png
  ```
- 只想验证 `plugin/src/styles/*.css` 的层叠结果（例如 tooltip 玻璃），可以用验证台，
  不需要动真实窗口：
  ```powershell
  node tools/tooltip-preview.mjs
  & 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' --headless=new --disable-gpu `
      --force-device-scale-factor=2 --window-size=760,560 `
      --screenshot=.ref\tip-preview\shot.png file:///<repo>/.ref/tip-preview/light.html
  ```
  验证台按 DSH 的加载顺序引入 baseline 主题 → dsh-context 宿主 CSS → 插件 CSS，
  渲染浅/深两套 `.lc-chart-tip` 与 `[role='tooltip']` 样例。


## 回滚

1. **只回滚代码**（保留插件安装状态，样式 HMR 恢复）：
   ```powershell
   git checkout baseline-v0 -- plugin/ docs/ tools/
   node tools/build-plugin.mjs
   ```
2. **完全回滚界面**（移除插件 bundle）：
   ```powershell
   # 在 DSH 插件管理器中停用/移除 dsh-skin-mistblue；或
   # plugin_manager remove_bundle { target: "dsh-skin-mistblue" }
   ```
   移除后页面回到基线视觉（颜色模式可能仍为您切换的浅色；可在 设置 → 外观 改回）。
3. **恢复 profile 原始组合**：用 `baseline/profile/cordis.patch.yml` 与 `baseline/profile/package.json` 覆盖 `C:\Users\baiyu\.dsh\profiles\desktop\` 下同名文件（先备份），重启 DSH。
4. **恢复 wallpaper-engine / liteglass 配置**：`baseline/plugins/*.json` 覆盖回
   `C:\Users\baiyu\.dsh-wallpaper-engine\config.json`、`C:\Users\baiyu\.dsh\ui-liteglass\config.json`。

> 注意：本次改造把 DSH 颜色模式一次性切到浅色（DeepSeek 参考图基准）。回滚后如需深色，在 设置 → 外观 里改回。
