import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  options: DropdownOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
}

export function Dropdown({ options, value, onChange, placeholder = 'Select...' }: DropdownProps) {
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

  const selected = options.find((o) => o.value === value)
  const display = selected?.label || placeholder

  return (
    <div ref={ref} className="relative">
      <button
        className="mac-input mac-btn text-foreground w-full flex items-center justify-between gap-2 px-3 py-2 text-[13px] font-medium"
        onClick={() => setOpen(!open)}
      >
        <span>{display}</span>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1.5 left-0 right-0 mac-surface bg-popover text-popover-foreground max-h-48 overflow-y-auto p-1 anim-pop">
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`w-full text-left px-3 py-2 text-[13px] font-medium rounded-[3px]
                hover:bg-accent-soft transition-colors
                ${value === opt.value ? 'bg-accent-soft text-primary' : ''}`}
              onClick={() => {
                onChange?.(opt.value)
                setOpen(false)
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
