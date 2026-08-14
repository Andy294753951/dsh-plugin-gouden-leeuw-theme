# Gouden Leeuw Moonlit Sanctuary for DeepSeek Harness

[简体中文](README.zh-CN.md)

An unofficial community theme for the DeepSeek Harness web UI, inspired by
Gouden Leeuw from *Azur Lane*. It combines pale mint moonlight, translucent
"moonstone" surfaces, a quieter reading state, animated firefly motes, and a
deep emerald night palette.

The theme is self-contained: the Gouden Leeuw artwork is bundled with the
plugin and served to the local UI by the Host side. No local artwork path is
required during installation.

## Highlights

- Carefully tuned light and dark palettes using the native DSH theme service.
- A vivid hero composition that automatically recedes during active chats.
- Soft glass panels, mint accents, moonlit gradients, and reduced-motion support.
- One exact same-origin route for the bundled artwork; no frontend dist patching.
- Reversible PowerShell installer for the standard `web` profile.

## Requirements

- DeepSeek Harness `0.1.0-rc.5` or newer in the `0.1.x` line.
- Node.js `^22.19.0` or `>=24.0.0`.

## Install on Windows

Clone the repository to a location you intend to keep, then run:

```powershell
git clone https://github.com/Andy294753951/dsh-plugin-gouden-leeuw-theme.git
Set-Location .\dsh-plugin-gouden-leeuw-theme
pwsh -File .\install.ps1
```

Restart `dsh web`. The script builds the dependency-free client bundle, adds
this local bundle to the `web` profile, and writes one clearly marked override
to `~/.dsh/profiles/web/cordis.patch.yml`.

To use a non-default DSH home or profile:

```powershell
pwsh -File .\install.ps1 `
  -DshHome "D:\dsh-home" `
  -DshProfile web
```

## Manual installation

Build and add the package:

```sh
npm run build
dsh plugin --profile web add .
```

The package bundle creates a dormant plugin row. Append the following override
to `~/.dsh/profiles/web/cordis.patch.yml`:

```yaml
- id: gouden-leeuw-theme
  disabled: false
```

Restart `dsh web` after changing the profile composition.

## Uninstall

```powershell
pwsh -File .\uninstall.ps1
```

The uninstaller removes the managed profile block and package dependency.

## Development

The client bundle uses the format expected by the Harness plugin loader and is
generated without third-party build tooling:

```sh
npm run check
```

Edit `src/client/theme.css` for visual rules, `src/client/index.js` for browser
behavior, and `src/index.js` for the Host artwork route. The bundled image lives
in `assets/`. Commit the generated `lib/` files so a profile can install
directly from the repository.

## Compatibility note

The semantic palette uses the supported theme service. Some layout polish
necessarily targets the current web UI's generated class names, so a future
Harness release may require selector maintenance. This package currently
targets the HTTP `web` profile.

## Rights and attribution

This is a non-commercial, unofficial fan project and is not affiliated with or
endorsed by DeepSeek, Yostar, Manjuu, or Yongshi. *Azur Lane*, Gouden Leeuw,
their names, artwork, and related marks belong to their respective rights
holders. The MIT license covers only the code in this repository, not the
bundled artwork. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the
source and artwork notice.
