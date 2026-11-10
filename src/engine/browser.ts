import type { EngineHealth, EngineLine, EngineMessage } from './client'

const ENGINE_FILE = 'stockfish-19-lite-single.js'

type SearchJob = {
  fen: string
  depth: number
  multipv: number
  signal: AbortSignal
  onUpdate: (message: EngineMessage) => void
  cancelled: boolean
  resolve: () => void
  reject: (error: unknown) => void
}

let worker: Worker | null = null
let health: EngineHealth | null = null
let ready: Promise<EngineHealth> | null = null
let lines = new Map<number, EngineLine>()
let active: SearchJob | null = null
const queue: SearchJob[] = []
let emitTimer: ReturnType<typeof setTimeout> | null = null

function engineUrl(): string {
  return new URL(`${import.meta.env.BASE_URL}engine/${ENGINE_FILE}`, window.location.origin).href
}

function parseInfo(line: string): EngineLine | null {
  if (!line.includes(' pv ') || line.includes('currmove')) return null
  if (line.includes('lowerbound') || line.includes('upperbound')) return null
  const depth = Number(/depth (\d+)/.exec(line)?.[1])
  if (!depth) return null
  const score = /score (cp|mate) (-?\d+)/.exec(line)
  const pvRaw = / pv (.+)$/.exec(line)?.[1]
  if (!score || !pvRaw) return null
  const wdl = /wdl (\d+) (\d+) (\d+)/.exec(line)
  return {
    multipv: Number(/multipv (\d+)/.exec(line)?.[1] ?? 1),
    depth,
    cp: score[1] === 'cp' ? Number(score[2]) : null,
    mate: score[1] === 'mate' ? Number(score[2]) : null,
    pv: pvRaw.trim().split(/\s+/),
    wdl: wdl ? [Number(wdl[1]), Number(wdl[2]), Number(wdl[3])] : null,
    nps: Number(/nps (\d+)/.exec(line)?.[1] ?? 0),
  }
}

function snapshot(): EngineLine[] {
  return [...lines.values()].sort((a, b) => a.multipv - b.multipv)
}

function clearEmit() {
  if (!emitTimer) return
  clearTimeout(emitTimer)
  emitTimer = null
}

function scheduleEmit(job: SearchJob) {
  if (emitTimer || job.cancelled) return
  emitTimer = setTimeout(() => {
    emitTimer = null
    if (active !== job || job.cancelled) return
    const top = lines.get(1)
    job.onUpdate({
      type: 'info',
      lines: snapshot(),
      depth: top?.depth ?? 0,
      nps: top?.nps ?? 0,
    })
  }, 60)
}

function finishActive(line: string) {
  const job = active
  active = null
  clearEmit()
  if (!job) {
    pump()
    return
  }
  if (job.cancelled || job.signal.aborted) {
    job.reject(new DOMException('Aborted', 'AbortError'))
  } else {
    const move = line.split(/\s+/)[1] ?? ''
    const top = lines.get(1)
    job.onUpdate({
      type: 'bestmove',
      bestmove: move,
      lines: snapshot(),
      depth: top?.depth ?? 0,
      nps: top?.nps ?? 0,
    })
    job.resolve()
  }
  pump()
}

function onWorkerMessage(data: unknown) {
  if (typeof data !== 'string') return
  if (data.startsWith('id name ') && health) {
    health = { ...health, name: data.slice('id name '.length).trim() || health.name }
  }
  const info = data.startsWith('info ') ? parseInfo(data) : null
  if (info && active && !active.cancelled) {
    lines.set(info.multipv, info)
    scheduleEmit(active)
  }
  if (data.startsWith('bestmove ')) finishActive(data)
}

function boot(): Promise<EngineHealth> {
  if (ready) return ready
  ready = new Promise((resolve, reject) => {
    const engine = new Worker(engineUrl())
    worker = engine
    const pending: EngineHealth = { name: 'Stockfish', threads: 1 }
    health = pending
    const timer = window.setTimeout(() => {
      reject(new Error('Stockfish did not start'))
    }, 30000)

    engine.onmessage = (event: MessageEvent<unknown>) => {
      const data = event.data
      if (typeof data === 'string' && data.startsWith('id name ')) {
        pending.name = data.slice('id name '.length).trim() || pending.name
      }
      if (data === 'uciok') {
        window.clearTimeout(timer)
        resolve(pending)
      }
      onWorkerMessage(data)
    }
    engine.onerror = () => {
      window.clearTimeout(timer)
      reject(new Error('Stockfish failed to load'))
    }
    engine.postMessage('uci')
  })
  ready.catch(() => {
    ready = null
    worker?.terminate()
    worker = null
    health = null
  })
  return ready
}

function start(job: SearchJob) {
  if (!worker) {
    job.reject(new Error('Stockfish is not running'))
    return
  }
  active = job
  lines = new Map()
  worker.postMessage(`setoption name MultiPV value ${job.multipv}`)
  worker.postMessage(`position fen ${job.fen}`)
  worker.postMessage(`go depth ${job.depth}`)
}

function pump() {
  while (queue.length > 0) {
    const job = queue.shift()
    if (!job) return
    if (job.cancelled || job.signal.aborted) {
      job.reject(new DOMException('Aborted', 'AbortError'))
      continue
    }
    start(job)
    return
  }
}

function cancel(job: SearchJob) {
  job.cancelled = true
  if (active !== job) return
  clearEmit()
  worker?.postMessage('stop')
}

export async function fetchBrowserHealth(signal?: AbortSignal): Promise<EngineHealth> {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  const result = await boot()
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  return health ?? result
}

export function streamBrowserAnalysis(
  params: { fen: string; depth: number; multipv: number },
  onUpdate: (message: EngineMessage) => void,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const job: SearchJob = {
      ...params,
      signal,
      onUpdate,
      cancelled: signal.aborted,
      resolve,
      reject,
    }
    const abort = () => cancel(job)
    signal.addEventListener('abort', abort, { once: true })
    const settle = (finish: () => void) => {
      signal.removeEventListener('abort', abort)
      finish()
    }
    job.resolve = () => settle(resolve)
    job.reject = (error) => settle(() => reject(error))

    if (job.cancelled) {
      job.reject(new DOMException('Aborted', 'AbortError'))
      return
    }

    boot()
      .then(() => {
        if (job.cancelled || signal.aborted) {
          job.reject(new DOMException('Aborted', 'AbortError'))
          return
        }
        if (active) queue.push(job)
        else start(job)
      })
      .catch((error: unknown) => job.reject(error))
  })
}
