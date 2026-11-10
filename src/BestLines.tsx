import { useEffect, useMemo, useRef, useState } from 'react'
import type { EngineArrowData } from './EngineArrow'
import {
  evalBarPercent,
  formatEval,
  formatVariation,
  formatWdl,
  uciToSan,
} from './game'
import { streamAnalysis, type EngineLine } from './engine/client'

type BestLinesProps = {
  fen: string
  turn: 'w' | 'b'
  depth: number
  multipv: number
  engineReady: boolean
  gameOver: boolean
  onDepthChange: (depth: number) => void
  onMultipvChange: (multipv: number) => void
  onArrowChange: (arrow: EngineArrowData | null) => void
  onEvalChange: (payload: { text: string; bar: number }) => void
  onPlayUci: (uci: string) => void
}

type AnalysisState = {
  lines: EngineLine[]
  depth: number
  nps: number
  searching: boolean
  fen: string
}

export default function BestLines({
  fen,
  turn,
  depth,
  multipv,
  engineReady,
  gameOver,
  onDepthChange,
  onMultipvChange,
  onArrowChange,
  onEvalChange,
  onPlayUci,
}: BestLinesProps) {
  const [analysis, setAnalysis] = useState<AnalysisState>({
    lines: [],
    depth: 0,
    nps: 0,
    searching: false,
    fen,
  })
  const [hover, setHover] = useState<number | null>(null)
  const arrowKey = useRef('')
  const evalKey = useRef('')

  useEffect(() => {
    if (!engineReady || gameOver) {
      setAnalysis({
        lines: [],
        depth: 0,
        nps: 0,
        searching: false,
        fen,
      })
      return
    }

    const ctrl = new AbortController()
    let live = true
    setAnalysis((current) => ({
      ...current,
      searching: true,
      fen,
      // Keep previous lines until the first update for this position arrives.
      lines: current.fen === fen ? current.lines : [],
      depth: current.fen === fen ? current.depth : 0,
    }))

    streamAnalysis({ fen, depth, multipv }, (message) => {
      if (!live) return
      setAnalysis({
        lines: message.lines,
        depth: message.depth || 0,
        nps: message.nps || 0,
        searching: message.type !== 'bestmove',
        fen,
      })
    }, ctrl.signal).catch((error: unknown) => {
      if (!live || (error instanceof DOMException && error.name === 'AbortError')) return
      setAnalysis((current) => ({ ...current, searching: false }))
    })

    return () => {
      live = false
      ctrl.abort()
    }
  }, [fen, depth, multipv, engineReady, gameOver])

  const top = analysis.lines[0]
  const shown = analysis.lines.find((line) => line.multipv === hover) ?? top
  const fresh = analysis.fen === fen

  useEffect(() => {
    const uci = fresh ? shown?.pv[0] : undefined
    const color =
      shown && top && shown.multipv !== top.multipv ? '#3b82c4' : '#2f9e5c'
    const nextKey = uci && uci.length >= 4 ? `${uci.slice(0, 4)}:${color}` : ''
    if (nextKey === arrowKey.current) return
    arrowKey.current = nextKey
    onArrowChange(
      nextKey
        ? {
            from: uci!.slice(0, 2),
            to: uci!.slice(2, 4),
            color,
          }
        : null,
    )
  }, [fresh, shown, top, onArrowChange])

  useEffect(() => {
    const source = fresh && top ? top : analysis.lines[0]
    const text = source ? formatEval(source.cp, source.mate, turn) : '0.00'
    const bar = source ? evalBarPercent(source.cp, source.mate, turn) : 50
    const nextKey = `${text}|${Math.round(bar)}`
    if (nextKey === evalKey.current) return
    evalKey.current = nextKey
    onEvalChange({ text, bar })
  }, [analysis.lines, fresh, onEvalChange, top, turn])

  const wdl = useMemo(
    () => (fresh && top ? formatWdl(top.wdl, turn) : null),
    [fresh, top, turn],
  )

  return (
    <section>
      <div className="section-head">
        <h2>Best lines</h2>
        <span>
          {gameOver
            ? 'Game over'
            : !engineReady
              ? 'Starting Stockfish…'
              : analysis.searching
                ? `Depth ${analysis.depth || '…'}/${depth}${analysis.nps ? ` · ${formatNps(analysis.nps)}` : ''}`
                : analysis.nps
                  ? `Depth ${analysis.depth || depth} · ${formatNps(analysis.nps)}`
                  : 'Positive favors White'}
        </span>
      </div>
      {wdl && <p className="wdl">{wdl}</p>}
      {gameOver ? (
        <p className="empty">Game over</p>
      ) : analysis.lines.length === 0 ? (
        <p className="empty">
          {engineReady ? 'Waiting for Stockfish…' : 'The engine process is not up yet.'}
        </p>
      ) : (
        <ol className={`lines${fresh ? '' : ' stale'}`}>
          {analysis.lines.map((line) => {
            const sans = uciToSan(analysis.fen, line.pv)
            return (
              <li key={line.multipv}>
                <button
                  type="button"
                  className={line.multipv === (shown?.multipv ?? 1) ? 'hot' : ''}
                  onMouseEnter={() => setHover(line.multipv)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onPlayUci(line.pv[0] ?? '')}
                >
                  <span className={scoreClass(formatEval(line.cp, line.mate, turn))}>
                    {formatEval(line.cp, line.mate, turn)}
                  </span>
                  <span className="pv">{formatVariation(analysis.fen, sans)}</span>
                </button>
              </li>
            )
          })}
        </ol>
      )}
      <p className="hint">Click a line to play its first move. Hover to point the arrow at it.</p>
      <div className="settings">
        <label>
          Depth {depth}
          <input
            type="range"
            min={10}
            max={26}
            value={depth}
            onChange={(event) => onDepthChange(Number(event.target.value))}
          />
        </label>
        <label>
          Lines
          <select
            value={multipv}
            onChange={(event) => onMultipvChange(Number(event.target.value))}
          >
            {[1, 2, 3, 4, 5].map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}

function formatNps(nps: number): string {
  if (nps >= 1_000_000) return `${(nps / 1_000_000).toFixed(1)}M nps`
  if (nps >= 1_000) return `${Math.round(nps / 1000)}k nps`
  return `${nps} nps`
}

function scoreClass(score: string): string {
  if (score.startsWith('+')) return 'score plus'
  if (score.startsWith('-')) return 'score minus'
  return 'score'
}
