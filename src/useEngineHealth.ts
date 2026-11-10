import { useEffect, useState } from 'react'
import { fetchHealth } from './engine/client'

export function useEngineHealth() {
  const [engine, setEngine] = useState<{ name: string; threads: number } | null>(null)
  const [engineDown, setEngineDown] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function ping() {
      try {
        const health = await fetchHealth()
        if (cancelled) return
        setEngine((current) =>
          current && current.name === health.name && current.threads === health.threads
            ? current
            : health,
        )
        setEngineDown(false)
      } catch {
        if (cancelled) return
        setEngine(null)
        setEngineDown(true)
      }
    }
    void ping()
    const timer = window.setInterval(() => void ping(), 3000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  return { engine, engineDown, engineReady: Boolean(engine) }
}
