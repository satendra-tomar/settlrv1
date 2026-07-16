import React, { useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Image,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useAuth } from '../src/hooks/useAuth'
import { useFavorites } from '../src/hooks/useFavorites'
import { colors, spacing, fontSize, radius } from '../src/lib/tokens'

export default function CompareScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ ids?: string }>()
  const ids = params.ids?.split(',') || []

  const { user } = useAuth()
  const { data: favorites, isLoading } = useFavorites(user?.id ?? null)

  const listings = useMemo(() => {
    if (!favorites) return []
    return favorites
      .filter((f) => f.listing && ids.includes(f.id))
      .map((f) => f.listing!)
  }, [favorites, ids])

  // If wrong state (less than 2 items), show empty state
  if (!isLoading && listings.length < 2) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕ Close</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIcon}>⚖️</Text>
          </View>
          <Text style={styles.emptyTitle}>Select at least two listings</Text>
          <Text style={styles.emptySubtitle}>
            Choose two or more saved listings to compare them side by side.
          </Text>
          <View style={styles.emptyActions}>
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryActionText}>Go to My Shortlist</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  const mixedTypes = listings.some(l => l.type !== listings[0]?.type)
  
  if (!isLoading && mixedTypes) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕ Close</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIcon}>⚠️</Text>
          </View>
          <Text style={styles.emptyTitle}>Compare similar listings</Text>
          <Text style={styles.emptySubtitle}>
            Compare works between listings of the same type. Choose either coachings or hostels.
          </Text>
          <View style={styles.emptyActions}>
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryActionText}>Return to Shortlist</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  // Derive Comparison Logic
  const isCoaching = listings[0]?.type === 'coaching'
  
  // Overall Winner
  const winner = useMemo(() => {
    if (listings.length === 0) return null
    const sorted = [...listings].sort((a, b) => {
      // 1. Rating
      if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0)
      // 2. Review count
      if ((b.review_count || 0) !== (a.review_count || 0)) return (b.review_count || 0) - (a.review_count || 0)
      // 3. Verified
      if (b.is_verified !== a.is_verified) return b.is_verified ? 1 : -1
      // 4. Alphabetical
      return (a.name || '').localeCompare(b.name || '')
    })
    
    // If the top two are tied on all meaningful stats (rating, review count, verified), then no clear winner.
    if (sorted.length > 1) {
      const first = sorted[0]
      const second = sorted[1]
      if (
        (first.rating || 0) === (second.rating || 0) &&
        (first.review_count || 0) === (second.review_count || 0) &&
        first.is_verified === second.is_verified
      ) {
        return null // Tie
      }
    }
    
    return sorted[0]
  }, [listings])

  // Highlights mapping
  const highlights = useMemo(() => {
    const res: Record<string, string> = {}
    const used = new Set<string>()
    
    const sortedByRating = [...listings].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    const sortedByReviews = [...listings].sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
    
    let sortedByFees: typeof listings = []
    if (!isCoaching) {
      sortedByFees = [...listings].sort((a, b) => {
        const aMin = a.hostel_details?.[0]?.rent_min || 999999
        const bMin = b.hostel_details?.[0]?.rent_min || 999999
        return aMin - bMin
      })
    }

    listings.forEach((l) => {
      if (l.id === sortedByRating[0]?.id && (l.rating || 0) > 4 && !used.has('🏆 Highest Rated')) {
        res[l.id] = '🏆 Highest Rated'
        used.add('🏆 Highest Rated')
      } else if (sortedByFees.length > 0 && l.id === sortedByFees[0]?.id && !used.has('💰 Lowest Fees')) {
        res[l.id] = '💰 Lowest Fees'
        used.add('💰 Lowest Fees')
      } else if (l.id === sortedByReviews[0]?.id && (l.review_count || 0) > 10 && !used.has('⭐ Most Reviews')) {
        res[l.id] = '⭐ Most Reviews'
        used.add('⭐ Most Reviews')
      } else if (l.is_verified && !used.has('✓ Verified')) {
        res[l.id] = '✓ Verified'
        used.add('✓ Verified')
      } else {
        res[l.id] = '📍 Top Pick' // fallback
      }
    })
    return res
  }, [listings, isCoaching])

  // Verdict Generation
  const verdictText = useMemo(() => {
    if (listings.length < 2) return ''
    const best = winner?.name
    let cheap = ''
    if (!isCoaching) {
      const sortedByFees = [...listings].sort((a, b) => (a.hostel_details?.[0]?.rent_min || 999999) - (b.hostel_details?.[0]?.rent_min || 999999))
      cheap = sortedByFees[0]?.name || ''
    }

    if (isCoaching) {
      if (best) {
         return `Based on ratings and student reviews, ${best} currently performs best among your selected options. Other choices remain strong alternatives depending on specific subject needs.`
      }
      return `Based on available ratings and reviews, your selected options perform similarly. There is no clear overall winner.`
    } else {
      if (best) {
         return `Based on ratings and student feedback, ${best} is the most recommended option among your selections.\n\n${cheap && cheap !== best ? `${cheap} offers a lower fee based on available pricing.` : ''}`
      }
      return `Both options appear similarly rated based on available feedback.\n\n${cheap ? `${cheap} offers a lower fee based on available pricing.` : ''}`
    }
  }, [listings, winner, isCoaching])

  if (isLoading) {
    return <SafeAreaView style={styles.safe}><Text style={{padding: 24}}>Loading workspace...</Text></SafeAreaView>
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Compare</Text>
          <Text style={styles.headerSubtitle}>Find the best option for your needs.</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕ Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* SUMMARY / AVATARS */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionLabel}>{isCoaching ? 'Coachings Compared' : 'Hostels Compared'}</Text>
          <View style={styles.avatarsRow}>
            {listings.map((l, i) => (
              <View key={l.id} style={[styles.avatarWrapper, { zIndex: 10 - i, marginLeft: i > 0 ? -16 : 0 }]}>
                {l.listing_images?.[0]?.url ? (
                  <Image source={{ uri: l.listing_images[0].url }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarImgPlaceholder} />
                )}
              </View>
            ))}
            <Text style={styles.avatarTextCount}>{listings.length} items</Text>
          </View>
        </View>

        {/* OVERALL WINNER */}
        {winner && (
          <View style={styles.winnerCard}>
            <View style={styles.winnerHeader}>
              <Text style={styles.winnerLabel}>⭐ Settlr Pick</Text>
              <Text style={styles.winnerTitle}>Recommended Based on Available Data</Text>
            </View>
            <View style={styles.winnerContent}>
              <Text style={styles.winnerName}>{winner.name}</Text>
              <Text style={styles.winnerReason}>
                Ratings • Reviews • Verification
              </Text>
            </View>
          </View>
        )}

        {/* COMPARISON MATRIX */}
        <View style={styles.matrixSection}>
          <Text style={styles.sectionLabel}>Side-by-side</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matrixScroll}>
            {listings.map(l => (
              <View key={l.id} style={styles.matrixColumn}>
                
                {/* Column Header */}
                <View style={styles.matrixHeader}>
                  {l.listing_images?.[0]?.url ? (
                    <Image source={{ uri: l.listing_images[0].url }} style={styles.matrixImg} />
                  ) : (
                    <View style={styles.matrixImgPlaceholder} />
                  )}
                  <Text style={styles.matrixName} numberOfLines={2}>{l.name}</Text>
                  <View style={styles.highlightChip}>
                    <Text style={styles.highlightText}>{highlights[l.id]}</Text>
                  </View>
                </View>

                {/* Rows */}
                <View style={styles.matrixRow}>
                  <Text style={styles.rowLabel}>Rating</Text>
                  <Text style={styles.rowValue}>⭐ {l.rating?.toFixed(1) || 'N/A'}</Text>
                </View>
                <View style={styles.matrixRow}>
                  <Text style={styles.rowLabel}>Reviews</Text>
                  <Text style={styles.rowValue}>{l.review_count || 0} reviews</Text>
                </View>
                <View style={styles.matrixRow}>
                  <Text style={styles.rowLabel}>Location</Text>
                  <Text style={styles.rowValue} numberOfLines={2}>{l.area}</Text>
                </View>
                <View style={styles.matrixRow}>
                  <Text style={styles.rowLabel}>Verified</Text>
                  <Text style={styles.rowValue}>{l.is_verified ? 'Yes ✓' : 'No'}</Text>
                </View>
                
                {!isCoaching && (
                  <View style={styles.matrixRow}>
                    <Text style={styles.rowLabel}>Rent (Min)</Text>
                    <Text style={styles.rowValue}>
                      {l.hostel_details?.[0]?.rent_min ? `₹${l.hostel_details[0].rent_min}/mo` : 'N/A'}
                    </Text>
                  </View>
                )}
                
                {isCoaching && (
                  <View style={styles.matrixRow}>
                    <Text style={styles.rowLabel}>Subjects</Text>
                    <Text style={styles.rowValue} numberOfLines={3}>
                      {l.coaching_details?.[0]?.subjects?.join(', ') || 'N/A'}
                    </Text>
                  </View>
                )}
                
                {/* Actions per column */}
                <TouchableOpacity 
                  style={styles.colBtn} 
                  onPress={() => {
                    if (isCoaching) router.push(`/coaching/${l.id}`)
                    else router.push(`/hostel/${l.id}`)
                  }}
                >
                  <Text style={styles.colBtnText}>View Details</Text>
                </TouchableOpacity>

              </View>
            ))}
          </ScrollView>
        </View>

        {/* SETTLR VERDICT */}
        <View style={styles.verdictSection}>
          <Text style={styles.verdictLabel}>Settlr Summary</Text>
          <Text style={styles.verdictText}>{verdictText}</Text>
        </View>
        
        <View style={{height: 64}} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
  closeBtn: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // Summary
  summarySection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FAFAFA',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  avatarImgPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  avatarTextCount: {
    marginLeft: 16,
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },

  // Winner Card
  winnerCard: {
    marginHorizontal: 24,
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 24,
    marginBottom: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  winnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  winnerLabel: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  winnerTitle: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  winnerContent: {},
  winnerName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  winnerReason: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 22,
  },

  // Matrix
  matrixSection: {
    marginBottom: 40,
  },
  matrixScroll: {
    paddingHorizontal: 24,
    gap: 16,
  },
  matrixColumn: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  matrixHeader: {
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    paddingBottom: 24,
  },
  matrixImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 16,
  },
  matrixImgPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  matrixName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  highlightChip: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  highlightText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  matrixRow: {
    marginBottom: 20,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
  },
  colBtn: {
    marginTop: 16,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  colBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  // Verdict
  verdictSection: {
    marginHorizontal: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  verdictLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  verdictText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    fontWeight: '500',
  },

  // Empty State
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
})
