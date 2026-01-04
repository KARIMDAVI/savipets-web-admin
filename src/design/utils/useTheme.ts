/**
 * Theme Hook
 * Provides theme context and utilities
 */

import { useContext, createContext } from 'react';
import { lightTheme, darkTheme } from '../theme';
import type { Theme } from '../theme';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export { ThemeContext };

