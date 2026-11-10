import { useState } from 'react'
import AnalysisMode from './AnalysisMode'
import LearnMode from './LearnMode'
import PlayMode from './PlayMode'
import { useEngineHealth } from './useEngineHealth'

type Mode = 'analysis' | 'play' | 'learn'

const MODES: { id: Mode; label: string; blurb: string }[] = [
  { id: 'analysis', label: 'Analysis', blurb: 'Study any position' },
  { id: 'play', label: 'Play', blurb: 'Vs Stockfish' },
  { id: 'learn', label: 'Learn', blurb: 'Openings & traps' },
]

export default function App() {
  const [mode, setMode] = useState<Mode>('analysis')
  const { engine } = useEngineHealth()

  return (
    <div className="app">
      <header className="top">
        <div>
          <p className="mark">Study</p>
          <h1>MyChessBase</h1>
        </div>
        <div className="engine-status">
          <strong>{engine ? engine.name : 'Local engine'}</strong>
          <span>
            {import.meta.env.VITE_ENGINE === 'browser'
              ? engine
                ? 'Running in this browser'
                : 'Loading Stockfish…'
              : engine
                ? `${engine.threads} threads on this computer`
                : 'Launch it with npm run dev'}
          </span>
        </div>
      </header>

      <nav className="mode-nav" aria-label="Modes">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={mode === item.id ? 'mode-tab hot' : 'mode-tab'}
            onClick={() => setMode(item.id)}
          >
            <strong>{item.label}</strong>
            <span>{item.blurb}</span>
          </button>
        ))}
      </nav>

      {mode === 'analysis' && <AnalysisMode />}
      {mode === 'play' && <PlayMode />}
      {mode === 'learn' && <LearnMode />}
    </div>
  )
}
