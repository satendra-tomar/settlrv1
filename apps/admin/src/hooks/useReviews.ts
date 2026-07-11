import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'

export function useReviews() {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(
          `
          id,
          listing_id,
          user_id,
          rating,
          body,
          is_approved,
          created_at,
          listings(name)
        `,
        )
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
  })
}

export function useToggleReviewApproval(id: string, currentValue: boolean) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: !currentValue })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      toast.success(currentValue ? 'Review hidden' : 'Review shown')
    },
    onError: (err: Error) => {
      toast.error(`Failed to update review: ${err.message}`)
    },
  })
}
