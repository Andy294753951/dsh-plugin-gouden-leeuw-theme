import { createReadStream, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ARTWORK_ROUTE = '/gouden-leeuw-theme/artwork'
const ARTWORK_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../assets/gouden-leeuw.png')

/**
 * Serves the bundled fan-theme artwork over an exact same-origin route.
 */
export function apply(ctx) {
  const artwork = statSync(ARTWORK_PATH)
  if (!artwork.isFile()) {
    throw new TypeError(`Bundled Gouden Leeuw artwork is missing: ${ARTWORK_PATH}`)
  }

  const etag = `W/\"${artwork.size.toString(16)}-${Math.trunc(artwork.mtimeMs).toString(16)}\"`

  ctx.inject(['webServer'], (owner) => {
    owner.effect(() => owner.webServer.register({
      kind: 'exact',
      path: ARTWORK_ROUTE,
      handler(req, res) {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.writeHead(405, { Allow: 'GET, HEAD' })
          res.end()
          return
        }

        if (req.headers['if-none-match'] === etag) {
          res.writeHead(304)
          res.end()
          return
        }

        res.writeHead(200, {
          'Cache-Control': 'private, max-age=3600',
          'Content-Length': artwork.size,
          'Content-Type': 'image/png',
          'Cross-Origin-Resource-Policy': 'same-origin',
          ETag: etag,
          'X-Content-Type-Options': 'nosniff',
        })
        if (req.method === 'HEAD') {
          res.end()
          return
        }

        const stream = createReadStream(ARTWORK_PATH)
        stream.on('error', () => res.destroy())
        stream.pipe(res)
      },
    }), 'gouden-leeuw-theme: bundled artwork route')
  })
}

export { ARTWORK_PATH, ARTWORK_ROUTE }
