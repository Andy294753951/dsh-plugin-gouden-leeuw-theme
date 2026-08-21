# Gouden Leeuw Moonwell Sanctuary for DeepSeek Harness

[简体中文](README.zh-CN.md)

An unofficial community theme for the DeepSeek Harness web UI, inspired by
Gouden Leeuw from *Azur Lane*. The composition turns the Harness frame itself
into a dark emerald moonwell sanctuary: a pure forest environment surrounds a
calm central work area, the real composer becomes moonwell glass, and the
official character artwork remains one sharp, independent transparent layer.

The theme is self-contained. All production artwork is bundled with the plugin
and served to the local UI by the Host side; installation does not require a
local artwork path or a patched Harness frontend.

## Highlights

- One authoritative transparent Gouden Leeuw main PNG plus original day/night
  sidebar chibis; no regenerated, blurred, or background-baked character.
- A character-first pure environment: moon, forest arches, elven ruins and
  moonwell water support the pale ivory/mint artwork instead of competing with
  it.
- A composed welcome state and a sharp right-side guardian placement in active
  conversations; the reading column uses solid sanctuary glass instead of
  turning the character into a translucent watermark.
- Raster botanical/crystal anchors establish the sanctuary chrome while CSS is
  limited to layout, glass, lighting, interaction and sparse firefly motes.
- Stable Harness data hooks mapped to plugin-owned roles; the stylesheet does
  not depend on generated CSS-module class names or stacked legacy overrides.
- Eleven versioned exact same-origin asset routes with GET, HEAD, strong SHA-256
  ETags, immutable caching, same-origin resource policy and MIME hardening.
- Responsive and reduced-motion safeguards, plus a reversible PowerShell
  installer for the standard `web` profile.

## Requirements

- DeepSeek Harness in the `0.1.x` release-candidate line. The current build was
  visually verified with Host `0.1.0-rc.7` and web UI `0.1.0-rc.8`.
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

## Development and verification

```sh
npm run build
npm run check
```

- `src/client/theme.css`: sanctuary layout, glass, lighting, interaction, and
  responsive rules.
- `src/client/index.js`: semantic palette, lifecycle, stable host-role mapping,
  the unique character layer, and firefly nodes.
- `src/index.js`: the Host asset manifest and exact same-origin routes.
- `assets/backgrounds/`: the production day and night pure-environment backgrounds.
- `assets/character/`: the authoritative main PNG and original day/night sidebar chibis.
- `assets/ui/`: small reviewed raster ornaments only.
- `lib/`: generated installable output; regenerate it with `npm run build`.

The committed build normalizes source line endings so Windows checkouts do not
create noisy bundle-only diffs.

The final visual pass was exercised in the real Harness runtime at 1920×1080
for day/night active conversations and the welcome state, plus 3840×698 to
verify that no moving full-width divider remains outside the conversation card.
The captured evidence is stored in `gui-test-screenshots/`.

## Compatibility note

The semantic palette uses the Harness theme service. Layout integration uses
semantic slots and stable `data-*` state exposed by the current web UI, then
maps them to plugin-owned `data-gouden-leeuw-role` attributes. A future Harness
release that changes those structural hooks may require a small mapping update
in `src/client/index.js`; visual CSS remains isolated from generated host class
names. The package targets the HTTP `web` profile.

## Rights and attribution

This is a non-commercial, unofficial fan project and is not affiliated with or
endorsed by DeepSeek, Yostar, Manjuu, or Yongshi. *Azur Lane*, Gouden Leeuw,
their names, artwork, and related marks belong to their respective rights
holders. The MIT license covers only the code in this repository, not bundled
third-party or user-supplied artwork. See
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
