import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  isDark: boolean
  onToggle: () => void
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      className="relative w-10 h-[18px] bg-muted border border-border transition-colors shrink-0 overflow-visible"
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle theme"
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-accent
          flex items-center justify-center transition-transform duration-150
          ${isDark ? 'translate-x-[18px]' : '-translate-x-0.5'}`}
      >
        {isDark ? (
          <Moon size={11} className="text-accent-foreground" strokeWidth={2.5} />
        ) : (
          <Sun size={11} className="text-accent-foreground" strokeWidth={2.5} />
        )}
      </span>
    </button>
  )
}
