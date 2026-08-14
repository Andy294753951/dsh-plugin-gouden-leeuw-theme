const PLUGIN_ID = 'dsh-plugin-gouden-leeuw-theme'
const STYLE_ID = `${PLUGIN_ID}/theme.css`
const TITLE = 'DeepSeek Harness · 金狮月泉'

const TOKEN_OVERRIDES = {
  '--dsw-alias-bg-base': { light: 'rgba(246, 252, 248, 0.82)', dark: 'rgba(7, 22, 18, 0.88)' },
  '--dsw-alias-bg-layer-1': { light: 'rgba(252, 255, 252, 0.80)', dark: 'rgba(12, 36, 30, 0.86)' },
  '--dsw-alias-bg-layer-2': { light: 'rgba(245, 252, 248, 0.88)', dark: 'rgba(14, 42, 34, 0.90)' },
  '--dsw-alias-bg-overlay': { light: 'rgba(252, 255, 253, 0.96)', dark: 'rgba(8, 30, 25, 0.97)' },
  '--dsw-alias-border-l1': { light: 'rgba(51, 123, 102, 0.12)', dark: 'rgba(148, 238, 208, 0.09)' },
  '--dsw-alias-border-l2': { light: 'rgba(51, 123, 102, 0.19)', dark: 'rgba(148, 238, 208, 0.15)' },
  '--dsw-alias-brand-primary': { light: '#4fb99c', dark: '#70ddbe' },
  '--dsw-alias-label-primary': { light: '#173a33', dark: '#e7fff5' },
  '--dsw-alias-label-secondary': { light: '#486b61', dark: '#9bc2b6' },
  '--dsw-alias-state-error-primary': { light: '#c75d67', dark: '#ff8992' },
  '--dsw-alias-state-success-primary': { light: '#43b78b', dark: '#66d7a6' },
  '--dsw-alias-state-warn-primary': { light: '#a77b27', dark: '#f0c66d' },
  '--dsw-specific-sidebar-fill': { light: 'rgba(239, 248, 242, 0.70)', dark: 'rgba(6, 27, 22, 0.70)' },
}

const MOTES = [
  [65, 15, 3, 8.2, -1.3], [76, 24, 2, 10.6, -4.8],
  [88, 16, 3, 9.3, -2.6], [72, 43, 2, 12.1, -7.4],
  [94, 48, 3, 8.8, -5.1], [81, 61, 2, 11.7, -3.2],
  [68, 72, 3, 9.9, -6.8], [90, 78, 2, 12.8, -1.9],
  [58, 52, 2, 10.2, -8.1], [84, 36, 3, 13.2, -9.6],
  [97, 28, 2, 9.5, -5.9], [74, 88, 3, 11.3, -4.1],
]

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="b" x1="8" y1="8" x2="56" y2="56"><stop stop-color="#143e34"/><stop offset="1" stop-color="#071b18"/></linearGradient><linearGradient id="l" x1="18" y1="12" x2="47" y2="50"><stop stop-color="#edffac"/><stop offset=".48" stop-color="#7fe1bd"/><stop offset="1" stop-color="#72bfe9"/></linearGradient></defs><circle cx="32" cy="32" r="30" fill="url(#b)" stroke="#79d8b9" stroke-opacity=".35" stroke-width="2"/><path d="M47 12C30 14 18 24 17 40c0 5 3 10 8 12 1-13 8-24 21-33-10 10-15 20-16 31 11-4 18-14 17-38Z" fill="url(#l)"/><path d="M25 53c2-13 9-25 22-36" fill="none" stroke="#efffd0" stroke-linecap="round" stroke-width="2"/><circle cx="48" cy="11" r="2" fill="#f3ffab"/></svg>`

const inject = ['theme']

function apply(ctx) {
  ctx.effect(
    () => ctx.theme.overrideTokens(PLUGIN_ID, TOKEN_OVERRIDES),
    'gouden-leeuw-theme: semantic palette',
  )

  ctx.effect(() => {
    if (typeof document === 'undefined' || document.body === null) return undefined

    const previousTitle = document.title
    const root = document.documentElement
    const body = document.body
    document.title = TITLE
    root.dataset.goudenLeeuwTheme = 'true'
    body.dataset.goudenLeeuwTheme = 'true'

    let style = document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`)
    if (style === null) {
      style = document.createElement('style')
      style.dataset.plugin = PLUGIN_ID
      style.dataset.pluginCss = STYLE_ID
      style.textContent = THEME_CSS
      document.head.appendChild(style)
    }

    const field = document.createElement('div')
    field.id = 'gouden-leeuw-theme-fireflies'
    field.className = 'elf-firefly-field'
    field.setAttribute('aria-hidden', 'true')
    for (const [x, y, size, duration, delay] of MOTES) {
      const mote = document.createElement('i')
      mote.style.setProperty('--x', `${x}%`)
      mote.style.setProperty('--y', `${y}%`)
      mote.style.setProperty('--s', `${size}px`)
      mote.style.setProperty('--d', `${duration}s`)
      mote.style.setProperty('--delay', `${delay}s`)
      field.appendChild(mote)
    }
    body.prepend(field)

    const favicon = document.createElement('link')
    favicon.rel = 'icon'
    favicon.type = 'image/svg+xml'
    favicon.dataset.plugin = PLUGIN_ID
    favicon.href = `data:image/svg+xml,${encodeURIComponent(FAVICON_SVG)}`
    document.head.appendChild(favicon)

    return () => {
      field.remove()
      favicon.remove()
      style.remove()
      if (root.dataset.goudenLeeuwTheme === 'true') delete root.dataset.goudenLeeuwTheme
      if (body.dataset.goudenLeeuwTheme === 'true') delete body.dataset.goudenLeeuwTheme
      if (document.title === TITLE) document.title = previousTitle
    }
  }, 'gouden-leeuw-theme: visual surface')
}

exports.apply = apply
exports.inject = inject
