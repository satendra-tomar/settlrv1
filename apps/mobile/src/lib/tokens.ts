// =============================================================================
// Settlr Mobile — Design Tokens
// Reference these constants everywhere. Never hardcode hex, spacing, or
// font-size values inline in StyleSheet objects or inline styles.
// =============================================================================

export const colors = {
  violet: '#8B5CF6',
  violetLight: '#A78BFA',
  violetBorder: '#E9D5FF',
  surface: '#FAF8FF',
  darkTop: '#2A1B44',
  darkBottom: '#12091C',
  ink: '#1F2937',
  muted: '#6B7280',
  verified: '#22C55E',
  star: '#F59E0B',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  background: '#F9FAFB',
  cardBackground: '#FFFFFF',
  border: '#E5E7EB',
} as const

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const
