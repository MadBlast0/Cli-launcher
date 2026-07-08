import type { ReactNode } from 'react'

interface PanelProps {
  title?: string
  children: ReactNode
  actions?: ReactNode
  className?: string
}

export function Panel({ title, children, actions, className = '' }: PanelProps) {
  return (
    <div className={`mac-surface text-card-foreground overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          {title && (
            <h3 className="text-[12px] font-semibold tracking-wide text-card-foreground">
              {title}
            </h3>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  )
}
