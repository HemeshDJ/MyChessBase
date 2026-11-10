import { useEffect, useMemo, useState } from 'react'
import BoardFrame from './BoardFrame'
import MaterialDiff from './MaterialDiff'
import {
  chessAt,
  emptyGame,
  formatVariation,
  notation,
  type Game,
} from './game'
import {
  OPENING_FAMILIES,
  OPENINGS,
  type OpeningMistake,
  type OpeningVariation,
} from './openings'

type LessonTab = 'line' | 'mistakes'

function gameFromSans(sans: string[], ply = sans.length): Game {
  return { startFen: emptyGame().startFen, sans, ply }
}

function buildMistakeLine(mistake: OpeningMistake): string[] {
  return [...mistake.before, mistake.mistake, ...mistake.punish]
}

export default function LearnMode() {
  const [family, setFamily] = useState<string>('All')
  const [openingId, setOpeningId] = useState(OPENINGS[0]?.id ?? '')
  const [tab, setTab] = useState<LessonTab>('line')
  const [variationId, setVariationId] = useState<string>('')
  const [mistakeId, setMistakeId] = useState<string>('')
  const [ply, setPly] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [promo, setPromo] = useState<{ from: string; to: string } | null>(null)

  const opening = useMemo(
    () => OPENINGS.find((item) => item.id === openingId) ?? OPENINGS[0],
    [openingId],
  )

  const filtered = useMemo(
    () => (family === 'All' ? OPENINGS : OPENINGS.filter((item) => item.family === family)),
    [family],
  )

  const variation: OpeningVariation | null = useMemo(() => {
    if (!opening) return null
    if (variationId === opening.mainLine.id || !variationId) return opening.mainLine
    return opening.variations.find((item) => item.id === variationId) ?? opening.mainLine
  }, [opening, variationId])

  const mistake: OpeningMistake | null = useMemo(() => {
    if (!opening) return null
    return opening.mistakes.find((item) => item.id === mistakeId) ?? opening.mistakes[0] ?? null
  }, [opening, mistakeId])

  const activeSans = useMemo(() => {
    if (tab === 'mistakes' && mistake) return buildMistakeLine(mistake)
    return variation?.sans ?? []
  }, [tab, mistake, variation])

  // Clamp during render so a stale ply after switching lines can't crash chessAt.
  const safePly = Math.max(0, Math.min(ply, activeSans.length))
  const game = useMemo(() => gameFromSans(activeSans, safePly), [activeSans, safePly])
  const position = useMemo(() => chessAt(game), [game])
  const fen = position.fen()
  const turn = position.turn()
  const moves = useMemo(
    () => notation(gameFromSans(activeSans, activeSans.length)),
    [activeSans],
  )
  const orientation = opening?.forSide === 'black' ? 'black' : 'white'
  const mistakePly = mistake ? mistake.before.length + 1 : -1

  function selectOpening(id: string) {
    const next = OPENINGS.find((item) => item.id === id)
    if (!next) return
    setOpeningId(id)
    setVariationId(next.mainLine.id)
    setMistakeId(next.mistakes[0]?.id ?? '')
    setTab('line')
    setPly(0)
    setSelected(null)
    setPromo(null)
  }

  function selectVariation(id: string) {
    setVariationId(id)
    setPly(0)
    setSelected(null)
    setPromo(null)
  }

  function selectMistake(id: string) {
    setMistakeId(id)
    setPly(0)
    setSelected(null)
    setPromo(null)
  }

  function selectTab(next: LessonTab) {
    setTab(next)
    setPly(0)
    setSelected(null)
    setPromo(null)
  }

  useEffect(() => {
    if (ply !== safePly) setPly(safePly)
  }, [ply, safePly])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setPly((current) => Math.max(0, current - 1))
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        setPly((current) => Math.min(activeSans.length, current + 1))
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setPly(0)
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        setPly(activeSans.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeSans.length])

  const highlight =
    tab === 'mistakes' && mistake && safePly >= mistakePly
      ? {
          kind: safePly === mistakePly ? 'mistake' : 'punish',
          text:
            safePly === mistakePly ? `Mistake: ${mistake.mistake}` : 'Punishment line',
        }
      : null

  if (!opening || !variation) {
    return (
      <main className="mode-panel">
        <p>No openings loaded.</p>
      </main>
    )
  }

  return (
    <main className="workspace learn">
      <section className="board-column">
        <div className="turn-row">
          <span className="turn-meta">
            {opening.name}
            <strong> · {opening.eco}</strong>
            <MaterialDiff position={position} />
          </span>
          <span className={highlight?.kind === 'mistake' ? 'warn' : ''}>
            {highlight?.text ?? (turn === 'w' ? 'White to move' : 'Black to move')}
          </span>
        </div>
        <div className="board-row single">
          <BoardFrame
            id="learn-board"
            game={game}
            fen={fen}
            turn={turn}
            orientation={orientation}
            selected={selected}
            promo={promo}
            movableColor="none"
            onSelect={setSelected}
            onPlay={() => undefined}
            onAskPromotion={(from, to) => setPromo({ from, to })}
            onCancelPromo={() => setPromo(null)}
          />
        </div>
        <div className="toolbar">
          <button type="button" onClick={() => setPly(0)}>
            Start
          </button>
          <button type="button" onClick={() => setPly((current) => Math.max(0, current - 1))}>
            Back
          </button>
          <button
            type="button"
            onClick={() => setPly((current) => Math.min(activeSans.length, current + 1))}
          >
            Forward
          </button>
          <button type="button" onClick={() => setPly(activeSans.length)}>
            End
          </button>
          {tab === 'mistakes' && mistake && (
            <button type="button" onClick={() => setPly(mistakePly)}>
              Jump to mistake
            </button>
          )}
        </div>
        <p className="hint">Arrow keys step the lesson. The board follows the selected line.</p>
        <div className="moves">
          <button
            type="button"
            className={safePly === 0 ? 'current' : ''}
            onClick={() => setPly(0)}
          >
            Start
          </button>
          {moves.map((item) => {
            const isMistakeMove = tab === 'mistakes' && item.ply === mistakePly
            const isPunish = tab === 'mistakes' && mistake && item.ply > mistakePly
            return (
              <button
                key={item.ply}
                type="button"
                className={[
                  item.ply === safePly ? 'current' : '',
                  item.ply > safePly ? 'future' : '',
                  isMistakeMove ? 'mistake-move' : '',
                  isPunish ? 'punish-move' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setPly(item.ply)}
              >
                {item.prefix && <span>{item.prefix}</span>} {item.san}
              </button>
            )
          })}
        </div>
      </section>

      <aside className="study">
        <section>
          <div className="section-head">
            <h2>Catalog</h2>
            <select value={family} onChange={(event) => setFamily(event.target.value)}>
              <option value="All">All families</option>
              {OPENING_FAMILIES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="catalog">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === opening.id ? 'catalog-item hot' : 'catalog-item'}
                onClick={() => selectOpening(item.id)}
              >
                <strong>{item.name}</strong>
                <span>
                  {item.eco} · {item.forSide === 'both' ? 'both sides' : item.forSide}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="lede">{opening.summary}</p>
          <ul className="plan-list">
            {opening.plans.map((plan) => (
              <li key={plan}>{plan}</li>
            ))}
          </ul>
        </section>

        <section>
          <div className="choice-row">
            <button
              type="button"
              className={tab === 'line' ? 'choice hot' : 'choice'}
              onClick={() => selectTab('line')}
            >
              Variations
            </button>
            <button
              type="button"
              className={tab === 'mistakes' ? 'choice hot' : 'choice'}
              onClick={() => selectTab('mistakes')}
            >
              Punish mistakes
            </button>
          </div>

          {tab === 'line' ? (
            <div className="lesson-stack">
              <button
                type="button"
                className={variation.id === opening.mainLine.id ? 'lesson-card hot' : 'lesson-card'}
                onClick={() => selectVariation(opening.mainLine.id)}
              >
                <strong>{opening.mainLine.name}</strong>
                <span>{opening.mainLine.note}</span>
                <em>{formatVariation(emptyGame().startFen, opening.mainLine.sans)}</em>
              </button>
              {opening.variations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={variation.id === item.id ? 'lesson-card hot' : 'lesson-card'}
                  onClick={() => selectVariation(item.id)}
                >
                  <strong>{item.name}</strong>
                  <span>{item.note}</span>
                  <em>{formatVariation(emptyGame().startFen, item.sans)}</em>
                </button>
              ))}
            </div>
          ) : (
            <div className="lesson-stack">
              {opening.mistakes.length === 0 ? (
                <p className="empty">No common mistakes catalogued for this opening yet.</p>
              ) : (
                opening.mistakes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={mistake?.id === item.id ? 'lesson-card hot' : 'lesson-card'}
                    onClick={() => selectMistake(item.id)}
                  >
                    <strong>{item.title}</strong>
                    <span className="mistake-label">Opponent plays {item.mistake}</span>
                    <span>{item.why}</span>
                    <em>Punish with: {item.punish.join(' ')}</em>
                    <span className="idea">{item.idea}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </section>
      </aside>
    </main>
  )
}
