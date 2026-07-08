import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

const variantStyles = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  error: 'bg-destructive/15 text-destructive',
  info: 'bg-primary/15 text-primary',
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10.5px] font-semibold tracking-wide
        rounded-[3px] ${variantStyles[variant]}`}
    >
      {children}
    </span>
  )
}
