import { execFile } from 'node:child_process'
import { existsSync, createWriteStream } from 'node:fs'
import { copyFile, mkdir, readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { promisify } from 'node:util'
import { spawn } from 'node:child_process'

const execFileAsync = promisify(execFile)
const root = path.resolve(import.meta.dirname, '..')
const engineDir = path.join(root, 'engine')
const destExe = path.join(engineDir, 'stockfish.exe')
const releaseUrl = 'https://api.github.com/repos/official-stockfish/Stockfish/releases/latest'
const headers = {
  'User-Agent': 'MyChessBase',
  Accept: 'application/vnd.github+json',
}

if (!process.argv.includes('--force') && existsSync(destExe)) {
  const name = await probe(destExe).catch(() => null)
  if (name) {
    console.log(`${name} already present at ${destExe}`)
    process.exit(0)
  }
  console.log('Existing engine did not start. Downloading a fresh copy.')
}

const releaseResponse = await fetch(releaseUrl, { headers })
if (!releaseResponse.ok) {
  throw new Error(`Could not read the Stockfish release (${releaseResponse.status})`)
}
const release = await releaseResponse.json()
const asset =
  release.assets?.find((item) => item.name === 'stockfish-windows-x86-64-universal.zip') ??
  release.assets?.find((item) => /windows-x86-64.*\.zip$/i.test(item.name))

if (!asset) {
  throw new Error('The latest Stockfish release has no Windows x86-64 build.')
}

await mkdir(engineDir, { recursive: true })
const zipPath = path.join(engineDir, asset.name)
const extractDir = path.join(engineDir, 'src')
console.log(`Downloading ${asset.name} from ${release.tag_name}...`)

const download = await fetch(asset.browser_download_url, {
  headers: { 'User-Agent': 'MyChessBase' },
})
if (!download.ok || !download.body) {
  throw new Error(`Download failed (${download.status})`)
}
await pipeline(Readable.fromWeb(download.body), createWriteStream(zipPath))

await rm(extractDir, { recursive: true, force: true })
await mkdir(extractDir, { recursive: true })
console.log('Extracting...')
await execFileAsync('tar', ['-xf', zipPath, '-C', extractDir])

const exe = await findWindowsEngine(extractDir)
if (!exe) throw new Error('The archive did not contain a Windows Stockfish executable.')
await copyFile(exe, destExe)
await rm(extractDir, { recursive: true, force: true })
await rm(zipPath, { force: true })

const name = await probe(destExe)
console.log(`Ready: ${name}`)
console.log(destExe)

async function findWindowsEngine(dir) {
  const found = []
  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) await walk(full)
      else if (entry.name.toLowerCase().endsWith('.exe')) found.push(full)
    }
  }
  await walk(dir)
  return (
    found.find((file) => /avx2/i.test(path.basename(file))) ??
    found.find((file) => /universal|popcnt|sse/i.test(path.basename(file))) ??
    found[0] ??
    null
  )
}

function probe(exe) {
  return new Promise((resolve, reject) => {
    const child = spawn(exe, [], { stdio: ['pipe', 'pipe', 'pipe'] })
    let output = ''
    const timer = setTimeout(() => {
      child.kill()
      reject(new Error('Stockfish did not answer the uci command'))
    }, 20000)
    child.on('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
    child.stdout.on('data', (chunk) => {
      output += chunk.toString()
      if (!output.includes('uciok')) return
      clearTimeout(timer)
      child.stdin.write('quit\n')
      resolve(output.match(/id name (.+)/)?.[1]?.trim() ?? 'Stockfish')
    })
    child.stdin.write('uci\n')
  })
}
