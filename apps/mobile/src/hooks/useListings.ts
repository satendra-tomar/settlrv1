import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Enums } from '../types/database'

// ---------------------------------------------------------------------------
// Shared card shape — the minimal columns fetched for list views
// ---------------------------------------------------------------------------
export type ListingCard = {
  id: string
  name: string
  area: string | null
  rating: number
  review_count: number
  is_verified: boolean
  plan_tier: Enums<'plan_tier'>
  type: Enums<'listing_type'>
  listing_images: { url: string; is_primary: boolean }[]
  // Detail joined when available (coaching)
  coaching_details?: { subjects: string[] | null }[] | null
  // Detail joined when available (hostel)
  hostel_details?: { rent_min: number | null; rent_max: number | null }[] | null
}

export type ListingFilters = {
  type?: Enums<'listing_type'>
  area?: string
  minRating?: number
  sortBy?: 'rating' | 'newest' | 'rent_asc'
  examTypes?: string[]
  gender?: Enums<'hostel_gender'>
  rentMin?: number
  rentMax?: number
  foodIncluded?: boolean
  search?: string
}

const PAGE_SIZE = 20

// ---------------------------------------------------------------------------
// useListings — infinite paginated list for Search screen
// ---------------------------------------------------------------------------
export function useListings(filters: ListingFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['listings', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase
        .from('listings')
        .select(
          `
          id,
          name,
          area,
          rating,
          review_count,
          is_verified,
          plan_tier,
          type,
          listing_images(url, is_primary),
          coaching_details${filters.type === 'coaching' ? '!inner' : ''}(subjects),
          hostel_details${filters.type === 'hostel' ? '!inner' : ''}(rent_min, rent_max)
          `,
        )
        // RLS already ensures is_active=true AND is_verified=true for anon reads
        .range(from, to)

      // Text search
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`)
      }

      // Type filter
      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      // Area filter
      if (filters.area) {
        query = query.ilike('area', `%${filters.area}%`)
      }

      // Minimum rating
      if (filters.minRating && filters.minRating > 0) {
        query = query.gte('rating', filters.minRating)
      }

      // Coaching-specific filters
      if (filters.type === 'coaching') {
        if (filters.examTypes && filters.examTypes.length > 0) {
          query = query.overlaps('coaching_details.subjects', filters.examTypes)
        }
      }

      // Hostel-specific filters
      if (filters.type === 'hostel') {
        if (filters.gender) {
          query = query.eq('hostel_details.gender', filters.gender)
        }
        if (filters.rentMin && filters.rentMin > 0) {
          query = query.gte('hostel_details.rent_min', filters.rentMin)
        }
        if (filters.rentMax && filters.rentMax > 0) {
          query = query.lte('hostel_details.rent_max', filters.rentMax)
        }
        if (filters.foodIncluded) {
          query = query.eq('hostel_details.food_included', true)
        }
      }

      // Sort
      // Paid listings first for featured feel (must be first .order() to take precedence)
      query = query.order('plan_tier', { ascending: false })

      switch (filters.sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'rent_asc':
          // For hostel only — sort by rent_min ascending
          query = query.order('rent_min', { foreignTable: 'hostel_details', ascending: true })
          break
        case 'rating':
        default:
          query = query.order('rating', { ascending: false })
          break
      }

      const { data, error } = await query
      if (error) throw error

      return (data ?? []) as ListingCard[]
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    initialPageParam: 0,
  })
}

// ---------------------------------------------------------------------------
// useFeaturedListings — homepage featured section (paid first, then by rating)
// ---------------------------------------------------------------------------
export function useFeaturedListings() {
  return useQuery({
    queryKey: ['listings', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(
          `
          id,
          name,
          area,
          rating,
          review_count,
          is_verified,
          plan_tier,
          type,
          listing_images(url, is_primary),
          coaching_details(subjects),
          hostel_details(rent_min, rent_max)
          `,
        )
        .order('plan_tier', { ascending: false })
        .order('rating', { ascending: false })
        .limit(10)

      if (error) throw error
      return (data ?? []) as ListingCard[]
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
