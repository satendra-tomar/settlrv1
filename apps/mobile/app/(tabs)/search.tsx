import React, { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useListings } from '../../src/hooks/useListings'
import { useFilterStore } from '../../src/store/filterStore'
import { ListingCard } from '../../src/components/ListingCard'
import { SkeletonCard } from '../../src/components/SkeletonCard'
import { colors, spacing, fontSize, radius } from '../../src/lib/tokens'
import type { Enums } from '../../src/types/database'

const EXAM_TYPES = ['NEET', 'JEE', 'UPSC', 'Banking', 'SSC']

export default function SearchScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    type?: string
    examTypes?: string
    gender?: string
    rentMax?: string
    area?: string
  }>()

  const filterStore = useFilterStore()
  const [showFilters, setShowFilters] = useState(false)
  const [searchText, setSearchText] = useState('')

  // Hydrate filter store from route params on mount
  useEffect(() => {
    if (params.type === 'coaching' || params.type === 'hostel') {
      filterStore.setType(params.type)
    }
    if (params.examTypes) {
      filterStore.setFilter('examTypes', [params.examTypes])
    }
    if (params.gender) {
      filterStore.setFilter('gender', params.gender as Enums<'hostel_gender'>)
    }
    if (params.rentMax) {
      filterStore.setFilter('rentMax', parseInt(params.rentMax, 10))
    }
    if (params.area) {
      filterStore.setFilter('area', params.area)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const queryFilters = {
    type: filterStore.type,
    area: filterStore.area,
    minRating: filterStore.minRating,
    sortBy: filterStore.sortBy,
    examTypes: filterStore.examTypes,
    gender: filterStore.gender || undefined,
    rentMin: filterStore.rentMin || undefined,
    rentMax: filterStore.rentMax || undefined,
    foodIncluded: filterStore.foodIncluded || undefined,
    search: searchText,
  }

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    refetch,
  } = useListings(queryFilters)

  const listings = data?.pages.flat() ?? []

  const isDefaultState = useMemo(() => {
    return (
      !searchText &&
      !filterStore.type &&
      !filterStore.area &&
      filterStore.examTypes.length === 0 &&
      !filterStore.gender &&
      !filterStore.foodIncluded &&
      !filterStore.minRating &&
      filterStore.sortBy === 'rating'
    )
  }, [searchText, filterStore])

  function navigateToListing(id: string, type: string) {
    if (type === 'coaching') router.push(`/coaching/${id}`)
    else router.push(`/hostel/${id}`)
  }

  function toggleExamType(et: string) {
    const current = filterStore.examTypes
    if (current.includes(et)) {
      filterStore.setFilter('examTypes', current.filter((e) => e !== et))
    } else {
      filterStore.setFilter('examTypes', [...current, et])
    }
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerLabel}>Search</Text>
      <Text style={styles.headerTitle}>Find your next coaching or stay</Text>
      <Text style={styles.headerSubtitle}>
        Search verified coachings and hostels across the city.
      </Text>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search coaching, hostel or area..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.filterButtonIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {isDefaultState ? (
        <View style={styles.discoverySection}>
          {/* Recent Searches */}
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            {['SSC', 'Girls Hostel', 'Physics Wallah', 'Bhanwarkuan'].map((s) => (
              <TouchableOpacity key={s} style={styles.recentChip} activeOpacity={0.7} onPress={() => setSearchText(s)}>
                <Text style={styles.recentChipText}>🕒 {s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Trending Searches */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>🔥 Trending Searches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            {['NEET', 'JEE', 'SSC', 'Banking', 'Girls Hostel', 'Boys Hostel', 'Library', 'Mess'].map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.trendingChip}
                activeOpacity={0.7}
                onPress={() => setSearchText(s)}
              >
                <Text style={styles.trendingChipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Category Shortcuts */}
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {[
              { id: 'coaching', label: '🎓 Coaching', disabled: false },
              { id: 'hostel', label: '🏠 Hostel', disabled: false },
              { id: 'library', label: '📚 Library', disabled: true },
              { id: 'mess', label: '🍛 Mess', disabled: true },
            ].map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.categoryBtn, c.disabled && styles.categoryBtnDisabled]}
                activeOpacity={c.disabled ? 1 : 0.7}
                onPress={() => {
                  if (!c.disabled) {
                    filterStore.setType(c.id as any)
                  }
                }}
              >
                <Text style={[styles.categoryBtnText, c.disabled && styles.categoryBtnTextDisabled]}>
                  {c.label}
                </Text>
                {c.disabled && <Text style={styles.comingSoonBadge}>Coming Soon</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.smartFiltersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            {/* Smart Filters mapping to existing logic */}
            <TouchableOpacity
              style={[styles.smartChip, filterStore.sortBy === 'rating' && styles.smartChipActive]}
              onPress={() => filterStore.setFilter('sortBy', 'rating')}
              activeOpacity={0.7}
            >
              <Text style={[styles.smartChipText, filterStore.sortBy === 'rating' && styles.smartChipTextActive]}>⭐ Top Rated</Text>
            </TouchableOpacity>

            {(filterStore.type === 'hostel' || !filterStore.type) && (
              <TouchableOpacity
                style={[styles.smartChip, filterStore.sortBy === 'rent_asc' && styles.smartChipActive]}
                onPress={() => {
                  filterStore.setType('hostel')
                  filterStore.setFilter('sortBy', 'rent_asc')
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.smartChipText, filterStore.sortBy === 'rent_asc' && styles.smartChipTextActive]}>💰 Lowest Fees</Text>
              </TouchableOpacity>
            )}

            {(filterStore.type === 'hostel' || !filterStore.type) && (
              <TouchableOpacity
                style={[styles.smartChip, filterStore.gender === 'female' && styles.smartChipActive]}
                onPress={() => {
                  filterStore.setType('hostel')
                  filterStore.setFilter('gender', filterStore.gender === 'female' ? '' : 'female')
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.smartChipText, filterStore.gender === 'female' && styles.smartChipTextActive]}>👩 Girls Only</Text>
              </TouchableOpacity>
            )}

            {(filterStore.type === 'hostel' || !filterStore.type) && (
              <TouchableOpacity
                style={[styles.smartChip, filterStore.gender === 'male' && styles.smartChipActive]}
                onPress={() => {
                  filterStore.setType('hostel')
                  filterStore.setFilter('gender', filterStore.gender === 'male' ? '' : 'male')
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.smartChipText, filterStore.gender === 'male' && styles.smartChipTextActive]}>👦 Boys Only</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.smartChip, styles.smartChipActive]}
              activeOpacity={1}
            >
              <Text style={styles.smartChipTextActive}>✓ Verified</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  )

  const renderEmptyState = () => (
    <View style={styles.premiumEmptyState}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>🔍</Text>
      </View>
      <Text style={styles.emptyTitle}>No results found</Text>
      <Text style={styles.emptySubtitle}>We couldn't find anything matching your search. Try adjusting your filters.</Text>
      
      <View style={styles.emptyActions}>
        <TouchableOpacity style={styles.emptyPrimaryAction} onPress={() => {
          setSearchText('')
          filterStore.reset()
        }}>
          <Text style={styles.emptyPrimaryText}>Try another keyword</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.emptySecondaryAction} onPress={() => {
          filterStore.reset()
          filterStore.setType('coaching')
        }}>
          <Text style={styles.emptySecondaryText}>Browse Coachings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.emptySecondaryAction} onPress={() => {
          filterStore.reset()
          filterStore.setType('hostel')
        }}>
          <Text style={styles.emptySecondaryText}>Browse Hostels</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={(!isDefaultState && !isLoading && !error && listings.length === 0) ? [] : listings}
        keyExtractor={(item, index) => item?.id || `fallback-${index}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Something went wrong</Text>
              <Text style={styles.errorSubtitle}>Check your connection and try again.</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : isLoading ? (
            <View style={styles.skeletonList}>
              <SkeletonCard />
              <View style={{ height: 24 }} />
              <SkeletonCard />
              <View style={{ height: 24 }} />
              <SkeletonCard />
            </View>
          ) : !isDefaultState ? (
            renderEmptyState()
          ) : null
        }
        renderItem={({ item }) => {
          if (!item) return null
          return (
            <View style={styles.listingWrapper}>
              <ListingCard
                listing={item}
                onPress={() => navigateToListing(item.id, item.type)}
              />
            </View>
          )
        }}
        contentContainerStyle={styles.flatlistContent}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={colors.ink} style={{ marginVertical: spacing.lg }} />
          ) : null
        }
      />

      {/* Filter Bottom Sheet Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetTitle}>Filters</Text>

              {filterStore.type === 'coaching' ? (
                <>
                  <Text style={styles.filterLabel}>Exam Types</Text>
                  <View style={styles.chipRow}>
                    {EXAM_TYPES.map((et) => (
                      <TouchableOpacity
                        key={et}
                        style={[
                          styles.filterModalChip,
                          filterStore.examTypes.includes(et) && styles.filterModalChipActive,
                        ]}
                        onPress={() => toggleExamType(et)}
                      >
                        <Text
                          style={[
                            styles.filterModalChipText,
                            filterStore.examTypes.includes(et) && styles.filterModalChipTextActive,
                          ]}
                        >
                          {et}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.filterLabel}>Gender</Text>
                  <View style={styles.chipRow}>
                    {[
                      { label: 'Male', value: 'male' },
                      { label: 'Female', value: 'female' },
                      { label: 'Co-ed', value: 'co_ed' },
                    ].map((g) => (
                      <TouchableOpacity
                        key={g.value}
                        style={[
                          styles.filterModalChip,
                          filterStore.gender === g.value && styles.filterModalChipActive,
                        ]}
                        onPress={() =>
                          filterStore.setFilter(
                            'gender',
                            filterStore.gender === g.value ? '' : (g.value as any),
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.filterModalChipText,
                            filterStore.gender === g.value && styles.filterModalChipTextActive,
                          ]}
                        >
                          {g.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.filterLabel}>Rent Range (₹/mo)</Text>
                  <View style={styles.rentRow}>
                    <TextInput
                      style={[styles.input, styles.rentInput]}
                      placeholder="Min"
                      keyboardType="number-pad"
                      value={filterStore.rentMin ? String(filterStore.rentMin) : ''}
                      onChangeText={(v) => filterStore.setFilter('rentMin', parseInt(v, 10) || 0)}
                    />
                    <Text style={styles.rentSeparator}>–</Text>
                    <TextInput
                      style={[styles.input, styles.rentInput]}
                      placeholder="Max"
                      keyboardType="number-pad"
                      value={filterStore.rentMax ? String(filterStore.rentMax) : ''}
                      onChangeText={(v) => filterStore.setFilter('rentMax', parseInt(v, 10) || 0)}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.checkRow}
                    onPress={() => filterStore.setFilter('foodIncluded', !filterStore.foodIncluded)}
                  >
                    <View
                      style={[styles.checkbox, filterStore.foodIncluded && styles.checkboxChecked]}
                    >
                      {filterStore.foodIncluded && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkLabel}>Food included</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Area */}
              <Text style={styles.filterLabel}>Area</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Vijay Nagar"
                value={filterStore.area}
                onChangeText={(v) => filterStore.setFilter('area', v)}
              />

              {/* Min rating */}
              <Text style={styles.filterLabel}>Minimum Rating</Text>
              <View style={styles.ratingRow}>
                {[0, 1, 2, 3, 4, 5].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.ratingChip,
                      filterStore.minRating === r && styles.ratingChipActive,
                    ]}
                    onPress={() => filterStore.setFilter('minRating', r)}
                  >
                    <Text
                      style={[
                        styles.filterModalChipText,
                        filterStore.minRating === r && styles.filterModalChipTextActive,
                      ]}
                    >
                      {r === 0 ? 'Any' : `${r}★+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.sheetButtons}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    filterStore.reset()
                    setShowFilters(false)
                  }}
                >
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setShowFilters(false)}
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Premium light background
  },
  flatlistContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    paddingTop: 32,
    paddingBottom: 16,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    paddingHorizontal: 24,
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    paddingHorizontal: 24,
    lineHeight: 24,
    marginBottom: 32,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  filterButton: {
    backgroundColor: '#111827',
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  filterButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  discoverySection: {
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    paddingHorizontal: 24,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  chipScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  recentChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  trendingChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  trendingChipText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 40,
  },
  categoryBtn: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  categoryBtnDisabled: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowOpacity: 0,
    elevation: 0,
  },
  categoryBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  categoryBtnTextDisabled: {
    color: '#9CA3AF',
  },
  comingSoonBadge: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  smartFiltersSection: {
    marginBottom: 24,
  },
  smartChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  smartChipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  smartChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  smartChipTextActive: {
    color: '#FFFFFF',
  },
  listingWrapper: {
    paddingHorizontal: 24,
    marginBottom: 8, // Added some breathing room between cards
  },
  skeletonList: {
    paddingHorizontal: 24,
  },

  // Premium Empty State
  premiumEmptyState: {
    paddingHorizontal: 24,
    paddingTop: 48,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  emptyActions: {
    width: '100%',
    gap: 12,
  },
  emptyPrimaryAction: {
    backgroundColor: '#111827',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptySecondaryAction: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  emptySecondaryText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },

  // Errors
  errorContainer: {
    padding: 32,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Modal / sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 12,
    marginTop: 24,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterModalChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#FFFFFF',
  },
  filterModalChipActive: {
    borderColor: '#111827',
    backgroundColor: '#111827',
  },
  filterModalChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  filterModalChipTextActive: {
    color: '#FFFFFF',
  },
  rentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  rentInput: {
    flex: 1,
    marginBottom: 0,
  },
  rentSeparator: {
    color: '#6B7280',
    fontSize: 16,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  checkLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  ratingChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#FFFFFF',
  },
  ratingChipActive: {
    borderColor: '#111827',
    backgroundColor: '#111827',
  },
  sheetButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 40,
    marginBottom: 16,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  clearButtonText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '700',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
})
