import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import test from 'node:test'

const dataKey = name => name
  .slice(5)
  .replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase())

function selectorMatches(node, selector) {
  if (selector.startsWith('#')) return node.id === selector.slice(1)
  const match = selector.match(/^([a-z]+)?\[([^=\]]+)(?:="([^"]*)")?\]$/i)
  if (match) {
    const [, tagName, attribute, expected] = match
    if (tagName && node.tagName.toLowerCase() !== tagName.toLowerCase()) return false
    const actual = node.getAttribute(attribute)
    return expected === undefined ? actual !== null : actual === expected
  }
  return node.tagName.toLowerCase() === selector.toLowerCase()
}

function element(tagName) {
  const attributes = new Map()
  const listeners = new Map()
  const node = {
    tagName,
    id: '',
    className: '',
    textContent: '',
    dataset: {},
    style: {
      values: {},
      setProperty(name, value) { this.values[name] = value },
      getPropertyValue(name) { return this.values[name] ?? '' },
      removeProperty(name) { delete this.values[name] },
    },
    children: [],
    parentElement: null,
    removed: false,
    get nextElementSibling() {
      if (this.parentElement === null) return null
      const index = this.parentElement.children.indexOf(this)
      return this.parentElement.children[index + 1] ?? null
    },
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, [])
      listeners.get(type).push(handler)
    },
    removeEventListener(type, handler) {
      if (!listeners.has(type)) return
      const handlers = listeners.get(type)
      const index = handlers.indexOf(handler)
      if (index !== -1) handlers.splice(index, 1)
    },
    appendChild(child) {
      child.remove?.()
      child.removed = false
      child.parentElement = this
      this.children.push(child)
      return child
    },
    append(...children) {
      for (const child of children) this.appendChild(child)
    },
    prepend(...children) {
      for (const child of [...children].reverse()) {
        child.remove?.()
        child.removed = false
        child.parentElement = this
        this.children.unshift(child)
      }
    },
    setAttribute(name, value) {
      const text = String(value)
      attributes.set(name, text)
      if (name === 'id') this.id = text
      if (name === 'class') this.className = text
      if (name.startsWith('data-')) this.dataset[dataKey(name)] = text
    },
    getAttribute(name) {
      if (name === 'id' && this.id) return this.id
      if (name === 'class' && this.className) return this.className
      if (name.startsWith('data-')) {
        const value = this.dataset[dataKey(name)]
        if (value !== undefined) return String(value)
      }
      return attributes.get(name) ?? null
    },
    querySelector(selector) {
      return this.querySelectorAll(selector)[0] ?? null
    },
    querySelectorAll(selector) {
      const found = []
      const visit = current => {
        for (const child of current.children) {
          if (selectorMatches(child, selector)) found.push(child)
          visit(child)
        }
      }
      visit(this)
      return found
    },
    remove() {
      if (this.parentElement) {
        const index = this.parentElement.children.indexOf(this)
        if (index !== -1) this.parentElement.children.splice(index, 1)
      }
      this.parentElement = null
      this.removed = true
    },
  }
  return node
}

function slot(parent, name) {
  const node = element('div')
  node.setAttribute('data-slot', name)
  parent.appendChild(node)
  return node
}

