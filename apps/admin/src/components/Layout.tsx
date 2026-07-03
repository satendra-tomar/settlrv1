import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  List,
  MessageSquare,
  TrendingUp,
  MapPin,
  Tag,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/listings', icon: List, label: 'Listings' },
  { to: '/reviews', icon: MessageSquare, label: 'Reviews' },
  { to: '/leads', icon: TrendingUp, label: 'Leads' },
  { to: '/cities', icon: MapPin, label: 'Cities' },
  { to: '/amenities', icon: Tag, label: 'Amenities' },
]

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/listings': 'Listings',
  '/listings/new': 'Add Listing',
  '/reviews': 'Reviews',
  '/leads': 'Leads',
  '/cities': 'Cities',
  '/amenities': 'Amenities',
}

export function Layout() {
  const { signOut } = useAuth()
  const location = useLocation()

  const pageTitle =
    PAGE_TITLES[location.pathname] ??
    (location.pathname.endsWith('/edit') ? 'Edit Listing' : 'Admin')

  return (
    <div className="flex h-screen overflow-hidden bg-violet-surface">
      {/* Sidebar */}
      <aside className="w-60 flex flex-col bg-white border-r border-violet-border shadow-sm">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-violet-border">
          <span className="text-xl font-bold text-violet">Settlr Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-violet text-white'
                    : 'text-ink hover:bg-violet-surface hover:text-violet',
                ].join(' ')
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-violet-border">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted hover:text-ink hover:bg-violet-surface transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-violet-border px-8 py-4">
          <h1 className="text-lg font-semibold text-ink">{pageTitle}</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
