import { useState, useEffect } from 'react'

interface LoaderProps {
  onDone: () => void
}

export function Loader({ onDone }: LoaderProps) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const done = setTimeout(() => setFading(true), 2000)
    const remove = setTimeout(onDone, 2500)
    return () => {
      clearTimeout(done)
      clearTimeout(remove)
    }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
      style={{ transition: 'opacity 0.5s ease', opacity: fading ? 0 : 1 }}
    >
      <div className="flex flex-col items-center gap-6">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          CLI Launcher
        </span>
        <div className="loader-track">
          <div className="loader-bar" />
        </div>
      </div>
    </div>
  )
}
