import { useEffect, type ReactNode } from 'react'
import { X, Check, AlertTriangle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

const icons: Record<ToastType, ReactNode> = {
  success: <Check size={14} />,
  error: <AlertTriangle size={14} />,
  info: <Info size={14} />,
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      className={`mac-surface flex items-center gap-2.5 px-3.5 py-2.5 anim-pop pointer-events-auto ${toast.type === 'error' ? 'border-destructive/40' : ''}`}
      style={{ minWidth: 280, maxWidth: 420 }}
    >
      <span
        className={`shrink-0 ${
          toast.type === 'success'
            ? 'text-success'
            : toast.type === 'error'
              ? 'text-destructive'
              : 'text-muted-foreground'
        }`}
      >
        {icons[toast.type]}
      </span>
      <span className="text-[12px] font-medium text-foreground flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-muted-foreground hover:text-foreground p-0.5 transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  )
}
