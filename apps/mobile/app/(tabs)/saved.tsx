import React from 'react'
import { View, FlatList, Text, SafeAreaView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../../src/hooks/useAuth'
import { useFavorites } from '../../src/hooks/useFavorites'
import { useToggleFavorite } from '../../src/hooks/useFavorites'
import { ListingCard } from '../../src/components/ListingCard'
import { EmptyState } from '../../src/components/EmptyState'
import { SkeletonCard } from '../../src/components/SkeletonCard'
import { colors, spacing, fontSize } from '../../src/lib/tokens'

export default function SavedScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: favorites, isLoading, refetch } = useFavorites(user?.id ?? null)
  const toggleFavorite = useToggleFavorite()

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.pageTitle}>Saved</Text>
        <EmptyState
          title="Save listings you love"
          subtitle="Log in to save coaching institutes and hostels so you can compare them later."
          action={{ label: 'Log In', onPress: () => router.push('/(auth)/login') }}
        />
      </SafeAreaView>
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.pageTitle}>Saved</Text>
        <View style={styles.list}>
          {Array(4).fill(null).map((_, i) => <SkeletonCard key={i} />)}
        </View>
      </SafeAreaView>
    )
  }

  if (!favorites || favorites.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.pageTitle}>Saved</Text>
        <EmptyState
          title="No saved listings yet"
          subtitle="Tap the heart icon on any listing to save it here."
          action={{ label: 'Browse Listings', onPress: () => router.push('/(tabs)/search') }}
        />
      </SafeAreaView>
    )
  }

  function navigateToListing(id: string, type: string) {
    if (type === 'coaching') router.push(`/coaching/${id}`)
    else router.push(`/hostel/${id}`)
  }

  function handleRemoveFavorite(favoriteId: string, listingId: string) {
    if (!user) return
    toggleFavorite.mutate({
      listingId,
      userId: user.id,
      existingFavoriteId: favoriteId,
    })
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.pageTitle}>Saved</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          item.listing ? (
            <ListingCard
              listing={item.listing}
              onPress={() => navigateToListing(item.listing.id, item.listing.type)}
            />
          ) : null
        )}
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pageTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.ink,
    padding: spacing.xl,
    paddingBottom: spacing.sm,
  },
  list: {
    padding: spacing.md,
    paddingTop: 0,
  },
})
