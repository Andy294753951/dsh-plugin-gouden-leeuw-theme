# DeepSeek Harness 金狮月泉圣所主题

[English](README.md)

这是一个受《碧蓝航线》金狮（Gouden Leeuw）启发的非官方社区主题。它不再把
森林当作普通网页背后的壁纸，而是让 Harness 框架本身成为深墨绿的月泉圣所：
两侧森林围合中央工作区，真实输入框成为月泉玻璃，唯一正式立绘始终保持为清晰、
独立的透明 PNG 图层。

主题完全自包含。所有生产素材随插件提供，并由 Host 侧通过同源路由交给本机 UI；
安装时不需要本地图片路径，也不修改 Harness 官方前端 `dist`。

## 主要效果

- 使用一份正式透明金狮主立绘与原始昼夜侧栏 Q 版；不重新生成人物、不模糊、不烘焙进背景。
- 采用“立绘优先”的纯环境：月亮、森林拱门、精灵遗迹与月泉水面服务于象牙白/
  薄荷绿人物主色，不再与人物争夺焦点。
- welcome 页面形成标题—输入框—人物—月泉的完整构图；active 对话态把同一张
  清晰立绘移到右侧守护位，用实色圣所玻璃隔开阅读列，而不是把人物变成幽灵水印。
- 植物/晶体复杂装饰由经过检查的透明位图承担；CSS 只负责布局、玻璃、光照、
  交互和稀疏萤火。
- 把 Harness 的稳定语义 slot / `data-*` 状态集中映射为插件自有角色；CSS 不依赖
  构建哈希类，也不叠加历史 override。
- 十一个带版本号的精确同源素材路由，支持 GET、HEAD、SHA-256 强 ETag、immutable
  缓存、同源资源策略和 MIME 防护。
- 包含响应式、减少动态效果和可逆的 Windows 安装/卸载流程。

## 环境要求

- DeepSeek Harness `0.1.x` release-candidate 系列。当前版本已在 Host
  `0.1.0-rc.7`、Web UI `0.1.0-rc.8` 上完成实机视觉验证。
- Node.js `^22.19.0` 或 `>=24.0.0`。

## Windows 安装

把仓库克隆到一个准备长期保留的位置，然后执行：

```powershell
git clone https://github.com/Andy294753951/dsh-plugin-gouden-leeuw-theme.git
Set-Location .\dsh-plugin-gouden-leeuw-theme
pwsh -File .\install.ps1
```

之后重启 `dsh web`。脚本会构建无第三方依赖的浏览器 bundle，把本地组合包加入
`web` profile，并在 `~/.dsh/profiles/web/cordis.patch.yml` 中写入一段有明确标记
的覆盖配置。

使用自定义 DSH Home 或 profile：

```powershell
pwsh -File .\install.ps1 `
  -DshHome "D:\dsh-home" `
  -DshProfile web
```

## 手动安装

先构建并加入包：

```sh
npm run build
dsh plugin --profile web add .
```

组合包会先创建一个休眠的插件条目。再把以下覆盖配置追加到
`~/.dsh/profiles/web/cordis.patch.yml`：

```yaml
- id: gouden-leeuw-theme
  disabled: false
```

修改 profile 组合后重启 `dsh web`。

## 卸载

```powershell
pwsh -File .\uninstall.ps1
```

卸载脚本会移除受管理的 profile 配置和包依赖。

## 开发与验证

```sh
npm run build
npm run check
```

- `src/client/theme.css`：圣所布局、玻璃、光照、交互与响应式规则。
- `src/client/index.js`：语义色板、生命周期、稳定宿主角色映射、唯一人物图层和萤火。
- `src/index.js`：Host 素材清单与精确同源路由。
- `assets/backgrounds/`：正式昼夜纯环境背景。
- `assets/character/`：正式主立绘 PNG 与原始昼夜侧栏 Q 版。
- `assets/ui/`：只保留经过评估的小型位图装饰。
- `lib/`：构建生成的可安装产物；通过 `npm run build` 统一更新。

构建过程会统一换行符，避免 Windows checkout 只让 bundle 产生无意义差异。

最终视觉验收已在真实 Harness 中覆盖 1920×1080 的昼夜 active 对话与 welcome
页面，并以 3840×698 超宽短视口确认会话卡片外不再出现随布局移动的全宽分界线。
最终截图保存在 `gui-test-screenshots/`。

## 兼容性说明

语义色板使用 Harness 主题服务。布局集成只读取当前 Web UI 提供的语义 slot 与稳定
`data-*` 状态，再集中映射为 `data-gouden-leeuw-role`。如果未来 Harness 改动这些
结构 hook，只需优先维护 `src/client/index.js` 的映射层；视觉 CSS 不依赖宿主构建
哈希类。目前只面向 HTTP `web` profile。

## 权利与声明

本项目是非商业、非官方同人主题，与 DeepSeek、悠星、蛮啾或勇仕没有隶属或背书关系。
《碧蓝航线》、金狮（Gouden Leeuw）、相关名称、图像与商标归各自权利方所有。
MIT 许可证只覆盖本仓库代码，不覆盖第三方或用户提供的随包素材。详情见
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
