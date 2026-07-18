import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { colors, radius, spacing, fontSize } from '../../lib/tokens'
import { ReviewItem } from '../ReviewItem'
import { ReviewOverview } from './ReviewOverview'
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
        <ReviewOverview
          listingId={listingId}
          rating={rating}
          reviewCount={reviewCount}
          reviews={reviews}
          hasMyReview={hasMyReview}
        />
      </View>
    )
  }

  // Show only up to 2 recent reviews for preview
  const previewReviews = reviews.slice(0, 2)

  return (
    <View style={styles.container}>
      <ReviewOverview
        listingId={listingId}
        rating={rating}
        reviewCount={reviewCount}
        reviews={reviews}
        hasMyReview={hasMyReview}
      />

      <View style={styles.latestReviewsHeader}>
        <Text style={styles.latestReviewsTitle}>Latest Reviews</Text>
      </View>

      <View style={styles.reviewsList}>
        {previewReviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
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
  latestReviewsHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  latestReviewsTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.white,
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
