const PLUGIN_ID = 'dsh-plugin-gouden-leeuw-theme'
const STYLE_ID = `${PLUGIN_ID}/theme.css`
const SURFACE_ID = `${PLUGIN_ID}/surface`
const MAIN_ART_ID = `${PLUGIN_ID}/main-art`
const STATE_KEY = '__goudenLeeuwThemeState'
const TITLE = 'DeepSeek Harness · 金狮月泉'

const React = require('react')

const ASSET_ROUTES = Object.freeze({
  backgroundNight: '/gouden-leeuw-theme/v0.4.0/background/night',
  backgroundDay: '/gouden-leeuw-theme/v0.4.0/background/daylight',
  character: '/gouden-leeuw-theme/v0.4.0/character/main',
  sidebarBuddyDay: '/gouden-leeuw-theme/v0.4.0/character/chibi-sidebar',
  sidebarBuddyNight: '/gouden-leeuw-theme/v0.4.0/character/chibi-sidebar-night',
  corner: '/gouden-leeuw-theme/v0.4.0/chrome/corner-left',
  sidebarCrest: '/gouden-leeuw-theme/v0.4.0/chrome/sidebar-relic',
  topRail: '/gouden-leeuw-theme/v0.4.0/chrome/top-rail',
  composerCrown: '/gouden-leeuw-theme/v0.4.0/chrome/composer-crown',
  sidebarCrown: '/gouden-leeuw-theme/v0.4.0/chrome/sidebar-crown',
  frameAnchorRight: '/gouden-leeuw-theme/v0.4.0/chrome/frame-anchor-right',
})

const tone = (night, day) => ({ light: day, dark: night })

// Night sanctuary: deep emerald glass over moonlit forest
const NIGHT_TOKENS = {
  '--dsw-alias-bg-base': 'rgba(2, 14, 11, 0.93)',
  '--dsw-alias-bg-layer-1': 'rgba(3, 27, 21, 0.91)',
  '--dsw-alias-bg-layer-2': 'rgba(5, 37, 29, 0.94)',
  '--dsw-alias-bg-layer-3': 'rgba(8, 48, 37, 0.96)',
  '--dsw-alias-bg-overlay': 'rgba(3, 24, 19, 0.98)',
  '--dsw-alias-border-l1': 'rgba(155, 219, 177, 0.12)',
  '--dsw-alias-border-l2': 'rgba(155, 219, 177, 0.21)',
  '--dsw-alias-border-l3': 'rgba(202, 184, 112, 0.28)',
  '--dsw-alias-brand-primary': '#9bdbb1',
  '--dsw-alias-brand-text': '#d8efc9',
  '--dsw-alias-label-primary': '#f5f8ed',
  '--dsw-alias-label-secondary': '#c9d8c5',
  '--dsw-alias-label-tertiary': '#9bb4a7',
  '--dsw-alias-state-error-primary': '#ff8992',
  '--dsw-alias-state-success-primary': '#6fd6a8',
  '--dsw-alias-state-warn-primary': '#e8c67a',
  '--dsw-specific-sidebar-fill': 'rgba(2, 20, 15, 0.90)',
  '--dsw-specific-input-major': 'rgba(4, 32, 24, 0.92)',
  '--dsw-specific-menu': 'rgba(4, 27, 21, 0.98)',
  '--dsw-alias-markdown-code-block': 'rgba(2, 18, 14, 0.95)',
}

