import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import BestLines from './BestLines'
import BoardFrame from './BoardFrame'
import type { EngineArrowData } from './EngineArrow'
import MaterialDiff from './MaterialDiff'
import {
  chessAt,
  emptyGame,
  notation,
  outcome,
  playMove,
  readGameText,
  toPgn,
  type Game,
} from './game'
import { useEngineHealth } from './useEngineHealth'

export default function AnalysisMode() {
  const { engine, engineDown, engineReady } = useEngineHealth()
  const [game, setGame] = useState<Game>(emptyGame)
  const [orientation, setOrientation] = useState<'white' | 'black'>('white')
  const [selected, setSelected] = useState<string | null>(null)
  const [promo, setPromo] = useState<{ from: string; to: string } | null>(null)
  const [moveText, setMoveText] = useState('')
  const [moveError, setMoveError] = useState<string | null>(null)
  const [paste, setPaste] = useState('')
  const [pasteError, setPasteError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [depth, setDepth] = useState(20)
  const [multipv, setMultipv] = useState(3)
  const [arrow, setArrow] = useState<EngineArrowData | null>(null)
  const [evalView, setEvalView] = useState({ text: '0.00', bar: 50 })
  const activeMove = useRef<HTMLButtonElement>(null)

  const position = useMemo(() => chessAt(game), [game])
  const fen = useMemo(() => position.fen(), [position])
  const turn = position.turn()
  const result = useMemo(() => outcome(position), [position])
  const moves = useMemo(() => notation(game), [game])
  const inCheck = position.inCheck() && !result

  useEffect(() => {
    activeMove.current?.scrollIntoView({ block: 'nearest' })
  }, [game.ply])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setGame((current) => ({ ...current, ply: Math.max(0, current.ply - 1) }))
        setSelected(null)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        setGame((current) => ({ ...current, ply: Math.min(current.sans.length, current.ply + 1) }))
        setSelected(null)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setGame((current) => ({ ...current, ply: 0 }))
        setSelected(null)
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        setGame((current) => ({ ...current, ply: current.sans.length }))
        setSelected(null)
      } else if (event.key === 'f') {
        setOrientation((side) => (side === 'white' ? 'black' : 'white'))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onSelect = useCallback((square: string | null) => setSelected(square), [])
  const onPlay = useCallback((from: string, to: string, promotion?: string) => {
    setGame((current) => playMove(current, { from, to, ...(promotion ? { promotion } : {}) }))
    setSelected(null)
    setPromo(null)
    setMoveError(null)
  }, [])
  const onAskPromotion = useCallback((from: string, to: string) => {
    setPromo({ from, to })
    setSelected(null)
  }, [])
  const onCancelPromo = useCallback(() => setPromo(null), [])

  const onArrowChange = useCallback((next: EngineArrowData | null) => {
    setArrow((current) => {
      if (
        current &&
        next &&
        current.from === next.from &&
        current.to === next.to &&
        current.color === next.color
      ) {
        return current
      }
      return next
    })
  }, [])

  const onEvalChange = useCallback((payload: { text: string; bar: number }) => {
    setEvalView((current) =>
      current.text === payload.text && Math.abs(current.bar - payload.bar) < 0.5
        ? current
        : payload,
    )
  }, [])

  const onPlayUci = useCallback((uci: string) => {
    if (uci.length < 4) return
    try {
      setGame((current) =>
        playMove(current, {
          from: uci.slice(0, 2),
          to: uci.slice(2, 4),
          ...(uci[4] ? { promotion: uci[4] } : {}),
        }),
      )
      setSelected(null)
    } catch {
      setMoveError('Could not play that engine move.')
    }
  }, [])

  function submitMove(event: FormEvent) {
    event.preventDefault()
    const text = moveText.trim()
    if (!text) return
    try {
      setGame((current) => playMove(current, text))
      setMoveText('')
      setMoveError(null)
      setSelected(null)
    } catch {
      setMoveError(`“${text}” is not a legal move here.`)
    }
  }

  function loadPasted() {
    try {
      setGame(readGameText(paste))
      setPasteError(null)
      setSelected(null)
      setPromo(null)
    } catch (error) {
      setPasteError(error instanceof Error ? error.message : 'Could not read that game.')
    }
  }

  async function copyPgn() {
    await navigator.clipboard.writeText(toPgn(game))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const status = result
    ? result
    : engineDown && !engine
      ? 'Stockfish is not running'
      : !engine
        ? 'Starting Stockfish…'
        : inCheck
          ? 'Check'
          : import.meta.env.VITE_ENGINE === 'browser'
            ? 'In-browser analysis'
            : 'Local analysis'

  return (
    <main className="workspace">
      <section className="board-column">
        <div className="turn-row">
          <span className="turn-meta">
            {turn === 'w' ? 'White' : 'Black'} to move
            <strong className={scoreClass(evalView.text)}>{evalView.text}</strong>
            <MaterialDiff position={position} />
          </span>
          <span className={result ? 'result' : ''}>{status}</span>
        </div>
        <div className="board-row">
          <div className="eval" title={`${evalView.text} for White`}>
            <div className="eval-white" style={{ height: `${evalView.bar}%` }} />
          </div>
          <BoardFrame
            id="analysis-board"
            game={game}
            fen={fen}
            turn={turn}
            orientation={orientation}
            selected={selected}
            arrow={arrow}
            promo={promo}
            onSelect={onSelect}
            onPlay={onPlay}
            onAskPromotion={onAskPromotion}
            onCancelPromo={onCancelPromo}
          />
        </div>

        <div className="toolbar">
          <button type="button" onClick={() => setGame((current) => ({ ...current, ply: 0 }))}>
            Start
          </button>
          <button
            type="button"
            onClick={() =>
              setGame((current) => ({ ...current, ply: Math.max(0, current.ply - 1) }))
            }
          >
            Back
          </button>
          <button
            type="button"
            onClick={() =>
              setGame((current) => ({
                ...current,
                ply: Math.min(current.sans.length, current.ply + 1),
              }))
            }
          >
            Forward
          </button>
          <button
            type="button"
            onClick={() => setGame((current) => ({ ...current, ply: current.sans.length }))}
          >
            End
          </button>
          <button
            type="button"
            onClick={() => setOrientation((side) => (side === 'white' ? 'black' : 'white'))}
          >
            Flip
          </button>
          <button
            type="button"
            onClick={() => {
              setGame(emptyGame())
              setSelected(null)
              setPromo(null)
              setMoveError(null)
            }}
          >
            New game
          </button>
        </div>
        <p className="hint">Arrow keys step through the game. F flips the board.</p>

        <form className="move-form" onSubmit={submitMove}>
          <label htmlFor="move">Play a move</label>
          <div>
            <input
              id="move"
              value={moveText}
              onChange={(event) => setMoveText(event.target.value)}
              placeholder="e4, Nf3, O-O"
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit">Play</button>
          </div>
          {moveError && <p className="error">{moveError}</p>}
        </form>
      </section>

      <aside className="study">
        <BestLines
          fen={fen}
          turn={turn}
          depth={depth}
          multipv={multipv}
          engineReady={engineReady}
          gameOver={Boolean(result)}
          onDepthChange={setDepth}
          onMultipvChange={setMultipv}
          onArrowChange={onArrowChange}
          onEvalChange={onEvalChange}
          onPlayUci={onPlayUci}
        />

        <section>
          <div className="section-head">
            <h2>Moves</h2>
            <button type="button" className="texty" onClick={() => void copyPgn()}>
              {copied ? 'Copied' : 'Copy PGN'}
            </button>
          </div>
          <div className="moves">
            <button
              type="button"
              className={game.ply === 0 ? 'current' : ''}
              onClick={() => setGame((current) => ({ ...current, ply: 0 }))}
            >
              Start
            </button>
            {moves.map((item) => (
              <button
                key={item.ply}
                type="button"
                ref={item.ply === game.ply ? activeMove : undefined}
                className={item.ply === game.ply ? 'current' : item.ply > game.ply ? 'future' : ''}
                onClick={() => setGame((current) => ({ ...current, ply: item.ply }))}
              >
                {item.prefix && <span>{item.prefix}</span>} {item.san}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2>Load a game</h2>
          <textarea
            value={paste}
            onChange={(event) => setPaste(event.target.value)}
            placeholder={'1. e4 e5 2. Nf3 Nc6 3. Bb5\nor a PGN, or a FEN'}
            rows={5}
            spellCheck={false}
          />
          <button type="button" onClick={loadPasted}>
            Load
          </button>
          {pasteError && <p className="error">{pasteError}</p>}
        </section>
      </aside>
    </main>
  )
}

function scoreClass(score: string): string {
  if (score.startsWith('+')) return 'score plus'
  if (score.startsWith('-')) return 'score minus'
  return 'score'
}
