import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { colors, radius, spacing, fontSize } from '../lib/tokens'
import type { ListingCard as ListingCardType } from '../hooks/useListings'
import { RatingStars } from './RatingStars'

interface ListingCardProps {
  listing: ListingCardType
  onPress: () => void
}

function getPrimaryImage(images: { url: string; is_primary: boolean }[]) {
  const primary = images.find((img) => img.is_primary)
  const url = primary?.url ?? images[0]?.url
  if (!url) return null
  // Append transform params for thumbnail
  return url.includes('?') ? `${url}&width=400&quality=80` : `${url}?width=400&quality=80`
}

export function ListingCard({ listing, onPress }: ListingCardProps) {
  const thumbnailUrl = getPrimaryImage(listing.listing_images ?? [])

  const examTypes =
    listing.coaching_details?.[0]?.subjects ?? []
  const rentMin = listing.hostel_details?.[0]?.rent_min
  const rentMax = listing.hostel_details?.[0]?.rent_max

  const visibleExamTypes = examTypes.slice(0, 2)
  const extraExamTypes = examTypes.length > 2 ? examTypes.length - 2 : 0

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Thumbnail */}
      {thumbnailUrl ? (
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {listing.name}
          </Text>
          {listing.is_verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
        </View>

        {/* Area */}
        {listing.area ? (
          <Text style={styles.area} numberOfLines={1}>
            📍 {listing.area}
          </Text>
        ) : null}

        {/* Rating */}
        <View style={styles.ratingRow}>
          <RatingStars rating={listing.rating} count={listing.review_count} size="sm" />
        </View>

        {/* Type-specific info */}
        {listing.type === 'coaching' && examTypes.length > 0 && (
          <View style={styles.chipRow}>
            {visibleExamTypes.map((et) => (
              <View key={et} style={styles.chip}>
                <Text style={styles.chipText}>{et}</Text>
              </View>
            ))}
            {extraExamTypes > 0 && (
              <View style={[styles.chip, styles.chipMuted]}>
                <Text style={[styles.chipText, styles.chipTextMuted]}>
                  +{extraExamTypes} more
                </Text>
              </View>
            )}
          </View>
        )}

        {listing.type === 'hostel' && (rentMin != null || rentMax != null) && (
          <Text style={styles.rentText}>
            ₹{rentMin?.toLocaleString('en-IN') ?? '?'} –{' '}
            ₹{rentMax?.toLocaleString('en-IN') ?? '?'}/mo
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
  },
  imagePlaceholder: {
    backgroundColor: colors.violetBorder,
  },
  content: {
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  name: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.ink,
    marginRight: spacing.sm,
  },
  verifiedBadge: {
    backgroundColor: colors.verified,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  verifiedText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: '600',
  },
  area: {
    fontSize: fontSize.sm,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  ratingRow: {
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  chip: {
    backgroundColor: colors.violet,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  chipMuted: {
    backgroundColor: colors.border,
  },
  chipText: {
    fontSize: fontSize.xs,
    color: colors.white,
    fontWeight: '600',
  },
  chipTextMuted: {
    color: colors.muted,
  },
  rentText: {
    fontSize: fontSize.sm,
    color: colors.violet,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
})
