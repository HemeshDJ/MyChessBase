import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const exe = path.join(root, 'engine', 'stockfish.exe')

if (!existsSync(exe)) {
  console.error('Stockfish is not downloaded yet.')
  console.error('Run: npm run download-engine')
  process.exit(1)
}

const children = []
let stopping = false

function shutdown(code = 0) {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (!child.killed) child.kill()
  }
  setTimeout(() => process.exit(code), 300)
}

function run(script) {
  const child = spawn(process.execPath, [path.join(root, script)], {
    cwd: root,
    stdio: 'inherit',
  })
  children.push(child)
  child.on('exit', (code) => {
    if (!stopping) shutdown(code ?? 0)
  })
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

run('server/index.mjs')
run(path.join('node_modules', 'vite', 'bin', 'vite.js'))
