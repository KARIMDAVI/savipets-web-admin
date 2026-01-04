/**
 * Shadow Design Tokens
 * Elevation system for depth and hierarchy
 */

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 2px 8px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 12px rgba(0, 0, 0, 0.1)',
  xl: '0 8px 24px rgba(0, 0, 0, 0.12)',
  '2xl': '0 12px 48px rgba(0, 0, 0, 0.15)',

  // Component-specific shadows
  card: '0 2px 8px rgba(0, 0, 0, 0.1)',
  cardHover: '0 4px 16px rgba(0, 0, 0, 0.12)',
  sidebar: '2px 0 8px rgba(0, 0, 0, 0.1)',
  header: '0 2px 8px rgba(0, 0, 0, 0.1)',
  dropdown: '0 4px 12px rgba(0, 0, 0, 0.15)',
  modal: '0 12px 48px rgba(0, 0, 0, 0.2)',
} as const;

export type ShadowToken = typeof shadows;

