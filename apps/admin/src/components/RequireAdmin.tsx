import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface RequireAdminProps {
  children: React.ReactNode
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const { role, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin" />
          <p className="text-muted text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
