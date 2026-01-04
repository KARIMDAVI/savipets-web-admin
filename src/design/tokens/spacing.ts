/**
 * Spacing Design Tokens
 * Consistent spacing scale based on 4px base unit
 */

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
} as const;

export const spacingScale = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  13: '52px',
  14: '56px',
  15: '60px',
  16: '64px',
} as const;

export type SpacingToken = typeof spacing;
export type SpacingScale = typeof spacingScale;

