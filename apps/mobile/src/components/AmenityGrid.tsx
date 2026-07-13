import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, fontSize, radius } from '../lib/tokens'

// Maps icon identifier strings (from the amenities table) to emoji/Unicode symbols.
// A proper icon font replaces this in Phase 4 — do not install an icon package for this.
const ICON_MAP: Record<string, string> = {
  wifi: '📶',
  ac: '❄️',
  mess: '🍽️',
  library: '📚',
  cctv: '📷',
  power: '🔋',
  laundry: '👕',
  parking: '🅿️',
  // fallback for unmapped icons
  default: '✓',
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
          <Text style={styles.emoji}>{getEmoji(amenity.icon)}</Text>
          <Text style={styles.label}>{amenity.name}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  emoji: {
    fontSize: fontSize.lg,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.ink,
    fontWeight: '500',
    flex: 1,
  },
})
