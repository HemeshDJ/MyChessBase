import { useCallback, useEffect, useMemo, useState } from 'react'
import BoardFrame from './BoardFrame'
import MaterialDiff from './MaterialDiff'
import {
  chessAt,
  emptyGame,
  notation,
  outcome,
  playMove,
  toPgn,
  type Game,
} from './game'
import { requestBestMove } from './engine/client'
import { useEngineHealth } from './useEngineHealth'

const DEPTH_PRESETS = [
  { depth: 3, label: 'Beginner', blurb: 'Makes simple mistakes' },
  { depth: 6, label: 'Club', blurb: 'Solid club player' },
  { depth: 10, label: 'Strong', blurb: 'Tough and consistent' },
  { depth: 14, label: 'Expert', blurb: 'Very hard to beat' },
  { depth: 18, label: 'Engine', blurb: 'Near full strength' },
] as const

type Phase = 'setup' | 'playing'

export default function PlayMode() {
  const { engine, engineDown, engineReady } = useEngineHealth()
  const [phase, setPhase] = useState<Phase>('setup')
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w')
  const [depth, setDepth] = useState(6)
  const [game, setGame] = useState<Game>(emptyGame)
  const [selected, setSelected] = useState<string | null>(null)
  const [promo, setPromo] = useState<{ from: string; to: string } | null>(null)
  const [thinking, setThinking] = useState(false)
  const [statusNote, setStatusNote] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const position = useMemo(() => chessAt(game), [game])
  const fen = useMemo(() => position.fen(), [position])
  const turn = position.turn()
  const result = useMemo(() => outcome(position), [position])
  const moves = useMemo(() => notation(game), [game])
  const orientation = playerColor === 'w' ? 'white' : 'black'
  const playersTurn = phase === 'playing' && !result && turn === playerColor && !thinking
  const movableColor = playersTurn ? playerColor : 'none'

  const startGame = useCallback(() => {
    setGame(emptyGame())
    setSelected(null)
    setPromo(null)
    setStatusNote(null)
    setThinking(false)
    setPhase('playing')
  }, [])

  const onSelect = useCallback(
    (square: string | null) => {
      if (!playersTurn) return
      setSelected(square)
    },
    [playersTurn],
  )

  const onPlay = useCallback(
    (from: string, to: string, promotion?: string) => {
      if (!playersTurn) return
      setGame((current) => playMove(current, { from, to, ...(promotion ? { promotion } : {}) }))
      setSelected(null)
      setPromo(null)
      setStatusNote(null)
    },
    [playersTurn],
  )

  const onAskPromotion = useCallback((from: string, to: string) => {
    setPromo({ from, to })
    setSelected(null)
  }, [])

  const onCancelPromo = useCallback(() => setPromo(null), [])

  useEffect(() => {
    if (phase !== 'playing' || result || !engineReady) return
    if (turn === playerColor) return

    const ctrl = new AbortController()
    let live = true
    setThinking(true)
    setStatusNote('Stockfish is thinking…')

    requestBestMove({ fen, depth }, ctrl.signal)
      .then((uci) => {
        if (!live) return
        if (!uci || uci.length < 4) {
          setStatusNote('Engine returned no move.')
          return
        }
        setGame((current) =>
          playMove(current, {
            from: uci.slice(0, 2),
            to: uci.slice(2, 4),
            ...(uci[4] ? { promotion: uci[4] } : {}),
          }),
        )
        setStatusNote(null)
      })
      .catch((error: unknown) => {
        if (!live || (error instanceof DOMException && error.name === 'AbortError')) return
        setStatusNote('Could not get a move from Stockfish.')
      })
      .finally(() => {
        if (live) setThinking(false)
      })

    return () => {
      live = false
      ctrl.abort()
    }
  }, [phase, result, engineReady, turn, playerColor, fen, depth])

  async function copyPgn() {
    await navigator.clipboard.writeText(toPgn(game))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const preset = DEPTH_PRESETS.find((item) => item.depth === depth)
  const headerStatus = result
    ? result
    : engineDown && !engine
      ? 'Stockfish is not running'
      : !engineReady
        ? 'Starting Stockfish…'
        : thinking
          ? 'Computer to move'
          : playersTurn
            ? 'Your move'
            : 'Waiting…'

  if (phase === 'setup') {
    return (
      <main className="mode-panel">
        <section className="setup-card">
          <div className="section-head">
            <h2>Play against Stockfish</h2>
            <span>
              {engine
                ? engine.name
                : import.meta.env.VITE_ENGINE === 'browser'
                  ? 'Loading Stockfish…'
                  : 'Local engine required'}
            </span>
          </div>
          <p className="lede">
            Choose your color and search depth. Higher depth means a stronger opponent.
          </p>

          <div className="setup-block">
            <h3>Your color</h3>
            <div className="choice-row">
              <button
                type="button"
                className={playerColor === 'w' ? 'choice hot' : 'choice'}
                onClick={() => setPlayerColor('w')}
              >
                White
              </button>
              <button
                type="button"
                className={playerColor === 'b' ? 'choice hot' : 'choice'}
                onClick={() => setPlayerColor('b')}
              >
                Black
              </button>
            </div>
          </div>

          <div className="setup-block">
            <h3>
              Depth {depth}
              {preset ? ` · ${preset.label}` : ''}
            </h3>
            <p className="hint">{preset?.blurb ?? 'Custom strength'}</p>
            <div className="choice-row wrap">
              {DEPTH_PRESETS.map((item) => (
                <button
                  key={item.depth}
                  type="button"
                  className={depth === item.depth ? 'choice hot' : 'choice'}
                  onClick={() => setDepth(item.depth)}
                >
                  {item.label}
                  <small>d{item.depth}</small>
                </button>
              ))}
            </div>
            <label className="depth-slider">
              Fine-tune depth
              <input
                type="range"
                min={1}
                max={20}
                value={depth}
                onChange={(event) => setDepth(Number(event.target.value))}
              />
            </label>
          </div>

          <button
            type="button"
            className="primary"
            disabled={!engineReady}
            onClick={startGame}
          >
            {engineReady ? 'Start game' : 'Waiting for Stockfish…'}
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="workspace">
      <section className="board-column">
        <div className="turn-row">
          <span className="turn-meta">
            You play {playerColor === 'w' ? 'White' : 'Black'}
            <strong> · depth {depth}</strong>
            <MaterialDiff position={position} />
          </span>
          <span className={result ? 'result' : ''}>{headerStatus}</span>
        </div>
        <div className="board-row single">
          <BoardFrame
            id="play-board"
            game={game}
            fen={fen}
            turn={turn}
            orientation={orientation}
            selected={selected}
            promo={promo}
            movableColor={movableColor}
            onSelect={onSelect}
            onPlay={onPlay}
            onAskPromotion={onAskPromotion}
            onCancelPromo={onCancelPromo}
          />
        </div>
        <div className="toolbar">
          <button type="button" onClick={startGame}>
            New game
          </button>
          <button
            type="button"
            onClick={() => {
              setPhase('setup')
              setThinking(false)
            }}
          >
            Settings
          </button>
          <button type="button" className="texty" onClick={() => void copyPgn()}>
            {copied ? 'Copied' : 'Copy PGN'}
          </button>
        </div>
        {statusNote && <p className="hint">{statusNote}</p>}
      </section>

      <aside className="study">
        <section>
          <div className="section-head">
            <h2>Game</h2>
            <span>{thinking ? 'Thinking…' : result ? 'Finished' : 'In progress'}</span>
          </div>
          <p className="lede">
            {result
              ? result
              : `Stockfish answers at depth ${depth}. Only your pieces are movable on your turn.`}
          </p>
          <div className="moves">
            <button type="button" className={game.ply === 0 ? 'current' : ''} disabled>
              Start
            </button>
            {moves.map((item) => (
              <button
                key={item.ply}
                type="button"
                className={item.ply === game.ply ? 'current' : ''}
                disabled
              >
                {item.prefix && <span>{item.prefix}</span>} {item.san}
              </button>
            ))}
          </div>
        </section>
      </aside>
    </main>
  )
}
