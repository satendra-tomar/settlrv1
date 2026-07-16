import React, { useRef, useState, useEffect, memo } from 'react'
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native'
import { Image } from 'expo-image'
import { colors, radius, spacing, fontSize } from '../lib/tokens'
import type { ListingCard as ListingCardType } from '../hooks/useListings'

interface ListingCardProps {
  listing: ListingCardType
  onPress: () => void
  onSavePress?: () => void
  isSaved?: boolean
}

function getPrimaryImage(images: { url: string; is_primary: boolean }[]) {
  const primary = images.find((img) => img.is_primary)
  const url = primary?.url ?? images[0]?.url
  if (!url) return null
  return url.includes('?') ? `${url}&width=400&quality=80` : `${url}?width=400&quality=80`
}

function ShimmerPlaceholder({ style }: { style: any }) {
  const opacity = useRef(new Animated.Value(0.3)).current
  
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [opacity])
  
  return <Animated.View style={[style, { opacity, backgroundColor: colors.border }]} />
}

export const ListingCard = memo(function ListingCard({
  listing,
  onPress,
  onSavePress,
  isSaved,
}: ListingCardProps) {
  const scale = useRef(new Animated.Value(1)).current
  const [imgLoaded, setImgLoaded] = useState(false)
  const thumbnailUrl = getPrimaryImage(listing.listing_images ?? [])

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 30, bounciness: 4 }).start()
  }
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }).start()
  }

  const examTypes = listing.coaching_details?.[0]?.subjects ?? []
  
  let chips: string[] = []
  if (listing.type === 'coaching') {
    chips = examTypes.slice(0, 3)
  }

  let priceDisplay = 'Contact for Fees'
  if (listing.type === 'hostel') {
    const rentMin = listing.hostel_details?.[0]?.rent_min
    if (rentMin) {
      priceDisplay = `₹${rentMin.toLocaleString('en-IN')}/month`
    }
  } else if (listing.type === 'coaching') {
    const fee = (listing.coaching_details?.[0] as any)?.fee_per_month
    if (fee) {
      priceDisplay = `₹${fee.toLocaleString('en-IN')} Course`
    }
  }

  const ratingDisplay = listing.rating > 0 ? listing.rating.toFixed(1) : 'New'

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        
        {/* HERO IMAGE */}
        <View style={styles.imageContainer}>
          {thumbnailUrl ? (
            <>
              {!imgLoaded && <ShimmerPlaceholder style={StyleSheet.absoluteFill as any} />}
              <Image
                source={{ uri: thumbnailUrl }}
                style={StyleSheet.absoluteFill as any}
                contentFit="cover"
                transition={300}
                onLoad={() => setImgLoaded(true)}
              />
            </>
          ) : (
            <View style={styles.emptyImageContainer}>
              <Text style={styles.emptyImageText}>
                {listing.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Bottom Gradient Overlay Approximation */}
          <View style={styles.imageOverlay} />

          {/* Top-Left Verified Badge */}
          {listing.is_verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}

          {/* Top-Right Save Button */}
          {onSavePress && (
            <Pressable
              onPress={onSavePress}
              style={styles.saveButton}
              hitSlop={12}
            >
              <Text style={{ fontSize: 20, color: isSaved ? colors.rose : colors.white, top: Platform.OS === 'ios' ? 1 : 0 }}>
                {isSaved ? '♥' : '♡'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {listing.name}
          </Text>

          {/* Rating Row (Preferred: ⭐ 4.8 • 218) */}
          <View style={styles.trustRow}>
            <Text style={styles.starText}>⭐</Text>
            <Text style={styles.trustTextValue}>{ratingDisplay}</Text>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.trustTextCount}>{listing.review_count} Reviews</Text>
          </View>

          {/* Location */}
          {listing.area && (
            <Text style={styles.location} numberOfLines={1}>
              📍 {listing.area}
            </Text>
          )}

          {/* Highlights */}
          {chips.length > 0 && (
            <View style={styles.chipRow}>
              {chips.map((chip) => (
                <View key={chip} style={styles.chip}>
                  <Text style={styles.chipText}>{chip}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Footer (Price & Explore Pill) */}
          <View style={styles.footerRow}>
            <Text style={styles.price} numberOfLines={1}>{priceDisplay}</Text>
            <View style={styles.ctaPill}>
              <Text style={styles.ctaText}>Explore</Text>
            </View>
          </View>

        </View>
      </Animated.View>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    marginBottom: spacing.xl, // Generous whitespace
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)', // Subtle border
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 180, // Slightly larger
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },
  emptyImageContainer: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: '#F3F4F6', // monochrome
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  emptyImageText: {
    fontSize: 64,
    fontWeight: '800',
    color: '#D1D5DB', // muted letter
  },
  imageOverlay: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: 'rgba(0,0,0,0.25)', // very subtle darkening
    top: '55%', // gradient bottom approximation
  },
  verifiedBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(16, 185, 129, 0.95)', // emerald translucent
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    shadowColor: colors.ink,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  verifiedText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  saveButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)', // glass effect
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.md, // generous breathing room
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.ink,
    lineHeight: 24, // Premium spacing
    marginBottom: spacing.xs,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  starText: {
    fontSize: fontSize.sm,
    marginRight: 4,
  },
  trustTextValue: {
    fontSize: fontSize.md,
    color: colors.ink,
    fontWeight: '700',
  },
  bullet: {
    fontSize: fontSize.xs,
    color: colors.muted,
    marginHorizontal: 6,
  },
  trustTextCount: {
    fontSize: fontSize.sm,
    color: colors.muted,
    fontWeight: '500',
  },
  location: {
    fontSize: fontSize.sm,
    color: colors.muted,
    marginBottom: spacing.md, // breathe
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap', // never wrap
    overflow: 'hidden',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    backgroundColor: '#F3F4F6', // calmer
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 11,
    color: colors.ink,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.ink,
    flex: 1,
  },
  ctaPill: {
    backgroundColor: colors.ink,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  ctaText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
})
