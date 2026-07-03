import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import type { Tables, Enums } from '../types/database'

export interface ListingFilters {
  type?: Enums<'listing_type'>
  is_verified?: boolean
  plan_tier?: Enums<'plan_tier'>
  search?: string
  page?: number
}

export type ListingRow = Pick<
  Tables<'listings'>,
  | 'id'
  | 'type'
  | 'name'
  | 'area'
  | 'plan_tier'
  | 'is_verified'
  | 'is_active'
  | 'rating'
  | 'review_count'
  | 'created_at'
>

const PAGE_SIZE = 25

export function useListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const { page = 1, type, is_verified, plan_tier, search } = filters
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase
        .from('listings')
        .select(
          'id, type, name, area, plan_tier, is_verified, is_active, rating, review_count, created_at',
          { count: 'exact' },
        )
        .order('created_at', { ascending: false })
        .range(from, to)

      if (type) query = query.eq('type', type)
      if (is_verified !== undefined) query = query.eq('is_verified', is_verified)
      if (plan_tier) query = query.eq('plan_tier', plan_tier)
      if (search) query = query.ilike('name', `%${search}%`)

      const { data, error, count } = await query

      if (error) throw error

      return {
        listings: (data ?? []) as ListingRow[],
        total: count ?? 0,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
      }
    },
  })
}

export function useListingDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['listing', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(
          `
          *,
          coaching_details(*),
          hostel_details(*),
          listing_images(*),
          listing_amenities(amenity_id)
        `,
        )
        .eq('id', id!)
        .single()

      if (error) throw error
      return data
    },
  })
}

export function useCreateListing() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data, error } = await supabase.rpc('create_listing_with_details', {
        payload: payload as never,
      })
      if (error) throw error
      return data as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      toast.success('Listing created successfully')
      navigate('/listings')
    },
    onError: (err: Error) => {
      toast.error(`Failed to create listing: ${err.message}`)
    },
  })
}

export function useUpdateListing() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { error } = await supabase.rpc('update_listing_with_details', {
        payload: payload as never,
      })
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      const id = variables.id as string
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['listing', id] })
      toast.success('Listing updated successfully')
      navigate('/listings')
    },
    onError: (err: Error) => {
      toast.error(`Failed to update listing: ${err.message}`)
    },
  })
}

export function useDeleteListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('listings').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      toast.success('Listing deleted')
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete listing: ${err.message}`)
    },
  })
}

export function useToggleVerified(id: string, currentValue: boolean) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('listings')
        .update({ is_verified: !currentValue })
        .eq('id', id)
      if (error) throw error
    },
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['listings'] })
      const previous = queryClient.getQueriesData({ queryKey: ['listings'] })

      queryClient.setQueriesData(
        { queryKey: ['listings'] },
        (old: unknown) => {
          if (!old || typeof old !== 'object') return old
          const oldData = old as { listings: ListingRow[] }
          return {
            ...oldData,
            listings: oldData.listings?.map((l) =>
              l.id === id ? { ...l, is_verified: !currentValue } : l,
            ),
          }
        },
      )

      return { previous }
    },
    onError: (err: Error, _vars, context) => {
      // Revert optimistic update
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data)
        }
      }
      toast.error(`Failed to update verification: ${err.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
  })
}
