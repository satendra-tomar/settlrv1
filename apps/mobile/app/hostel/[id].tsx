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
  HOSTEL_SUMMARY,
  HOSTEL_BEST_FOR,
} from '../../src/lib/placeholders'
import type { ReviewItem as ReviewItemType } from '../../src/hooks/useReviews'

const GENDER_LABEL: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  co_ed: 'Co-ed',
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
    if (id) LeadTracker.track({ type: 'view', listingId: id, listingType: 'hostel' })
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

  // ── Derive hostel-specific data ──
  const hd = listing.hostel_details?.[0]

  const quickTags: string[] = []
  if (hd?.gender) quickTags.push(GENDER_LABEL[hd.gender] ?? hd.gender)
  if (hd?.food_included) quickTags.push('Food Included')
  if (hd?.total_rooms) quickTags.push(`${hd.total_rooms} Rooms`)

  const quickFacts: { emoji: string; label: string; value: string }[] = []
  if (hd?.gender) quickFacts.push({ emoji: '👤', label: 'Gender', value: GENDER_LABEL[hd.gender] ?? hd.gender })
  if (hd?.total_rooms != null) quickFacts.push({ emoji: '🛏️', label: 'Rooms', value: String(hd.total_rooms) })
  quickFacts.push({ emoji: '🍽️', label: 'Food', value: hd?.food_included ? 'Included' : 'Not Included' })
  if (hd?.warden_name) quickFacts.push({ emoji: '👤', label: 'Warden', value: hd.warden_name })

  const amenities = (listing.listing_amenities ?? [])
    .filter((la) => la.amenities != null)
    .map((la) => ({ name: la.amenities!.name, icon: la.amenities!.icon }))

  const experienceScores: { label: string; score: number; emoji: string }[] = []
  if (hd?.cleanliness_score != null) experienceScores.push({ label: 'Cleanliness', score: hd.cleanliness_score, emoji: '✨' })
  if (hd?.food_quality_score != null) experienceScores.push({ label: 'Food Quality', score: hd.food_quality_score, emoji: '🍽️' })
  if (hd?.safety_score != null) experienceScores.push({ label: 'Safety', score: hd.safety_score, emoji: '🛡️' })
  if (hd?.study_environment_score != null) experienceScores.push({ label: 'Study Environment', score: hd.study_environment_score, emoji: '📖' })
  if (hd?.warden_support_score != null) experienceScores.push({ label: 'Warden Support', score: hd.warden_support_score, emoji: '👤' })
  if (hd?.location_score != null) experienceScores.push({ label: 'Location', score: hd.location_score, emoji: '📍' })

  const pros = (hd?.pros ?? []).map(text => ({ text }))
  const cons = (hd?.cons ?? []).map(text => ({ text }))
  const roomTypes = hd?.room_types ?? []

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      <ListingDetailLayout
        id={listing.id}
        name={listing.name}
        type="hostel"
        images={listing.listing_images ?? []}
        area={listing.area}
        rating={listing.rating}
        reviewCount={listing.review_count}
        isVerified={listing.is_verified}
        updatedAt={listing.updated_at}
        settlrScore={null}
        summary={listing.description ?? HOSTEL_SUMMARY}
        bestFor={roomTypes.length > 0 ? roomTypes : HOSTEL_BEST_FOR}
        experienceScores={experienceScores.length > 0 ? experienceScores : undefined}
        pros={pros.length > 0 ? pros : undefined}
        cons={cons.length > 0 ? cons : undefined}
        nearbyPlaces={[]}
        quickTags={quickTags}
        quickFacts={quickFacts}
        rentMin={hd?.rent_min ?? null}
        rentMax={hd?.rent_max ?? null}
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
