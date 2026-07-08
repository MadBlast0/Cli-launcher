import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  isDark: boolean
  onToggle: () => void
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      className="relative w-12 h-6 rounded-[3px] bg-muted border border-border transition-colors shrink-0"
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle theme"
    >
      <span
        className={`absolute top-[2px] left-[2px] w-[22px] h-[18px] rounded-[2px] bg-primary
          flex items-center justify-center transition-transform duration-150
          ${isDark ? 'translate-x-[24px]' : 'translate-x-0'}`}
      >
        {isDark ? (
          <Moon size={11} className="text-primary-foreground" strokeWidth={2.5} />
        ) : (
          <Sun size={11} className="text-primary-foreground" strokeWidth={2.5} />
        )}
      </span>
    </button>
  )
}
