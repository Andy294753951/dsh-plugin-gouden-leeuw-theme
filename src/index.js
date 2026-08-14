import { createReadStream, statSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import z from '@deepseek-ai/schemastery'

const ARTWORK_ROUTE = '/gouden-leeuw-theme/artwork'
const MIME_TYPES = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

export const Config = z.object({
  artworkPath: z.string().required(),
})

/**
 * Serves one explicitly configured local artwork file over an exact,
 * same-origin route. The repository never bundles or copies that artwork.
 */
export function apply(ctx, config) {
  const artworkPath = resolve(config.artworkPath)
  const artwork = statSync(artworkPath)
  if (!artwork.isFile()) {
    throw new TypeError(`Gouden Leeuw theme artwork is not a file: ${artworkPath}`)
  }

  const contentType = MIME_TYPES[extname(artworkPath).toLowerCase()] ?? 'application/octet-stream'
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
          'Content-Type': contentType,
          'Cross-Origin-Resource-Policy': 'same-origin',
          ETag: etag,
          'X-Content-Type-Options': 'nosniff',
        })
        if (req.method === 'HEAD') {
          res.end()
          return
        }

        const stream = createReadStream(artworkPath)
        stream.on('error', () => res.destroy())
        stream.pipe(res)
      },
    }), 'gouden-leeuw-theme: local artwork route')
  })
}

export { ARTWORK_ROUTE }
