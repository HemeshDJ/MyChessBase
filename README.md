# MyChessBase

Chess study app with a local Stockfish engine. The same UI can run in a browser or as a Windows desktop app.

## Browser

```bash
npm install
npm run download-engine
npm run dev
```

Open http://localhost:5173/. The engine listens on http://127.0.0.1:8787.

## Desktop window

```bash
npm run desktop
```

Builds the UI and opens it in its own window, with Stockfish started automatically.

## Windows app

```bash
npm run exe
```

Writes `release/MyChessBase.exe`. That file is the local application: double-click it, and it opens the app window and starts Stockfish. No browser tab and no separate dev server.

The browser dev server and the desktop app each start their own Stockfish process. Run one at a time if you want a single engine on port 8787. The desktop app moves to the next free port when 8787 is already taken.

## GitHub Pages

```bash
npm run build:pages
```

That build runs Stockfish in the browser (the lite single-threaded Stockfish.js engine) and is what https://hemeshdj.github.io/MyChessBase/ serves. Publish it by pushing the `dist` folder to the `gh-pages` branch. The local dev server and the Windows app keep using the downloaded Stockfish executable. Stockfish.js is GPL-3.0; the Pages build downloads its license text next to the engine.
