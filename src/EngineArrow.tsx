import { memo } from 'react'

export type EngineArrowData = {
  from: string
  to: string
  color: string
}

type EngineArrowProps = {
  arrow: EngineArrowData | null
  orientation: 'white' | 'black'
}

/** One square in the 100×100 board viewBox. */
const SQUARE = 12.5
/** Shaft width ≈ 1/4.5 of a square, close to react-chessboard's look. */
const SHAFT = SQUARE / 4.5
/** Arrowhead base width. */
const HEAD_WIDTH = SQUARE / 2.1
/** Arrowhead length along the shaft. */
const HEAD_LENGTH = SQUARE / 2.35
/** Keep the tip short of the destination piece. */
const END_SHORTEN = SQUARE / 5.5
/** Pull the start slightly away from the piece center. */
const START_OFFSET = SQUARE * 0.18

function squareCenter(square: string, orientation: 'white' | 'black') {
  const file = square.charCodeAt(0) - 97
  const rank = Number(square[1]) - 1
  const col = orientation === 'white' ? file : 7 - file
  const row = orientation === 'white' ? 7 - rank : rank
  return {
    x: ((col + 0.5) / 8) * 100,
    y: ((row + 0.5) / 8) * 100,
  }
}

function EngineArrow({ arrow, orientation }: EngineArrowProps) {
  if (!arrow) return null

  const start = squareCenter(arrow.from, orientation)
  const end = squareCenter(arrow.to, orientation)
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.hypot(dx, dy) || 1
  const ux = dx / length
  const uy = dy / length
  const px = -uy
  const py = ux

  const usable = Math.max(length - START_OFFSET - END_SHORTEN, HEAD_LENGTH + 0.5)
  const fromX = start.x + ux * START_OFFSET
  const fromY = start.y + uy * START_OFFSET
  const tipX = fromX + ux * usable
  const tipY = fromY + uy * usable
  const headBaseX = tipX - ux * HEAD_LENGTH
  const headBaseY = tipY - uy * HEAD_LENGTH
  const halfShaft = SHAFT / 2
  const halfHead = HEAD_WIDTH / 2

  const points = [
    `${fromX + px * halfShaft},${fromY + py * halfShaft}`,
    `${headBaseX + px * halfShaft},${headBaseY + py * halfShaft}`,
    `${headBaseX + px * halfHead},${headBaseY + py * halfHead}`,
    `${tipX},${tipY}`,
    `${headBaseX - px * halfHead},${headBaseY - py * halfHead}`,
    `${headBaseX - px * halfShaft},${headBaseY - py * halfShaft}`,
    `${fromX - px * halfShaft},${fromY - py * halfShaft}`,
  ].join(' ')

  return (
    <svg className="engine-arrow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polygon
        points={points}
        fill={arrow.color}
        stroke="rgba(12, 18, 14, 0.35)"
        strokeWidth="0.35"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  )
}

export default memo(EngineArrow)
