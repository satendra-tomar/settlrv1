import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, fontSize, radius } from '../../lib/tokens'

interface PrimaryActionBarProps {
  phone?: string | null
  whatsapp?: string | null
  website?: string | null
  isPaid: boolean
  onCallPress?: () => void
  onWhatsAppPress?: () => void
  onWebsitePress?: () => void
}

function PrimaryActionBarComponent({
  phone,
  whatsapp,
  website,
  isPaid,
  onCallPress,
  onWhatsAppPress,
  onWebsitePress,
}: PrimaryActionBarProps) {
  const insets = useSafeAreaInsets()
  const showCall = Boolean(phone && onCallPress)
  const showWhatsApp = Boolean(isPaid && whatsapp && onWhatsAppPress)
  const showWebsite = Boolean(isPaid && website && onWebsitePress)

  if (!showCall && !showWhatsApp && !showWebsite) return null

  return (
    <View style={[styles.container, { bottom: Math.max(insets.bottom, spacing.md) }]}>
      <View style={styles.inner}>
        {showCall && (
          <TouchableOpacity
            style={[styles.button, styles.callButton]}
            onPress={onCallPress}
            activeOpacity={0.85}
            accessibilityLabel="Call this listing"
          >
            <Text style={styles.buttonEmoji}>📞</Text>
            <Text style={styles.buttonText}>Call Now</Text>
          </TouchableOpacity>
        )}
        {showWhatsApp && (
          <TouchableOpacity
            style={[styles.button, styles.whatsappButton]}
            onPress={onWhatsAppPress}
            activeOpacity={0.85}
            accessibilityLabel="Message on WhatsApp"
          >
            <Text style={styles.buttonEmoji}>💬</Text>
            <Text style={styles.buttonText}>WhatsApp</Text>
          </TouchableOpacity>
        )}
        {showWebsite && (
          <TouchableOpacity
            style={[styles.button, styles.websiteButton]}
            onPress={onWebsitePress}
            activeOpacity={0.85}
            accessibilityLabel="Visit website"
          >
            <Text style={styles.buttonEmoji}>🌐</Text>
            <Text style={styles.buttonText}>Website</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export const PrimaryActionBar = React.memo(PrimaryActionBarComponent)
PrimaryActionBar.displayName = 'PrimaryActionBar'

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.darkCard,
    borderRadius: 9999, // Pill shape
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
    borderRadius: 9999, // Pill shape
    minHeight: 52, // Slightly taller
  },
  callButton: {
    backgroundColor: colors.violet,
  },
  whatsappButton: {
    backgroundColor: colors.whatsapp,
  },
  websiteButton: {
    backgroundColor: colors.darkCard,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  buttonEmoji: {
    fontSize: 16,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
})
