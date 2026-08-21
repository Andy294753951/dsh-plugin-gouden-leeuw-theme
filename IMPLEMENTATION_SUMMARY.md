# Gouden Leeuw Theme v0.4.0 — Implementation Summary

## Release scope

Version 0.4.0 packages the Gouden Leeuw Moonwell Sanctuary theme as a complete,
self-contained DeepSeek Harness web-profile plugin. The Host serves every
production asset from a versioned same-origin route; the client applies semantic
day/night tokens, mounts the artwork layers, and maps current Harness slots to
plugin-owned roles.

## Production assets

The Host manifest contains 11 versioned PNG routes under
`/gouden-leeuw-theme/v0.4.0/`:

- two pure-environment backgrounds (night and day);
- one main Gouden Leeuw portrait;
- two original sidebar chibis (day and night);
- six sanctuary UI ornaments.

Character integrity hashes:

- `assets/character/gouden-leeuw-main.png`:
  `d00196533344ba8ae98e846f1e9ba6dfc7374c9ddaf47d2ed776cc1b8d4e782e`
- `assets/character/gouden-leeuw-chibi-sidebar.png`:
  `43c119917890172c4a3d0a4b85dde3602932ff77664eb21a4a8f9194c33b6913`
- `assets/character/gouden-leeuw-chibi-sidebar-night.png`:
  `4b43d06b012e1497a8ebc8ac7a3c6a2943a42bd946c9dba7149087b84cf14841`

## Runtime behavior

- Day/night selection uses the official Harness ThemeRuntime and
  `sidebar.footer.action` slot.
- Hero, settling, and active phases keep the original main-art coordinates.
- The sidebar uses the day chibi in light mode and the night chibi in dark mode.
- The composer seat and its pseudo-element remain transparent, preserving the
  continuous sanctuary background.
- The main viewport frame is disabled.
- The activity/status rails and composer card remain aligned at desktop widths.
- The active conversation keeps its focused glass card while the outer
  `conversation-view` remains transparent, preventing a moving full-width
  horizontal divider as the viewport or conversation geometry changes.

## Verification

The final release was checked with:

```text
npm run check
node --check lib/index.js
node --check lib/client.js
npm pack --dry-run
```

The test suite covers all production routes, GET/HEAD/ETag behavior, package
version synchronization, rc.8 client contracts, original character assets,
semantic mounting, day/night switching, cleanup, and the protected layout CSS.

Visual verification was completed in the real Harness runtime on port 3080:

- 1920×1080 active night;
- 1920×1080 active day;
- 1920×1080 Hero/welcome;
- 3840×698 active night to verify that no moving full-width divider remains.

The final screenshots are stored in `gui-test-screenshots/`.

## Build output

- `scripts/build.mjs` copies `src/index.js` to `lib/index.js`.
- It embeds normalized `src/client/theme.css` and `src/client/index.js` into
  `lib/client.js`.
- `lib/` is committed so the profile can install the plugin without a separate
  compilation step.

## Compatibility and rights

The package targets the DeepSeek Harness `0.1.x` release-candidate web profile
and Node.js `^22.19.0 || >=24.0.0`. The MIT license covers project code only;
bundled artwork remains subject to `THIRD_PARTY_NOTICES.md`.
