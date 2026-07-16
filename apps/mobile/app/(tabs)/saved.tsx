import React, { useState, useMemo } from 'react'
import {
  View,
  FlatList,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../../src/hooks/useAuth'
import { useFavorites, useToggleFavorite } from '../../src/hooks/useFavorites'
import { ListingCard } from '../../src/components/ListingCard'
import { SkeletonCard } from '../../src/components/SkeletonCard'
import { colors, spacing, fontSize, radius } from '../../src/lib/tokens'

export default function SavedScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: favorites, isLoading, refetch } = useFavorites(user?.id ?? null)
  const toggleFavorite = useToggleFavorite()

  const [activeTab, setActiveTab] = useState<'all' | 'coaching' | 'hostel'>('all')
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Derive stats & filtered lists
  const stats = useMemo(() => {
    if (!favorites) return { coaching: 0, hostel: 0, total: 0 }
    let coaching = 0
    let hostel = 0
    favorites.forEach((f) => {
      if (f.listing?.type === 'coaching') coaching++
      if (f.listing?.type === 'hostel') hostel++
    })
    return { coaching, hostel, total: favorites.length }
  }, [favorites])

  const filteredFavorites = useMemo(() => {
    if (!favorites) return []
    return favorites.filter((f) => {
      if (activeTab === 'all') return true
      return f.listing?.type === activeTab
    })
  }, [favorites, activeTab])

  // Selection logic
  function toggleSelection(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  function handleCancelSelection() {
    setIsSelectMode(false)
    setSelectedIds(new Set())
  }

  function navigateToListing(id: string, type: string) {
    if (isSelectMode) return // Prevent navigation when selecting
    if (type === 'coaching') router.push(`/coaching/${id}`)
    else router.push(`/hostel/${id}`)
  }

  // Render Premium Header
  const renderHeader = () => {
    if (!favorites || favorites.length === 0) return null

    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Shortlist</Text>
        <Text style={styles.headerSubtitle}>
          Everything you're considering, in one place.
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.coaching}</Text>
            <Text style={styles.statLabel}>Coachings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.hostel}</Text>
            <Text style={styles.statLabel}>Hostels</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Saved</Text>
          </View>
        </View>

        {/* Segmented Control & Decision Mode Toggle */}
        <View style={styles.controlRow}>
          <View style={styles.segmentedControl}>
            {(['all', 'coaching', 'hostel'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.segmentTab,
                  activeTab === tab && styles.segmentTabActive,
                ]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeTab === tab && styles.segmentTextActive,
                  ]}
                >
                  {tab === 'all' ? 'All' : tab === 'coaching' ? 'Coachings' : 'Hostels'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => (isSelectMode ? handleCancelSelection() : setIsSelectMode(true))}
          >
            <Text style={styles.selectButtonText}>
              {isSelectMode ? 'Cancel' : 'Select'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Renders
  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIcon}>🔒</Text>
          </View>
          <Text style={styles.emptyTitle}>Log in to save</Text>
          <Text style={styles.emptySubtitle}>
            Save coaching institutes and hostels so you can compare them later.
          </Text>
          <View style={styles.emptyActions}>
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.primaryActionText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>My Shortlist</Text>
          <Text style={styles.headerSubtitle}>
            Loading your saved items...
          </Text>
        </View>
        <View style={styles.list}>
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <SkeletonCard key={i} />
            ))}
        </View>
      </SafeAreaView>
    )
  }

  if (!favorites || favorites.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIcon}>📂</Text>
          </View>
          <Text style={styles.emptyTitle}>Start building your shortlist</Text>
          <Text style={styles.emptySubtitle}>
            Save coachings and hostels to compare them later.
          </Text>
          <View style={styles.emptyActions}>
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Text style={styles.primaryActionText}>Browse Listings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => router.push('/')}
            >
              <Text style={styles.secondaryActionText}>Go Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={filteredFavorites}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[styles.list, isSelectMode && styles.listWithBottomBar]}
        renderItem={({ item, index }) => {
          if (!item.listing) return null

          // We don't have created_at in the current hook's payload.
          // Falling back to a simple index-based "Recently Added" section if list is long.
          const showLabel = index === 0 && filteredFavorites.length > 3
          const showEarlierLabel = index === 3 && filteredFavorites.length > 3

          const isSelected = selectedIds.has(item.id)

          return (
            <View>
              {showLabel && (
                <View style={styles.timeframeLabel}>
                  <Text style={styles.timeframeText}>Recently Added</Text>
                </View>
              )}
              {showEarlierLabel && (
                <View style={styles.timeframeLabel}>
                  <Text style={styles.timeframeText}>Earlier</Text>
                </View>
              )}
              <View style={styles.cardContainer}>
                {isSelectMode && (
                  <TouchableOpacity
                    style={styles.selectOverlay}
                    activeOpacity={0.9}
                    onPress={() => toggleSelection(item.id)}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                )}
                <View style={[isSelectMode && styles.cardShifted, isSelected && styles.cardSelected]}>
                  <ListingCard
                    listing={item.listing}
                    onPress={() => navigateToListing(item.listing!.id, item.listing!.type)}
                  />
                </View>
              </View>
            </View>
          )
        }}
        onRefresh={refetch}
        refreshing={isLoading}
      />

      {/* Decision Mode Bottom Bar */}
      {isSelectMode && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomBarHeader}>
            <Text style={styles.selectionCount}>
              {selectedIds.size} {selectedIds.size === 1 ? 'Selected' : 'Selected'}
            </Text>
          </View>
          <View style={styles.bottomBarActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnOutline]}
              disabled={true}
              activeOpacity={0.7}
            >
              <Text style={styles.actionBtnOutlineText}>Remove</Text>
              <View style={styles.comingSoonBadge}><Text style={styles.comingSoonText}>Soon</Text></View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnOutline]}
              disabled={true}
              activeOpacity={0.7}
            >
              <Text style={styles.actionBtnOutlineText}>Share</Text>
              <View style={styles.comingSoonBadge}><Text style={styles.comingSoonText}>Soon</Text></View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary, selectedIds.size === 0 && styles.actionBtnDisabled]}
              disabled={selectedIds.size === 0}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnPrimaryText}>Compare</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  list: {
    paddingBottom: 40,
  },
  listWithBottomBar: {
    paddingBottom: 160, // Leave room for bottom bar
  },

  // Premium Header
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Segmented Control
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB', // softer gray
    borderRadius: 24,
    padding: 4,
  },
  segmentTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  segmentTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#111827',
    fontWeight: '700',
  },

  // Select Button
  selectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.violet,
  },

  // Card Container & Selection
  cardContainer: {
    position: 'relative',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  timeframeLabel: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  timeframeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  selectOverlay: {
    position: 'absolute',
    top: 0,
    left: 24,
    bottom: 0,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.violet,
    borderColor: colors.violet,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cardShifted: {
    transform: [{ translateX: 32 }], // Shift right to make room for checkbox
    width: '90%', // Reduce width so it doesn't overflow
  },
  cardSelected: {
    opacity: 0.9,
  },

  // Bottom Action Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  bottomBarHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectionCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  bottomBarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionBtnOutline: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionBtnOutlineText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF', // Muted since it's disabled
  },
  actionBtnPrimary: {
    backgroundColor: '#111827',
  },
  actionBtnDisabled: {
    backgroundColor: '#E5E7EB',
  },
  actionBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  comingSoonBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  comingSoonText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
  },

  // Premium Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyActions: {
    width: '100%',
    gap: 12,
  },
  primaryAction: {
    backgroundColor: '#111827',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryAction: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  secondaryActionText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
})
