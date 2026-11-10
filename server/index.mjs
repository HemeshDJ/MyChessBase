import { createInterface } from 'node:readline'
import { spawn } from 'node:child_process'
import { createReadStream, existsSync, statSync } from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const threads = Math.min(8, Math.max(1, os.availableParallelism() - 1))
const FEN_RE =
  /^([pnbrqkPNBRQK1-8]+\/){7}[pnbrqkPNBRQK1-8]+ [wb] (-|[KQkq]+) (-|[a-h][36]) \d+ \d+$/

let engineName = 'Stockfish'
let state = 'boot'
let currentRes = null
let queued = null
let lines = new Map()
let emitTimer = null
let emitGen = 0
let proc = null
let markReady = () => {}
let ready = Promise.resolve()
let boundPort = 8787

function send(command) {
  proc?.stdin.write(`${command}\n`)
}

function clearEmit() {
  if (!emitTimer) return
  clearTimeout(emitTimer)
  emitTimer = null
}

function snapshot() {
  return [...lines.values()].sort((a, b) => a.multipv - b.multipv)
}

function writeEvent(res, payload) {
  if (!res || res.writableEnded || res.destroyed) return
  res.write(`data: ${JSON.stringify(payload)}\n\n`)
}

function scheduleEmit() {
  const gen = emitGen
  if (emitTimer) return
  emitTimer = setTimeout(() => {
    emitTimer = null
    if (gen !== emitGen || state !== 'searching') return
    const top = lines.get(1)
    writeEvent(currentRes, {
      type: 'info',
      lines: snapshot(),
      depth: top?.depth ?? 0,
      nps: top?.nps ?? 0,
    })
  }, 60)
}

function startSearch(job, res) {
  const launch = () => {
    if (currentRes !== res) return
    emitGen += 1
    clearEmit()
    lines = new Map()
    state = 'searching'
    send(`setoption name MultiPV value ${job.multipv}`)
    send(`position fen ${job.fen}`)
    send(`go depth ${job.depth}`)
  }

  if (state === 'idle') {
    launch()
    return
  }

  queued = launch
  if (state === 'searching') {
    state = 'stopping'
    clearEmit()
    send('stop')
  }
}

function onBestmove(line) {
  if (state === 'stopping') {
    state = 'idle'
    const next = queued
    queued = null
    if (next) next()
    return
  }
  if (state !== 'searching') return
  state = 'idle'
  clearEmit()
  const move = line.split(/\s+/)[1] ?? ''
  const res = currentRes
  writeEvent(res, {
    type: 'bestmove',
    bestmove: move,
    lines: snapshot(),
    depth: lines.get(1)?.depth ?? 0,
    nps: lines.get(1)?.nps ?? 0,
  })
  if (res && !res.writableEnded) res.end()
  if (currentRes === res) currentRes = null
}

function parseInfo(line) {
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

function allowOrigin(req, res) {
  const origin = req.headers.origin
  if (typeof origin === 'string' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
}

function contentType(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case '.html':
      return 'text/html; charset=utf-8'
    case '.js':
      return 'text/javascript; charset=utf-8'
    case '.css':
      return 'text/css; charset=utf-8'
    case '.svg':
      return 'image/svg+xml'
    case '.json':
      return 'application/json'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    case '.ico':
      return 'image/x-icon'
    case '.woff2':
      return 'font/woff2'
    default:
      return 'application/octet-stream'
  }
}

function serveUi(uiDir, url, res) {
  const rel = decodeURIComponent(url.pathname).replace(/^[/\\]+/, '')
  const base = path.resolve(uiDir)
  let filePath = path.resolve(base, rel)
  if (filePath !== base && !filePath.startsWith(base + path.sep)) {
    res.statusCode = 403
    res.end('Forbidden')
    return
  }
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = path.join(base, 'index.html')
  }
  if (!existsSync(filePath)) {
    res.statusCode = 404
    res.end('Not found')
    return
  }
  res.setHeader('Content-Type', contentType(filePath))
  createReadStream(filePath).pipe(res)
}

function listen(server, port) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off('listening', onListening)
      reject(error)
    }
    const onListening = () => {
      server.off('error', onError)
      const address = server.address()
      resolve(typeof address === 'object' && address ? address.port : port)
    }
    server.once('error', onError)
    server.once('listening', onListening)
    server.listen(port, '127.0.0.1')
  })
}

