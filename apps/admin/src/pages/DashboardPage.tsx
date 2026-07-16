import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { 
  Building2, 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  Star, 
  MessageSquare,
  TrendingUp,
  Clock,
  Plus,
  Settings,
  Eye,
  FileCheck2,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'

interface StatCardProps {
  label: string
  value: number | string | undefined
  icon: React.ElementType
  loading: boolean
  trend?: { value: number; label: string }
}

function StatCard({ label, value, icon: Icon, loading, trend }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-20 bg-surface-darker rounded animate-shimmer" />
          ) : (
            <p className="mt-1 text-3xl font-bold text-ink">{value ?? 0}</p>
          )}
        </div>
        <div className="p-2.5 bg-surface-darker rounded-lg text-text-secondary">
          <Icon size={20} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span className={trend.value >= 0 ? 'text-success' : 'text-danger'}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-text-secondary">{trend.label}</span>
        </div>
      )}
    </div>
  )
}

function QuickAction({ icon: Icon, label, to, onClick, primary }: any) {
  const className = [
    'flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 group hover:shadow-md w-full',
    primary 
      ? 'bg-brand/5 border-brand/20 hover:bg-brand/10 hover:border-brand/30' 
      : 'bg-white border-border-subtle hover:border-text-secondary/30',
  ].join(' ')

  const content = (
    <>
      <div className={[
        'p-2 rounded-lg transition-colors',
        primary ? 'bg-brand text-white' : 'bg-surface-darker text-text-secondary group-hover:text-ink',
      ].join(' ')}>
        <Icon size={20} />
      </div>
      <span className={[
        'font-medium text-sm',
        primary ? 'text-brand' : 'text-ink',
      ].join(' ')}>
        {label}
      </span>
    </>
  )
  
  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()

  // KPI Queries
  const { data: kpis, isLoading: loadingKpis } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const [
        { count: totalCount },
        { count: coachingCount },
        { count: hostelCount },
        { count: publishedCount },
        { count: draftCount },
        { count: featuredCount },
        { count: verifiedCount },
        { count: reviewsCount },
        { data: avgRatingData }
      ] = await Promise.all([
        supabase.from('listings').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('type', 'coaching'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('type', 'hostel'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('is_active', false),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('plan_tier', 'paid'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('is_verified', true),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('rating').gt('rating', 0)
      ])

      const validRatings = (avgRatingData || []).map(r => r.rating)
      const avgRating = validRatings.length 
        ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1)
        : 0

      return {
        total: totalCount || 0,
        coaching: coachingCount || 0,
        hostel: hostelCount || 0,
        published: publishedCount || 0,
        draft: draftCount || 0,
        featured: featuredCount || 0,
        verified: verifiedCount || 0,
        reviews: reviewsCount || 0,
        avgRating,
      }
    },
  })

  const { data: recentActivity, isLoading: loadingRecent } = useQuery({
    queryKey: ['dashboard-recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('id, name, type, area, updated_at, listing_images(url, is_primary)')
        .order('updated_at', { ascending: false })
        .limit(5)
      
      if (error) throw error
      return data
    },
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction 
          icon={Plus} 
          label="Add Coaching" 
          to="/listings/new?type=coaching" 
          primary 
        />
        <QuickAction 
          icon={Plus} 
          label="Add Hostel" 
          to="/listings/new?type=hostel" 
          primary 
        />
        <QuickAction 
          icon={Settings} 
          label="Manage Listings" 
          to="/listings" 
        />
        <QuickAction 
          icon={MessageSquare} 
          label="Manage Reviews" 
          to="/reviews" 
        />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard label="Total Listings" value={kpis?.total} icon={FileText} loading={loadingKpis} />
        <StatCard label="Coachings" value={kpis?.coaching} icon={GraduationCap} loading={loadingKpis} />
        <StatCard label="Hostels" value={kpis?.hostel} icon={Building2} loading={loadingKpis} />
        <StatCard label="Published" value={kpis?.published} icon={Eye} loading={loadingKpis} />
        <StatCard label="Drafts" value={kpis?.draft} icon={FileText} loading={loadingKpis} />
        <StatCard label="Featured" value={kpis?.featured} icon={Star} loading={loadingKpis} />
        <StatCard label="Verified" value={kpis?.verified} icon={CheckCircle2} loading={loadingKpis} />
        <StatCard label="Total Reviews" value={kpis?.reviews} icon={MessageSquare} loading={loadingKpis} />
        <StatCard label="Avg. Rating" value={kpis?.avgRating} icon={Star} loading={loadingKpis} />
      </div>

      {/* Recent Activity */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
            <Clock size={20} className="text-text-secondary" />
            Recently Updated Listings
          </h2>
          <Link to="/listings" className="text-sm font-medium text-brand hover:text-brand/80 transition-colors">
            View all
          </Link>
        </div>
        
        <div className="divide-y divide-border-subtle">
          {loadingRecent ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-darker rounded-lg animate-shimmer shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-surface-darker rounded w-1/3 animate-shimmer" />
                  <div className="h-3 bg-surface-darker rounded w-1/4 animate-shimmer" />
                </div>
              </div>
            ))
          ) : recentActivity?.length === 0 ? (
            <EmptyState
              icon={FileCheck2}
              title="No recent activity"
              subtitle="Get started by creating a new listing or updating an existing one."
              action={
                <Link to="/listings/new" className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors">
                  Add Listing
                </Link>
              }
            />
          ) : (
            recentActivity?.map((row) => {
              const primaryImage = (row.listing_images as any[])?.find(img => img.is_primary)?.url
              
              return (
                <div key={row.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-darker/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    {primaryImage ? (
                      <img src={primaryImage} alt="" className="w-12 h-12 rounded-lg object-cover bg-surface-darker border border-border-subtle" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-surface-dark border border-border-subtle flex items-center justify-center text-text-secondary font-medium text-lg">
                        {row.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <Link to={`/listings/${row.id}/edit`} className="font-medium text-ink group-hover:text-brand transition-colors flex items-center gap-2">
                        {row.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                        <span className="capitalize bg-surface-darker px-1.5 py-0.5 rounded border border-border-subtle font-medium text-ink">
                          {row.type}
                        </span>
                        {row.area && (
                          <>
                            <span>•</span>
                            <span>{row.area}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-sm font-medium text-ink">
                      {new Date(row.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {new Date(row.updated_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
      
    </div>
  )
}
