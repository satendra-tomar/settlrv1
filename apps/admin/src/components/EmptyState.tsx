import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  subtitle?: string
  action?: ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border-subtle rounded-xl bg-surface-darker/50">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-surface text-violet mb-4">
          <Icon size={24} />
        </div>
      )}
      <h3 className="text-lg font-semibold text-ink mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-text-secondary mb-6 max-w-sm">{subtitle}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
