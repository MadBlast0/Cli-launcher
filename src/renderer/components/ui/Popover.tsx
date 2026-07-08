import { useState, useRef, useEffect, type ReactNode } from 'react'

interface PopoverProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'bottom' | 'top'
}

export function Popover({ trigger, children, align = 'start', side = 'bottom' }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  }

  const sideClasses = {
    bottom: 'top-full mt-2',
    top: 'bottom-full mb-2',
  }

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          className={`absolute z-50 min-w-[160px] mac-surface bg-popover text-popover-foreground p-1.5 anim-pop
            ${alignClasses[align]} ${sideClasses[side]}`}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export function PopoverItem({
  children,
  onClick,
  danger,
}: {
  children: ReactNode
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button
      className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded-[3px]
        hover:bg-accent-soft transition-colors
        ${danger ? 'text-destructive' : 'text-popover-foreground'}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
