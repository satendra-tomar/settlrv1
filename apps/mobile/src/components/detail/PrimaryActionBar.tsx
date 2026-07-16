import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Linking from 'expo-linking'
import { colors, spacing, fontSize, radius } from '../../lib/tokens'

interface PrimaryActionBarProps {
  isFavorited: boolean
  onFavoritePress: () => void
  onCallPress?: () => void
  onSharePress?: () => void
  area: string | null
  name: string
}

export const PrimaryActionBar = React.memo(function PrimaryActionBarComponent({
  isFavorited,
  onFavoritePress,
  onCallPress,
  onSharePress,
  area,
  name,
}: PrimaryActionBarProps) {
  const insets = useSafeAreaInsets()

  function handleDirections() {
    if (!area) return
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
          style={[styles.button, styles.primaryButton]}
          onPress={onCallPress}
          activeOpacity={0.85}
          disabled={!onCallPress}
        >
          <Text style={styles.buttonEmoji}>📞</Text>
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleDirections}
          activeOpacity={0.85}
          disabled={!area}
        >
          <Text style={styles.buttonEmoji}>📍</Text>
          <Text style={styles.buttonText}>Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.iconButton]}
          onPress={onSharePress}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonEmoji}>↗️</Text>
          <Text style={styles.buttonText}>Share</Text>
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
    flex: 1.2, // Give slightly more room to primary action
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flex: 1.2,
  },
  iconButton: {
    flexDirection: 'column',
    gap: 2,
    backgroundColor: 'transparent',
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
