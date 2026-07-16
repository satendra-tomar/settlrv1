import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, ExternalLink, Copy, CheckSquare, Square, ChevronDown } from 'lucide-react'
import { DataTable, type Column } from '../components/DataTable'
import { EmptyState } from '../components/EmptyState'
import { ConfirmationModal } from '../components/ConfirmationModal'
import {
  useListings,
  useDeleteListing,
  useToggleVerified,
  useBulkUpdateListings,
  type ListingRow,
} from '../hooks/useListings'
import type { Enums } from '../types/database'

function CompletionBadge({ row }: { row: ListingRow }) {
  // Simple completion calculation based on fields available in row
  const fields = [row.name, row.type, row.area, row.address, row.phone]
  const filled = fields.filter(Boolean).length
  const total = fields.length
  const percentage = Math.round((filled / total) * 100)

  let color = 'bg-danger text-white'
  if (percentage >= 100) color = 'bg-success text-white'
  else if (percentage >= 60) color = 'bg-warning text-white'

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-surface-darker rounded-full overflow-hidden">
        <div className={`h-full ${color.split(' ')[0]}`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-xs font-medium text-text-secondary w-8">{percentage}%</span>
    </div>
  )
}

export function ListingsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<Enums<'listing_type'> | ''>('')
  const [verifiedFilter, setVerifiedFilter] = useState<'' | 'true' | 'false'>('')
  const [planFilter, setPlanFilter] = useState<Enums<'plan_tier'> | ''>('')
  const [statusFilter, setStatusFilter] = useState<'' | 'published' | 'draft' | 'archived'>('')
  const [sortFilter, setSortFilter] = useState<'newest' | 'oldest' | 'rating'>('newest')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: React.ReactNode
    isDestructive: boolean
    action: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    isDestructive: false,
    action: () => {},
  })

  // Debounce search 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const filters = {
    type: typeFilter || undefined,
    is_verified: verifiedFilter === '' ? undefined : verifiedFilter === 'true',
    plan_tier: planFilter || undefined,
    status: statusFilter || undefined,
    sort: sortFilter,
    search: search || undefined,
    page,
  }

  const { data, isLoading } = useListings(filters)
  const deleteMutation = useDeleteListing()
  const bulkUpdate = useBulkUpdateListings()

  const allIds = useMemo(() => data?.listings.map(l => l.id) ?? [], [data])
  const isAllSelected = allIds.length > 0 && selectedIds.size === allIds.length
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < allIds.length

  function toggleAll() {
    if (isAllSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(allIds))
  }

  function toggleOne(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  function handleAction(id: string, name: string, action: 'delete' | 'duplicate' | 'preview') {
    if (action === 'delete') {
      setConfirmModal({
        isOpen: true,
        title: 'Delete Listing',
        message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
        isDestructive: true,
        action: () => {
          deleteMutation.mutate(id, {
            onSuccess: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
          })
        }
      })
    } else if (action === 'duplicate') {
      navigate(`/listings/new?duplicate=${id}`)
    } else if (action === 'preview') {
      const listing = data?.listings.find(l => l.id === id)
      // Example preview logic. Adjust based on mobile/web routing.
      alert(`Preview URL: /${listing?.type}/${id}`)
    }
  }

  function handleBulkAction(action: 'publish' | 'unpublish' | 'verify' | 'unverify' | 'delete') {
    const count = selectedIds.size
    const isDelete = action === 'delete'
    
    setConfirmModal({
      isOpen: true,
      title: `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `Are you sure you want to ${action} ${count} selected listing${count > 1 ? 's' : ''}?${isDelete ? ' This cannot be undone.' : ''}`,
      isDestructive: isDelete,
      action: () => {
        bulkUpdate.mutate({ ids: Array.from(selectedIds), action }, {
          onSuccess: () => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }))
            setSelectedIds(new Set())
          }
        })
      }
    })
  }

  const columns: Column<ListingRow>[] = [
    {
      key: 'checkbox',
      header: (
        <button onClick={toggleAll} className="text-text-secondary hover:text-ink transition-colors">
          {isAllSelected ? <CheckSquare size={18} className="text-brand" /> : <Square size={18} />}
        </button>
      ) as any,
      className: 'w-12',
      render: (row) => (
        <button onClick={() => toggleOne(row.id)} className="text-text-secondary hover:text-ink transition-colors block mt-1">
          {selectedIds.has(row.id) ? <CheckSquare size={18} className="text-brand" /> : <Square size={18} />}
        </button>
      ),
    },
    {
      key: 'name',
      header: 'Listing',
      render: (row) => {
        const img = row.listing_images?.find(i => i.is_primary)?.url
        return (
          <div className="flex items-center gap-3">
            {img ? (
              <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover border border-border-subtle" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-surface-dark border border-border-subtle flex items-center justify-center text-text-secondary font-medium">
                {row.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <span className="font-medium text-ink block">{row.name}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs capitalize px-1.5 py-0.5 bg-surface-dark border border-border-subtle rounded text-text-secondary font-medium">
                  {row.type}
                </span>
                <span className="text-xs text-text-secondary">{row.area || 'No area'}</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={[
          'px-2 py-1 rounded-full text-xs font-medium flex inline-flex items-center gap-1.5',
          row.is_active ? 'bg-success/10 text-success' : 'bg-surface-dark border border-border-subtle text-text-secondary'
        ].join(' ')}>
          <span className={`w-1.5 h-1.5 rounded-full ${row.is_active ? 'bg-success' : 'bg-text-secondary'}`} />
          {row.is_active ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'featured',
      header: 'Plan',
      render: (row) => (
        <span className={[
          'px-2 py-1 rounded-full text-xs font-medium capitalize',
          row.plan_tier === 'paid' ? 'bg-amber-100 text-amber-700' : 'bg-surface-dark border border-border-subtle text-text-secondary',
        ].join(' ')}>
          {row.plan_tier === 'paid' ? 'Featured' : 'Free'}
        </span>
      ),
    },
    {
      key: 'completion',
      header: 'Completion',
      render: (row) => <CompletionBadge row={row} />,
    },
    {
      key: 'metrics',
      header: 'Metrics',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm font-medium text-ink">
            <span className="text-star">★</span> {row.rating > 0 ? row.rating.toFixed(1) : '—'}
          </div>
          <div className="text-xs text-text-secondary">{row.review_count} reviews</div>
        </div>
      ),
    },
    {
      key: 'updated',
      header: 'Last Updated',
      render: (row) => (
        <div className="space-y-1">
          <div className="text-sm text-ink">{new Date(row.updated_at || row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div className="text-xs text-text-secondary">{new Date(row.updated_at || row.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => handleAction(row.id, row.name, 'preview')} className="p-1.5 rounded-lg text-text-secondary hover:text-ink hover:bg-surface-dark transition-colors" title="Preview">
            <ExternalLink size={16} />
          </button>
          <button onClick={() => navigate(`/listings/${row.id}/edit`)} className="p-1.5 rounded-lg text-text-secondary hover:text-brand hover:bg-brand/10 transition-colors" title="Edit">
            <Edit2 size={16} />
          </button>
          <button onClick={() => handleAction(row.id, row.name, 'duplicate')} className="p-1.5 rounded-lg text-text-secondary hover:text-ink hover:bg-surface-dark transition-colors" title="Duplicate">
            <Copy size={16} />
          </button>
          <button onClick={() => handleAction(row.id, row.name, 'delete')} className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
        isPending={deleteMutation.isPending || bulkUpdate.isPending}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Filter bar */}
      <div className="card p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search listings, areas..."
              className="w-full pl-3 pr-4 py-2 border border-border-subtle rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white placeholder-text-secondary"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value as any); setPage(1) }}
              className="px-3 py-2 border border-border-subtle rounded-lg text-sm focus:outline-none focus:border-brand bg-white"
            >
              <option value="">All Types</option>
              <option value="coaching">Coaching</option>
              <option value="hostel">Hostel</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1) }}
              className="px-3 py-2 border border-border-subtle rounded-lg text-sm focus:outline-none focus:border-brand bg-white"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value as any); setPage(1) }}
              className="px-3 py-2 border border-border-subtle rounded-lg text-sm focus:outline-none focus:border-brand bg-white"
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="paid">Featured</option>
            </select>
            
            <select
              value={sortFilter}
              onChange={(e) => { setSortFilter(e.target.value as any); setPage(1) }}
              className="px-3 py-2 border border-border-subtle rounded-lg text-sm focus:outline-none focus:border-brand bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/listings/new')} className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors shadow-sm">
            <Plus size={16} />
            Add Listing
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-surface-darker border border-brand/30 rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <span className="text-sm font-medium text-brand px-2">
            {selectedIds.size} listing{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => handleBulkAction('publish')} className="px-3 py-1.5 bg-white border border-border-subtle rounded-lg text-sm font-medium text-ink hover:bg-surface-dark transition-colors shadow-sm">Publish</button>
            <button onClick={() => handleBulkAction('unpublish')} className="px-3 py-1.5 bg-white border border-border-subtle rounded-lg text-sm font-medium text-ink hover:bg-surface-dark transition-colors shadow-sm">Unpublish</button>
            <button onClick={() => handleBulkAction('verify')} className="px-3 py-1.5 bg-white border border-border-subtle rounded-lg text-sm font-medium text-ink hover:bg-surface-dark transition-colors shadow-sm">Verify</button>
            <button onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger/90 transition-colors shadow-sm flex items-center gap-1.5">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {data?.listings.length === 0 && !isLoading ? (
        <EmptyState
          title="No listings found"
          subtitle="Try adjusting your search or filters, or add a new listing."
          action={
            <button onClick={() => navigate('/listings/new')} className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors">
              Add Listing
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <DataTable
            columns={columns}
            data={data?.listings ?? []}
            loading={isLoading}
            rowKey={(r) => r.id}
          />
        </div>
      )}

      {/* Pagination */}
      {(data?.totalPages ?? 0) > 1 && (
        <div className="flex items-center justify-between text-sm text-text-secondary px-2">
          <span>
            Showing page {page} of {data?.totalPages} ({data?.total} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-border-subtle rounded-lg disabled:opacity-40 hover:bg-surface-dark transition-colors font-medium shadow-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data?.totalPages ?? p, p + 1))}
              disabled={page === data?.totalPages}
              className="px-4 py-2 bg-white border border-border-subtle rounded-lg disabled:opacity-40 hover:bg-surface-dark transition-colors font-medium shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
