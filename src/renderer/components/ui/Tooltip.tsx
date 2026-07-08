import { useState, useRef, useLayoutEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  text: string
  children: ReactNode
}

export function Tooltip({ text, children }: TooltipProps) {
  const triggerRef = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState<{ left: number; top: number; below: boolean }>({
    left: 0,
    top: 0,
    below: false,
  })

  useLayoutEffect(() => {
    if (!show || !triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    // Prefer above; flip below if too close to the top of the window.
    const below = r.top < 46
    setPos({
      left: r.left + r.width / 2,
      top: below ? r.bottom + 8 : r.top - 8,
      below,
    })
  }, [show])

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none"
            style={{
              left: pos.left,
              top: pos.top,
              transform: `translate(-50%, ${pos.below ? '0' : '-100%'})`,
            }}
          >
            <div className={`tooltip-box anim-pop ${pos.below ? 'tooltip-below' : ''}`}>{text}</div>
          </div>,
          document.body
        )}
    </>
  )
}
