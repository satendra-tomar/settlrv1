import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export type ReviewItem = {
  id: string
  listing_id: string
  user_id: string
  rating: number
  body: string | null
  is_approved: boolean
  created_at: string
  profiles: { full_name: string | null } | null
}

// ---------------------------------------------------------------------------
// useReviews — approved reviews for a listing, joined with reviewer name
// ---------------------------------------------------------------------------
export function useReviews(listingId: string) {
  return useQuery({
    queryKey: ['reviews', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(
          'id, listing_id, user_id, rating, body, is_approved, created_at',
        )
        .eq('listing_id', listingId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as unknown as ReviewItem[]
    },
    enabled: Boolean(listingId),
  })
}

// ---------------------------------------------------------------------------
// useMyReview — the current user's review for a listing (null if none)
// ---------------------------------------------------------------------------
export function useMyReview(listingId: string, userId: string | null) {
  return useQuery({
    queryKey: ['myReview', listingId, userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, body, created_at')
        .eq('listing_id', listingId)
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: Boolean(listingId && userId),
  })
}

// ---------------------------------------------------------------------------
// useSubmitReview — insert or update a review
// ---------------------------------------------------------------------------
type SubmitReviewPayload = {
  listingId: string
  userId: string
  rating: number
  body: string
  existingReviewId?: string
}

export function useSubmitReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      listingId,
      userId,
      rating,
      body,
      existingReviewId,
    }: SubmitReviewPayload) => {
      if (existingReviewId) {
        // UPDATE
        const { error } = await supabase
          .from('reviews')
          .update({ rating, body, is_approved: true })
          .eq('id', existingReviewId)
          .eq('user_id', userId)
        if (error) throw error
      } else {
        // INSERT
        const { error } = await supabase.from('reviews').insert({
          listing_id: listingId,
          user_id: userId,
          rating,
          body,
          is_approved: true,
        })
        if (error) throw error
      }
    },
    onSuccess: (_data, variables) => {
      // Invalidate so the Phase 0 trigger-recomputed rating/count appears immediately
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.listingId] })
      queryClient.invalidateQueries({ queryKey: ['listing', variables.listingId] })
      queryClient.invalidateQueries({ queryKey: ['listings'] }) // Invalidate list views (featured & search)
      queryClient.invalidateQueries({
        queryKey: ['myReview', variables.listingId, variables.userId],
      })
    },
  })
}
