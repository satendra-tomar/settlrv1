import React, { useState } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import * as Linking from 'expo-linking'
import { useListingDetail } from '../../src/hooks/useListingDetail'
import { useReviews, useMyReview } from '../../src/hooks/useReviews'
import { useIsFavorited, useToggleFavorite } from '../../src/hooks/useFavorites'
import { useAuth } from '../../src/hooks/useAuth'
import { LeadTracker } from '../../src/lib/leads'
import { EmptyState } from '../../src/components/EmptyState'
import { DetailSkeleton } from '../../src/components/detail/DetailSkeleton'
import { AuthPromptModal } from '../../src/components/AuthPromptModal'
import { ListingDetailLayout } from '../../src/components/detail/ListingDetailLayout'
import { colors } from '../../src/lib/tokens'
import {
  COACHING_SUMMARY,
  COACHING_BEST_FOR,
} from '../../src/lib/placeholders'
import type { ReviewItem as ReviewItemType } from '../../src/hooks/useReviews'

export default function CoachingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authReason, setAuthReason] = useState('')
  const [pendingAction, setPendingAction] = useState<(() => void) | undefined>()

  const { data: listing, isLoading, error, refetch } = useListingDetail(id, 'coaching')
  const { data: reviews } = useReviews(id)
  const { data: myReview } = useMyReview(id, user?.id ?? null)
  const { data: favRow } = useIsFavorited(id, user?.id ?? null)
  const toggleFavorite = useToggleFavorite()

  // Fire-and-forget lead view on mount
  React.useEffect(() => {
    if (id) LeadTracker.track({ type: 'view', listingId: id, listingType: 'coaching' })
  }, [id])

  function handleFavorite() {
    if (!user) {
      setAuthReason('Log in to save this coaching institute')
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
        <DetailSkeleton />
      </SafeAreaView>
    )
  }

  // ── Error ──
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

  // ── Derive coaching-specific data ──
  const cd = listing.coaching_details?.[0]
  const subjects = cd?.subjects ?? []

  const quickTags = subjects.slice(0, 4)

  const quickFacts: { emoji: string; label: string; value: string }[] = []
  if (cd?.established_year) quickFacts.push({ emoji: '🏛️', label: 'Est.', value: String(cd.established_year) })
  if (cd?.faculty_count) quickFacts.push({ emoji: '👩‍🏫', label: 'Faculty', value: String(cd.faculty_count) })
  if (cd?.has_demo_class) quickFacts.push({ emoji: '✅', label: 'Demo', value: 'Available' })
  if (cd?.has_online_classes) quickFacts.push({ emoji: '💻', label: 'Online', value: 'Available' })

  const amenities = (listing.listing_amenities ?? [])
    .filter((la) => la.amenities != null)
    .map((la) => ({ name: la.amenities!.name, icon: la.amenities!.icon }))

  const experienceScores: { label: string; score: number; emoji: string }[] = []
  if (cd?.teaching_score != null) experienceScores.push({ label: 'Teaching', score: cd.teaching_score, emoji: '📚' })
  if (cd?.notes_score != null) experienceScores.push({ label: 'Notes', score: cd.notes_score, emoji: '📝' })
  if (cd?.test_series_score != null) experienceScores.push({ label: 'Test Series', score: cd.test_series_score, emoji: '📊' })
  if (cd?.doubt_support_score != null) experienceScores.push({ label: 'Doubt Support', score: cd.doubt_support_score, emoji: '🙋' })
  if (cd?.competition_score != null) experienceScores.push({ label: 'Competition', score: cd.competition_score, emoji: '🏆' })
  if (cd?.personal_attention_score != null) experienceScores.push({ label: 'Personal Attention', score: cd.personal_attention_score, emoji: '🎯' })

  const pros = (cd?.pros ?? []).map(text => ({ text }))
  const cons = (cd?.cons ?? []).map(text => ({ text }))

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      <ListingDetailLayout
        id={listing.id}
        name={listing.name}
        type="coaching"
        images={listing.listing_images ?? []}
        area={listing.area}
        rating={listing.rating}
        reviewCount={listing.review_count}
        isVerified={listing.is_verified}
        updatedAt={listing.updated_at}
        settlrScore={null}
        summary={listing.description ?? COACHING_SUMMARY}
        bestFor={subjects.length > 0 ? subjects : COACHING_BEST_FOR}
        experienceScores={experienceScores.length > 0 ? experienceScores : undefined}
        pros={pros.length > 0 ? pros : undefined}
        cons={cons.length > 0 ? cons : undefined}
        nearbyPlaces={[]}
        quickTags={quickTags}
        quickFacts={quickFacts}
        feePerMonth={cd?.fee_per_month ?? null}
        amenities={amenities}
        reviews={(reviews ?? []) as ReviewItemType[]}
        hasMyReview={Boolean(myReview)}
        isFavorited={isFavorited}
        phone={listing.phone}
        whatsapp={listing.whatsapp}
        website={listing.website_url}
        isPaid={listing.plan_tier === 'paid'}
        onFavoritePress={handleFavorite}
        onWriteReviewPress={handleWriteReview}
      />

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
    backgroundColor: colors.dark,
  },
})
