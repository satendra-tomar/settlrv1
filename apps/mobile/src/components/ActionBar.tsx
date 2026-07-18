import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import * as Linking from 'expo-linking'
import { LeadTracker } from '../lib/leads'
import { colors, radius, spacing, fontSize } from '../lib/tokens'
import type { Enums } from '../types/database'

interface ActionBarProps {
  listingId: string
  listingType?: 'coaching' | 'hostel'
  phone?: string | null
  whatsapp?: string | null
  website?: string | null
  planTier: Enums<'plan_tier'>
}

export function ActionBar({
  listingId,
  listingType = 'coaching', // fallback
  phone,
  whatsapp,
  website,
  planTier,
}: ActionBarProps) {
  const isPaid = planTier === 'paid'

  async function handleCall() {
    if (!phone) return
    LeadTracker.track({ type: 'call_click', listingId, listingType })
    await Linking.openURL(`tel:${phone}`)
  }

  async function handleWhatsApp() {
    if (!whatsapp) return
    LeadTracker.track({ type: 'whatsapp_click', listingId, listingType })
    const number = whatsapp.replace(/[^0-9]/g, '')
    await Linking.openURL(`https://wa.me/${number}`)
  }

  async function handleWebsite() {
    if (!website) return
    LeadTracker.track({ type: 'website_click', listingId, listingType })
    await Linking.openURL(website)
  }

  return (
    <View style={styles.container}>
      {/* Call — always shown if phone is present */}
      {phone && (
        <TouchableOpacity
          style={[styles.button, styles.callButton]}
          onPress={handleCall}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>📞 Call</Text>
        </TouchableOpacity>
      )}

      {/* WhatsApp — paid only, and only if number is present */}
      {isPaid && whatsapp && (
        <TouchableOpacity
          style={[styles.button, styles.whatsappButton]}
          onPress={handleWhatsApp}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>💬 WhatsApp</Text>
        </TouchableOpacity>
      )}

      {/* Website — paid only, and only if URL is present */}
      {isPaid && website && (
        <TouchableOpacity
          style={[styles.button, styles.websiteButton]}
          onPress={handleWebsite}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>🌐 Website</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  button: {
    flex: 1,
    minWidth: 90,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButton: {
    backgroundColor: colors.violet,
  },
  whatsappButton: {
    backgroundColor: colors.whatsapp,
  },
  websiteButton: {
    backgroundColor: colors.ink,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
})
