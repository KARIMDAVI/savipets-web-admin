/**
 * Responsive Hook
 * SSR-safe responsive breakpoint detection
 */

import { useState, useEffect } from 'react';
import { breakpoints } from '../tokens';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

export const useResponsive = (): ResponsiveState => {
  const [width, setWidth] = useState(() => {
    // SSR-safe initialization
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 0; // Default for SSR
  });

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Set initial width
    setWidth(window.innerWidth);

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    isMobile: width < breakpoints.md,
    isTablet: width >= breakpoints.md && width < breakpoints.lg,
    isDesktop: width >= breakpoints.lg,
    width,
  };
};

