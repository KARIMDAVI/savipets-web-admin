/**
 * Theme Provider
 * Manages theme state and provides theme context
 */

import React, { useState, useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { lightTheme, darkTheme } from '../theme';
import { ThemeContext } from './useTheme';
import type { Theme } from '../theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') {
        return saved === 'dark';
      }
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return true;
      }
    }
    return false;
  });

  const currentTheme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    // Save theme preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, isDark, toggleTheme, setTheme }}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: currentTheme.colors.primary,
            borderRadius: 8,
            fontFamily: currentTheme.typography.fontFamily.sans,
            // Map theme colors to Ant Design tokens
            colorSuccess: currentTheme.colors.success,
            colorWarning: currentTheme.colors.warning,
            colorError: currentTheme.colors.error,
            colorInfo: currentTheme.colors.info,
            colorBgContainer: currentTheme.colors.backgroundTertiary,
            colorBgElevated: currentTheme.colors.backgroundSecondary,
            colorBgLayout: currentTheme.colors.background,
            colorText: currentTheme.colors.text,
            colorTextSecondary: currentTheme.colors.textSecondary,
            colorTextTertiary: currentTheme.colors.textTertiary,
            colorBorder: currentTheme.colors.border,
          },
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

