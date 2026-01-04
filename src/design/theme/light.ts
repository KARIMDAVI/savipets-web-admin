/**
 * Light Theme Configuration
 */

import { colors, spacing, typography, shadows, borders } from '../tokens';

export const lightTheme = {
  colors: {
    primary: colors.primary[500],
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
    info: colors.info[500],
    background: colors.background.default,
    backgroundSecondary: colors.background.secondary,
    backgroundTertiary: colors.background.tertiary,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    textTertiary: colors.text.tertiary,
    textDisabled: colors.text.disabled,
    textInverse: colors.text.inverse,
    border: borders.color.default,
  },
  spacing,
  typography,
  shadows,
  borders,
  mode: 'light' as const,
};

export type LightTheme = typeof lightTheme;

