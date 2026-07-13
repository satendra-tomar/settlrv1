import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Enums } from '../types/database'

// ---------------------------------------------------------------------------
// Full detail shape for a single listing
// ---------------------------------------------------------------------------
export type ListingDetail = {
  id: string
  name: string
  type: Enums<'listing_type'>
  city_id: string
  area: string | null
  address: string | null
  phone: string | null
  whatsapp: string | null
  website_url: string | null
  description: string | null
  plan_tier: Enums<'plan_tier'>
  is_verified: boolean
  rating: number
  review_count: number
  created_at: string
  updated_at: string
  listing_images: {
    id: string
    url: string
    is_primary: boolean
    sort_order: number
  }[]
  listing_amenities: {
    amenities: { name: string; icon: string | null } | null
  }[]
  coaching_details: {
    subjects: string[] | null
    established_year: number | null
    faculty_count: number | null
    has_demo_class: boolean
    has_online_classes: boolean
  }[] | null
  hostel_details: {
    gender: Enums<'hostel_gender'>
    total_rooms: number | null
    rent_min: number | null
    rent_max: number | null
    food_included: boolean
    warden_name: string | null
    warden_phone: string | null
  }[] | null
}

export function useListingDetail(id: string, type: Enums<'listing_type'>) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const detailJoin =
        type === 'coaching'
          ? 'coaching_details(subjects, established_year, faculty_count, has_demo_class, has_online_classes)'
          : 'hostel_details(gender, total_rooms, rent_min, rent_max, food_included, warden_name, warden_phone)'

      const { data, error } = await supabase
        .from('listings')
        .select(
          `
          id,
          name,
          type,
          city_id,
          area,
          address,
          phone,
          whatsapp,
          website_url,
          description,
          plan_tier,
          is_verified,
          rating,
          review_count,
          created_at,
          updated_at,
          listing_images(id, url, is_primary, sort_order),
          listing_amenities(amenities(name, icon)),
          ${detailJoin}
          `,
        )
        .eq('id', id)
        .order('sort_order', { foreignTable: 'listing_images', ascending: true })
        .single()

      if (error) throw error
      return data as unknown as ListingDetail
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  })
}
