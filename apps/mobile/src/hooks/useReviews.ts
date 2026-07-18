import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export type ReviewItem = {
  id: string
  listing_id: string
  user_id: string
  rating: number
  title: string | null
  body: string | null
  is_anonymous: boolean
  is_verified: boolean
  recommend: boolean | null
  helpful_count: number
  is_approved: boolean
  created_at: string
  profiles: { full_name: string | null; avatar_url: string | null } | null
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
          'id, listing_id, user_id, rating, title, body, is_anonymous, is_verified, recommend, helpful_count, is_approved, created_at, profiles(full_name, avatar_url)',
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
        .select('id, rating, title, body, is_anonymous, recommend, created_at')
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
  title: string | null
  body: string | null
  isAnonymous: boolean
  recommend: boolean | null
  existingReviewId?: string
}

export function useSubmitReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      listingId,
      userId,
      rating,
      title,
      body,
      isAnonymous,
      recommend,
      existingReviewId,
    }: SubmitReviewPayload) => {
      const payload = {
        rating,
        title,
        body,
        is_anonymous: isAnonymous,
        recommend,
        is_approved: true, // auto-approve for now
      }

      if (existingReviewId) {
        // UPDATE
        const { error } = await supabase
          .from('reviews')
          .update(payload)
          .eq('id', existingReviewId)
          .eq('user_id', userId)
        if (error) throw error
      } else {
        // INSERT
        const { error } = await supabase.from('reviews').insert({
          ...payload,
          listing_id: listingId,
          user_id: userId,
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

// ---------------------------------------------------------------------------
// useToggleHelpful — toggle a helpful vote for a review
// ---------------------------------------------------------------------------
export function useToggleHelpful() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ reviewId, userId, isHelpful }: { reviewId: string; userId: string; isHelpful: boolean }) => {
      if (isHelpful) {
        await supabase.from('review_helpful_votes').insert({ review_id: reviewId, user_id: userId })
        // Increment helpful_count RPC would be ideal, but for now we rely on simple update
        // We'll let the frontend mock the count change locally for responsiveness
      } else {
        await supabase.from('review_helpful_votes').delete().eq('review_id', reviewId).eq('user_id', userId)
      }
    },
    // We don't invalidate immediately to avoid jitter; the UI will optimistic update
  })
}

// ---------------------------------------------------------------------------
// useReportReview — report a review
// ---------------------------------------------------------------------------
export function useReportReview() {
  return useMutation({
    mutationFn: async ({ reviewId, userId, reason }: { reviewId: string; userId: string; reason: string }) => {
      const { error } = await supabase.from('review_reports').insert({
        review_id: reviewId,
        user_id: userId,
        reason,
      })
      if (error) throw error
    },
  })
}
