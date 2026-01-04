/**
 * Design Tokens Index
 * Centralized export for all design tokens
 */

// Import all tokens
import { colors } from './colors';
import { spacing, spacingScale } from './spacing';
import { typography } from './typography';
import { shadows } from './shadows';
import { borders } from './borders';
import { breakpoints, mediaQueries } from './breakpoints';

// Re-export individual tokens
export * from './colors';
export * from './spacing';
export * from './typography';
export * from './shadows';
export * from './borders';
export * from './breakpoints';

// Export combined tokens object
export const tokens = {
  colors,
  spacing,
  spacingScale,
  typography,
  shadows,
  borders,
  breakpoints,
  mediaQueries,
} as const;

export type Tokens = typeof tokens;