// Day sanctuary: ivory glass over sunlit jade forest
const DAY_TOKENS = {
  '--dsw-alias-bg-base': 'rgba(248, 252, 248, 0.94)',
  '--dsw-alias-bg-layer-1': 'rgba(245, 250, 245, 0.92)',
  '--dsw-alias-bg-layer-2': 'rgba(242, 248, 243, 0.95)',
  '--dsw-alias-bg-layer-3': 'rgba(238, 245, 240, 0.96)',
  '--dsw-alias-bg-overlay': 'rgba(250, 254, 250, 0.98)',
  '--dsw-alias-border-l1': 'rgba(95, 145, 120, 0.16)',
  '--dsw-alias-border-l2': 'rgba(85, 135, 110, 0.24)',
  '--dsw-alias-border-l3': 'rgba(165, 150, 100, 0.32)',
  '--dsw-alias-brand-primary': '#5ca882',
  '--dsw-alias-brand-text': '#3d8a68',
  '--dsw-alias-label-primary': '#1a3e32',
  '--dsw-alias-label-secondary': '#2e5a48',
  '--dsw-alias-label-tertiary': '#587a6b',
  '--dsw-alias-state-error-primary': '#d64854',
  '--dsw-alias-state-success-primary': '#4ab888',
  '--dsw-alias-state-warn-primary': '#c59f48',
  '--dsw-specific-sidebar-fill': 'rgba(240, 248, 244, 0.92)',
  '--dsw-specific-input-major': 'rgba(245, 252, 248, 0.94)',
  '--dsw-specific-menu': 'rgba(248, 254, 250, 0.98)',
  '--dsw-alias-markdown-code-block': 'rgba(242, 248, 245, 0.96)',
}

const THEME_TOKEN_OVERRIDES = Object.freeze(Object.fromEntries(
  [...new Set([...Object.keys(NIGHT_TOKENS), ...Object.keys(DAY_TOKENS)])].map(key => [
    key,
    tone(NIGHT_TOKENS[key] ?? DAY_TOKENS[key], DAY_TOKENS[key] ?? NIGHT_TOKENS[key]),
  ]),
))

