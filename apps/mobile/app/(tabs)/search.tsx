import React, { useEffect, useState } from 'react'
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
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useListings } from '../../src/hooks/useListings'
import { useFilterStore } from '../../src/store/filterStore'
import { ListingCard } from '../../src/components/ListingCard'
import { SkeletonCard } from '../../src/components/SkeletonCard'
import { EmptyState } from '../../src/components/EmptyState'
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

  return (
    <SafeAreaView style={styles.safe}>
      {/* Search input */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search coaching or hostel…"
          placeholderTextColor={colors.muted}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.filterButtonText}>⚙️ Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Type tabs */}
      <View style={styles.tabRow}>
        {(['coaching', 'hostel'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, filterStore.type === t && styles.tabActive]}
            onPress={() => filterStore.setType(t)}
          >
            <Text
              style={[styles.tabText, filterStore.type === t && styles.tabTextActive]}
            >
              {t === 'coaching' ? '🏛️ Coaching' : '🏠 Hostel'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sort */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow}>
        {(['rating', 'newest', ...(filterStore.type === 'hostel' ? ['rent_asc'] : [])] as const).map(
          (s) => (
            <TouchableOpacity
              key={s}
              style={[styles.sortChip, filterStore.sortBy === s && styles.sortChipActive]}
              onPress={() => filterStore.setFilter('sortBy', s as any)}
            >
              <Text
                style={[styles.sortChipText, filterStore.sortBy === s && styles.sortChipTextActive]}
              >
                {s === 'rating' ? '⭐ Rating' : s === 'newest' ? '🆕 Newest' : '💰 Rent ↑'}
              </Text>
            </TouchableOpacity>
          ),
        )}
      </ScrollView>

      {/* Results */}
      {error ? (
        <EmptyState
          title="Something went wrong"
          subtitle="Couldn't load listings. Please check your connection."
          action={{ label: 'Retry', onPress: () => refetch() }}
        />
      ) : isLoading ? (
        <FlatList
          data={Array(6).fill(null)}
          keyExtractor={(_, i) => `sk-${i}`}
          renderItem={() => <SkeletonCard />}
          contentContainerStyle={styles.list}
        />
      ) : listings.length === 0 ? (
        <EmptyState
          title="No listings found"
          subtitle="Try changing your filters or search term."
          action={{ label: 'Clear Filters', onPress: () => filterStore.reset() }}
        />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              onPress={() => navigateToListing(item.id, item.type)}
            />
          )}
          contentContainerStyle={styles.list}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={colors.violet} style={{ marginVertical: spacing.md }} />
            ) : null
          }
        />
      )}

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
                          styles.filterChip,
                          filterStore.examTypes.includes(et) && styles.filterChipActive,
                        ]}
                        onPress={() => toggleExamType(et)}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            filterStore.examTypes.includes(et) && styles.filterChipTextActive,
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
                          styles.filterChip,
                          filterStore.gender === g.value && styles.filterChipActive,
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
                            styles.filterChipText,
                            filterStore.gender === g.value && styles.filterChipTextActive,
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
                        styles.filterChipText,
                        filterStore.minRating === r && styles.filterChipTextActive,
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
    backgroundColor: colors.background,
  },
  searchRow: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  filterButton: {
    backgroundColor: colors.violet,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.border,
    borderRadius: radius.md,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.white,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: fontSize.sm,
    color: colors.muted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.violet,
  },
  sortRow: {
    paddingLeft: spacing.md,
    marginBottom: spacing.sm,
    flexGrow: 0,
  },
  sortChip: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.sm,
    backgroundColor: colors.white,
  },
  sortChipActive: {
    borderColor: colors.violet,
    backgroundColor: colors.violetBorder,
  },
  sortChipText: {
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: '500',
  },
  sortChipTextActive: {
    color: colors.violet,
    fontWeight: '700',
  },
  list: {
    padding: spacing.md,
    paddingTop: 0,
  },
  // Modal / sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    maxHeight: '90%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  filterLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filterChipActive: {
    borderColor: colors.violet,
    backgroundColor: colors.violet,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    color: colors.ink,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  rentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.ink,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  rentInput: {
    flex: 1,
    marginBottom: 0,
  },
  rentSeparator: {
    color: colors.muted,
    fontSize: fontSize.md,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.violet,
    borderColor: colors.violet,
  },
  checkmark: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  checkLabel: {
    fontSize: fontSize.md,
    color: colors.ink,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  ratingChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  ratingChipActive: {
    borderColor: colors.violet,
    backgroundColor: colors.violet,
  },
  sheetButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  clearButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: fontSize.md,
    color: colors.muted,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.violet,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: fontSize.md,
    color: colors.white,
    fontWeight: '700',
  },
})
