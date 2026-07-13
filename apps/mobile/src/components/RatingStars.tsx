import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, fontSize, spacing } from '../lib/tokens'

interface RatingStarsProps {
  rating: number
  count?: number
  size?: 'sm' | 'md'
}

export function RatingStars({ rating, count, size = 'md' }: RatingStarsProps) {
  const starSize = size === 'sm' ? fontSize.sm : fontSize.md
  const filled = Math.round(rating)

  return (
    <View style={styles.container}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Text
          key={i}
          style={[
            styles.star,
            { fontSize: starSize },
            i < filled ? styles.starFilled : styles.starEmpty,
          ]}
        >
          ★
        </Text>
      ))}
      {count !== undefined && (
        <Text style={[styles.count, { fontSize: starSize - 1 }]}>
          ({count} {count === 1 ? 'review' : 'reviews'})
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  star: {
    lineHeight: undefined,
  },
  starFilled: {
    color: colors.star,
  },
  starEmpty: {
    color: colors.border,
  },
  count: {
    color: colors.muted,
    marginLeft: spacing.xs,
  },
})
