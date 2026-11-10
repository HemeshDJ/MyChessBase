const browserEngine = import.meta.env.VITE_ENGINE === 'browser'

function engineBase(): string {
  if (import.meta.env.DEV) return 'http://127.0.0.1:8787'
  return window.location.origin
}

export type EngineLine = {
  multipv: number
  depth: number
  cp: number | null
  mate: number | null
  pv: string[]
  wdl: [number, number, number] | null
  nps: number
}

export type EngineMessage = {
  type: 'info' | 'bestmove'
  lines: EngineLine[]
  depth: number
  nps: number
  bestmove?: string
}

export type EngineHealth = {
  name: string
  threads: number
}

export async function fetchHealth(signal?: AbortSignal): Promise<EngineHealth> {
  if (browserEngine) {
    const engine = await import('./browser')
    return engine.fetchBrowserHealth(signal)
  }
  const response = await fetch(`${engineBase()}/api/health`, { signal })
  if (!response.ok) throw new Error('Engine health check failed')
  return response.json() as Promise<EngineHealth>
}

export async function streamAnalysis(
  params: { fen: string; depth: number; multipv: number },
  onUpdate: (message: EngineMessage) => void,
  signal: AbortSignal,
): Promise<void> {
  if (browserEngine) {
    const engine = await import('./browser')
    return engine.streamBrowserAnalysis(params, onUpdate, signal)
  }
  const url = new URL('/api/analyze', engineBase())
  url.searchParams.set('fen', params.fen)
  url.searchParams.set('depth', String(params.depth))
  url.searchParams.set('multipv', String(params.multipv))

  const response = await fetch(url, {
    signal,
    headers: { Accept: 'text/event-stream' },
  })
  if (!response.ok || !response.body) {
    throw new Error(`Engine request failed (${response.status})`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const chunks = buffer.split('\n\n')
    buffer = chunks.pop() ?? ''
    for (const chunk of chunks) {
      const data = chunk
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
        .join('\n')
      if (!data) continue
      onUpdate(JSON.parse(data) as EngineMessage)
    }
  }
}

export async function requestBestMove(
  params: { fen: string; depth: number },
  signal: AbortSignal,
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    let settled = false
    const finish = (value: string | null) => {
      if (settled) return
      settled = true
      resolve(value && value !== '(none)' ? value : null)
    }

    streamAnalysis({ ...params, multipv: 1 }, (message) => {
      if (message.type !== 'bestmove') return
      finish(message.bestmove ?? message.lines[0]?.pv[0] ?? null)
    }, signal)
      .then(() => finish(null))
      .catch((error: unknown) => {
        if (settled) return
        settled = true
        reject(error)
      })
  })
}
