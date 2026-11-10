const { app, BrowserWindow, dialog } = require('electron')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const packaged = app.isPackaged
const root = packaged ? app.getAppPath() : path.resolve(__dirname, '..')

let engine = null

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

function stockfishPath() {
  if (packaged) return path.join(process.resourcesPath, 'engine', 'stockfish.exe')
  return path.join(root, 'engine', 'stockfish.exe')
}

async function openWindow() {
  const serverUrl = pathToFileURL(path.join(root, 'server', 'index.mjs')).href
  const { startEngineServer } = await import(serverUrl)
  engine = await startEngineServer({
    stockfishPath: stockfishPath(),
    uiDir: path.join(root, 'dist'),
    allowPortFallback: true,
  })

  const window = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: 'MyChessBase',
    autoHideMenuBar: true,
    backgroundColor: '#1c1915',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  await window.loadURL(`http://127.0.0.1:${engine.port}/`)
}

app.whenReady().then(() => {
  openWindow().catch((error) => {
    dialog.showErrorBox('MyChessBase', error instanceof Error ? error.message : String(error))
    app.quit()
  })
})

app.on('second-instance', () => {
  const [window] = BrowserWindow.getAllWindows()
  if (!window) return
  if (window.isMinimized()) window.restore()
  window.focus()
})

app.on('before-quit', () => {
  engine?.shutdown()
})

app.on('window-all-closed', () => {
  app.quit()
})