const MOTES = [
  [18, 16, 2, 15.2, -2.4], [31, 70, 2, 18.6, -8.1],
  [46, 21, 3, 17.4, -5.8], [57, 12, 2, 21.1, -11.6],
  [65, 38, 2, 16.8, -3.7], [76, 25, 3, 19.7, -9.3],
  [86, 57, 2, 22.4, -14.1], [93, 19, 2, 17.9, -6.6],
  [54, 78, 2, 20.6, -12.5], [72, 84, 3, 23.2, -4.9],
]

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="b" x1="8" y1="8" x2="56" y2="56"><stop stop-color="#143e34"/><stop offset="1" stop-color="#071b18"/></linearGradient><linearGradient id="l" x1="18" y1="12" x2="47" y2="50"><stop stop-color="#edffac"/><stop offset=".48" stop-color="#7fe1bd"/><stop offset="1" stop-color="#72bfe9"/></linearGradient></defs><circle cx="32" cy="32" r="30" fill="url(#b)" stroke="#79d8b9" stroke-opacity=".35" stroke-width="2"/><path d="M47 12C30 14 18 24 17 40c0 5 3 10 8 12 1-13 8-24 21-33-10 10-15 20-16 31 11-4 18-14 17-38Z" fill="url(#l)"/><path d="M25 53c2-13 9-25 22-36" fill="none" stroke="#efffd0" stroke-linecap="round" stroke-width="2"/><circle cx="48" cy="11" r="2" fill="#f3ffab"/></svg>`

const inject = ['slots', 'theme']

function toneFromSnapshot(snapshot) {
  return snapshot?.active?.colorScheme === 'light' ? 'day' : 'night'
}

function ToneControl({ wide, getTone, subscribeTone, setTone }) {
  const activeTone = React.useSyncExternalStore(subscribeTone, getTone, getTone)

  if (!wide) {
    const nextTone = activeTone === 'night' ? 'day' : 'night'
    return React.createElement('button', {
      type: 'button',
      className: 'gl-tone-control gl-tone-control--rail',
      'data-tone': activeTone,
      'aria-label': nextTone === 'day' ? '切换至白昼圣所' : '切换至月夜圣所',
      onClick: () => setTone(nextTone),
    }, React.createElement('span', { 'aria-hidden': 'true' }, activeTone === 'night' ? '☾' : '☀'))
  }

  return React.createElement('div', {
    className: 'gl-tone-control gl-tone-control--wide',
    role: 'group',
    'aria-label': '圣所昼夜',
    'data-tone': activeTone,
  },
  React.createElement('button', {
    type: 'button',
    className: 'gl-tone-control__option',
    'aria-pressed': activeTone === 'day' ? 'true' : 'false',
    onClick: () => setTone('day'),
  }, React.createElement('span', { 'aria-hidden': 'true' }, '☀'), React.createElement('span', null, '白昼')),
  React.createElement('button', {
    type: 'button',
    className: 'gl-tone-control__option',
    'aria-pressed': activeTone === 'night' ? 'true' : 'false',
    onClick: () => setTone('night'),
  }, React.createElement('span', { 'aria-hidden': 'true' }, '☾'), React.createElement('span', null, '月夜')))
}

function createToneController(ctx) {
  let activeTone = toneFromSnapshot(ctx.theme.getTheme())
  const listeners = new Set()

  const controller = {
    getTone: () => activeTone,
    subscribeTone(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    setTone(nextTone) {
      ctx.theme.setTheme(nextTone === 'day' ? 'light' : 'dark')
    },
    sync(snapshot) {
      const nextTone = toneFromSnapshot(snapshot)
      if (nextTone === activeTone) return
      activeTone = nextTone
      for (const listener of listeners) listener()
    },
  }

  return controller
}

function makeElement(tagName, className, attributes = {}) {
  const node = document.createElement(tagName)
  node.className = className
  for (const [name, value] of Object.entries(attributes)) {
    node.setAttribute(name, value)
  }
  return node
}

function findParent(slot) {
  return document.querySelector(`[data-slot="${slot}"]`)?.parentElement ?? null
}

function findSlotContent(slot) {
  const outlet = document.querySelector(`[data-slot="${slot}"]`)
  return outlet?.children?.[0] ?? null
}

function apply(ctx) {
  const toneController = createToneController(ctx)
  ctx.on('theme/change', snapshot => toneController.sync(snapshot))
  ctx.effect(() => ctx.theme.overrideTokens(PLUGIN_ID, THEME_TOKEN_OVERRIDES), 'gouden-leeuw-theme: semantic day/night tokens')
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'gouden-leeuw-tone',
    order: 20,
    label: '圣所昼夜',
    inject: () => ({
      getTone: toneController.getTone,
      subscribeTone: toneController.subscribeTone,
      setTone: toneController.setTone,
    }),
  }, ToneControl))

  ctx.effect(() => {
    if (typeof document === 'undefined') return undefined

    window[STATE_KEY]?.dispose?.()

    let disposed = false
    let bootObserver
    let mountedCleanup

    const mount = () => {
      if (disposed || document.body === null || mountedCleanup !== undefined) return

      const previousTitle = document.title
      const root = document.documentElement
      const body = document.body
      let syncQueued = false
      let animationFrame = 0
      let resizeObserver
      let observedMain = null
      let themeTone = toneController.getTone()
      let sidebarBuddy
      const sidebarBuddyUrl = () => themeTone === 'night'
        ? ASSET_ROUTES.sidebarBuddyNight
        : ASSET_ROUTES.sidebarBuddyDay

      const updateArtwork = () => {
        const backgroundUrl = themeTone === 'night' ? ASSET_ROUTES.backgroundNight : ASSET_ROUTES.backgroundDay
        body.style.setProperty('--gl-background-url', `url("${backgroundUrl}")`)
        sidebarBuddy?.setAttribute('src', sidebarBuddyUrl())
        body.dataset.goudenLeeuwTone = themeTone
        root.dataset.goudenLeeuwTone = themeTone
      }

      const artworkVariables = {
        '--gl-background-url': `url("${themeTone === 'night' ? ASSET_ROUTES.backgroundNight : ASSET_ROUTES.backgroundDay}")`,
        '--gl-sidebar-crest-url': `url("${ASSET_ROUTES.sidebarCrest}")`,
        '--gl-corner-url': `url("${ASSET_ROUTES.corner}")`,
        '--gl-top-rail-url': `url("${ASSET_ROUTES.topRail}")`,
        '--gl-composer-crown-url': `url("${ASSET_ROUTES.composerCrown}")`,
        '--gl-sidebar-crown-url': `url("${ASSET_ROUTES.sidebarCrown}")`,
        '--gl-frame-anchor-right-url': `url("${ASSET_ROUTES.frameAnchorRight}")`,
      }
      const previousArtworkVariables = new Map(
        Object.keys(artworkVariables).map(name => [name, body.style.getPropertyValue(name)]),
      )

      document.title = TITLE
      root.dataset.goudenLeeuwTheme = 'true'
      root.dataset.goudenLeeuwTone = themeTone
      body.dataset.goudenLeeuwTheme = 'true'
      body.dataset.goudenLeeuwTone = themeTone
      for (const [name, value] of Object.entries(artworkVariables)) {
        body.style.setProperty(name, value)
      }
      document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`)?.remove()
      const style = document.createElement('style')
      style.dataset.plugin = PLUGIN_ID
      style.dataset.pluginCss = STYLE_ID
      style.textContent = THEME_CSS
      document.head.appendChild(style)

      document.getElementById(SURFACE_ID)?.remove()
      const surface = makeElement('div', 'gl-sanctuary-surface', {
        id: SURFACE_ID,
        'aria-hidden': 'true',
      })
      surface.appendChild(makeElement('div', 'gl-sanctuary-surface__image'))
      surface.appendChild(makeElement('div', 'gl-sanctuary-surface__veil'))

      const fireflies = makeElement('div', 'gl-fireflies')
      for (const [x, y, size, duration, delay] of MOTES) {
        const mote = document.createElement('i')
        mote.style.setProperty('--x', `${x}%`)
        mote.style.setProperty('--y', `${y}%`)
        mote.style.setProperty('--s', `${size}px`)
        mote.style.setProperty('--d', `${duration}s`)
        mote.style.setProperty('--delay', `${delay}s`)
        fireflies.appendChild(mote)
      }
      surface.appendChild(fireflies)
      body.prepend(surface)

      document.getElementById(MAIN_ART_ID)?.remove()
      const mainArt = makeElement('div', 'gl-main-art', {
        id: MAIN_ART_ID,
        'aria-hidden': 'true',
      })
      const mainCorner = makeElement('div', 'gl-main-art__corner')
      const topRail = makeElement('div', 'gl-main-art__top-rail')
      const rightAnchor = makeElement('div', 'gl-main-art__right-anchor')
      const aura = makeElement('div', 'gl-main-art__aura')
      const character = makeElement('img', 'gl-main-art__character', {
        alt: '',
        'aria-hidden': 'true',
        decoding: 'async',
        draggable: 'false',
        src: ASSET_ROUTES.character,
      })
      mainArt.append(mainCorner, topRail, rightAnchor, aura, character)
      body.prepend(mainArt)

      sidebarBuddy = makeElement('img', 'gl-sidebar-buddy', {
        alt: '',
        'aria-hidden': 'true',
        decoding: 'async',
        draggable: 'false',
        src: sidebarBuddyUrl(),
      })

      const unsubscribeTone = toneController.subscribeTone(() => {
        themeTone = toneController.getTone()
        updateArtwork()
      })

      const favicon = document.createElement('link')
      favicon.rel = 'icon'
      favicon.type = 'image/svg+xml'
      favicon.dataset.plugin = PLUGIN_ID
      favicon.href = `data:image/svg+xml,${encodeURIComponent(FAVICON_SVG)}`
      document.head.appendChild(favicon)

      const mark = (node, role) => {
        if (node === null) return
        if (node.dataset.goudenLeeuwRole !== role) node.dataset.goudenLeeuwRole = role
      }

      const syncHost = () => {
        if (disposed) return

        const frame = document.querySelector('[data-shell-overlay]')?.parentElement ?? null
        const sidebar = findParent('sidebar')
        const main = findParent('conversation')
        const details = findParent('details')
        const conversation = document.querySelector('[data-conversation-scroll]')?.parentElement ?? null
        const composerSeat = document.querySelector('[data-composer-seat]')
        const composerCard = document.querySelector('[data-composer-card]')
        const heroMark = document.querySelector('[data-slot="conversation.hero.brand.mark"]')?.parentElement ?? null
        const heroHeadline = heroMark?.parentElement ?? null

        mark(frame, 'frame')
        mark(sidebar, 'sidebar')
        mark(main, 'main')
        mark(details, 'details')
        mark(conversation, 'conversation')
        mark(composerSeat, 'composer-seat')
        mark(composerCard, 'composer-card')
        mark(composerCard?.parentElement ?? null, 'composer-shell')
        mark(heroMark, 'hero-mark')
        mark(heroHeadline, 'hero-headline')
        mark(findParent('conversation.hero.workspace'), 'hero-workspace')
        mark(findParent('conversation.view'), 'conversation-view')
        mark(document.querySelector('[data-chat-flow]'), 'conversation-flow')
        mark(findSlotContent('conversation.session.header'), 'session-header')
        mark(findSlotContent('conversation.input.dock'), 'activity-rail')
        mark(findSlotContent('conversation.composer.dock'), 'status-rail')
        mark(findParent('sidebar.brand.mark'), 'brand-mark')
        mark(findParent('sidebar.brand.name'), 'brand-name')
        mark(findParent('sidebar.workspaces'), 'sidebar-workspaces')
        mark(findParent('sidebar.settings'), 'sidebar-settings')

        if (sidebar !== null && sidebarBuddy.parentElement !== sidebar) sidebar.append(sidebarBuddy)

        // Keep the decorative layer inside the main pane's stacking context
        // while the semantic conversation layer remains interactive.
        if (main !== null && mainArt.parentElement !== main) main.prepend(mainArt)

        const toBottomButton = [...(conversation?.querySelectorAll('button') ?? [])]
          .find(button => /^(回到底部|scroll to bottom|back to bottom)$/i.test(button.getAttribute('aria-label') ?? ''))
        mark(toBottomButton ?? null, 'to-bottom-button')

        if (resizeObserver !== undefined && observedMain !== main) {
          if (observedMain !== null) resizeObserver.unobserve(observedMain)
          observedMain = main
          if (observedMain !== null) resizeObserver.observe(observedMain)
        }

        for (const slot of document.querySelectorAll('[data-slot="conversation.chat.node"]')) {
          const flowItem = slot.parentElement
          mark(flowItem, 'chat-node')
          if (flowItem?.dataset.chatFlowKind === 'user') {
            const imagesSlot = slot.querySelector('[data-slot="conversation.message.images"]')
            mark(imagesSlot?.nextElementSibling ?? null, 'user-bubble')
          }
        }

        if (sidebar !== null) {
          for (const button of sidebar.querySelectorAll('button')) {
            const label = `${button.getAttribute('aria-label') ?? ''} ${button.textContent ?? ''}`.trim()
            const containsBrand = button.querySelector('[data-slot="sidebar.brand.mark"]') !== null
            if (!containsBrand && /^(新建会话|new session)/i.test(label)) mark(button, 'new-session')
          }
        }

        if (composerCard !== null) {
          const buttons = [...composerCard.querySelectorAll('button')]
          const commandButton = buttons.find(button => button.getAttribute('aria-haspopup') === 'listbox')
          const sendButton = buttons.find(button => /^(发送消息|send message)$/i.test(button.getAttribute('aria-label') ?? ''))
          mark(commandButton ?? null, 'command-button')
          mark(sendButton ?? null, 'send-button')
        }

        const phase = conversation?.dataset.phase
          ?? mainArt.dataset.phase
          ?? body.dataset.goudenLeeuwPhase
          ?? 'active'
        if (body.dataset.goudenLeeuwPhase !== phase) body.dataset.goudenLeeuwPhase = phase
        if (mainArt.dataset.phase !== phase) mainArt.dataset.phase = phase

        if (main?.getBoundingClientRect !== undefined) {
          const rect = main.getBoundingClientRect()
          const setLayoutValue = (name, value) => {
            for (const layer of [mainArt, surface]) {
              if (layer.style.getPropertyValue(name) !== value) {
                layer.style.setProperty(name, value)
              }
            }
          }
          setLayoutValue('--gl-main-left', `${rect.left}px`)
          setLayoutValue('--gl-main-top', `${rect.top}px`)
          setLayoutValue('--gl-main-width', `${rect.width}px`)
          setLayoutValue('--gl-main-height', `${rect.height}px`)
        }
      }

      const scheduleSync = () => {
        if (disposed || syncQueued) return
        syncQueued = true
        const run = () => {
          syncQueued = false
          animationFrame = 0
          syncHost()
        }
        if (typeof window.requestAnimationFrame === 'function') {
          animationFrame = window.requestAnimationFrame(run)
        } else {
          run()
        }
      }

      resizeObserver = typeof ResizeObserver === 'function'
        ? new ResizeObserver(scheduleSync)
        : undefined
      syncHost()
      const observer = typeof MutationObserver === 'function'
        ? new MutationObserver(scheduleSync)
        : null
      // Observe the stable body rather than the current #root. Harness can
      // replace #root during a hot reload; watching body lets syncHost find
      // the replacement main pane and move the existing single art node.
      observer?.observe(body, {
        attributes: true,
        attributeFilter: ['data-phase', 'data-sidebar-collapsed', 'data-details-collapsed'],
        childList: true,
        subtree: true,
      })
      window.addEventListener?.('resize', scheduleSync, { passive: true })

      mountedCleanup = () => {
        observer?.disconnect()
        resizeObserver?.disconnect()
        if (animationFrame !== 0) window.cancelAnimationFrame?.(animationFrame)
        window.removeEventListener?.('resize', scheduleSync)
        unsubscribeTone()
        for (const node of document.querySelectorAll('[data-gouden-leeuw-role]')) {
          if (node.dataset.goudenLeeuwRole !== undefined) delete node.dataset.goudenLeeuwRole
        }
        mainArt.remove()
        sidebarBuddy.remove()
        surface.remove()
        favicon.remove()
        style.remove()
        delete body.dataset.goudenLeeuwPhase
        delete body.dataset.goudenLeeuwTone
        if (root.dataset.goudenLeeuwTheme === 'true') delete root.dataset.goudenLeeuwTheme
        if (root.dataset.goudenLeeuwTone !== undefined) delete root.dataset.goudenLeeuwTone
        if (body.dataset.goudenLeeuwTheme === 'true') delete body.dataset.goudenLeeuwTheme
        for (const [name, previousValue] of previousArtworkVariables) {
          if (previousValue === '') body.style.removeProperty(name)
          else body.style.setProperty(name, previousValue)
        }
        if (document.title === TITLE) document.title = previousTitle
      }
    }

    if (document.body !== null) {
      mount()
    } else if (typeof MutationObserver === 'function') {
      bootObserver = new MutationObserver(() => {
        if (document.body !== null) {
          bootObserver.disconnect()
          mount()
        }
      })
      bootObserver.observe(document.documentElement, { childList: true, subtree: true })
    }

    const state = {
      dispose() {
        if (disposed) return
        disposed = true
        bootObserver?.disconnect()
        mountedCleanup?.()
        if (window[STATE_KEY] === state) delete window[STATE_KEY]
      },
    }
    window[STATE_KEY] = state
    return state.dispose
  }, 'gouden-leeuw-theme: moonwell sanctuary surface')
}

exports.apply = apply
exports.inject = inject
