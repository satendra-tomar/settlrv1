import React, { useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useFeaturedListings } from '../../src/hooks/useListings'
import { ListingCard } from '../../src/components/ListingCard'
import { SkeletonCard } from '../../src/components/SkeletonCard'
import { EmptyState } from '../../src/components/EmptyState'
import { colors, spacing, fontSize, radius } from '../../src/lib/tokens'

// --- HELPER COMPONENTS ---

function HomeHero() {
  const hour = new Date().getHours()
  let greeting = 'Good Evening 🌙'
  if (hour < 12) greeting = 'Good Morning 👋'
  else if (hour < 17) greeting = 'Good Afternoon ☀️'

  return (
    <View style={styles.hero}>
      <Text style={styles.greeting}>{greeting}</Text>
      <View style={styles.headlineContainer}>
        <Text style={styles.headline}>Ready to find your</Text>
        <Text style={styles.headlineAccent}>perfect coaching?</Text>
      </View>
      <Text style={styles.supportingText}>
        Discover trusted institutes and hostels in Indore.
      </Text>
    </View>
  )
}

function PremiumSearch({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.searchContainer}>
      <TouchableOpacity style={styles.searchBar} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.searchInner}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchText}>Search coaching, hostel or area...</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

function QuickCategories({ onCategoryPress }: { onCategoryPress: (type: string) => void }) {
  const categories = [
    { id: 'coaching', label: '🎯 Coaching', disabled: false },
    { id: 'hostel', label: '🏠 Hostels', disabled: false },
    { id: 'library', label: '📚 Libraries', disabled: true },
    { id: 'mess', label: '🍱 Mess', disabled: true },
  ]

  return (
    <View style={styles.categoriesRow}>
      {categories.map((c) => (
        <TouchableOpacity
          key={c.id}
          style={[styles.categoryPill, c.disabled && styles.categoryDisabled]}
          onPress={() => !c.disabled && onCategoryPress(c.id)}
          activeOpacity={c.disabled ? 1 : 0.7}
        >
          <Text style={[styles.categoryText, c.disabled && styles.categoryTextDisabled]}>
            {c.label}
          </Text>
          {c.disabled && <Text style={styles.comingSoon}>Coming Soon</Text>}
        </TouchableOpacity>
      ))}
    </View>
  )
}

