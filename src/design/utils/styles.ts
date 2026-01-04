/**
 * Style Utilities
 * Common style patterns using design tokens
 */

import { colors, spacing, shadows, borders } from '../tokens';
import { useTheme } from './useTheme';

export const useStyles = () => {
  const { theme } = useTheme();

  return {
    // Card styles
    card: {
      background: theme.colors.backgroundTertiary,
      borderRadius: borders.radius.md,
      boxShadow: shadows.card,
      padding: spacing.lg,
      transition: 'box-shadow 0.2s ease',
    },
    cardHover: {
      '&:hover': {
        boxShadow: shadows.cardHover,
      },
    },

    // Container styles
    container: {
      padding: spacing.lg,
      background: theme.colors.background,
      minHeight: '100vh',
    },
    contentContainer: {
      padding: spacing.lg,
      background: theme.colors.backgroundTertiary,
      borderRadius: borders.radius.md,
      boxShadow: shadows.card,
    },

    // Loading styles
    loadingOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: theme.colors.background,
      zIndex: 9999,
    },
    loadingCard: {
      background: theme.colors.backgroundTertiary,
      borderRadius: borders.radius.md,
      boxShadow: shadows.card,
      padding: spacing.xl,
      textAlign: 'center' as const,
    },

    // Header styles
    header: {
      background: theme.colors.backgroundTertiary,
      boxShadow: shadows.header,
      padding: spacing.md,
      borderBottom: `1px solid ${theme.colors.border}`,
    },

    // Sidebar styles
    sidebar: {
      background: theme.colors.backgroundTertiary,
      boxShadow: shadows.sidebar,
    },
  };
};

// Static style helpers (don't require theme)
export const staticStyles = {
  // Flex utilities
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
  },

  // Spacing utilities
  spacing: {
    p: (value: keyof typeof spacing) => ({ padding: spacing[value] }),
    px: (value: keyof typeof spacing) => ({ 
      paddingLeft: spacing[value], 
      paddingRight: spacing[value] 
    }),
    py: (value: keyof typeof spacing) => ({ 
      paddingTop: spacing[value], 
      paddingBottom: spacing[value] 
    }),
    m: (value: keyof typeof spacing) => ({ margin: spacing[value] }),
    mx: (value: keyof typeof spacing) => ({ 
      marginLeft: spacing[value], 
      marginRight: spacing[value] 
    }),
    my: (value: keyof typeof spacing) => ({ 
      marginTop: spacing[value], 
      marginBottom: spacing[value] 
    }),
  },
};

