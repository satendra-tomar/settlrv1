import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, fontSize, radius } from '../lib/tokens'

// Maps icon identifier strings to emoji/Unicode symbols.
const ICON_MAP: Record<string, string> = {
  wifi: '📶',
  ac: '❄️',
  mess: '🍽️',
  library: '📚',
  cctv: '📷',
  power: '🔋',
  laundry: '👕',
  parking: '🅿️',
  default: '✨',
}

function getEmoji(icon: string | null): string {
  if (!icon) return ICON_MAP.default
  return ICON_MAP[icon.toLowerCase()] ?? ICON_MAP.default
}

interface AmenityGridProps {
  amenities: { name: string; icon: string | null }[]
}

export function AmenityGrid({ amenities }: AmenityGridProps) {
  if (!amenities || amenities.length === 0) return null

  return (
    <View style={styles.grid}>
      {amenities.map((amenity, i) => (
        <View key={`${amenity.name}-${i}`} style={styles.item}>
          <View style={styles.iconCircle}>
            <Text style={styles.emoji}>{getEmoji(amenity.icon)}</Text>
          </View>
          <Text style={styles.label} numberOfLines={2}>{amenity.name}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'flex-start',
  },
  item: {
    width: '28%', // fits 3 per row comfortably
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  emoji: {
    fontSize: 28,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
})
