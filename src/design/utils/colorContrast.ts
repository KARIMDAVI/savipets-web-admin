/**
 * Color Contrast Utility
 * WCAG 2.1 AA compliant contrast calculations
 */

import { colors } from '../tokens';

/**
 * Calculate relative luminance (WCAG formula)
 */
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Convert hex color to RGB
 */
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
};

/**
 * Calculate contrast ratio between two colors (WCAG formula)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);

  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Get accessible text color for a background
 * Returns the color with better contrast ratio
 */
export const getContrastColor = (backgroundColor: string): string => {
  const contrastWithPrimary = getContrastRatio(backgroundColor, colors.text.primary);
  const contrastWithInverse = getContrastRatio(backgroundColor, colors.text.inverse);

  return contrastWithPrimary >= contrastWithInverse
    ? colors.text.primary
    : colors.text.inverse;
};

/**
 * Get accessible text color with minimum contrast requirement
 * @param backgroundColor - Background color in hex format
 * @param minContrast - Minimum contrast ratio (default 4.5 for WCAG AA)
 * @returns Accessible text color
 */
export const getAccessibleTextColor = (
  backgroundColor: string,
  minContrast: number = 4.5
): string => {
  const primaryContrast = getContrastRatio(backgroundColor, colors.text.primary);
  const inverseContrast = getContrastRatio(backgroundColor, colors.text.inverse);

  if (primaryContrast >= minContrast) {
    return colors.text.primary;
  } else if (inverseContrast >= minContrast) {
    return colors.text.inverse;
  } else {
    // Neither meets minimum - return the better one and log warning
    console.warn(
      `Background color ${backgroundColor} does not meet WCAG AA contrast requirements. ` +
      `Best contrast: ${Math.max(primaryContrast, inverseContrast).toFixed(2)}:1`
    );
    return primaryContrast >= inverseContrast ? colors.text.primary : colors.text.inverse;
  }
};

/**
 * Check if contrast ratio meets WCAG AA standards
 * @param color1 - First color
 * @param color2 - Second color
 * @param level - WCAG level ('AA' or 'AAA')
 * @param size - Text size ('normal' or 'large')
 * @returns True if contrast meets requirements
 */
export const meetsWCAGContrast = (
  color1: string,
  color2: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean => {
  const ratio = getContrastRatio(color1, color2);

  if (level === 'AA') {
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
  } else {
    // AAA
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  }
};

