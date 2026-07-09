import type { ReactNode } from 'react'
import { X, Minus, ChevronDown } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'
import appLogo from '../../assets/app-logo.png'

interface LauncherWindowProps {
  children: ReactNode
  isDark: boolean
  onToggleTheme: () => void
}

export function LauncherWindow({ children, isDark, onToggleTheme }: LauncherWindowProps) {
  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden border border-border">
      {/* Title bar — flush with the app background, no divider */}
      <div
        className="flex items-center justify-between px-3.5 h-11 shrink-0 bg-background"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div
          className="flex items-center gap-2.5"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <img
            src={appLogo}
            alt="CLI Launcher"
            className="w-6 h-6 object-contain shrink-0"
            draggable={false}
          />
          <span className="text-[13px] font-bold tracking-tight text-foreground">
            CLI Launcher
          </span>
        </div>

        <div
          className="flex items-center gap-2"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={() => window.electronAPI.minimizeToTray()}
            className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Minimize to tray"
            title="Minimize to tray"
          >
            <ChevronDown size={15} />
          </button>
          <button
            onClick={() => window.electronAPI.minimizeWindow()}
            className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Minimize"
          >
            <Minus size={15} />
          </button>
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          <button
            onClick={() => window.electronAPI.closeWindow()}
            className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  )
}
