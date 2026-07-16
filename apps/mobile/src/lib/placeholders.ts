// =============================================================================
// Settlr – Placeholder Data for Phase 2.5A
// These temporary constants power the decision-platform UI before real data
// exists in the database. Phase 2.5B will replace every import from this file
// with live Supabase data.
// =============================================================================

// ---------------------------------------------------------------------------
// Experience score categories
// ---------------------------------------------------------------------------
export type ExperienceScore = {
  label: string
  score: number
  emoji: string
}

export const COACHING_EXPERIENCE_SCORES: ExperienceScore[] = [
  { label: 'Teaching', score: 9.4, emoji: '📚' },
  { label: 'Notes', score: 9.1, emoji: '📝' },
  { label: 'Test Series', score: 8.8, emoji: '📊' },
  { label: 'Doubt Support', score: 8.5, emoji: '🙋' },
  { label: 'Competition', score: 9.2, emoji: '🏆' },
  { label: 'Personal Attention', score: 8.0, emoji: '🎯' },
]

export const HOSTEL_EXPERIENCE_SCORES: ExperienceScore[] = [
  { label: 'Cleanliness', score: 9.0, emoji: '✨' },
  { label: 'Food Quality', score: 8.6, emoji: '🍽️' },
  { label: 'Safety', score: 9.3, emoji: '🛡️' },
  { label: 'Study Environment', score: 8.8, emoji: '📖' },
  { label: 'Warden Support', score: 8.2, emoji: '👤' },
  { label: 'Location', score: 9.1, emoji: '📍' },
]

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
export const COACHING_SUMMARY =
  'A well-established coaching institute known for its structured approach to competitive exam preparation. The faculty brings years of experience, and the study material is curated to match the latest exam patterns. Students appreciate the disciplined environment and consistent results.'

export const HOSTEL_SUMMARY =
  'A comfortable and safe accommodation designed for students preparing for competitive exams. The hostel offers a disciplined environment with dedicated study hours, nutritious meals, and modern amenities to support focused preparation.'

// ---------------------------------------------------------------------------
// Best-for chips
// ---------------------------------------------------------------------------
export const COACHING_BEST_FOR = [
  'NEET',
  'JEE',
  'Droppers',
  'Foundation',
  'Working Professionals',
]

export const HOSTEL_BEST_FOR = [
  'Exam Aspirants',
  'College Students',
  'Budget Friendly',
  'Girls Only',
  'Near Coaching',
]

// ---------------------------------------------------------------------------
// Pros & Cons
// ---------------------------------------------------------------------------
export type ProConItem = { text: string }

export const COACHING_PROS: ProConItem[] = [
  { text: 'Experienced faculty with proven track record' },
  { text: 'Comprehensive study material provided' },
  { text: 'Regular mock tests and assessments' },
  { text: 'Good peer learning environment' },
]

export const COACHING_CONS: ProConItem[] = [
  { text: 'Batch sizes can be large during peak season' },
  { text: 'Limited parking available on campus' },
  { text: 'Weekend classes may have schedule changes' },
]

export const HOSTEL_PROS: ProConItem[] = [
  { text: 'Well-maintained rooms with daily cleaning' },
  { text: 'Nutritious meals served three times daily' },
  { text: 'Close proximity to major coaching institutes' },
  { text: '24/7 security and CCTV surveillance' },
]

export const HOSTEL_CONS: ProConItem[] = [
  { text: 'Limited visitor hours during exam season' },
  { text: 'Laundry service available only on weekdays' },
  { text: 'Shared bathrooms on some floors' },
]

// ---------------------------------------------------------------------------
// Nearby places
// ---------------------------------------------------------------------------
export type NearbyPlace = {
  name: string
  category: string
  emoji: string
  distance: string
}

export const COACHING_NEARBY: NearbyPlace[] = [
  { name: 'Sunrise Hostel', category: 'Hostel', emoji: '🏠', distance: '0.3 km' },
  { name: 'City Library', category: 'Library', emoji: '📚', distance: '0.5 km' },
  { name: 'Sharma Mess', category: 'Mess', emoji: '🍽️', distance: '0.2 km' },
  { name: 'Vijay Nagar Bus Stop', category: 'Bus Stop', emoji: '🚌', distance: '0.4 km' },
]

export const HOSTEL_NEARBY: NearbyPlace[] = [
  { name: 'Apex Coaching', category: 'Coaching', emoji: '🏛️', distance: '0.2 km' },
  { name: 'Municipal Library', category: 'Library', emoji: '📚', distance: '0.6 km' },
  { name: 'Gupta Mess', category: 'Mess', emoji: '🍽️', distance: '0.1 km' },
  { name: 'Scheme 78 Bus Stop', category: 'Bus Stop', emoji: '🚌', distance: '0.3 km' },
]

// ---------------------------------------------------------------------------
// Settlr Score (manual placeholder)
// ---------------------------------------------------------------------------
export const SETTLR_SCORE = 9.2
