/**
 * Dark Theme Configuration
 */

import { colors, spacing, typography, shadows, borders } from '../tokens';

export const darkTheme = {
  colors: {
    primary: colors.primary[400],
    success: colors.success[400],
    warning: colors.warning[400],
    error: colors.error[400],
    info: colors.info[400],
    background: colors.neutral[900],
    backgroundSecondary: colors.neutral[800],
    backgroundTertiary: colors.neutral[700],
    text: colors.neutral[0],
    textSecondary: colors.neutral[200],
    textTertiary: colors.neutral[400],
    textDisabled: colors.neutral[600],
    textInverse: colors.neutral[900],
    border: colors.neutral[700],
  },
  spacing,
  typography,
  shadows: {
    ...shadows,
    // Enhanced shadows for dark mode
    card: '0 2px 8px rgba(0, 0, 0, 0.3)',
    cardHover: '0 4px 16px rgba(0, 0, 0, 0.4)',
  },
  borders,
  mode: 'dark' as const,
};

export type DarkTheme = typeof darkTheme;

