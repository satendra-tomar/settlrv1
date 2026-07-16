import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { colors, radius, spacing, fontSize } from '../../lib/tokens'
import { ReviewItem } from '../ReviewItem'
import { EmptyState } from '../EmptyState'
import SectionTitle from './SectionTitle'
import type { ReviewItem as ReviewItemType } from '../../hooks/useReviews'
import { useRouter } from 'expo-router'

interface ReviewPreviewSectionProps {
  listingId: string
  rating: number
  reviewCount: number
  reviews: ReviewItemType[]
  hasMyReview: boolean
  onWriteReviewPress: () => void
}

export function ReviewPreviewSection({
  listingId,
  rating,
  reviewCount,
  reviews,
  hasMyReview,
  onWriteReviewPress,
}: ReviewPreviewSectionProps) {
  const router = useRouter()

  if (reviews.length === 0) {
    return (
      <View style={styles.container}>
        <SectionTitle title="Reviews" light />
        <EmptyState
          title="No reviews yet"
          subtitle="Be the first to share your experience!"
          action={{ label: 'Write a Review', onPress: onWriteReviewPress }}
          light
        />
      </View>
    )
  }

  // Show only up to 2 recent reviews
  const previewReviews = reviews.slice(0, 2)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.avgRating}>⭐ {rating.toFixed(1)}</Text>
          <Text style={styles.countText}>from {reviewCount} reviews</Text>
        </View>
        <TouchableOpacity
          onPress={onWriteReviewPress}
          activeOpacity={0.8}
          style={styles.writeReviewButton}
        >
          <Text style={styles.writeReviewLink}>
            {hasMyReview ? '✏️ Edit' : '+ Write a review'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reviewsList}>
        {previewReviews.map((review) => (
          <ReviewItem key={review.id} review={review as any} />
        ))}
      </View>

      {reviewCount > previewReviews.length && (
        <TouchableOpacity
          style={styles.viewAllBtn}
          activeOpacity={0.8}
          onPress={() => router.push(`/review/list/${listingId}` as any)}
        >
          <Text style={styles.viewAllText}>See all {reviewCount} reviews</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // margins handled by layout
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerLeft: {},
  avgRating: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -1,
  },
  countText: {
    fontSize: fontSize.sm,
    color: colors.darkMuted,
    fontWeight: '500',
    marginTop: 4,
  },
  writeReviewButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderRadius: radius.full,
  },
  writeReviewLink: {
    fontSize: fontSize.sm,
    color: colors.violetLight,
    fontWeight: '700',
  },
  reviewsList: {
    gap: spacing.lg,
  },
  viewAllBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.darkCard,
    borderWidth: 1,
    borderColor: colors.darkBorder,
    paddingVertical: 16,
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.white,
  },
})
