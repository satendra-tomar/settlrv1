import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Share, Platform } from 'react-native'
import * as Linking from 'expo-linking'
import * as Clipboard from 'expo-clipboard'
import { colors, spacing, fontSize, radius } from '../../lib/tokens'
import { LeadTracker } from '../../lib/leads'
import { BRANDING } from '../../constants/branding'

interface ContactCardProps {
  listingId: string
  listingType: 'coaching' | 'hostel'
  name: string
  area: string | null
  phone: string | null
  whatsapp: string | null
  website: string | null
  isVerified: boolean
}

export function ContactCard({
  listingId,
  listingType,
  name,
  area,
  phone,
  whatsapp,
  website,
  isVerified,
}: ContactCardProps) {

  async function handleCall() {
    if (!phone) return
    LeadTracker.track({ type: 'call_click', listingId, listingType })
    await Linking.openURL(`tel:${phone}`)
  }

  async function handleCopyPhone() {
    if (!phone) return
    await Clipboard.setStringAsync(phone)
    // Could show a toast here in a real app
  }

  async function handleWhatsApp() {
    if (!whatsapp) return
    LeadTracker.track({ type: 'whatsapp_click', listingId, listingType })
    const number = whatsapp.replace(/[^0-9]/g, '')
    const message = encodeURIComponent(`Hi, I found your institute on ${BRANDING.name} and would like to know more about admissions.`)
    await Linking.openURL(`https://wa.me/${number}?text=${message}`)
  }

  async function handleDirections() {
    if (!area) return
    LeadTracker.track({ type: 'direction_click', listingId, listingType })
    const query = encodeURIComponent(`${name}, ${area}`)
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`)
  }

  async function handleWebsite() {
    if (!website) return
    LeadTracker.track({ type: 'website_click', listingId, listingType })
    await Linking.openURL(website)
  }

  async function handleShare() {
    LeadTracker.track({ type: 'share_click', listingId, listingType })
    
    // Future deep link placeholder
    const deepLink = `https://settlr.com/${listingType}/${listingId}`
    
    const message = `${name}${area ? ` in ${area}` : ''}\nFound on ${BRANDING.name}.\n\n${deepLink}`
    
    try {
      await Share.share({
        message,
        url: Platform.OS === 'ios' ? deepLink : undefined,
        title: `Check out ${name} on ${BRANDING.name}`,
      })
    } catch (error) {
      console.warn('Error sharing:', error)
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Contact & Information</Text>
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionsGrid}>
        
        {/* Phone Action */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.primaryButton, !phone && styles.disabledButton]}
            onPress={handleCall}
            disabled={!phone}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonEmoji}>📞</Text>
            <Text style={styles.buttonText}>{phone ? 'Call Now' : 'Phone not available'}</Text>
          </TouchableOpacity>
          
          {phone && (
            <TouchableOpacity style={styles.iconOnlyButton} onPress={handleCopyPhone} activeOpacity={0.7} accessibilityLabel="Copy Phone">
              <Text style={styles.iconEmoji}>📋</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* WhatsApp Action */}
        {whatsapp && (
          <TouchableOpacity
            style={[styles.primaryButton, styles.whatsappButton]}
            onPress={handleWhatsApp}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonEmoji}>💬</Text>
            <Text style={styles.buttonText}>WhatsApp</Text>
          </TouchableOpacity>
        )}

        {/* Directions Action */}
        {area && (
          <TouchableOpacity
            style={[styles.secondaryButton]}
            onPress={handleDirections}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonEmoji}>📍</Text>
            <Text style={[styles.secondaryButtonText, { flex: 1 }]} numberOfLines={1}>
              {area}
            </Text>
            <Text style={styles.chevron}>→</Text>
          </TouchableOpacity>
        )}

        {/* Website Action */}
        {website && (
          <TouchableOpacity
            style={[styles.secondaryButton]}
            onPress={handleWebsite}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonEmoji}>🌐</Text>
            <Text style={[styles.secondaryButtonText, { flex: 1 }]} numberOfLines={1}>
              Visit Website
            </Text>
            <Text style={styles.chevron}>→</Text>
          </TouchableOpacity>
        )}

        {/* Share Action */}
        <TouchableOpacity
          style={[styles.secondaryButton]}
          onPress={handleShare}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonEmoji}>↗️</Text>
          <Text style={[styles.secondaryButtonText, { flex: 1 }]}>
            Share this listing
          </Text>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  headerRow: {
    marginBottom: spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.white,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsGrid: {
    gap: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.violet,
    paddingVertical: 16,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  whatsappButton: {
    backgroundColor: '#25D366', // Official WhatsApp brand color
  },
  disabledButton: {
    backgroundColor: colors.darkBorder,
    opacity: 0.7,
  },
  buttonEmoji: {
    fontSize: 18,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  iconOnlyButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.darkBorder,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.darkBorder,
    paddingVertical: 16,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.muted,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  chevron: {
    color: colors.muted,
    fontSize: 16,
  },
})