function attachEngine(exe) {
  ready = new Promise((resolve) => {
    markReady = resolve
  })
  proc = spawn(exe, [], {
    cwd: path.dirname(exe),
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  proc.on('error', (error) => {
    console.error(error.message)
  })
  proc.on('exit', (code) => {
    if (code !== 0 && code !== null) console.error(`Stockfish exited (${code})`)
  })
  proc.stderr.on('data', (chunk) => process.stderr.write(chunk))

  const rl = createInterface({ input: proc.stdout })
  rl.on('line', (line) => {
    if (line.startsWith('id name ')) engineName = line.slice('id name '.length).trim()
    if (line === 'uciok') {
      send(`setoption name Threads value ${threads}`)
      send('setoption name Hash value 128')
      send('setoption name UCI_ShowWDL value true')
      send('isready')
      return
    }
    if (line === 'readyok' && state === 'boot') {
      state = 'idle'
      markReady()
      console.log(`${engineName} ready on 127.0.0.1:${boundPort} (${threads} threads)`)
      return
    }
    if (line.startsWith('bestmove')) {
      onBestmove(line)
      return
    }
    if (state === 'searching' && line.startsWith('info ')) {
      const info = parseInfo(line)
      if (!info) return
      lines.set(info.multipv, info)
      scheduleEmit()
    }
  })
  send('uci')
}

export async function startEngineServer(options = {}) {
  const exe = options.stockfishPath || process.env.STOCKFISH_PATH || path.join(root, 'engine', 'stockfish.exe')
  const uiDir = options.uiDir || process.env.UI_DIR || ''
  const preferredPort = Number(options.port ?? process.env.ENGINE_PORT ?? 8787)
  if (!existsSync(exe)) {
    throw new Error(`Missing ${exe}\nRun: npm run download-engine`)
  }

  const server = http.createServer(async (req, res) => {
    allowOrigin(req, res)
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${boundPort}`)

    if (req.method === 'GET' && url.pathname === '/api/health') {
      await ready
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ name: engineName, threads }))
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/analyze') {
      await ready
      const fen = url.searchParams.get('fen') ?? ''
      const depth = Number(url.searchParams.get('depth') ?? '20')
      const multipv = Number(url.searchParams.get('multipv') ?? '3')
      if (
        !FEN_RE.test(fen) ||
        !Number.isInteger(depth) ||
        depth < 1 ||
        depth > 30 ||
        !Number.isInteger(multipv) ||
        multipv < 1 ||
        multipv > 5
      ) {
        res.statusCode = 400
        res.end('Bad analysis request')
        return
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      })
      currentRes = res
      startSearch({ fen, depth, multipv }, res)

      req.on('close', () => {
        if (currentRes !== res) return
        currentRes = null
        clearEmit()
        if (state === 'searching') {
          queued = null
          state = 'stopping'
          send('stop')
        } else if (state === 'stopping') {
          queued = null
        }
      })
      return
    }

    if (req.method === 'GET' && uiDir) {
      serveUi(uiDir, url, res)
      return
    }

    res.statusCode = 404
    res.end('Not found')
  })

  const ports = options.allowPortFallback
    ? Array.from({ length: 20 }, (_, index) => preferredPort + index)
    : [preferredPort]
  let listenError = null
  for (const port of ports) {
    try {
      boundPort = await listen(server, port)
      listenError = null
      break
    } catch (error) {
      listenError = error
      if (error?.code !== 'EADDRINUSE') break
    }
  }
  if (listenError) throw listenError

  attachEngine(exe)

  let stopped = false
  function shutdown() {
    if (stopped) return
    stopped = true
    clearEmit()
    try {
      send('quit')
    } catch {
      proc?.kill()
    }
    setTimeout(() => {
      if (proc && !proc.killed) proc.kill()
      server.close()
    }, 250)
  }

  return { port: boundPort, ready, shutdown }
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href

if (invokedDirectly) {
  startEngineServer()
    .then((handle) => {
      const stop = () => {
        handle.shutdown()
        setTimeout(() => process.exit(0), 300)
      }
      process.on('SIGINT', stop)
      process.on('SIGTERM', stop)
    })
    .catch((error) => {
      console.error(error.message)
      process.exit(1)
    })
}
