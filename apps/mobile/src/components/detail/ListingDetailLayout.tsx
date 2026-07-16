import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, spacing, fontSize, radius } from '../../lib/tokens'
import type { ExperienceScore, ProConItem, NearbyPlace } from '../../lib/placeholders'
import type { ReviewItem as ReviewItemType } from '../../hooks/useReviews'

import { ListingHero } from './ListingHero'
import SectionTitle from './SectionTitle'
import SettlrSummary from './SettlrSummary'
import BestForChips from './BestForChips'
import ExperienceGrid from './ExperienceGrid'
import ProsConsCard from './ProsConsCard'
import PricingSection from './PricingSection'
import QuickFactsRow from './QuickFactsRow'
import NearbySection from './NearbySection'
import { PrimaryActionBar } from './PrimaryActionBar'
import { AmenityGrid } from '../AmenityGrid'
import { ReviewItem } from '../ReviewItem'
import { EmptyState } from '../EmptyState'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ListingDetailLayoutProps {
  // Core listing data
  name: string
  type: 'coaching' | 'hostel'
  images: { url: string; is_primary: boolean }[]
  area: string | null
  rating: number
  reviewCount: number
  isVerified: boolean

  // Placeholder data / Real data
  settlrScore?: number | null
  summary: string
  bestFor: string[]
  experienceScores?: ExperienceScore[]
  pros?: ProConItem[]
  cons?: ProConItem[]
  nearbyPlaces?: NearbyPlace[]

  // Quick tags for hero
  quickTags: string[]

  // Quick facts
  quickFacts: { emoji: string; label: string; value: string }[]

  // Pricing
  feePerMonth?: number | null
  rentMin?: number | null
  rentMax?: number | null

  // Amenities
  amenities: { name: string; icon: string | null }[]

  // Reviews
  reviews: ReviewItemType[]
  hasMyReview: boolean

  // Auth & interaction
  isFavorited: boolean
  phone?: string | null
  whatsapp?: string | null
  website?: string | null
  isPaid: boolean

  // Callbacks (business logic stays in screen)
  onFavoritePress: () => void
  onCallPress?: () => void
  onWhatsAppPress?: () => void
  onWebsitePress?: () => void
  onSharePress?: () => void
  onWriteReviewPress: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
function ListingDetailLayoutComponent(props: ListingDetailLayoutProps) {
  const {
    name,
    type,
    images,
    area,
    rating,
    reviewCount,
    isVerified,
    settlrScore,
    summary,
    bestFor,
    experienceScores,
    pros,
    cons,
    nearbyPlaces,
    quickTags,
    quickFacts,
    feePerMonth,
    rentMin,
    rentMax,
    amenities,
    reviews,
    hasMyReview,
    isFavorited,
    phone,
    whatsapp,
    website,
    isPaid,
    onFavoritePress,
    onCallPress,
    onWhatsAppPress,
    onWebsitePress,
    onSharePress,
    onWriteReviewPress,
  } = props

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── 1. Hero ── */}
        <ListingHero
          images={images}
          name={name}
          area={area}
          rating={rating}
          reviewCount={reviewCount}
          isVerified={isVerified}
          settlrScore={settlrScore ?? undefined}
          quickTags={quickTags}
          isFavorited={isFavorited}
          onFavoritePress={onFavoritePress}
          onCallPress={onCallPress}
          onSharePress={onSharePress}
        />

        {/* Dark content area */}
        <View style={styles.darkContent}>
          {/* ── 2. Summary ── */}
          {summary ? (
            <View style={styles.section}>
              <SectionTitle title="About" light size="xl" />
              <SettlrSummary summary={summary} />
            </View>
          ) : null}

          {/* ── 3. Best For ── */}
          {bestFor.length > 0 && (
            <View style={styles.section}>
              <SectionTitle title="Best For" light />
              <BestForChips items={bestFor} />
            </View>
          )}

          {/* ── 4. Student Experience ── */}
          {experienceScores && experienceScores.length > 0 && (
            <View style={styles.section}>
              <SectionTitle title="Student Experience" subtitle="Based on reviews and ratings" light />
              <ExperienceGrid scores={experienceScores} />
            </View>
          )}

          {/* ── 5. Pros & Cons ── */}
          {((pros && pros.length > 0) || (cons && cons.length > 0)) && (
            <View style={styles.section}>
              <SectionTitle title="What Students Say" light />
              <ProsConsCard pros={pros ?? []} cons={cons ?? []} />
            </View>
          )}

          {/* ── 6. Pricing ── */}
          <View style={styles.section}>
            <SectionTitle title="Pricing" light />
            <PricingSection
              type={type}
              feePerMonth={feePerMonth}
              rentMin={rentMin}
              rentMax={rentMax}
            />
          </View>

          {/* ── 7. Quick Facts ── */}
          {quickFacts.length > 0 && (
            <View style={styles.section}>
              <SectionTitle title="Quick Facts" light />
              <QuickFactsRow facts={quickFacts} />
            </View>
          )}

          {/* ── 8. Amenities ── */}
          {amenities.length > 0 && (
            <View style={styles.section}>
              <SectionTitle title="Amenities" light />
              <View style={styles.amenityContainer}>
                <AmenityGrid amenities={amenities} />
              </View>
            </View>
          )}

          {/* ── 9. Reviews ── */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <SectionTitle
                title={`Reviews${reviewCount > 0 ? ` (${reviewCount})` : ''}`}
                light
              />
              <TouchableOpacity
                onPress={onWriteReviewPress}
                activeOpacity={0.8}
                accessibilityLabel={hasMyReview ? 'Edit your review' : 'Write a review'}
                style={styles.writeReviewButton}
              >
                <Text style={styles.writeReviewLink}>
                  {hasMyReview ? '✏️ Edit' : '+ Write a review'}
                </Text>
              </TouchableOpacity>
            </View>

            {reviews.length === 0 ? (
              <EmptyState
                title="No reviews yet"
                subtitle="Be the first to share your experience!"
                action={{ label: 'Write a Review', onPress: onWriteReviewPress }}
                light
              />
            ) : (
              reviews.map((review) => (
                <ReviewItem key={review.id} review={review as any} />
              ))
            )}
          </View>

          {/* ── 10. Nearby (Removed for MVP) ── */}

          {/* Bottom spacer for sticky action bar */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Sticky bottom action bar */}
      <PrimaryActionBar
        phone={phone}
        whatsapp={whatsapp}
        website={website}
        isPaid={isPaid}
        onCallPress={onCallPress}
        onWhatsAppPress={onWhatsAppPress}
        onWebsitePress={onWebsitePress}
      />
    </View>
  )
}

export const ListingDetailLayout = React.memo(ListingDetailLayoutComponent)
ListingDetailLayout.displayName = 'ListingDetailLayout'

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  darkContent: {
    backgroundColor: colors.dark,
    paddingTop: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: 56,
  },
  amenityContainer: {
    backgroundColor: colors.darkCard,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  writeReviewButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderRadius: radius.full,
  },
  writeReviewLink: {
    fontSize: fontSize.sm,
    color: colors.violetLight,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 140, // Increased for taller CTA + shadow
  },
})
