import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/database'

type LeadEvent = Tables<'lead_events'> & {
  listings: { name: string; type: string } | null
}

export interface LeadSummary {
  listing_id: string
  listing_name: string
  listing_type: string
  calls: number
  whatsapp: number
  website: number
  views: number
  total: number
  dailyBreakdown: Record<string, { calls: number; whatsapp: number; website: number; views: number }>
}

export function useLeads(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ['leads', dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_events')
        .select('*, listings(name, type)')
        .gte('created_at', dateFrom)
        .lte('created_at', dateTo)
        .order('created_at', { ascending: false })

      if (error) throw error

      const events = (data ?? []) as LeadEvent[]

      // Aggregate in TypeScript (appropriate at Indore-only scale)
      const byListing: Record<string, LeadSummary> = {}

      for (const event of events) {
        const lid = event.listing_id
        if (!byListing[lid]) {
          byListing[lid] = {
            listing_id: lid,
            listing_name: event.listings?.name ?? 'Unknown',
            listing_type: event.listings?.type ?? 'unknown',
            calls: 0,
            whatsapp: 0,
            website: 0,
            views: 0,
            total: 0,
            dailyBreakdown: {},
          }
        }

        const day = event.created_at.split('T')[0]
        if (!byListing[lid].dailyBreakdown[day]) {
          byListing[lid].dailyBreakdown[day] = { calls: 0, whatsapp: 0, website: 0, views: 0 }
        }

        switch (event.event_type) {
          case 'call':
            byListing[lid].calls++
            byListing[lid].dailyBreakdown[day].calls++
            break
          case 'whatsapp':
            byListing[lid].whatsapp++
            byListing[lid].dailyBreakdown[day].whatsapp++
            break
          case 'website':
            byListing[lid].website++
            byListing[lid].dailyBreakdown[day].website++
            break
          case 'view':
            byListing[lid].views++
            byListing[lid].dailyBreakdown[day].views++
            break
        }
        byListing[lid].total++
      }

      return Object.values(byListing).sort((a, b) => b.total - a.total)
    },
  })
}
