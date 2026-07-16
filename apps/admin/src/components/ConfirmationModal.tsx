import { ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  isPending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-white rounded-xl shadow-xl border border-border-subtle overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h3 className="text-lg font-semibold text-ink flex items-center gap-2">
            {isDestructive && <AlertTriangle size={20} className="text-danger" />}
            {title}
          </h3>
          <button
            onClick={onCancel}
            disabled={isPending}
            className="p-1.5 rounded-lg text-text-secondary hover:text-ink hover:bg-surface-darker transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="px-6 py-6">
          <p className="text-ink text-sm leading-relaxed">{message}</p>
        </div>
        
        <div className="px-6 py-4 bg-surface-dark flex items-center justify-end gap-3 border-t border-border-subtle">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium text-ink bg-white border border-border-subtle hover:bg-surface-darker transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={[
              'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-70 flex items-center gap-2',
              isDestructive 
                ? 'bg-danger hover:bg-danger/90' 
                : 'bg-brand hover:bg-brand/90',
            ].join(' ')}
          >
            {isPending && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
