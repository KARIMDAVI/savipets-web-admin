/**
 * Color Design Tokens
 * Centralized color system following design system best practices
 */

export const colors = {
  // Primary brand colors
  primary: {
    50: '#fff7e6',
    100: '#ffe7ba',
    200: '#ffd591',
    300: '#ffc069',
    400: '#ffab40',
    500: '#f0932b', // Main brand color
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Semantic colors
  success: {
    50: '#f6ffed',
    100: '#d9f7be',
    200: '#b7eb8f',
    300: '#95de64',
    400: '#73d13d',
    500: '#52c41a',
    600: '#389e0d',
    700: '#237804',
    800: '#135200',
    900: '#092b00',
  },

  warning: {
    50: '#fffbe6',
    100: '#fff1b8',
    200: '#ffe58f',
    300: '#ffd666',
    400: '#ffc53d',
    500: '#faad14',
    600: '#d48806',
    700: '#ad6800',
    800: '#874d00',
    900: '#613400',
  },

  error: {
    50: '#fff1f0',
    100: '#ffccc7',
    200: '#ffa39e',
    300: '#ff7875',
    400: '#ff4d4f',
    500: '#f5222d',
    600: '#cf1322',
    700: '#a8071a',
    800: '#820014',
    900: '#5c0011',
  },

  info: {
    50: '#e6f7ff',
    100: '#bae7ff',
    200: '#91d5ff',
    300: '#69c0ff',
    400: '#40a9ff',
    500: '#1890ff',
    600: '#096dd9',
    700: '#0050b3',
    800: '#003a8c',
    900: '#002766',
  },

  // Neutral colors
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#f0f0f0',
    300: '#d9d9d9',
    400: '#bfbfbf',
    500: '#8c8c8c',
    600: '#595959',
    700: '#434343',
    800: '#262626',
    900: '#1f1f1f',
    1000: '#000000',
  },

  // Background colors
  background: {
    default: '#f0f2f5',
    secondary: '#fafafa',
    tertiary: '#ffffff',
  },

  // Text colors
  text: {
    primary: '#262626',
    secondary: '#595959',
    tertiary: '#8c8c8c',
    disabled: '#bfbfbf',
    inverse: '#ffffff',
  },
} as const;

export type ColorToken = typeof colors;

