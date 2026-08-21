import { createReadStream, readFileSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

/**
 * Production art stays in independent files so the backgrounds and small
 * ornaments can be cached and composed without baking UI into artwork.
 */
const THEME_ASSETS = Object.freeze([
  Object.freeze({
    id: 'background-night',
    route: '/gouden-leeuw-theme/v0.4.0/background/night',
    path: resolve(here, '../assets/backgrounds/moonwell-sanctuary-v05.png'),
    contentType: 'image/png',
  }),
  Object.freeze({
    id: 'background-day',
    route: '/gouden-leeuw-theme/v0.4.0/background/daylight',
    path: resolve(here, '../assets/backgrounds/cda34f3a-0097-423e-afcf-62d6bed2e3d4.png'),
    contentType: 'image/png',
  }),
  Object.freeze({
    id: 'character',
    route: '/gouden-leeuw-theme/v0.4.0/character/main',
    path: resolve(here, '../assets/character/gouden-leeuw-main.png'),
    contentType: 'image/png',
  }),
  Object.freeze({
    id: 'sidebar-buddy-day',
    route: '/gouden-leeuw-theme/v0.4.0/character/chibi-sidebar',
    path: resolve(here, '../assets/character/gouden-leeuw-chibi-sidebar.png'),
    contentType: 'image/png',
  }),
  Object.freeze({
    id: 'sidebar-buddy-night',
    route: '/gouden-leeuw-theme/v0.4.0/character/chibi-sidebar-night',
    path: resolve(here, '../assets/character/gouden-leeuw-chibi-sidebar-night.png'),
    contentType: 'image/png',
  }),
  Object.freeze({
    id: 'corner',
    route: '/gouden-leeuw-theme/v0.4.0/chrome/corner-left',
    path: resolve(here, '../assets/ui/moonwell-corner.png'),
    contentType: 'image/png',
  }),
  Object.freeze({
    id: 'sidebar-crest',
    route: '/gouden-leeuw-theme/v0.4.0/chrome/sidebar-relic',
    path: resolve(here, '../assets/ui/sidebar-crest.png'),
    contentType: 'image/png',
  }),
  Object.freeze({
    id: 'top-rail',
    route: '/gouden-leeuw-theme/v0.4.0/chrome/top-rail',
    path: resolve(here, '../assets/ui/moonwell-top-rail.png'),
    contentType: 'image/png',
  }),
  Object.freeze({
    id: 'composer-crown',
    route: '/gouden-leeuw-theme/v0.4.0/chrome/composer-crown',
    path: resolve(here, '../assets/ui/moonwell-composer-crown.png'),
    contentType: 'image/png',
  }),
  Object.freeze({
    id: 'sidebar-crown',
    route: '/gouden-leeuw-theme/v0.4.0/chrome/sidebar-crown',
    path: resolve(here, '../assets/ui/moonwell-sidebar-crown.png'),
    contentType: 'image/png',
  }),
  Object.freeze({
    id: 'frame-anchor-right',
    route: '/gouden-leeuw-theme/v0.4.0/chrome/frame-anchor-right',
    path: resolve(here, '../assets/ui/moonwell-frame-anchor-right.png'),
    contentType: 'image/png',
  }),
])

function assetHeaders(asset, etag) {
  return {
    'Cache-Control': 'private, max-age=31536000, immutable',
    'Content-Length': asset.size,
    'Content-Type': asset.contentType,
    'Cross-Origin-Resource-Policy': 'same-origin',
    ETag: etag,
    'X-Content-Type-Options': 'nosniff',
  }
}

function createAssetHandler(definition) {
  const stat = statSync(definition.path)
  if (!stat.isFile()) {
    throw new TypeError(`Gouden Leeuw theme asset is missing: ${definition.path}`)
  }

  const asset = { ...definition, size: stat.size }
  const digest = createHash('sha256').update(readFileSync(definition.path)).digest('base64url')
  const etag = `"sha256-${digest}"`
  const headers = assetHeaders(asset, etag)

  return function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' })
      res.end()
      return
    }

    if (req.headers?.['if-none-match'] === etag) {
      const { ['Content-Length']: _length, ...notModifiedHeaders } = headers
      res.writeHead(304, notModifiedHeaders)
      res.end()
      return
    }

    res.writeHead(200, headers)
    if (req.method === 'HEAD') {
      res.end()
      return
    }

    const stream = createReadStream(definition.path)
    stream.on('error', () => res.destroy())
    stream.pipe(res)
  }
}

/**
 * Register exact same-origin routes for the production asset manifest.
 */
export function apply(ctx) {
  const routes = THEME_ASSETS.map(definition => ({
    definition,
    handler: createAssetHandler(definition),
  }))

  ctx.inject(['webServer'], (owner) => {
    for (const { definition, handler } of routes) {
      owner.effect(
        () => owner.webServer.register({
          kind: 'exact',
          path: definition.route,
          handler,
        }),
        `gouden-leeuw-theme: ${definition.id} route`,
      )
    }
  })
}

export { THEME_ASSETS }
