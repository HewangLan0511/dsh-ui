# DSH × DeepSeek Web — UI 玻璃化重构

以 DeepSeek 网页端（deepseek.com）的视觉语言为基准，重构 DSH（DeepSeek Harness）桌面/Web GUI 的界面与交互：
整体透明、浅色空气感、大留白、柔光玻璃，弹窗/显示卡/详情卡按可读性分级加雾（backdrop blur）。

## 仓库结构

```
baseline/            施工前快照（可回滚点）
  profile/           当前 profile 的 cordis.patch.yml / package.json 副本
  plugins/           ui-liteglass 与 wallpaper-engine 的当前配置
  ui-theme/          DSH 主题 token 样式表（从 app.asar 提取）与 WE 玻璃 CSS 参考
  screenshots/       当前界面截图
  reference/         DeepSeek 网页端参考图
docs/                设计规格、玻璃引擎规格、DSH 页面/选择器清单、任务板
plugin/              新插件 dsh-ui-deepseek（本项目主要产物）
tools/               提取/构建/安装/截图/回滚脚本
```

## 设计目标（摘要）

- **视觉**：DeepSeek 蓝 `#4D6BFE`、雾蓝白渐变氛围背景 + 极淡网格、超大留白、圆角胶囊、柔和分层阴影。
- **透明**：所有面板/卡片/浮层半透明，背景为 CSS 氛围层（可选：与 wallpaper-engine 壁纸共存）。
- **可读性分级加雾**：全宽内容面低雾；卡片/设置页中雾；弹窗/详情/小浮层高雾。具体数值来自 wallpaper-engine 的 `glassAlpha` / `*Transparency` / `*Blur` 逻辑。
- **交互**：轻量动效（150–220ms）、hover 抬升、焦点环、胶囊按钮、发送按钮浮起。

## 开发与回滚

```powershell
# 构建插件 client（CSS + JS 内联）
node tools/build-plugin.mjs

# 安装/更新到当前 profile（HMR 生效；重包安装需重启）
# 见 docs/OPERATIONS.md

# 回滚到施工前快照
git checkout baseline-v0 -- .
# 或卸载 bundle（见 docs/OPERATIONS.md）
```

基线提交：`baseline-v0`（`git log --oneline --decorate` 查看）。

## 状态

- [x] 仓库初始化 + 基线快照
- [ ] 设计规格 / 玻璃引擎规格 / 页面清单
- [ ] 插件骨架 + 安装链路
- [ ] 壳层（背景、侧栏、标题栏、输入区）
- [ ] 内容面（消息、工具卡、代码块、轨迹）
- [ ] 浮层（弹窗、设置、详情、菜单、通知）
- [ ] 视觉验收（截图对比）+ 交互验收
