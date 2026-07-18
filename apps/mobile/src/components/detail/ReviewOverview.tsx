import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { colors, radius, spacing, fontSize } from '../../lib/tokens'
import type { ReviewItem } from '../../hooks/useReviews'
import SectionTitle from './SectionTitle'
import { RatingStars } from '../RatingStars'
import { useRouter } from 'expo-router'

interface ReviewOverviewProps {
  listingId: string
  rating: number
  reviewCount: number
  reviews: ReviewItem[]
  hasMyReview: boolean
}

export function ReviewOverview({
  listingId,
  rating,
  reviewCount,
  reviews,
  hasMyReview,
}: ReviewOverviewProps) {
  const router = useRouter()

  // Calculate distribution
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating as keyof typeof distribution]++
    }
  })

  const getPercentage = (count: number) => {
    if (reviewCount === 0) return 0
    return Math.round((count / reviewCount) * 100)
  }

  const handleWriteReview = () => {
    router.push(`/review/write/${listingId}` as any)
  }

  return (
    <View style={styles.container}>
      <SectionTitle title="Reviews" light size="xl" />

      {reviewCount > 0 ? (
        <View style={styles.content}>
          <View style={styles.summaryCol}>
            <Text style={styles.avgRating}>{rating.toFixed(1)}</Text>
            <RatingStars rating={rating} size="md" />
            <Text style={styles.countText}>{reviewCount} Reviews</Text>
          </View>

          <View style={styles.barsCol}>
            {[5, 4, 3, 2, 1].map(stars => {
              const count = distribution[stars as keyof typeof distribution]
              const percent = getPercentage(count)
              return (
                <View key={stars} style={styles.barRow}>
                  <Text style={styles.barLabel}>{stars}</Text>
                  <Text style={styles.starIcon}>★</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${percent}%` }]} />
                  </View>
                  <Text style={styles.percentText}>{percent}%</Text>
                </View>
              )
            })}
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptySub}>Be the first student to share your experience.</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.writeButton}
        onPress={handleWriteReview}
        activeOpacity={0.8}
      >
        <Text style={styles.writeButtonText}>
          {hasMyReview ? 'Edit Your Review' : 'Write a Review'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  content: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  summaryCol: {
    alignItems: 'center',
    width: 100,
  },
  avgRating: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -2,
    marginBottom: spacing.xs,
  },
  countText: {
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  barsCol: {
    flex: 1,
    gap: spacing.sm,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  barLabel: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: '700',
    width: 10,
    textAlign: 'right',
  },
  starIcon: {
    color: colors.star,
    fontSize: 10,
    marginRight: spacing.xs,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.violetLight,
    borderRadius: radius.full,
  },
  percentText: {
    color: colors.muted,
    fontSize: 10,
    width: 24,
    textAlign: 'right',
  },
  writeButton: {
    backgroundColor: colors.violet,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  writeButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  emptySub: {
    fontSize: fontSize.sm,
    color: colors.muted,
    textAlign: 'center',
  },
})
