import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { useListingDetail } from '../../src/hooks/useListingDetail'
import { useReviews, useMyReview } from '../../src/hooks/useReviews'
import { useIsFavorited, useToggleFavorite } from '../../src/hooks/useFavorites'
import { useAuth } from '../../src/hooks/useAuth'
import { recordLead } from '../../src/lib/leads'
import { ImageGallery } from '../../src/components/ImageGallery'
import { RatingStars } from '../../src/components/RatingStars'
import { ActionBar } from '../../src/components/ActionBar'
import { AmenityGrid } from '../../src/components/AmenityGrid'
import { ReviewItem } from '../../src/components/ReviewItem'
import { EmptyState } from '../../src/components/EmptyState'
import { AuthPromptModal } from '../../src/components/AuthPromptModal'
import { colors, spacing, fontSize, radius } from '../../src/lib/tokens'
import type { ReviewItem as ReviewItemType } from '../../src/hooks/useReviews'

const GENDER_LABEL: Record<string, string> = {
  male: '👦 Male',
  female: '👩 Female',
  co_ed: '🏫 Co-ed',
}

export default function HostelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authReason, setAuthReason] = useState('')
  const [pendingAction, setPendingAction] = useState<(() => void) | undefined>()

  const { data: listing, isLoading, error, refetch } = useListingDetail(id, 'hostel')
  const { data: reviews } = useReviews(id)
  const { data: myReview } = useMyReview(id, user?.id ?? null)
  const { data: favRow } = useIsFavorited(id, user?.id ?? null)
  const toggleFavorite = useToggleFavorite()

  // Fire-and-forget lead view on mount
  React.useEffect(() => {
    if (id) recordLead(id, 'view')
  }, [id])

  function handleFavorite() {
    if (!user) {
      setAuthReason('Log in to save this hostel')
      setPendingAction(() => () => doToggleFavorite())
      setShowAuthModal(true)
      return
    }
    doToggleFavorite()
  }

  function doToggleFavorite() {
    if (!user) return
    toggleFavorite.mutate({
      listingId: id,
      userId: user.id,
      existingFavoriteId: favRow?.id,
    })
  }

  function handleWriteReview() {
    if (!user) {
      setAuthReason('Log in to write a review')
      setShowAuthModal(true)
      return
    }
    router.push(`/review/write/${id}`)
  }

  const isFavorited = Boolean(favRow)

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.violet} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    )
  }

  if (error || !listing) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState
          title="Couldn't load this listing"
          subtitle="Please check your connection and try again."
          action={{ label: 'Retry', onPress: () => refetch() }}
        />
      </SafeAreaView>
    )
  }

  const hd = listing.hostel_details?.[0]

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen
        options={{
          title: listing.name,
          headerRight: () => (
            <TouchableOpacity onPress={handleFavorite} style={styles.heartButton}>
              <Text style={{ fontSize: 22 }}>{isFavorited ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 1. Gallery */}
        <ImageGallery images={listing.listing_images ?? []} />

        {/* 2. Header */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{listing.name}</Text>
            {listing.is_verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>
          {listing.area ? (
            <Text style={styles.area}>📍 {listing.area}</Text>
          ) : null}
          <RatingStars rating={listing.rating} count={listing.review_count} size="md" />
        </View>

        {/* 3. Hostel facts */}
        {hd && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.factsGrid}>
              {hd.gender ? (
                <Text style={styles.fact}>{GENDER_LABEL[hd.gender] ?? hd.gender}</Text>
              ) : null}
              {(hd.rent_min != null || hd.rent_max != null) && (
                <Text style={styles.fact}>
                  💰 ₹{hd.rent_min?.toLocaleString('en-IN') ?? '?'} –{' '}
                  ₹{hd.rent_max?.toLocaleString('en-IN') ?? '?'}/mo
                </Text>
              )}
              {hd.total_rooms != null && (
                <Text style={styles.fact}>🛏️ {hd.total_rooms} rooms</Text>
              )}
              <Text style={styles.fact}>
                {hd.food_included ? '✅ Food included' : '❌ Food not included'}
              </Text>
              {hd.warden_name && (
                <Text style={styles.fact}>👤 Warden: {hd.warden_name}</Text>
              )}
            </View>
          </View>
        )}

        {/* 4. Description */}
        {listing.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>
        ) : null}

        {/* 5. Amenities */}
        {listing.listing_amenities && listing.listing_amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <AmenityGrid
              amenities={listing.listing_amenities
                .filter((la) => la.amenities != null)
                .map((la) => ({
                  name: la.amenities!.name,
                  icon: la.amenities!.icon,
                }))}
            />
          </View>
        )}

        {/* 6. Action bar */}
        <View style={styles.section}>
          <ActionBar
            listingId={id}
            phone={listing.phone}
            whatsapp={listing.whatsapp}
            website={listing.website_url}
            planTier={listing.plan_tier}
          />
        </View>

        {/* 7. Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity onPress={handleWriteReview} activeOpacity={0.8}>
              <Text style={styles.writeReviewLink}>
                {myReview ? '✏️ Edit your review' : '+ Write a review'}
              </Text>
            </TouchableOpacity>
          </View>

          {!reviews || reviews.length === 0 ? (
            <EmptyState
              title="No reviews yet"
              subtitle="Be the first to share your experience!"
              action={{ label: 'Write a Review', onPress: handleWriteReview }}
            />
          ) : (
            reviews.map((review: ReviewItemType) => (
              <ReviewItem key={review.id} review={review as any} />
            ))
          )}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      <AuthPromptModal
        visible={showAuthModal}
        reason={authReason}
        onClose={() => setShowAuthModal(false)}
        pendingAction={pendingAction}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  heartButton: {
    padding: spacing.sm,
  },
  section: {
    padding: spacing.md,
    paddingBottom: 0,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  name: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.ink,
  },
  verifiedBadge: {
    backgroundColor: colors.verified,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginTop: 3,
  },
  verifiedText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: '700',
  },
  area: {
    fontSize: fontSize.md,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  factsGrid: {
    gap: spacing.sm,
  },
  fact: {
    fontSize: fontSize.sm,
    color: colors.ink,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.muted,
    lineHeight: 24,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  writeReviewLink: {
    fontSize: fontSize.sm,
    color: colors.violet,
    fontWeight: '600',
  },
})