function PopularSearches({ onSearchPress }: { onSearchPress: (params: string) => void }) {
  const searches = [
    { label: 'SSC', params: 'type=coaching&examTypes=SSC' },
    { label: 'Banking', params: 'type=coaching&examTypes=Banking' },
    { label: 'NEET', params: 'type=coaching&examTypes=NEET' },
    { label: 'JEE', params: 'type=coaching&examTypes=JEE' },
    { label: 'Girls Hostel', params: 'type=hostel&gender=female' },
    { label: 'Boys Hostel', params: 'type=hostel&gender=male' },
    { label: 'Vijay Nagar', params: 'area=Vijay Nagar' },
    { label: 'Bhanwar Kuan', params: 'area=Bhanwar Kuan' },
  ]

  return (
    <View style={styles.popularContainer}>
      <Text style={styles.popularSectionTitle}>Popular Searches</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.popularScroll}
      >
        {searches.map((s) => (
          <TouchableOpacity
            key={s.label}
            style={styles.popularChip}
            onPress={() => onSearchPress(s.params)}
            activeOpacity={0.7}
          >
            <Text style={styles.popularText}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

function StudentTipCard() {
  return (
    <View style={styles.tipCard}>
      <View style={styles.tipIconContainer}>
        <Text style={styles.tipIcon}>💡</Text>
      </View>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>Student Tip</Text>
        <Text style={styles.tipText}>
          Visit at least three coachings before making your final decision. Compare their test series and batch sizes.
        </Text>
      </View>
    </View>
  )
}

function HomeSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.hero} />
      <View style={[styles.searchBar, { height: 64, marginHorizontal: 24, backgroundColor: colors.border, shadowOpacity: 0 }]} />
      <View style={styles.categoriesRow}>
        <View style={[styles.categoryPill, { backgroundColor: colors.border, width: 120, height: 48 }]} />
        <View style={[styles.categoryPill, { backgroundColor: colors.border, width: 120, height: 48 }]} />
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Coachings</Text>
      </View>
      <FlatList
        horizontal
        data={Array(3).fill(null)}
        keyExtractor={(_, i) => `sk-${i}`}
        renderItem={() => (
          <View style={[styles.cardWrapper, { width: 280 }]}>
            <SkeletonCard />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listPadding}
        scrollEnabled={false}
      />
    </View>
  )
}

// --- MAIN SCREEN ---

export default function HomeScreen() {
  const router = useRouter()
  const { data: featured, isLoading, error, refetch } = useFeaturedListings()

  const coachings = useMemo(() => featured?.filter((l) => l.type === 'coaching') || [], [featured])
  const hostels = useMemo(() => featured?.filter((l) => l.type === 'hostel') || [], [featured])
  const trending = useMemo(() => featured?.slice(0, 5) || [], [featured])

  function navigateToListing(id: string, type: string) {
    if (type === 'coaching') router.push(`/coaching/${id}`)
    else router.push(`/hostel/${id}`)
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <HomeSkeleton />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState
          title="We're having trouble connecting"
          subtitle="Please check your internet connection and try again."
          action={{ label: 'Retry', onPress: refetch }}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <HomeHero />
        
        <PremiumSearch onPress={() => router.push('/(tabs)/search')} />
        
        <QuickCategories onCategoryPress={(type) => router.push(`/(tabs)/search?type=${type}`)} />
        
        <PopularSearches onSearchPress={(params) => router.push(`/(tabs)/search?${params}`)} />

        {/* Featured Coachings */}
        {coachings.length > 0 && (
          <View style={styles.sectionCoachings}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Coachings</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/search?type=coaching')} hitSlop={10}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={coachings}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <View style={[
                  styles.cardWrapper, 
                  { 
                    width: index === 0 ? 300 : 280, // Emphasize first card slightly by width
                    marginRight: index === 0 ? 24 : 16
                  }
                ]}>
                  <ListingCard listing={item} onPress={() => navigateToListing(item.id, item.type)} />
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listPadding}
            />
          </View>
        )}

        {/* Featured Hostels */}
        {hostels.length > 0 && (
          <View style={styles.sectionHostels}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Hostels</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/search?type=hostel')} hitSlop={10}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={hostels}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <View style={[
                  styles.cardWrapper, 
                  { 
                    width: index === 0 ? 300 : 280,
                    marginRight: index === 0 ? 24 : 16
                  }
                ]}>
                  <ListingCard listing={item} onPress={() => navigateToListing(item.id, item.type)} />
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listPadding}
            />
          </View>
        )}

        {/* Trending This Week */}
        {trending.length > 0 && (
          <View style={styles.sectionTrending}>
            <View style={styles.sectionHeaderTrending}>
              <View>
                <Text style={styles.trendingTitle}>🔥 Trending</Text>
                <Text style={styles.trendingSubtitle}>Popular this week</Text>
              </View>
            </View>
            <FlatList
              horizontal
              data={trending}
              keyExtractor={(item) => `trending-${item.id}`}
              renderItem={({ item, index }) => (
                <View style={[
                  styles.cardWrapper, 
                  { 
                    width: index === 0 ? 300 : 280,
                    marginRight: index === 0 ? 24 : 16
                  }
                ]}>
                  <ListingCard listing={item} onPress={() => navigateToListing(item.id, item.type)} />
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listPadding}
            />
          </View>
        )}

        {/* Student Tip */}
        <View style={styles.sectionTip}>
          <StudentTipCard />
        </View>

        <View style={{ height: 96 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Premium light monochrome base
  },
  container: {
    flex: 1,
  },
  skeletonContainer: {
    flex: 1,
    paddingTop: 48,
  },
  
  // HERO
  hero: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 28, // Matches Subtitle -> Search 28px requirement
  },
  greeting: {
    fontSize: 15,
    color: '#6B7280', // muted cool gray
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headlineContainer: {
    marginBottom: 12,
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  headlineAccent: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  supportingText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    fontWeight: '400',
  },

  // PREMIUM SEARCH
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 5,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  searchIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  searchText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // QUICK CATEGORIES
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 16, // Better spacing
    marginBottom: 56, // Rhythm: Categories -> 56px -> Popular Searches
  },
  categoryPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16, // Larger radius
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  categoryDisabled: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowOpacity: 0,
    elevation: 0,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  categoryTextDisabled: {
    color: '#9CA3AF',
  },
  comingSoon: {
    fontSize: 10,
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
    overflow: 'hidden',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 10,
    fontWeight: '700',
  },

  // POPULAR SEARCHES
  popularContainer: {
    marginBottom: 56, // Rhythm: Popular Searches -> 56px -> Featured Coachings
  },
  popularSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    paddingHorizontal: 24,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  popularScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  popularChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  popularText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },

  // SECTIONS
  sectionCoachings: {
    marginBottom: 64, // Rhythm: Coachings -> 64px -> Hostels
  },
  sectionHostels: {
    marginBottom: 64, // Rhythm: Hostels -> 64px -> Trending
  },
  sectionTrending: {
    marginBottom: 64, // Rhythm: Trending -> 64px -> Tip
    backgroundColor: '#F3F4F6', // Different background for trending
    paddingVertical: 40,
    marginHorizontal: 0, // full bleed background
  },
  sectionTip: {
    marginBottom: 64,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeaderTrending: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280', // Lighter secondary action
  },
  trendingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F97316', // Orange
    letterSpacing: -0.5,
  },
  trendingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
  },
  listPadding: {
    paddingHorizontal: 24,
    paddingBottom: 16, // space for shadows
  },
  cardWrapper: {
    // width and marginRight are set dynamically
  },

  // STUDENT TIP
  tipCard: {
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  tipIconContainer: {
    backgroundColor: '#FFFBEB', // soft yellow background for the bulb
    borderRadius: 16,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    fontWeight: '500',
  },
})
