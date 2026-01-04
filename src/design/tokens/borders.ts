/**
 * Border Design Tokens
 * Border radius and width values
 */

export const borders = {
  radius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  width: {
    none: '0',
    thin: '1px',
    medium: '2px',
    thick: '4px',
  },

  color: {
    default: '#f0f0f0',
    light: '#fafafa',
    dark: '#d9d9d9',
  },
} as const;

export type BorderToken = typeof borders;

