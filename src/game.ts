import { Chess, type Square } from 'chess.js'

export const START_FEN = new Chess().fen()

export type Game = {
  startFen: string
  sans: string[]
  ply: number
}

export function emptyGame(): Game {
  return { startFen: START_FEN, sans: [], ply: 0 }
}

export function chessAt(game: Game): Chess {
  const chess = new Chess(game.startFen)
  const ply = Math.max(0, Math.min(game.ply, game.sans.length))
  for (let i = 0; i < ply; i++) {
    const san = game.sans[i]
    if (!san) break
    chess.move(san)
  }
  return chess
}

export function isSquare(value: string): value is Square {
  return /^[a-h][1-8]$/.test(value)
}

export function playMove(
  game: Game,
  move: string | { from: string; to: string; promotion?: string },
): Game {
  const chess = chessAt(game)
  const made = chess.move(move)
  const sans = game.sans.slice(0, game.ply)
  sans.push(made.san)
  return { startFen: game.startFen, sans, ply: sans.length }
}

export function needsPromotion(chess: Chess, from: Square, to: Square): boolean {
  const piece = chess.get(from)
  if (!piece || piece.type !== 'p') return false
  const rank = piece.color === 'w' ? '8' : '1'
  if (!to.endsWith(rank)) return false
  return chess.moves({ square: from, verbose: true }).some((move) => move.to === to && move.promotion)
}

export function outcome(chess: Chess): string | null {
  if (chess.isCheckmate()) {
    return `${chess.turn() === 'w' ? 'Black' : 'White'} wins by checkmate`
  }
  if (chess.isStalemate()) return 'Draw by stalemate'
  if (chess.isThreefoldRepetition()) return 'Draw by threefold repetition'
  if (chess.isInsufficientMaterial()) return 'Draw by insufficient material'
  if (chess.isDrawByFiftyMoves()) return 'Draw by the fifty-move rule'
  if (chess.isDraw()) return 'Draw'
  return null
}

export type NotationItem = {
  san: string
  ply: number
  prefix: string
}

export function notation(game: Game): NotationItem[] {
  const blackStarts = game.startFen.split(' ')[1] === 'b'
  let moveNo = Number(game.startFen.split(' ')[5] || '1')
  return game.sans.map((san, index) => {
    const blackMove = blackStarts ? index % 2 === 0 : index % 2 === 1
    let prefix = ''
    if (!blackMove) prefix = `${moveNo}.`
    else if (index === 0) prefix = `${moveNo}...`
    if (blackMove) moveNo += 1
    return { san, ply: index + 1, prefix }
  })
}

export function formatVariation(fen: string, sans: string[]): string {
  const fields = fen.split(' ')
  let moveNo = Number(fields[5] || '1')
  let index = 0
  const parts: string[] = []
  if (fields[1] === 'b' && sans[0]) {
    parts.push(`${moveNo}...`, sans[0])
    index = 1
    moveNo += 1
  }
  for (; index < sans.length; index += 2) {
    parts.push(`${moveNo}.`, sans[index])
    if (sans[index + 1]) parts.push(sans[index + 1])
    moveNo += 1
  }
  return parts.join(' ')
}

export function uciToSan(fen: string, uciMoves: string[]): string[] {
  const chess = new Chess(fen)
  const sans: string[] = []
  for (const uci of uciMoves) {
    if (uci.length < 4) break
    const promotion = uci[4]
    try {
      const made = chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        ...(promotion ? { promotion } : {}),
      })
      sans.push(made.san)
    } catch {
      break
    }
  }
  return sans
}

const PIECE_VALUE: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
}

const PIECE_GLYPH: Record<'w' | 'b', Record<string, string>> = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
}

export type MaterialInfo = {
  /** White material minus Black material in pawn units (kings ignored). */
  diff: number
  /** Signed White−Black text: "+3", "-2", "0". */
  text: string
  /** Extra pieces White has vs Black (glyphs). */
  whiteExtras: string
  /** Extra pieces Black has vs White (glyphs). */
  blackExtras: string
}

