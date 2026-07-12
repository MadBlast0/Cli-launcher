import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

interface ModeDropdownProps {
  yoloMode: boolean
  onYoloModeChange: (value: boolean) => void
  supportedClis: string[]
}

export function ModeDropdown({ yoloMode, onYoloModeChange, supportedClis }: ModeDropdownProps) {
  const [open, setOpen] = useState(false)
  const [infoHover, setInfoHover] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLSpanElement>(null)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  useLayoutEffect(() => {
    if (!infoHover || !infoRef.current) return
    const r = infoRef.current.getBoundingClientRect()
    setTooltipPos({
      top: r.bottom + 6,
      left: r.left + r.width / 2,
    })
  }, [infoHover])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        className={`mac-btn mac-btn-soft px-2 py-1.5 text-[11px] font-semibold rounded-[3px] flex items-center gap-1 ${
          yoloMode ? 'text-warning' : ''
        }`}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={yoloMode ? 'YOLO mode' : 'Normal mode'}
      >
        {yoloMode ? 'YOLO' : 'Normal'}
        <ChevronDown size={11} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-[4px] shadow-lg z-50 min-w-[140px] py-1"
          role="listbox"
          aria-label="Permission mode"
        >
          <button
            className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium hover:bg-accent-soft transition-colors ${
              !yoloMode ? 'bg-accent-soft' : ''
            }`}
            onClick={() => { onYoloModeChange(false); setOpen(false) }}
            role="option"
            aria-selected={!yoloMode}
          >
            <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
              !yoloMode ? 'border-foreground' : 'border-muted-foreground'
            }`}>
              {!yoloMode && <span className="w-1.5 h-1.5 rounded-full bg-foreground" />}
            </span>
            Normal
          </button>

          <div className="relative">
            <button
              className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium hover:bg-accent-soft transition-colors ${
                yoloMode ? 'bg-accent-soft' : ''
              }`}
              onClick={() => { onYoloModeChange(true); setOpen(false) }}
              role="option"
              aria-selected={yoloMode}
            >
              <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                yoloMode ? 'border-warning' : 'border-muted-foreground'
              }`}>
                {yoloMode && <span className="w-1.5 h-1.5 rounded-full bg-warning" />}
              </span>
              <span className={yoloMode ? 'text-warning' : ''}>YOLO</span>
              <span
                ref={infoRef}
                className="ml-auto text-muted-foreground/40 hover:text-muted-foreground cursor-help text-[11px]"
                onMouseEnter={() => setInfoHover(true)}
                onMouseLeave={() => setInfoHover(false)}
                aria-label="Learn more about YOLO mode"
              >
                ⓘ
              </span>
            </button>

            {infoHover && createPortal(
              <div
                className="fixed z-[9999] pointer-events-none"
                style={{
                  left: tooltipPos.left,
                  top: tooltipPos.top,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="tooltip-box anim-pop text-[11px] leading-relaxed whitespace-nowrap">
                  <div className="font-semibold mb-1">⚠ YOLO Mode</div>
                  <div className="mb-1">
                    Launches supported CLIs with their respective<br />
                    auto-approve flags to skip permission prompts.
                  </div>
                  {supportedClis.length > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-white/20">
                      <div className="font-medium mb-0.5">Affects installed CLIs:</div>
                      {supportedClis.map((name) => (
                        <div key={name} className="pl-1">• {name}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>,
              document.body
            )}
          </div>
        </div>
      )}
    </div>
  )
}
