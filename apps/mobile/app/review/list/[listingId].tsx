import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { useReviews, useMyReview } from '../../../src/hooks/useReviews'
import { useAuth } from '../../../src/hooks/useAuth'
import { colors, spacing, fontSize, radius } from '../../../src/lib/tokens'
import { ReviewItem } from '../../../src/components/ReviewItem'
import { ReviewOverview } from '../../../src/components/detail/ReviewOverview'

type SortOption = 'Helpful' | 'Recent' | 'Highest' | 'Lowest'

export default function ReviewListScreen() {
  const { listingId } = useLocalSearchParams<{ listingId: string }>()
  const { user } = useAuth()
  
  const { data: reviews = [], isLoading } = useReviews(listingId)
  const { data: myReview } = useMyReview(listingId, user?.id ?? null)

  const [sortBy, setSortBy] = useState<SortOption>('Helpful')
  const [filter5Star, setFilter5Star] = useState(false)
  const [filterVerified, setFilterVerified] = useState(false)

  // Derive overview stats
  const rating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0

  // Filter & Sort
  const filteredReviews = reviews.filter((r) => {
    if (filter5Star && r.rating !== 5) return false
    if (filterVerified && !r.is_verified) return false
    return true
  })

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'Helpful') {
      return (b.helpful_count || 0) - (a.helpful_count || 0)
    }
    if (sortBy === 'Recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    if (sortBy === 'Highest') {
      return b.rating - a.rating
    }
    if (sortBy === 'Lowest') {
      return a.rating - b.rating
    }
    return 0
  })

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ title: 'All Reviews' }} />
      
      {isLoading ? (
        <ActivityIndicator color={colors.violet} style={{ flex: 1 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {/* Overview */}
          <ReviewOverview
            listingId={listingId}
            rating={rating}
            reviewCount={reviews.length}
            reviews={reviews}
            hasMyReview={Boolean(myReview)}
          />

          {/* Filters & Sorting */}
          {reviews.length > 0 && (
            <View style={styles.controlsSection}>
              <View style={styles.sortRow}>
                {(['Helpful', 'Recent', 'Highest', 'Lowest'] as SortOption[]).map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, sortBy === opt && styles.chipActive]}
                    onPress={() => setSortBy(opt)}
                  >
                    <Text style={[styles.chipText, sortBy === opt && styles.chipTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[styles.filterBtn, filter5Star && styles.filterBtnActive]}
                  onPress={() => setFilter5Star(!filter5Star)}
                >
                  <Text style={[styles.filterText, filter5Star && styles.filterTextActive]}>
                    ★★★★★ Only
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterBtn, filterVerified && styles.filterBtnActive]}
                  onPress={() => setFilterVerified(!filterVerified)}
                >
                  <Text style={[styles.filterText, filterVerified && styles.filterTextActive]}>
                    ✓ Verified
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Reviews List */}
          <View style={styles.listSection}>
            {sortedReviews.length === 0 && reviews.length > 0 ? (
              <Text style={styles.noMatch}>No reviews match your filters.</Text>
            ) : (
              sortedReviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  controlsSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.darkCard,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  chipActive: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderColor: colors.violetLight,
  },
  chipText: {
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.violetLight,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  filterBtnActive: {
    borderColor: colors.emerald,
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  filterText: {
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.emerald,
  },
  listSection: {
    gap: spacing.md,
  },
  noMatch: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
})