function fixture() {
  const html = element('html')
  const head = element('head')
  const body = element('body')
  html.append(head, body)

  const app = element('div')
  app.setAttribute('id', 'root')
  body.appendChild(app)
  const frame = element('div')
  app.appendChild(frame)
  const sidebar = element('aside')
  const main = element('main')
  main.getBoundingClientRect = () => ({ left: 280, top: 0, width: 1320, height: 900 })
  const details = element('aside')
  frame.append(sidebar, main, details)
  slot(sidebar, 'sidebar')
  slot(main, 'conversation')
  slot(details, 'details')

  const brandMark = element('span')
  const brandName = element('span')
  const brandButton = element('button')
  brandButton.setAttribute('aria-label', '新建会话')
  brandButton.append(brandMark, brandName)
  sidebar.appendChild(brandButton)
  slot(brandMark, 'sidebar.brand.mark')
  slot(brandName, 'sidebar.brand.name')
  const workspaces = element('div')
  const settings = element('div')
  sidebar.append(workspaces, settings)
  slot(workspaces, 'sidebar.workspaces')
  slot(settings, 'sidebar.settings')
  const newSession = element('button')
  newSession.setAttribute('aria-label', '新建会话')
  sidebar.appendChild(newSession)

  const conversation = element('section')
  conversation.dataset.phase = 'hero'
  main.appendChild(conversation)
  const scroll = element('div')
  scroll.setAttribute('data-conversation-scroll', '')
  conversation.appendChild(scroll)
  const toBottomButton = element('button')
  toBottomButton.setAttribute('aria-label', '回到底部')
  conversation.appendChild(toBottomButton)
  const view = element('div')
  view.setAttribute('data-chat-flow', '')
  scroll.appendChild(view)
  slot(view, 'conversation.view')
  const sessionHeader = element('header')
  const sessionHeaderOutlet = slot(main, 'conversation.session.header')
  sessionHeaderOutlet.appendChild(sessionHeader)
  const chatNode = element('article')
  chatNode.dataset.chatFlowKind = 'user'
  view.appendChild(chatNode)
  const chatSlot = slot(chatNode, 'conversation.chat.node')
  const userRow = element('div')
  const userStack = element('div')
  const userBubble = element('div')
  chatSlot.appendChild(userRow)
  userRow.appendChild(userStack)
  slot(userStack, 'conversation.message.images')
  userStack.appendChild(userBubble)
  const composerSeat = element('div')
  composerSeat.setAttribute('data-composer-seat', '')
  scroll.appendChild(composerSeat)
  const composerShell = element('div')
  const composerCard = element('div')
  composerCard.setAttribute('data-composer-card', 'true')
  composerSeat.appendChild(composerShell)
  composerShell.appendChild(composerCard)
  const commandButton = element('button')
  commandButton.setAttribute('aria-label', '命令')
  commandButton.setAttribute('aria-haspopup', 'listbox')
  const sendButton = element('button')
  sendButton.setAttribute('aria-label', '发送消息')
  composerCard.append(commandButton, sendButton)
  const activityRail = element('div')
  const statusRail = element('div')
  const activityRailOutlet = slot(composerSeat, 'conversation.input.dock')
  const statusRailOutlet = slot(composerSeat, 'conversation.composer.dock')
  activityRailOutlet.appendChild(activityRail)
  statusRailOutlet.appendChild(statusRail)

  const headline = element('div')
  const heroMark = element('span')
  composerSeat.appendChild(headline)
  headline.appendChild(heroMark)
  slot(heroMark, 'conversation.hero.brand.mark')
  const heroWorkspace = element('div')
  composerSeat.appendChild(heroWorkspace)
  slot(heroWorkspace, 'conversation.hero.workspace')

  const overlay = element('div')
  overlay.setAttribute('data-shell-overlay', 'true')
  frame.appendChild(overlay)

  const allRoots = [html]
  const document = {
    title: 'DeepSeek Harness',
    body,
    head,
    documentElement: html,
    createElement: element,
    getElementById(id) {
      return this.querySelector(`#${id}`)
    },
    querySelector(selector) {
      return this.querySelectorAll(selector)[0] ?? null
    },
    querySelectorAll(selector) {
      const found = []
      for (const root of allRoots) {
        if (selectorMatches(root, selector)) found.push(root)
        found.push(...root.querySelectorAll(selector))
      }
      return found
    },
  }

  return {
    document,
    nodes: { activityRail, body, brandButton, chatNode, commandButton, composerCard, composerSeat, conversation, frame, headline, main, newSession, sendButton, sessionHeader, sidebar, statusRail, toBottomButton, userBubble, view },
  }
}

class FakeMutationObserver {
  static instances = []

  constructor(callback) {
    this.callback = callback
    this.connected = false
    this.target = null
    FakeMutationObserver.instances.push(this)
  }

  observe(node) {
    this.connected = true
    this.target = node
  }
  disconnect() { this.connected = false }
}

class FakeResizeObserver {
  static instances = []

  constructor(callback) {
    this.callback = callback
    this.targets = new Set()
    this.disconnected = false
    FakeResizeObserver.instances.push(this)
  }

  observe(node) { this.targets.add(node) }
  unobserve(node) { this.targets.delete(node) }
  disconnect() {
    this.targets.clear()
    this.disconnected = true
  }
}

