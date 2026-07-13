import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { ListingCard } from './useListings'

export type FavoriteWithListing = {
  id: string
  listing_id: string
  user_id: string
  listing: ListingCard
}

// ---------------------------------------------------------------------------
// useFavorites — all saved listings for a user
// ---------------------------------------------------------------------------
export function useFavorites(userId: string | null) {
  return useQuery({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('favorites')
        .select(
          `
          id,
          listing_id,
          user_id,
          listing:listings(
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
          )
          `,
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as unknown as FavoriteWithListing[]
    },
    enabled: Boolean(userId),
  })
}

// ---------------------------------------------------------------------------
// useIsFavorited — check if a specific listing is favorited by the user
// ---------------------------------------------------------------------------
export function useIsFavorited(listingId: string, userId: string | null) {
  return useQuery({
    queryKey: ['favorites', userId, listingId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('listing_id', listingId)
        .maybeSingle()
      if (error) throw error
      return data // null if not favorited, { id } if favorited
    },
    enabled: Boolean(userId && listingId),
  })
}

// ---------------------------------------------------------------------------
// useToggleFavorite — insert or delete favorites row
// ---------------------------------------------------------------------------
type TogglePayload = {
  listingId: string
  userId: string
  existingFavoriteId?: string
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ listingId, userId, existingFavoriteId }: TogglePayload) => {
      if (existingFavoriteId) {
        // DELETE — remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existingFavoriteId)
          .eq('user_id', userId)
        if (error) throw error
      } else {
        // INSERT — add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({ listing_id: listingId, user_id: userId })
        if (error) throw error
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', variables.userId] })
      queryClient.invalidateQueries({
        queryKey: ['favorites', variables.userId, variables.listingId],
      })
    },
  })
}
