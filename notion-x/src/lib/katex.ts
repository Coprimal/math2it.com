import katex, { KatexOptions } from 'katex'

/**
 * KaTeX fonts lack metrics for many Vietnamese letters (ạ, ợ, ữ, …).
 * It still renders the glyph but always console.warns — hard-coded in katex.
 * Silence only that message so post pages stay quiet in the browser console.
 */
const METRICS_WARN_PREFIX = 'No character metrics'

export const defaultKatexSettings: KatexOptions = {
  throwOnError: false,
  strict: false
}

export function renderKatexToString(math: string, options: KatexOptions = {}): string {
  const previousWarn = console.warn
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].startsWith(METRICS_WARN_PREFIX)) {
      return
    }
    previousWarn.apply(console, args as Parameters<typeof console.warn>)
  }
  try {
    return katex.renderToString(math, { ...defaultKatexSettings, ...options })
  } finally {
    console.warn = previousWarn
  }
}
