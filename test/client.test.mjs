import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import test from 'node:test'

function element(tagName) {
  return {
    tagName,
    dataset: {},
    style: { values: {}, setProperty(name, value) { this.values[name] = value } },
    children: [],
    removed: false,
    appendChild(child) { this.children.push(child) },
    setAttribute(name, value) { this[name] = value },
    remove() { this.removed = true },
  }
}

test('registers a DSH client plugin and cleans up its DOM effects', async () => {
  let descriptor
  const head = element('head')
  const body = element('body')
  body.prepend = child => body.children.unshift(child)
  const documentElement = element('html')
  const document = {
    title: 'DeepSeek Harness',
    body,
    head,
    documentElement,
    createElement: element,
    querySelector: () => null,
  }
  const window = {
    __ModuleLoader__: { load(value) { descriptor = value } },
  }

  const bundle = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  vm.runInNewContext(bundle, { document, encodeURIComponent, window })
  assert.equal(descriptor.id, 'dsh-plugin-gouden-leeuw-theme')

  const plugin = descriptor.factory(() => { throw new Error('no external module expected') })
  assert.deepEqual([...plugin.inject], ['theme'])

  let overrideSource
  let overrideTokens
  let paletteDisposed = false
  const disposers = []
  const ctx = {
    theme: {
      overrideTokens(source, tokens) {
        overrideSource = source
        overrideTokens = tokens
        return () => { paletteDisposed = true }
      },
    },
    effect(factory) { disposers.push(factory()) },
  }

  plugin.apply(ctx)
  assert.equal(overrideSource, descriptor.id)
  assert.ok(overrideTokens['--dsw-alias-brand-primary'])
  assert.equal(document.title, 'DeepSeek Harness · 金狮月泉')
  assert.equal(documentElement.dataset.goudenLeeuwTheme, 'true')
  assert.equal(body.dataset.goudenLeeuwTheme, 'true')
  assert.equal(body.children[0].children.length, 12)
  assert.match(head.children[0].textContent, /gouden-leeuw-theme\/artwork/)

  disposers.reverse().forEach(dispose => dispose?.())
  assert.equal(paletteDisposed, true)
  assert.equal(document.title, 'DeepSeek Harness')
  assert.equal(documentElement.dataset.goudenLeeuwTheme, undefined)
  assert.equal(body.dataset.goudenLeeuwTheme, undefined)
  assert.equal(head.children[0].removed, true)
})
