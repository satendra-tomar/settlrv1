import React from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useFeaturedListings } from '../../src/hooks/useListings'
import { ListingCard } from '../../src/components/ListingCard'
import { SkeletonCard } from '../../src/components/SkeletonCard'
import { EmptyState } from '../../src/components/EmptyState'
import { colors, spacing, fontSize, radius } from '../../src/lib/tokens'

const SHORTCUTS = [
  { label: '🏛️ NEET Coaching', params: 'type=coaching&examTypes=NEET' },
  { label: '🔬 JEE Coaching', params: 'type=coaching&examTypes=JEE' },
  { label: '👩 Girls PG', params: 'type=hostel&gender=female' },
  { label: '👦 Boys PG', params: 'type=hostel&gender=male' },
  { label: '💰 Under ₹8,000', params: 'type=hostel&rentMax=8000' },
]

export default function HomeScreen() {
  const router = useRouter()
  const { data: featured, isLoading, error, refetch } = useFeaturedListings()

  function handleShortcut(params: string) {
    router.push(`/(tabs)/search?${params}`)
  }

  function navigateToListing(id: string, type: string) {
    if (type === 'coaching') router.push(`/coaching/${id}`)
    else router.push(`/hostel/${id}`)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Discover Indore</Text>
          <Text style={styles.headingMain}>Find your perfect</Text>
          <Text style={[styles.headingMain, { color: colors.violet }]}>
            coaching & stay
          </Text>
        </View>

        {/* Tappable search bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.8}
        >
          <Text style={styles.searchBarText}>🔍  Search coaching or hostel…</Text>
        </TouchableOpacity>

        {/* Quick filter shortcuts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Filters</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.shortcutsRow}
        >
          {SHORTCUTS.map((s) => (
            <TouchableOpacity
              key={s.label}
              style={styles.shortcutChip}
              onPress={() => handleShortcut(s.params)}
              activeOpacity={0.8}
            >
              <Text style={styles.shortcutText}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured listings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Listings</Text>
        </View>

        {error ? (
          <EmptyState
            title="Couldn't load listings"
            subtitle="Check your connection and try again."
            action={{ label: 'Retry', onPress: refetch }}
          />
        ) : isLoading ? (
          <FlatList
            horizontal
            data={Array(4).fill(null)}
            keyExtractor={(_, i) => `sk-${i}`}
            renderItem={() => (
              <View style={styles.featuredCardWrapper}>
                <SkeletonCard />
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
            scrollEnabled={false}
          />
        ) : !featured || featured.length === 0 ? (
          <EmptyState
            title="No listings yet"
            subtitle="Featured coaching institutes and hostels will appear here."
            action={{ label: 'Browse All', onPress: () => router.push('/(tabs)/search') }}
          />
        ) : (
          <FlatList
            horizontal
            data={featured}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.featuredCardWrapper}>
                <ListingCard
                  listing={item}
                  onPress={() => navigateToListing(item.id, item.type)}
                />
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: fontSize.sm,
    color: colors.muted,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  headingMain: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.ink,
    lineHeight: 36,
  },
  searchBar: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.violetBorder,
    shadowColor: colors.violet,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchBarText: {
    fontSize: fontSize.md,
    color: colors.muted,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.ink,
  },
  shortcutsRow: {
    paddingLeft: spacing.xl,
    paddingRight: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  shortcutChip: {
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.violetBorder,
    shadowColor: colors.violet,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  shortcutText: {
    fontSize: fontSize.sm,
    color: colors.ink,
    fontWeight: '500',
  },
  featuredList: {
    paddingLeft: spacing.xl,
    paddingRight: spacing.md,
    paddingBottom: spacing.sm,
  },
  featuredCardWrapper: {
    width: 280,
    marginRight: spacing.md,
  },
})
