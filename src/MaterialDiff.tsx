import { useMemo } from 'react'
import type { Chess } from 'chess.js'
import { materialInfo } from './game'

type MaterialDiffProps = {
  position: Chess
}

export default function MaterialDiff({ position }: MaterialDiffProps) {
  const info = useMemo(() => materialInfo(position), [position])
  const equal =
    info.diff === 0 && info.whiteExtras.length === 0 && info.blackExtras.length === 0

  return (
    <span
      className="material"
      title="Material difference (White − Black)"
      aria-label={
        equal
          ? 'Material is equal'
          : `Material ${info.text} for White${
              info.whiteExtras ? `, White up ${info.whiteExtras}` : ''
            }${info.blackExtras ? `, Black up ${info.blackExtras}` : ''}`
      }
    >
      {info.blackExtras ? <span className="material-extras black">{info.blackExtras}</span> : null}
      <strong className={scoreClass(info.diff)}>{equal ? 'Even' : info.text}</strong>
      {info.whiteExtras ? <span className="material-extras white">{info.whiteExtras}</span> : null}
    </span>
  )
}

function scoreClass(diff: number): string {
  if (diff > 0) return 'score plus'
  if (diff < 0) return 'score minus'
  return 'score'
}
