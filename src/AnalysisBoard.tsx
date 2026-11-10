import { memo, useCallback, useMemo, type CSSProperties } from 'react'
import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard'
import {
  chessAt,
  isSquare,
  needsPromotion,
  type Game,
} from './game'

export type MovableColor = 'w' | 'b' | 'both' | 'none'

type AnalysisBoardProps = {
  id?: string
  game: Game
  fen: string
  turn: 'w' | 'b'
  orientation: 'white' | 'black'
  selected: string | null
  movableColor?: MovableColor
  onSelect: (square: string | null) => void
  onPlay: (from: string, to: string, promotion?: string) => void
  onAskPromotion: (from: string, to: string) => void
}

function AnalysisBoard({
  id = 'analysis',
  game,
  fen,
  turn,
  orientation,
  selected,
  movableColor = 'both',
  onSelect,
  onPlay,
  onAskPromotion,
}: AnalysisBoardProps) {
  const canMoveNow =
    movableColor === 'both' || (movableColor !== 'none' && movableColor === turn)

  const lastMove = useMemo(() => {
    const history = chessAt(game).history({ verbose: true })
    const last = history[history.length - 1]
    return last ? { from: last.from, to: last.to } : null
  }, [game])

  const legalTargets = useMemo(() => {
    if (!canMoveNow || !selected || !isSquare(selected)) return [] as string[]
    return chessAt(game)
      .moves({ square: selected, verbose: true })
      .map((move) => move.to)
  }, [canMoveNow, game, selected])

  const squareStyles = useMemo(() => {
    const styles: Record<string, CSSProperties> = {}
    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: 'rgba(214, 176, 92, 0.55)' }
      styles[lastMove.to] = { backgroundColor: 'rgba(214, 176, 92, 0.75)' }
    }
    if (selected) {
      styles[selected] = { backgroundColor: 'rgba(214, 176, 92, 0.95)' }
      for (const to of legalTargets) {
        styles[to] = {
          background: 'radial-gradient(circle, rgba(28, 36, 24, 0.38) 18%, transparent 20%)',
        }
      }
    }
    return styles
  }, [lastMove, legalTargets, selected])

  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
      if (!canMoveNow) return false
      if (!targetSquare || !isSquare(sourceSquare) || !isSquare(targetSquare)) return false
      const chess = chessAt(game)
      const legal = chess
        .moves({ square: sourceSquare, verbose: true })
        .some((move) => move.to === targetSquare)
      if (!legal) return false
      if (needsPromotion(chess, sourceSquare, targetSquare)) {
        onAskPromotion(sourceSquare, targetSquare)
        onSelect(null)
        return false
      }
      onPlay(sourceSquare, targetSquare)
      return true
    },
    [canMoveNow, game, onAskPromotion, onPlay, onSelect],
  )

  const onSquareClick = useCallback(
    ({ square }: { square: string }) => {
      if (!canMoveNow || !isSquare(square)) {
        onSelect(null)
        return
      }
      const chess = chessAt(game)
      if (selected && isSquare(selected)) {
        const legal = chess
          .moves({ square: selected, verbose: true })
          .some((move) => move.to === square)
        if (legal) {
          if (needsPromotion(chess, selected, square)) onAskPromotion(selected, square)
          else onPlay(selected, square)
          onSelect(null)
          return
        }
      }
      const piece = chess.get(square)
      onSelect(piece && piece.color === chess.turn() ? square : null)
    },
    [canMoveNow, game, onAskPromotion, onPlay, onSelect, selected],
  )

  const canDragPiece = useCallback(
    ({ piece }: { piece: { pieceType: string } }) => {
      if (!canMoveNow) return false
      return piece.pieceType.startsWith(turn)
    },
    [canMoveNow, turn],
  )

  const options = useMemo(
    () => ({
      id,
      position: fen,
      boardOrientation: orientation,
      squareStyles,
      allowDragging: canMoveNow,
      allowDrawingArrows: false,
      clearArrowsOnClick: false,
      clearArrowsOnPositionChange: false,
      showAnimations: true,
      animationDurationInMs: 160,
      darkSquareStyle: DARK_SQUARE,
      lightSquareStyle: LIGHT_SQUARE,
      boardStyle: BOARD_STYLE,
      canDragPiece,
      onPieceDrop,
      onSquareClick,
    }),
    [
      canDragPiece,
      canMoveNow,
      fen,
      id,
      onPieceDrop,
      onSquareClick,
      orientation,
      squareStyles,
    ],
  )

  return <Chessboard options={options} />
}

const DARK_SQUARE = { backgroundColor: '#b58863' }
const LIGHT_SQUARE = { backgroundColor: '#f0d9b5' }
const BOARD_STYLE = { borderRadius: '4px' }

export default memo(AnalysisBoard)
