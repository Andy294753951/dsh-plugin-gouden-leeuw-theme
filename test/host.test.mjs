import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PassThrough } from 'node:stream'
import { once } from 'node:events'
import test from 'node:test'
import { apply, ARTWORK_ROUTE } from '../lib/index.js'

function activate(artworkPath) {
  let route
  const disposers = []
  const owner = {
    webServer: {
      register(value) {
        route = value
        return () => { route = undefined }
      },
    },
    effect(factory) {
      disposers.push(factory())
    },
  }
  const ctx = {
    inject(names, callback) {
      assert.deepEqual(names, ['webServer'])
      callback(owner)
    },
  }
  apply(ctx, { artworkPath })
  return { get route() { return route }, disposers }
}

function response() {
  const stream = new PassThrough()
  stream.status = undefined
  stream.headers = undefined
  stream.chunks = []
  stream.on('data', chunk => stream.chunks.push(chunk))
  stream.writeHead = (status, headers = {}) => {
    stream.status = status
    stream.headers = headers
    return stream
  }
  return stream
}

test('serves only the configured local artwork', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'gouden-leeuw-theme-'))
  const artworkPath = join(directory, 'artwork.png')
  const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a])
  await writeFile(artworkPath, bytes)

  try {
    const installed = activate(artworkPath)
    assert.equal(installed.route.kind, 'exact')
    assert.equal(installed.route.path, ARTWORK_ROUTE)

    const res = response()
    installed.route.handler({ method: 'GET', headers: {} }, res)
    await once(res, 'finish')
    assert.equal(res.status, 200)
    assert.equal(res.headers['Content-Type'], 'image/png')
    assert.deepEqual(Buffer.concat(res.chunks), bytes)

    const post = response()
    installed.route.handler({ method: 'POST', headers: {} }, post)
    await once(post, 'finish')
    assert.equal(post.status, 405)

    installed.disposers.reverse().forEach(dispose => dispose?.())
    assert.equal(installed.route, undefined)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('rejects an artwork directory', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'gouden-leeuw-theme-'))
  try {
    assert.throws(() => activate(directory), /not a file/)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
