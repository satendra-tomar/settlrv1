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
import { WhyChooseSection } from './WhyChooseSection'
import { LocationCard } from './LocationCard'
import { ReviewPreviewSection } from './ReviewPreviewSection'
import { SimilarListingsSection } from './SimilarListingsSection'
import { PrimaryActionBar } from './PrimaryActionBar'
import { AmenityGrid } from '../AmenityGrid'
import { ReviewItem } from '../ReviewItem'
import { EmptyState } from '../EmptyState'
import { ContactCard } from './ContactCard'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ListingDetailLayoutProps {
  // Core listing data
  id: string
  name: string
  type: 'coaching' | 'hostel'
  images: { url: string; is_primary: boolean }[]
  area: string | null
  rating: number
  reviewCount: number
  isVerified: boolean
  updatedAt: string

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
  onWriteReviewPress: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
function ListingDetailLayoutComponent(props: ListingDetailLayoutProps) {
  const {
    id,
    name,
    type,
    images,
    area,
    rating,
    reviewCount,
    isVerified,
    updatedAt,
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
          updatedAt={updatedAt}
          settlrScore={settlrScore ?? undefined}
          isFavorited={isFavorited}
          onFavoritePress={onFavoritePress}
        />

        {/* Dark content area */}
        <View style={styles.darkContent}>
          {/* ── 2. Quick Facts (Moved below Hero) ── */}
          {(quickTags.length > 0 || quickFacts.length > 0) && (
            <View style={styles.section}>
              <QuickFactsRow facts={quickFacts} tags={quickTags} />
            </View>
          )}

          {/* ── 2.5 Contact Card ── */}
          <View style={styles.section}>
            <ContactCard
              listingId={id}
              listingType={type}
              name={name}
              area={area}
              phone={phone ?? null}
              whatsapp={whatsapp ?? null}
              website={website ?? null}
              isVerified={isVerified}
            />
          </View>

          {/* ── 3. Why Students Choose This ── */}
          {(bestFor.length > 0 || (experienceScores && experienceScores.length > 0) || (pros && pros.length > 0) || (cons && cons.length > 0)) && (
            <View style={styles.section}>
              <WhyChooseSection
                bestFor={bestFor}
                experienceScores={experienceScores}
                pros={pros}
                cons={cons}
              />
            </View>
          )}
          
          {/* ── 4. About ── */}
          {summary ? (
            <View style={styles.section}>
              <SectionTitle title="About" light size="xl" />
              <SettlrSummary summary={summary} />
            </View>
          ) : null}

          {/* ── 5. Amenities ── */}
          {amenities.length > 0 && (
            <View style={styles.section}>
              <SectionTitle title="Amenities" light />
              <View style={styles.amenityContainer}>
                <AmenityGrid amenities={amenities} />
              </View>
            </View>
          )}

          {/* ── 6. Pricing ── */}
          <View style={styles.section}>
            <PricingSection
              type={type}
              feePerMonth={feePerMonth}
              rentMin={rentMin}
              rentMax={rentMax}
            />
          </View>

          {/* ── 8. Amenities ── */}
          {amenities.length > 0 && (
            <View style={styles.section}>
              <SectionTitle title="Amenities" light />
              <View style={styles.amenityContainer}>
                <AmenityGrid amenities={amenities} />
              </View>
            </View>
          )}

          {/* ── 7. Location ── */}
          {area && (
            <View style={styles.section}>
              <LocationCard area={area} name={name} />
            </View>
          )}

          {/* ── 8. Reviews ── */}
          <View style={styles.section}>
            <ReviewPreviewSection
              listingId={id}
              rating={rating}
              reviewCount={reviewCount}
              reviews={reviews}
              hasMyReview={hasMyReview}
              onWriteReviewPress={onWriteReviewPress}
            />
          </View>

          {/* ── 9. Similar Listings ── */}
          <SimilarListingsSection currentListingId={id} type={type} />

          {/* Bottom spacer for sticky action bar */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Sticky bottom action bar */}
      <PrimaryActionBar
        listingId={id}
        listingType={type}
        isFavorited={isFavorited}
        onFavoritePress={onFavoritePress}
        name={name}
        area={area}
        phone={phone ?? null}
        whatsapp={whatsapp ?? null}
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
