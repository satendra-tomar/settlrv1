import { supabase } from './supabase'

/**
 * Record a lead event for a listing.
 *
 * This is the ONLY place in the mobile codebase that inserts into `lead_events`.
 * Do NOT inline this logic at call sites.
 *
 * Fire-and-forget: intentionally not awaited at call sites so UI actions
 * (opening dialer, WhatsApp, browser) are never blocked by this insert.
 */
export async function recordLead(
  listingId: string,
  eventType: 'call' | 'whatsapp' | 'website' | 'view',
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Not awaited intentionally — fire-and-forget
  supabase.from('lead_events').insert({
    listing_id: listingId,
    event_type: eventType,
    user_id: user?.id ?? null,
  })
}
