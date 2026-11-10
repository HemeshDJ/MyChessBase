import { memo } from 'react'
import AnalysisBoard, { type MovableColor } from './AnalysisBoard'
import EngineArrow, { type EngineArrowData } from './EngineArrow'
import type { Game } from './game'

const PROMO_GLYPHS = {
  w: { q: '♕', r: '♖', b: '♗', n: '♘' },
  b: { q: '♛', r: '♜', b: '♝', n: '♞' },
} as const

type BoardFrameProps = {
  id?: string
  game: Game
  fen: string
  turn: 'w' | 'b'
  orientation: 'white' | 'black'
  selected: string | null
  arrow?: EngineArrowData | null
  promo: { from: string; to: string } | null
  movableColor?: MovableColor
  onSelect: (square: string | null) => void
  onPlay: (from: string, to: string, promotion?: string) => void
  onAskPromotion: (from: string, to: string) => void
  onCancelPromo: () => void
}

function BoardFrame({
  id,
  game,
  fen,
  turn,
  orientation,
  selected,
  arrow = null,
  promo,
  movableColor = 'both',
  onSelect,
  onPlay,
  onAskPromotion,
  onCancelPromo,
}: BoardFrameProps) {
  return (
    <div className="board-frame">
      <AnalysisBoard
        id={id}
        game={game}
        fen={fen}
        turn={turn}
        orientation={orientation}
        selected={selected}
        movableColor={movableColor}
        onSelect={onSelect}
        onPlay={onPlay}
        onAskPromotion={onAskPromotion}
      />
      <EngineArrow arrow={arrow} orientation={orientation} />
      {promo && (
        <div className="promo">
          {(['q', 'r', 'b', 'n'] as const).map((piece) => (
            <button key={piece} type="button" onClick={() => onPlay(promo.from, promo.to, piece)}>
              {PROMO_GLYPHS[turn][piece]}
            </button>
          ))}
          <button type="button" className="texty" onClick={onCancelPromo}>
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default memo(BoardFrame)