function makeContext() {
  let overrideSource
  let overrideTokens
  let overrideCalls = 0
  let paletteDisposed = false
  let themeSet
  const disposers = []
  const listeners = new Map()
  const slotRegistrations = []
  let snapshot = {
    preference: 'system',
    active: { id: 'dark', colorScheme: 'dark', tokens: {} },
    themes: [],
    revision: 1,
  }
  const emit = (event, value) => {
    for (const listener of listeners.get(event) ?? []) listener(value)
  }
  const ctx = {
    theme: {
      getTheme() { return snapshot },
      setTheme(id) {
        themeSet = id
        snapshot = {
          ...snapshot,
          preference: id,
          active: { id, colorScheme: id === 'light' ? 'light' : 'dark', tokens: {} },
          revision: snapshot.revision + 1,
        }
        emit('theme/change', snapshot)
      },
      overrideTokens(source, tokens) {
        overrideCalls += 1
        overrideSource = source
        overrideTokens = tokens
        return () => { paletteDisposed = true }
      },
    },
    slots: {
      inject(name, factory) {
        assert.equal(name, 'sidebar.footer.action')
        disposers.push(factory())
      },
      register(options, Component) {
        const registration = { options, Component, disposed: false }
        slotRegistrations.push(registration)
        return () => { registration.disposed = true }
      },
    },
    on(event, listener) {
      if (!listeners.has(event)) listeners.set(event, new Set())
      listeners.get(event).add(listener)
      let active = true
      const dispose = () => {
        if (!active) return
        active = false
        listeners.get(event)?.delete(listener)
      }
      disposers.push(dispose)
      return dispose
    },
    effect(factory) { disposers.push(factory()) },
  }
  return {
    ctx,
    disposers,
    slotRegistrations,
    emitTheme(nextSnapshot) {
      snapshot = nextSnapshot
      emit('theme/change', snapshot)
    },
    listenerCount(event) { return listeners.get(event)?.size ?? 0 },
    get overrideSource() { return overrideSource },
    get overrideTokens() { return overrideTokens },
    get overrideCalls() { return overrideCalls },
    get paletteDisposed() { return paletteDisposed },
    get themeSet() { return themeSet },
  }
}

const fakeReact = {
  createElement(type, props, ...children) {
    return { type, props: { ...(props ?? {}), children } }
  },
  useSyncExternalStore(_subscribe, getSnapshot) {
    return getSnapshot()
  },
}

test('keeps the stylesheet free of legacy override layers', async () => {
  const css = await readFile(new URL('../src/client/theme.css', import.meta.url), 'utf8')
  const source = await readFile(new URL('../src/client/index.js', import.meta.url), 'utf8')
  const importantDeclarations = css.match(/!\s*important\s*;/gi) ?? []
  assert.equal(importantDeclarations.length, 2)
  assert.match(css, /Skin Center applies its composer fade/)
  assert.doesNotMatch(css, /\.(?:pI_x6G|uV2eYG|wSkVaW|pXSMma|Md3f7G|gdEzaW)_/)
  assert.doesNotMatch(css, /frame-(?:main|sidebar|composer)|ornament-title/)
  assert.doesNotMatch(css, /gl-tone-toggle/)
  assert.doesNotMatch(source, /localStorage|gouden-leeuw-theme-tone|TOGGLE_ID|gl-tone-toggle/)
  assert.match(css, /data-gouden-leeuw-tone='day'\] \.gl-sanctuary-surface__veil/)
  assert.match(css, /data-gouden-leeuw-tone='day'\] \[data-gouden-leeuw-role='composer-card'\]/)
  assert.match(css, /data-gouden-leeuw-tone='day'\].*\[data-gouden-leeuw-role='conversation-flow'\]/)
  assert.match(css, /\[data-gouden-leeuw-role='main'\]::after\s*\{\s*content:\s*none;/s)
  assert.match(css, /\[data-gouden-leeuw-role='sidebar'\]\s*\{\s*border:\s*0;\s*box-shadow:\s*none;/s)
  assert.match(css, /\[data-phase='active'\] \[data-gouden-leeuw-role='composer-seat'\],[\s\S]*?\[data-phase='settling'\] \[data-gouden-leeuw-role='composer-seat'\]\s*\{[^}]*background:\s*transparent\s*!important;[^}]*background-image:\s*none\s*!important;[^}]*box-shadow:\s*none;/s)
  assert.match(css, /\[data-gouden-leeuw-role='composer-seat'\]::before\s*\{[^}]*content:\s*none;[^}]*background:\s*none;/s)
  assert.match(css, /\.gl-main-art__character\s*\{[^}]*left:\s*30%;[^}]*bottom:\s*4vh;[^}]*height:\s*min\(80vh, 840px\);/s)
  assert.match(css, /data-phase='settling'\] \.gl-main-art__character\s*\{[^}]*left:\s*75%;[^}]*height:\s*min\(62vh, 680px\);/s)
  assert.match(css, /data-phase='active'\] \.gl-main-art__character\s*\{[^}]*left:\s*80%;[^}]*height:\s*min\(58vh, 630px\);/s)
  assert.match(css, /\.gl-sidebar-buddy\s*\{[^}]*right:\s*8px;[^}]*bottom:\s*104px;[^}]*left:\s*8px;[^}]*height:\s*152px;/s)
  assert.match(css, /\[data-gouden-leeuw-role='activity-rail'\],[\s\S]*?\[data-gouden-leeuw-role='status-rail'\][\s\S]*?width:\s*min\(780px, calc\(100% - 64px\)\);/)
  assert.match(css, /data-gouden-leeuw-phase='active'\] \[data-gouden-leeuw-role='activity-rail'\][\s\S]*?transform:\s*translateX\(-4\.2vw\);/)
  assert.match(css, /\[data-gouden-leeuw-role='activity-rail'\]:has\(\[aria-expanded='true'\]\)\s*\{[^}]*border-radius:\s*18px;/s)
  assert.match(css, /:is\(\[role='menu'\], \[role='listbox'\], \[role='dialog'\]\)\s*\{[^}]*z-index:\s*50;/s)
})

