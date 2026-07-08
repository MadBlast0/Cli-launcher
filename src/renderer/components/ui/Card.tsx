import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hoverable?: boolean
  selected?: boolean
}

export function Card({ children, hoverable, selected, className = '', ...props }: CardProps) {
  return (
    <div
      className={`mac-card bg-card text-card-foreground p-4
        ${hoverable ? 'cursor-pointer' : ''}
        ${selected ? 'border-primary ring-2 ring-primary/30' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-3 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mt-3 pt-3 border-t border-border flex items-center gap-2 ${className}`} {...props}>
      {children}
    </div>
  )
}
