import { supabase } from './supabase'

export type LeadEventType = 'call_click' | 'whatsapp_click' | 'website_click' | 'direction_click' | 'share_click' | 'view'

export interface TrackLeadParams {
  type: LeadEventType
  listingId: string
  listingType: 'coaching' | 'hostel'
}

export class LeadTracker {
  static async track(params: TrackLeadParams): Promise<void> {
    const { type, listingId, listingType } = params

    console.log(`[LeadTracker] Tracking event locally: ${type} for ${listingType} ${listingId}`)

    // Only send to Supabase if the event type is supported by the enum
    // Currently supported in enum: 'view', 'call_click', 'whatsapp_click', 'direction_click', 'website_click'
    const supportedTypes = ['view', 'call_click', 'whatsapp_click', 'direction_click', 'website_click']
    
    if (supportedTypes.includes(type)) {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        // Fire-and-forget insert
        supabase.from('lead_events').insert({
          listing_id: listingId,
          event_type: type as any,
          user_id: user?.id ?? null,
        }).then(({ error }) => {
          if (error) {
            console.warn(`[LeadTracker] Failed to persist event to Supabase: ${error.message}`)
          }
        })
      } catch (e) {
        console.warn(`[LeadTracker] Error fetching user for tracking:`, e)
      }
    }
  }
}

