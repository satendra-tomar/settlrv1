import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Linking from 'expo-linking'
import { colors, spacing, fontSize, radius } from '../../lib/tokens'
import { LeadTracker } from '../../lib/leads'
import { BRANDING } from '../../constants/branding'

interface PrimaryActionBarProps {
  listingId: string
  listingType: 'coaching' | 'hostel'
  isFavorited: boolean
  onFavoritePress: () => void
  name: string
  area: string | null
  phone: string | null
  whatsapp: string | null
}

export const PrimaryActionBar = React.memo(function PrimaryActionBarComponent({
  listingId,
  listingType,
  isFavorited,
  onFavoritePress,
  name,
  area,
  phone,
  whatsapp,
}: PrimaryActionBarProps) {
  const insets = useSafeAreaInsets()

  async function handleCall() {
    if (!phone) return
    LeadTracker.track({ type: 'call_click', listingId, listingType })
    await Linking.openURL(`tel:${phone}`)
  }

  async function handleWhatsApp() {
    if (!whatsapp) return
    LeadTracker.track({ type: 'whatsapp_click', listingId, listingType })
    const number = whatsapp.replace(/[^0-9]/g, '')
    const message = encodeURIComponent(`Hi, I found your institute on ${BRANDING.name} and would like to know more about admissions.`)
    await Linking.openURL(`https://wa.me/${number}?text=${message}`)
  }

  function handleDirections() {
    if (!area) return
    LeadTracker.track({ type: 'direction_click', listingId, listingType })
    const query = encodeURIComponent(`${name}, ${area}`)
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`)
  }

  return (
    <View style={[styles.container, { bottom: Math.max(insets.bottom, spacing.md) }]}>
      <View style={styles.inner}>
        
        <TouchableOpacity
          style={[styles.button, styles.iconButton]}
          onPress={onFavoritePress}
          activeOpacity={0.85}
          accessibilityLabel={isFavorited ? 'Remove from saved' : 'Save this listing'}
        >
          <Text style={styles.buttonEmoji}>{isFavorited ? '❤️' : '🤍'}</Text>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, !phone && styles.disabledButton]}
          onPress={handleCall}
          activeOpacity={0.85}
          disabled={!phone}
        >
          <Text style={styles.buttonEmoji}>📞</Text>
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.whatsappButton, !whatsapp && styles.disabledButton]}
          onPress={handleWhatsApp}
          activeOpacity={0.85}
          disabled={!whatsapp}
        >
          <Text style={styles.buttonEmoji}>💬</Text>
          <Text style={styles.buttonText}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.iconButton]}
          onPress={handleDirections}
          activeOpacity={0.85}
          disabled={!area}
        >
          <Text style={styles.buttonEmoji}>📍</Text>
          <Text style={styles.buttonText}>Directions</Text>
        </TouchableOpacity>

      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.darkCard,
    borderRadius: radius.full,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  inner: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 14,
    borderRadius: radius.full,
    minHeight: 52,
  },
  primaryButton: {
    backgroundColor: colors.violet,
    flex: 1.2,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    flex: 1.2,
  },
  iconButton: {
    flexDirection: 'column',
    gap: 2,
    backgroundColor: 'transparent',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonEmoji: {
    fontSize: 16,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
})
