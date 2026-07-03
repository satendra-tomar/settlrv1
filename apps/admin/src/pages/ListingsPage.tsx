import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { DataTable, type Column } from '../components/DataTable'
import {
  useListings,
  useDeleteListing,
  useToggleVerified,
  type ListingRow,
} from '../hooks/useListings'
import type { Enums } from '../types/database'

const BADGE_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-600',
  paid: 'bg-violet-surface text-violet',
}

function VerifiedToggle({ row }: { row: ListingRow }) {
  const { mutate, isPending } = useToggleVerified(row.id, row.is_verified)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={row.is_verified}
      onClick={() => mutate()}
      disabled={isPending}
      className={[
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-60',
        row.is_verified ? 'bg-verified' : 'bg-gray-200',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
          row.is_verified ? 'translate-x-4' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  )
}

export function ListingsPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<Enums<'listing_type'> | ''>('')
  const [verifiedFilter, setVerifiedFilter] = useState<'' | 'true' | 'false'>('')
  const [planFilter, setPlanFilter] = useState<Enums<'plan_tier'> | ''>('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

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
    is_verified:
      verifiedFilter === '' ? undefined : verifiedFilter === 'true',
    plan_tier: planFilter || undefined,
    search: search || undefined,
    page,
  }

  const { data, isLoading } = useListings(filters)
  const deleteMutation = useDeleteListing()

  function handleDelete(id: string, name: string) {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(id)
    }
  }

  const columns: Column<ListingRow>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <span className="font-medium text-ink">{row.name}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <span className="capitalize text-muted">{row.type}</span>
      ),
    },
    {
      key: 'area',
      header: 'Area',
      render: (row) => <span className="text-muted">{row.area ?? '—'}</span>,
    },
    {
      key: 'plan_tier',
      header: 'Plan',
      render: (row) => (
        <span
          className={[
            'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
            BADGE_COLORS[row.plan_tier],
          ].join(' ')}
        >
          {row.plan_tier}
        </span>
      ),
    },
    {
      key: 'is_verified',
      header: 'Verified',
      render: (row) => <VerifiedToggle row={row} />,
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (row) => (
        <span className="text-star font-medium">
          {row.rating > 0 ? `★ ${row.rating}` : '—'}
        </span>
      ),
    },
    {
      key: 'review_count',
      header: 'Reviews',
      render: (row) => <span className="text-muted">{row.review_count}</span>,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row) => (
        <span className="text-muted text-xs">
          {new Date(row.created_at).toLocaleDateString('en-IN')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            id={`edit-listing-${row.id}`}
            onClick={() => navigate(`/listings/${row.id}/edit`)}
            className="p-1.5 rounded-lg text-muted hover:text-violet hover:bg-violet-surface transition-colors"
            title="Edit"
          >
            <Edit2 size={15} />
          </button>
          <button
            id={`delete-listing-${row.id}`}
            onClick={() => handleDelete(row.id, row.name)}
            className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Filter bar + Add button */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-3">
          <input
            id="listings-search"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name..."
            className="px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet w-48"
          />
          <select
            id="listings-type-filter"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as Enums<'listing_type'> | ''); setPage(1) }}
            className="px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet bg-white"
          >
            <option value="">All Types</option>
            <option value="coaching">Coaching</option>
            <option value="hostel">Hostel</option>
          </select>
          <select
            id="listings-verified-filter"
            value={verifiedFilter}
            onChange={(e) => { setVerifiedFilter(e.target.value as '' | 'true' | 'false'); setPage(1) }}
            className="px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet bg-white"
          >
            <option value="">All Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          <select
            id="listings-plan-filter"
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value as Enums<'plan_tier'> | ''); setPage(1) }}
            className="px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet bg-white"
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <button
          id="add-listing-btn"
          onClick={() => navigate('/listings/new')}
          className="flex items-center gap-2 px-4 py-2 bg-violet text-white rounded-lg text-sm font-medium hover:bg-violet/90 transition-colors"
        >
          <Plus size={16} />
          Add Listing
        </button>
      </div>

      <DataTable
        columns={columns}
        data={data?.listings ?? []}
        loading={isLoading}
        rowKey={(r) => r.id}
        emptyMessage="No listings found."
      />

      {/* Pagination */}
      {(data?.totalPages ?? 0) > 1 && (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            Showing page {page} of {data?.totalPages} ({data?.total} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-violet-border rounded-lg disabled:opacity-40 hover:bg-violet-surface transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(data?.totalPages ?? p, p + 1))
              }
              disabled={page === data?.totalPages}
              className="px-3 py-1.5 border border-violet-border rounded-lg disabled:opacity-40 hover:bg-violet-surface transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