export function materialInfo(chess: Chess): MaterialInfo {
  const counts: Record<'w' | 'b', Record<string, number>> = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
  }

  for (const row of chess.board()) {
    for (const piece of row) {
      if (!piece) continue
      counts[piece.color][piece.type] += 1
    }
  }

  let whiteScore = 0
  let blackScore = 0
  const whiteExtras: string[] = []
  const blackExtras: string[] = []

  for (const type of ['q', 'r', 'b', 'n', 'p'] as const) {
    whiteScore += counts.w[type] * PIECE_VALUE[type]
    blackScore += counts.b[type] * PIECE_VALUE[type]
    const delta = counts.w[type] - counts.b[type]
    if (delta > 0) {
      for (let i = 0; i < delta; i++) whiteExtras.push(PIECE_GLYPH.w[type])
    } else if (delta < 0) {
      for (let i = 0; i < -delta; i++) blackExtras.push(PIECE_GLYPH.b[type])
    }
  }

  const diff = whiteScore - blackScore
  const text = diff > 0 ? `+${diff}` : `${diff}`
  return {
    diff,
    text,
    whiteExtras: whiteExtras.join(''),
    blackExtras: blackExtras.join(''),
  }
}

export function formatEval(cp: number | null, mate: number | null, turn: 'w' | 'b'): string {
  const whiteMate = mate == null ? null : turn === 'w' ? mate : -mate
  if (whiteMate != null) {
    if (whiteMate === 0) return 'M0'
    return whiteMate > 0 ? `+M${whiteMate}` : `-M${Math.abs(whiteMate)}`
  }
  const pawns = ((turn === 'w' ? cp : -(cp ?? 0)) ?? 0) / 100
  const text = Math.abs(pawns).toFixed(2)
  if (pawns > 0) return `+${text}`
  if (pawns < 0) return `-${text}`
  return '0.00'
}

export function evalBarPercent(cp: number | null, mate: number | null, turn: 'w' | 'b'): number {
  const whiteMate = mate == null ? null : turn === 'w' ? mate : -mate
  if (whiteMate != null) return whiteMate > 0 ? 100 : whiteMate < 0 ? 0 : 50
  const pawns = Math.max(-8, Math.min(8, ((turn === 'w' ? cp : -(cp ?? 0)) ?? 0) / 100))
  return 50 + (pawns / 8) * 50
}

export function formatWdl(
  wdl: [number, number, number] | null,
  turn: 'w' | 'b',
): string | null {
  if (!wdl) return null
  const [win, draw, loss] = wdl
  const white = (turn === 'w' ? win : loss) / 10
  const black = (turn === 'w' ? loss : win) / 10
  return `White ${white.toFixed(0)}% · Draw ${(draw / 10).toFixed(0)}% · Black ${black.toFixed(0)}%`
}

export function toPgn(game: Game): string {
  const chess = new Chess(game.startFen)
  if (game.startFen !== START_FEN) {
    chess.setHeader('SetUp', '1')
    chess.setHeader('FEN', game.startFen)
  }
  for (const san of game.sans) chess.move(san)
  return chess.pgn()
}

const FEN_RE =
  /^([pnbrqkPNBRQK1-8]+\/){7}[pnbrqkPNBRQK1-8]+ [wb] (-|[KQkq]+) (-|[a-h][36]) \d+ \d+$/

export function readGameText(text: string): Game {
  const trimmed = text.trim()
  if (!trimmed) throw new Error('Paste a move list, PGN, or FEN.')

  if (FEN_RE.test(trimmed)) {
    const chess = new Chess(trimmed)
    return { startFen: chess.fen(), sans: [], ply: 0 }
  }

  const fromPgn = tryPgn(trimmed)
  if (fromPgn) return fromPgn

  const tokens = trimmed
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .split(/\s+/)
    .map((token) => token.replace(/^\d+\.(?:\.\.)?/, ''))
    .filter((token) => token && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token))

  if (tokens.length === 0) throw new Error('No moves found.')

  const chess = new Chess()
  const sans: string[] = []
  for (const token of tokens) {
    try {
      sans.push(chess.move(token).san)
    } catch {
      const played = sans.length ? ` after ${sans.join(' ')}` : ''
      throw new Error(`Could not play “${token}”${played}.`)
    }
  }
  return { startFen: START_FEN, sans, ply: sans.length }
}

function tryPgn(text: string): Game | null {
  try {
    const chess = new Chess()
    chess.loadPgn(text)
    const sans = chess.history()
    const headers = chess.getHeaders()
    const setup = headers.SetUp === '1' && headers.FEN ? headers.FEN : START_FEN
    if (sans.length === 0 && setup === START_FEN) return null
    return { startFen: setup, sans, ply: sans.length }
  } catch {
    return null
  }
}
