import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PassThrough } from 'node:stream'
import { once } from 'node:events'
import test from 'node:test'
import { apply, ARTWORK_PATH, ARTWORK_ROUTE } from '../lib/index.js'

function activate() {
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
  apply(ctx)
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

test('serves the bundled artwork', async () => {
  const bytes = await readFile(ARTWORK_PATH)
  const installed = activate()
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
})
