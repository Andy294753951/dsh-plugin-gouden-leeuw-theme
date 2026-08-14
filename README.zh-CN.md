# DeepSeek Harness 金狮月泉主题

[English](README.md)

这是一个非官方社区主题，灵感来自《碧蓝航线》的金狮（Gouden Leeuw）。整体采用
浅薄荷月光、月长石玻璃、萤火微粒与深翡翠夜色；在欢迎页保持角色构图鲜明，进入
对话后会主动降低视觉占比，让消息、工具与代码重新成为阅读中心。

主题现在是完整自包含的：金狮立绘随插件提供，由 Host 侧通过固定同源地址提供给
本机 UI。安装时不需要准备图片，也不需要填写任何本地路径。

## 主要效果

- 通过 Harness 原生主题服务统一适配浅色与深色模式。
- 欢迎页突出角色，活跃对话中自动弱化背景图。
- 月长石玻璃面板、薄荷高光、月色渐变和萤火动画。
- 支持“减少动态效果”系统设置。
- 不修改官方前端 `dist`，安装与卸载都可逆。

## 环境要求

- DeepSeek Harness `0.1.0-rc.5` 或更新的 `0.1.x` 版本。
- Node.js `^22.19.0` 或 `>=24.0.0`。

## Windows 安装

把仓库克隆到一个准备长期保留的位置，然后执行：

```powershell
git clone https://github.com/Andy294753951/dsh-plugin-gouden-leeuw-theme.git
Set-Location .\dsh-plugin-gouden-leeuw-theme
pwsh -File .\install.ps1
```

之后重启 `dsh web`。脚本会构建无第三方依赖的浏览器 bundle，把本地组合包加入
`web` profile，并在 `~/.dsh/profiles/web/cordis.patch.yml` 中写入一段有明确标记的覆盖配置。

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
npm run check
```

- `src/client/theme.css`：视觉规则。
- `src/client/index.js`：浏览器主题与萤火效果。
- `src/index.js`：Host 侧内置图片路由。
- `assets/`：主题自带的金狮立绘。
- `lib/`：生成后需要提交的可安装产物。

## 兼容性说明

语义色板走官方主题服务；部分布局细节不可避免地使用了当前 Web UI 的生成类名，
Harness 后续大版本更新时可能需要维护选择器。目前只面向 HTTP `web` profile。

## 权利与声明

本项目是非商业、非官方的同人主题，与 DeepSeek、悠星、蛮啾或勇仕没有隶属或背书关系。
《碧蓝航线》、金狮（Gouden Leeuw）、相关名称、图像与商标归各自权利方所有。MIT
许可证只覆盖本仓库代码，不覆盖随主题提供的立绘。图片来源及声明见
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
