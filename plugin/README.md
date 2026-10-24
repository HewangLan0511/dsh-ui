# dsh-skin-mistblue（雾蓝）

DeepSeek Harness（DSH）的玻璃质感皮肤：以 DeepSeek 网页端的视觉语言为基准，
雾蓝渐变氛围背景 + 分层柔光玻璃，弹窗/详情卡按可读性分级加雾。

- **install**：在 DSH 里通过插件市场 / `plugin_manager` 安装 `dsh-skin-mistblue`（npm 包）。
- **settings**：设置 → 外观 · 雾蓝：配色（浅色/深色/跟随系统）、氛围背景、玻璃透明度、模糊强度、动效开关。
- **themes**：浅色 / 深色双主题；设置页中英双语且跟随 DSH locale。
- **license**：MIT。

完整设计、玻璃规格、实现契约与逐轮交付报告见仓库根目录的 `README.md` 与 `docs/`。

## 安装（本地开发）

```powershell
node tools/build-plugin.mjs
# 然后用 DSH plugin_manager / 插件管理页安装本目录（bundle 入口 cordis.patch.yml）
```

> 本 README 是 npm 包内说明；仓库根目录 README 有截图、设计目标与完整文档索引。
