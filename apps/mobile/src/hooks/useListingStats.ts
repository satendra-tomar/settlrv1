import { useQuery } from '@tanstack/react-query'
import { Platform } from 'react-native'
import { supabase } from '../lib/supabase'
import { getAnonymousId } from '../lib/anonymous'

export interface ListingStats {
  views: number
  saves: number
  contacts: number
}

export function useListingStats(listingId: string) {
  return useQuery({
    queryKey: ['listingStats', listingId],
    queryFn: async (): Promise<ListingStats> => {
      // Run queries in parallel
      const [viewsRes, savesRes, contactsRes] = await Promise.all([
        supabase
          .from('listing_views')
          .select('*', { count: 'exact', head: true })
          .eq('listing_id', listingId),
        
        supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('listing_id', listingId),
          
        supabase
          .from('lead_events')
          .select('*', { count: 'exact', head: true })
          .eq('listing_id', listingId)
          .in('event_type', ['call_click', 'whatsapp_click', 'direction_click', 'website_click']),
      ])

      return {
        views: viewsRes.count ?? 0,
        saves: savesRes.count ?? 0,
        contacts: contactsRes.count ?? 0,
      }
    },
    enabled: Boolean(listingId),
  })
}

/**
 * Non-blocking, environment-aware unique view tracking.
 */
export function recordView(listingId: string) {
  Promise.resolve().then(async () => {
    try {
      const env = process.env.EXPO_PUBLIC_APP_ENV || (__DEV__ ? 'development' : 'production')
      if (env !== 'production') {
        console.log(`[useListingStats] Skipping view tracking in ${env} environment for ${listingId}`)
        return
      }

      console.log(`[useListingStats] Recording view for ${listingId}`)

      const { data: { user } } = await supabase.auth.getUser()
      const anonymousId = await getAnonymousId()
      const deviceType = Platform.OS // 'ios', 'android', 'web', 'windows', 'macos'

      const { error } = await supabase.rpc('record_listing_view', {
        p_listing_id: listingId,
        p_user_id: user?.id ?? null,
        p_anonymous_id: user?.id ? null : anonymousId,
        p_device_type: deviceType
      })

      if (error) {
        console.warn('[useListingStats] Error recording view:', error.message)
      }
    } catch (e) {
      console.warn('[useListingStats] Failed to record view:', e)
    }
  })
}
