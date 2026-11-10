import { createWriteStream, existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

const root = path.resolve(import.meta.dirname, '..')
const destDir = path.join(root, 'public', 'engine')
const release = 'https://github.com/nmrugg/stockfish.js/releases/download/v19.0.1'
const files = [
  ['stockfish-19-lite-single.js', `${release}/stockfish-19-lite-single.js`],
  ['stockfish-19-lite-single.wasm', `${release}/stockfish-19-lite-single.wasm`],
  ['LICENSE.txt', 'https://raw.githubusercontent.com/nmrugg/stockfish.js/v19.0.1/Copying.txt'],
]

await mkdir(destDir, { recursive: true })

for (const [name, url] of files) {
  const dest = path.join(destDir, name)
  if (existsSync(dest)) {
    console.log(`${name} already present`)
    continue
  }
  console.log(`Downloading ${name}...`)
  const response = await fetch(url, { headers: { 'User-Agent': 'MyChessBase' } })
  if (!response.ok || !response.body) {
    throw new Error(`Could not download ${name} (${response.status})`)
  }
  await pipeline(Readable.fromWeb(response.body), createWriteStream(dest))
}