test('mounts one semantic sanctuary surface and cleans up repeat applies', async () => {
  let descriptor
  FakeMutationObserver.instances.length = 0
  FakeResizeObserver.instances.length = 0
  const { document, nodes } = fixture()
  const window = {
    __ModuleLoader__: { load(value) { descriptor = value } },
  }

  const bundle = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
  vm.runInNewContext(bundle, {
    document,
    encodeURIComponent,
    MutationObserver: FakeMutationObserver,
    Object,
    ResizeObserver: FakeResizeObserver,
    Set,
    window,
  })
  assert.equal(descriptor.id, 'dsh-plugin-gouden-leeuw-theme')

  const plugin = descriptor.factory(id => {
    if (id === 'react') return fakeReact
    throw new Error(`unexpected external module: ${id}`)
  })
  assert.deepEqual([...plugin.inject], ['slots', 'theme'])

  const first = makeContext()
  plugin.apply(first.ctx)
  assert.equal(first.overrideSource, descriptor.id)
  assert.equal(first.overrideCalls, 1)
  assert.ok(first.overrideTokens['--dsw-alias-bg-base'])
  assert.notEqual(
    first.overrideTokens['--dsw-alias-bg-base'].light,
    first.overrideTokens['--dsw-alias-bg-base'].dark,
  )
  assert.equal(document.title, 'DeepSeek Harness · 金狮月泉')
  assert.equal(document.documentElement.dataset.goudenLeeuwTheme, 'true')
  assert.equal(document.documentElement.dataset.goudenLeeuwTone, 'night')
  assert.equal(nodes.body.dataset.goudenLeeuwTone, 'night')
  assert.equal(nodes.body.dataset.goudenLeeuwPhase, 'hero')
  assert.equal(nodes.main.dataset.goudenLeeuwRole, 'main')
  assert.equal(nodes.composerCard.dataset.goudenLeeuwRole, 'composer-card')
  assert.equal(nodes.view.dataset.goudenLeeuwRole, 'conversation-flow')
  assert.equal(nodes.sessionHeader.dataset.goudenLeeuwRole, 'session-header')
  assert.equal(nodes.activityRail.dataset.goudenLeeuwRole, 'activity-rail')
  assert.equal(nodes.statusRail.dataset.goudenLeeuwRole, 'status-rail')
  assert.equal(nodes.commandButton.dataset.goudenLeeuwRole, 'command-button')
  assert.equal(nodes.sendButton.dataset.goudenLeeuwRole, 'send-button')
  assert.equal(nodes.toBottomButton.dataset.goudenLeeuwRole, 'to-bottom-button')
  assert.equal(nodes.chatNode.dataset.goudenLeeuwRole, 'chat-node')
  assert.equal(nodes.userBubble.dataset.goudenLeeuwRole, 'user-bubble')
  assert.equal(nodes.newSession.dataset.goudenLeeuwRole, 'new-session')
  assert.notEqual(nodes.brandButton.dataset.goudenLeeuwRole, 'new-session')

  const surface = document.getElementById('dsh-plugin-gouden-leeuw-theme/surface')
  assert.ok(surface)
  assert.equal(surface.children[2].children.length, 10)
  assert.equal(nodes.body.style.values['--gl-background-url'], 'url("/gouden-leeuw-theme/v0.4.0/background/night")')
  assert.equal(nodes.body.style.values['--gl-top-rail-url'], 'url("/gouden-leeuw-theme/v0.4.0/chrome/top-rail")')
  const mainArt = document.getElementById('dsh-plugin-gouden-leeuw-theme/main-art')
  assert.equal(mainArt.parentElement, nodes.main)
  assert.equal(nodes.main.children[0], mainArt)
  assert.equal(mainArt.style.values['--gl-main-left'], '280px')
  assert.equal(mainArt.style.values['--gl-main-width'], '1320px')
  assert.equal(surface.style.values['--gl-main-left'], '280px')
  assert.equal(surface.style.values['--gl-main-width'], '1320px')
  assert.equal(FakeResizeObserver.instances.at(-1).targets.has(nodes.main), true)
  assert.equal(FakeMutationObserver.instances.at(-1).target, nodes.body)
  assert.equal(mainArt.children.length, 5)
  assert.equal(mainArt.children[4].tagName, 'img')
  assert.equal(mainArt.children[4].className, 'gl-main-art__character')
  assert.equal(mainArt.children[4].getAttribute('src'), '/gouden-leeuw-theme/v0.4.0/character/main')
  assert.equal(document.querySelectorAll('img[src="/gouden-leeuw-theme/v0.4.0/character/chibi-sidebar-night"]').length, 1)
  assert.equal(document.querySelectorAll('style[data-plugin-css="dsh-plugin-gouden-leeuw-theme/theme.css"]').length, 1)
  assert.match(document.querySelector('style[data-plugin-css="dsh-plugin-gouden-leeuw-theme/theme.css"]').textContent, /chrome\/composer-crown/)

  // The day/night switch belongs to Harness' real sidebar footer slot and
  // follows the official ThemeRuntime instead of private localStorage state.
  assert.equal(first.slotRegistrations.length, 1)
  const toneRegistration = first.slotRegistrations[0]
  assert.equal(toneRegistration.options.name, 'sidebar.footer.action')
  assert.equal(toneRegistration.options.id, 'gouden-leeuw-tone')
  const toneFace = toneRegistration.options.inject()
  let wideControl = toneRegistration.Component({ wide: true, ...toneFace })
  assert.equal(wideControl.props['data-tone'], 'night')
  assert.equal(wideControl.props.children.length, 2)

  let externalNotifications = 0
  const unsubscribeExternal = toneFace.subscribeTone(() => { externalNotifications += 1 })
  first.emitTheme({
    preference: 'system',
    active: { id: 'custom-day-theme', colorScheme: 'light', tokens: {} },
    themes: [],
    revision: 2,
  })
  assert.equal(externalNotifications, 1)
  assert.equal(document.documentElement.dataset.goudenLeeuwTone, 'day')
  assert.equal(nodes.body.style.values['--gl-background-url'], 'url("/gouden-leeuw-theme/v0.4.0/background/daylight")')
  assert.equal(document.querySelectorAll('img[src="/gouden-leeuw-theme/v0.4.0/character/chibi-sidebar"]').length, 1)
  unsubscribeExternal()
  first.emitTheme({
    preference: 'system',
    active: { id: 'custom-night-theme', colorScheme: 'dark', tokens: {} },
    themes: [],
    revision: 3,
  })
  assert.equal(externalNotifications, 1)

  wideControl = toneRegistration.Component({ wide: true, ...toneFace })
  assert.equal(wideControl.props['data-tone'], 'night')
  wideControl.props.children[0].props.onClick()
  assert.equal(first.themeSet, 'light')
  assert.equal(document.documentElement.dataset.goudenLeeuwTone, 'day')
  assert.equal(nodes.body.dataset.goudenLeeuwTone, 'day')
  assert.equal(nodes.body.style.values['--gl-background-url'], 'url("/gouden-leeuw-theme/v0.4.0/background/daylight")')
  assert.equal(document.querySelectorAll('img[src="/gouden-leeuw-theme/v0.4.0/character/chibi-sidebar"]').length, 1)
  wideControl = toneRegistration.Component({ wide: true, ...toneFace })
  assert.equal(wideControl.props['data-tone'], 'day')
  assert.equal(wideControl.props.children[0].props['aria-pressed'], 'true')
  const railControl = toneRegistration.Component({ wide: false, ...toneFace })
  assert.equal(railControl.props['data-tone'], 'day')
  assert.equal(railControl.props['aria-label'], '切换至月夜圣所')
  railControl.props.onClick()
  assert.equal(first.themeSet, 'dark')
  assert.equal(first.overrideCalls, 1)
  assert.equal(document.querySelectorAll('img[src="/gouden-leeuw-theme/v0.4.0/character/chibi-sidebar-night"]').length, 1)

  // React may replace or temporarily remove unmanaged children during a route
  // transition. The observed host tree must restore the decorative layer
  // instead of creating a duplicate or leaving it beneath #root.
  mainArt.remove()
  FakeMutationObserver.instances.at(-1).callback([])
  assert.equal(mainArt.parentElement, nodes.main)

  nodes.conversation.dataset.phase = 'active'
  FakeMutationObserver.instances.at(-1).callback([])
  assert.equal(mainArt.dataset.phase, 'active')
  assert.equal(nodes.body.dataset.goudenLeeuwPhase, 'active')
  nodes.conversation.remove()
  FakeMutationObserver.instances.at(-1).callback([])
  assert.equal(mainArt.dataset.phase, 'active')
  assert.equal(nodes.body.dataset.goudenLeeuwPhase, 'active')
  nodes.main.appendChild(nodes.conversation)
  nodes.conversation.dataset.phase = 'hero'
  FakeMutationObserver.instances.at(-1).callback([])

  const second = makeContext()
  plugin.apply(second.ctx)
  assert.equal(document.querySelectorAll('#dsh-plugin-gouden-leeuw-theme/surface').length, 1)
  assert.equal(document.querySelectorAll('style[data-plugin-css="dsh-plugin-gouden-leeuw-theme/theme.css"]').length, 1)
  assert.equal(second.slotRegistrations.length, 1)

  second.disposers.reverse().forEach(dispose => dispose?.())
  first.disposers.reverse().forEach(dispose => dispose?.())
  assert.equal(second.paletteDisposed, true)
  assert.equal(first.paletteDisposed, true)
  assert.equal(second.slotRegistrations[0].disposed, true)
  assert.equal(first.slotRegistrations[0].disposed, true)
  assert.equal(second.listenerCount('theme/change'), 0)
  assert.equal(first.listenerCount('theme/change'), 0)
  assert.equal(document.title, 'DeepSeek Harness')
  assert.equal(document.documentElement.dataset.goudenLeeuwTheme, undefined)
  assert.equal(document.documentElement.dataset.goudenLeeuwTone, undefined)
  assert.equal(nodes.body.dataset.goudenLeeuwTheme, undefined)
  assert.equal(nodes.body.dataset.goudenLeeuwTone, undefined)
  assert.equal(nodes.main.dataset.goudenLeeuwRole, undefined)
  assert.equal(nodes.commandButton.dataset.goudenLeeuwRole, undefined)
  assert.equal(nodes.sendButton.dataset.goudenLeeuwRole, undefined)
  assert.equal(nodes.toBottomButton.dataset.goudenLeeuwRole, undefined)
  assert.equal(nodes.userBubble.dataset.goudenLeeuwRole, undefined)
  assert.equal(document.getElementById('dsh-plugin-gouden-leeuw-theme/surface'), null)
  assert.equal(document.querySelectorAll('img[src="/gouden-leeuw-theme/v0.4.0/character/chibi-sidebar-night"]').length, 0)
  assert.equal(nodes.body.style.values['--gl-background-url'], undefined)
  assert.equal(FakeResizeObserver.instances.at(-1).disconnected, true)
})
