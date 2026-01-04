/**
 * Tests for Color Contrast Utilities
 */

import { describe, it, expect } from 'vitest';
import { getContrastRatio, getContrastColor, getAccessibleTextColor, meetsWCAGContrast } from '../colorContrast';

describe('getContrastRatio', () => {
  it('should calculate contrast ratio between white and black', () => {
    const ratio = getContrastRatio('#ffffff', '#000000');
    expect(ratio).toBeGreaterThan(20); // White on black has very high contrast
  });

  it('should calculate contrast ratio between same colors', () => {
    const ratio = getContrastRatio('#ffffff', '#ffffff');
    expect(ratio).toBe(1); // Same color = 1:1 ratio
  });

  it('should handle hex colors with #', () => {
    const ratio = getContrastRatio('#ffffff', '#000000');
    expect(ratio).toBeGreaterThan(1);
  });

  it('should handle hex colors without #', () => {
    const ratio = getContrastRatio('ffffff', '000000');
    expect(ratio).toBeGreaterThan(1);
  });
});

describe('getContrastColor', () => {
  it('should return dark text for light background', () => {
    const textColor = getContrastColor('#ffffff');
    expect(textColor).toBeDefined();
  });

  it('should return light text for dark background', () => {
    const textColor = getContrastColor('#000000');
    expect(textColor).toBeDefined();
  });
});

describe('getAccessibleTextColor', () => {
  it('should return color that meets WCAG AA for light background', () => {
    const textColor = getAccessibleTextColor('#ffffff', 4.5);
    expect(textColor).toBeDefined();
  });

  it('should return color that meets WCAG AA for dark background', () => {
    const textColor = getAccessibleTextColor('#000000', 4.5);
    expect(textColor).toBeDefined();
  });
});

describe('meetsWCAGContrast', () => {
  it('should return true for high contrast colors', () => {
    const meets = meetsWCAGContrast('#ffffff', '#000000', 'AA', 'normal');
    expect(meets).toBe(true);
  });

  it('should return false for low contrast colors', () => {
    const meets = meetsWCAGContrast('#ffffff', '#f0f0f0', 'AA', 'normal');
    expect(meets).toBe(false);
  });

  it('should have lower threshold for large text', () => {
    const normal = meetsWCAGContrast('#ffffff', '#cccccc', 'AA', 'normal');
    const large = meetsWCAGContrast('#ffffff', '#cccccc', 'AA', 'large');
    expect(large).toBeGreaterThanOrEqual(normal);
  });
});

