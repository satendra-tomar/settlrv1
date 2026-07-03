import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface StatCardProps {
  label: string
  value: number | undefined
  loading: boolean
  accent?: boolean
}

function StatCard({ label, value, loading, accent = false }: StatCardProps) {
  return (
    <div
      className={[
        'bg-white rounded-xl border p-6 shadow-sm',
        accent ? 'border-amber-300' : 'border-violet-border',
      ].join(' ')}
    >
      <p className="text-sm text-muted font-medium">{label}</p>
      {loading ? (
        <div className="mt-3 h-9 w-24 bg-violet-border rounded animate-pulse" />
      ) : (
        <p className="mt-2 text-4xl font-bold text-ink">{value ?? 0}</p>
      )}
      {accent && (
        <span className="mt-2 inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
          Needs action
        </span>
      )}
    </div>
  )
}

export function DashboardPage() {
  const { data: coachingCount, isLoading: loadingCoaching } = useQuery({
    queryKey: ['dashboard-coaching-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'coaching')
        .eq('is_active', true)
      if (error) throw error
      return count ?? 0
    },
  })

  const { data: hostelCount, isLoading: loadingHostel } = useQuery({
    queryKey: ['dashboard-hostel-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'hostel')
        .eq('is_active', true)
      if (error) throw error
      return count ?? 0
    },
  })

  const { data: pendingCount, isLoading: loadingPending } = useQuery({
    queryKey: ['dashboard-pending-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', false)
        .eq('is_active', true)
      if (error) throw error
      return count ?? 0
    },
  })

  const { data: leadsCount, isLoading: loadingLeads } = useQuery({
    queryKey: ['dashboard-leads-count'],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { count, error } = await supabase
        .from('lead_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', since)
      if (error) throw error
      return count ?? 0
    },
  })

  const { data: topListings, isLoading: loadingTop } = useQuery({
    queryKey: ['dashboard-top-listings'],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { data, error } = await supabase
        .from('lead_events')
        .select('listing_id, listings(name, type)')
        .gte('created_at', since)
      if (error) throw error

      type EventRow = { listing_id: string; listings: { name: string; type: string } | null }
      const rows = (data ?? []) as unknown as EventRow[]

      const counts: Record<string, { name: string; type: string; count: number }> = {}
      for (const row of rows) {
        const lid = row.listing_id
        if (!counts[lid]) {
          counts[lid] = {
            name: row.listings?.name ?? 'Unknown',
            type: row.listings?.type ?? '',
            count: 0,
          }
        }
        counts[lid].count++
      }

      return Object.entries(counts)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    },
  })

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Active Coaching Institutes"
          value={coachingCount}
          loading={loadingCoaching}
        />
        <StatCard
          label="Active Hostels"
          value={hostelCount}
          loading={loadingHostel}
        />
        <StatCard
          label="Pending Verification"
          value={pendingCount}
          loading={loadingPending}
          accent
        />
        <StatCard
          label="Leads (Last 7 Days)"
          value={leadsCount}
          loading={loadingLeads}
        />
      </div>

      {/* Top listings */}
      <div className="bg-white rounded-xl border border-violet-border shadow-sm">
        <div className="px-6 py-4 border-b border-violet-border">
          <h2 className="font-semibold text-ink">Top Listings by Leads (Last 7 Days)</h2>
        </div>
        <div className="divide-y divide-violet-border">
          {loadingTop ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div className="h-4 bg-violet-border rounded w-48 animate-pulse" />
                <div className="h-4 bg-violet-border rounded w-16 animate-pulse" />
              </div>
            ))
          ) : topListings?.length === 0 ? (
            <p className="px-6 py-8 text-muted text-sm text-center">
              No lead data for the last 7 days.
            </p>
          ) : (
            topListings?.map((row) => (
              <div
                key={row.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{row.name}</p>
                  <p className="text-xs text-muted capitalize">{row.type}</p>
                </div>
                <span className="text-sm font-bold text-violet">{row.count} leads</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
