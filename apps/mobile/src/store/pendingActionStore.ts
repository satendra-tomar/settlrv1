import { create } from 'zustand'

/**
 * Stores a single pending action to execute after the user successfully logs in.
 * Used for the "login gate" pattern (favorites, reviews) where a function
 * cannot be passed as a navigation param.
 */
type PendingActionState = {
  pendingAction: (() => void) | null
  setPendingAction: (action: (() => void) | null) => void
  executePendingAction: () => void
}

export const usePendingActionStore = create<PendingActionState>((set, get) => ({
  pendingAction: null,
  setPendingAction: (action) => set({ pendingAction: action }),
  executePendingAction: () => {
    const { pendingAction } = get()
    if (pendingAction) {
      pendingAction()
      set({ pendingAction: null })
    }
  },
}))
