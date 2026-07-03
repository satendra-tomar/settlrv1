import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useLeads, type LeadSummary } from '../hooks/useLeads'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function sevenDaysAgoStr() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString().split('T')[0]
}

function ExpandedRow({ summary }: { summary: LeadSummary }) {
  const days = Object.keys(summary.dailyBreakdown).sort()

  if (days.length === 0) {
    return (
      <tr>
        <td colSpan={8} className="px-8 py-3 bg-violet-surface text-muted text-xs">
          No per-day data.
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td colSpan={8} className="px-8 py-3 bg-violet-surface">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-muted">
              <th className="text-left py-1 pr-4 font-medium">Date</th>
              <th className="text-right py-1 pr-4 font-medium">Calls</th>
              <th className="text-right py-1 pr-4 font-medium">WhatsApp</th>
              <th className="text-right py-1 pr-4 font-medium">Website</th>
              <th className="text-right py-1 font-medium">Views</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-border">
            {days.map((day) => {
              const b = summary.dailyBreakdown[day]
              return (
                <tr key={day}>
                  <td className="py-1 pr-4 text-ink">{day}</td>
                  <td className="py-1 pr-4 text-right text-ink">{b.calls}</td>
                  <td className="py-1 pr-4 text-right text-ink">{b.whatsapp}</td>
                  <td className="py-1 pr-4 text-right text-ink">{b.website}</td>
                  <td className="py-1 text-right text-ink">{b.views}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </td>
    </tr>
  )
}

export function LeadsPage() {
  const [dateFrom, setDateFrom] = useState(sevenDaysAgoStr)
  const [dateTo, setDateTo] = useState(todayStr)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  // Append end-of-day to dateTo so the lte includes the full day
  const toISO = `${dateTo}T23:59:59Z`
  const fromISO = `${dateFrom}T00:00:00Z`

  const { data, isLoading } = useLeads(fromISO, toISO)

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Date range */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">From</label>
          <input
            id="leads-date-from"
            type="date"
            value={dateFrom}
            max={dateTo}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">To</label>
          <input
            id="leads-date-to"
            type="date"
            value={dateTo}
            min={dateFrom}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-violet-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet bg-white"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-violet-border p-8 text-center">
          <div className="w-8 h-8 border-2 border-violet border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted text-sm mt-3">Loading lead data…</p>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="bg-white rounded-xl border border-violet-border p-12 text-center">
          <p className="text-muted text-sm">No lead data for this period.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-violet-border shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-violet-surface border-b border-violet-border">
                <th className="px-4 py-3 text-left font-semibold text-ink w-8" />
                <th className="px-4 py-3 text-left font-semibold text-ink">Listing Name</th>
                <th className="px-4 py-3 text-left font-semibold text-ink">Type</th>
                <th className="px-4 py-3 text-right font-semibold text-ink">Calls</th>
                <th className="px-4 py-3 text-right font-semibold text-ink">WhatsApp</th>
                <th className="px-4 py-3 text-right font-semibold text-ink">Website</th>
                <th className="px-4 py-3 text-right font-semibold text-ink">Views</th>
                <th className="px-4 py-3 text-right font-semibold text-ink">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-border">
              {data.map((row) => {
                const isExpanded = expanded.has(row.listing_id)
                return (
                  <>
                    <tr
                      key={row.listing_id}
                      className="hover:bg-violet-surface transition-colors cursor-pointer"
                      onClick={() => toggleExpand(row.listing_id)}
                    >
                      <td className="px-4 py-3 text-muted">
                        {isExpanded ? (
                          <ChevronDown size={15} />
                        ) : (
                          <ChevronRight size={15} />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">
                        {row.listing_name}
                      </td>
                      <td className="px-4 py-3 text-muted capitalize">
                        {row.listing_type}
                      </td>
                      <td className="px-4 py-3 text-right text-ink">{row.calls}</td>
                      <td className="px-4 py-3 text-right text-ink">{row.whatsapp}</td>
                      <td className="px-4 py-3 text-right text-ink">{row.website}</td>
                      <td className="px-4 py-3 text-right text-ink">{row.views}</td>
                      <td className="px-4 py-3 text-right font-bold text-violet">
                        {row.total}
                      </td>
                    </tr>
                    {isExpanded && (
                      <ExpandedRow key={`${row.listing_id}-expand`} summary={row} />
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
