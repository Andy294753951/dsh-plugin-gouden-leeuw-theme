import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PassThrough } from 'node:stream'
import { once } from 'node:events'
import { createHash } from 'node:crypto'
import test from 'node:test'
import { apply, THEME_ASSETS } from '../lib/index.js'

function activate() {
  const routes = new Map()
  const disposers = []
  const owner = {
    webServer: {
      register(value) {
        routes.set(value.path, value)
        return () => routes.delete(value.path)
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
  return { routes, disposers }
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

test('serves every production asset with GET, HEAD and ETag support', async () => {
  const installed = activate()
  assert.equal(installed.routes.size, THEME_ASSETS.length)

  for (const asset of THEME_ASSETS) {
    const route = installed.routes.get(asset.route)
    const bytes = await readFile(asset.path)
    assert.equal(route.kind, 'exact')

    const get = response()
    route.handler({ method: 'GET', headers: {} }, get)
    await once(get, 'finish')
    assert.equal(get.status, 200)
    assert.equal(get.headers['Cache-Control'], 'private, max-age=31536000, immutable')
    assert.equal(get.headers['Content-Type'], asset.contentType)
    assert.equal(get.headers['Content-Length'], bytes.length)
    assert.equal(get.headers.ETag, `"sha256-${createHash('sha256').update(bytes).digest('base64url')}"`)
    assert.deepEqual(Buffer.concat(get.chunks), bytes)

    const head = response()
    route.handler({ method: 'HEAD', headers: {} }, head)
    await once(head, 'finish')
    assert.equal(head.status, 200)
    assert.equal(Buffer.concat(head.chunks).length, 0)

    const cached = response()
    route.handler({
      method: 'GET',
      headers: { 'if-none-match': get.headers.ETag },
    }, cached)
    await once(cached, 'finish')
    assert.equal(cached.status, 304)
    assert.equal(cached.headers.ETag, get.headers.ETag)
    assert.equal(cached.headers['Content-Length'], undefined)

    const post = response()
    route.handler({ method: 'POST', headers: {} }, post)
    await once(post, 'finish')
    assert.equal(post.status, 405)
    assert.equal(post.headers.Allow, 'GET, HEAD')
  }

  installed.disposers.reverse().forEach(dispose => dispose?.())
  assert.equal(installed.routes.size, 0)
})

test('keeps the client and Host asset routes on the package version', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  const clientSource = await readFile(new URL('../src/client/index.js', import.meta.url), 'utf8')
  const expectedPrefix = `/gouden-leeuw-theme/v${packageJson.version}/`
  const routes = new Set(THEME_ASSETS.map(asset => asset.route))

  assert.equal(THEME_ASSETS.length, 11)
  assert.equal(routes.size, THEME_ASSETS.length)
  for (const asset of THEME_ASSETS) {
    assert.equal(asset.route.startsWith(expectedPrefix), true)
    assert.equal(clientSource.includes(`'${asset.route}'`), true)
  }
})

test('declares the rc.8 client contracts used by the official tone control', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
  assert.deepEqual(packageJson.dsh.client.inject, [
    '@deepseek-ai/dsh-client-runtime',
    '@deepseek-ai/dsh-client-ui-theme',
    '@deepseek-ai/dsh-client-ui-sidebar',
  ])
  for (const name of [
    '@deepseek-ai/dsh-client-runtime',
    '@deepseek-ai/dsh-client-ui-theme',
    '@deepseek-ai/dsh-client-ui-sidebar',
  ]) {
    assert.match(packageJson.peerDependencies[name], /rc\.8/)
  }
  assert.equal('react' in packageJson.peerDependencies, false)
})

test('serves the original main and day/night sidebar character layers', async () => {
  const clientSource = await readFile(new URL('../src/client/index.js', import.meta.url), 'utf8')
  const character = THEME_ASSETS.find(asset => asset.id === 'character')
  const day = THEME_ASSETS.find(asset => asset.id === 'sidebar-buddy-day')
  const night = THEME_ASSETS.find(asset => asset.id === 'sidebar-buddy-night')
  assert.ok(character)
  assert.ok(day)
  assert.ok(night)
  assert.equal(character.route, '/gouden-leeuw-theme/v0.4.0/character/main')
  assert.equal(day.route, '/gouden-leeuw-theme/v0.4.0/character/chibi-sidebar')
  assert.equal(night.route, '/gouden-leeuw-theme/v0.4.0/character/chibi-sidebar-night')
  assert.match(character.path, /assets[\\/]character[\\/]gouden-leeuw-main\.png$/)
  assert.match(day.path, /assets[\\/]character[\\/]gouden-leeuw-chibi-sidebar\.png$/)
  assert.match(night.path, /assets[\\/]character[\\/]gouden-leeuw-chibi-sidebar-night\.png$/)
  assert.match(clientSource, /character:\s*'\/gouden-leeuw-theme\/v0\.4\.0\/character\/main'/)
  assert.match(clientSource, /sidebarBuddyDay:\s*'\/gouden-leeuw-theme\/v0\.4\.0\/character\/chibi-sidebar'/)
  assert.match(clientSource, /sidebarBuddyNight:\s*'\/gouden-leeuw-theme\/v0\.4\.0\/character\/chibi-sidebar-night'/)
})
