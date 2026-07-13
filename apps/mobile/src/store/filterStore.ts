import { create } from 'zustand'

/**
 * Manages UI filter state for the Search screen.
 * This store is ONLY for in-progress filter state.
 * Actual listing data lives in react-query cache — never put it here.
 */

export type SortBy = 'rating' | 'newest' | 'rent_asc'
export type ListingType = 'coaching' | 'hostel'
export type HostelGender = 'male' | 'female' | 'co_ed' | ''

type FilterState = {
  type: ListingType
  area: string
  minRating: number
  verifiedOnly: boolean
  sortBy: SortBy
  // coaching only
  examTypes: string[]
  // hostel only
  gender: HostelGender
  rentMin: number
  rentMax: number
  foodIncluded: boolean
  // actions
  setType: (type: ListingType) => void
  setFilter: <K extends keyof Omit<FilterState, 'setType' | 'setFilter' | 'reset'>>(
    key: K,
    value: FilterState[K],
  ) => void
  reset: () => void
}

const DEFAULTS = {
  type: 'coaching' as ListingType,
  area: '',
  minRating: 0,
  verifiedOnly: false,
  sortBy: 'rating' as SortBy,
  examTypes: [] as string[],
  gender: '' as HostelGender,
  rentMin: 0,
  rentMax: 0,
  foodIncluded: false,
}

export const useFilterStore = create<FilterState>((set) => ({
  ...DEFAULTS,
  setType: (type) =>
    set({
      type,
      // Reset type-specific filters when switching tab
      examTypes: [],
      gender: '',
      rentMin: 0,
      rentMax: 0,
      foodIncluded: false,
    }),
  setFilter: (key, value) => set({ [key]: value } as Partial<FilterState>),
  reset: () => set(DEFAULTS),
}))
