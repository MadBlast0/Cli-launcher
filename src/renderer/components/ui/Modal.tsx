import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: string
  hideCloseButton?: boolean
  hideHeader?: boolean
}

export function Modal({ open, onClose, title, children, width = '480px', hideCloseButton, hideHeader }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/30 backdrop-blur-sm"
      style={{ animation: 'macFade 0.15s ease' }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div
        className="mac-surface text-popover-foreground overflow-hidden anim-pop flex flex-col"
        style={{ width, maxWidth: '90vw', maxHeight: '80vh', boxShadow: 'var(--shadow-lg)' }}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
            <h2 className="text-[14px] font-semibold tracking-tight">{title}</h2>
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="mac-btn mac-btn-soft p-1.5 rounded-[3px] text-secondary-foreground"
              >
                <X size={15} />
              </button>
            )}
          </div>
        )}
        <div className="overflow-y-auto flex-1 min-h-0">{children}</div>
      </div>
    </div>
  )
}
