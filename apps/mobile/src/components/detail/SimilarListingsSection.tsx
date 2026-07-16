import React, { useMemo } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { spacing } from '../../lib/tokens'
import SectionTitle from './SectionTitle'
import { ListingCard } from '../ListingCard'
import { useAuth } from '../../hooks/useAuth'
import { useFavorites } from '../../hooks/useFavorites'

interface SimilarListingsSectionProps {
  currentListingId: string
  type: 'coaching' | 'hostel'
}

export function SimilarListingsSection({ currentListingId, type }: SimilarListingsSectionProps) {
  const router = useRouter()
  const { user } = useAuth()
  
  // We use favorites as a reliable local cache of listings the user has interacted with.
  // In a full production app, this would query a dedicated `useSimilarListings` endpoint.
  const { data: favorites } = useFavorites(user?.id ?? null)

  const similarListings = useMemo(() => {
    if (!favorites) return []
    return favorites
      .filter((f) => f.listing && f.listing.type === type && f.listing.id !== currentListingId)
      .map((f) => f.listing!)
      .slice(0, 4) // Only show top 4 similar
  }, [favorites, type, currentListingId])

  if (similarListings.length === 0) return null

  const title = type === 'coaching' ? 'Similar Coachings' : 'Similar Hostels'

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SectionTitle title={title} light />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {similarListings.map((listing) => (
          <View key={listing.id} style={styles.cardWrapper}>
            <ListingCard
              listing={listing}
              onPress={() => router.push(`/${type}/${listing.id}`)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // margins handled by layout
  },
  header: {
    paddingHorizontal: spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  cardWrapper: {
    width: 280, // slightly narrower than full screen for horizontal scroll affordance
  },
})
