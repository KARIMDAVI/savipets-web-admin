/**
 * Theme Toggle Component
 * Button to switch between light and dark themes
 */

import React from 'react';
import { Button } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTheme } from '@/design/utils/useTheme';
import { a11y } from '@/design/utils/a11y';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      type="text"
      icon={isDark ? <SunOutlined /> : <MoonOutlined />}
      onClick={toggleTheme}
      {...a11y.label(`Switch to ${isDark ? 'light' : 'dark'} mode`)}
    >
      {isDark ? 'Light' : 'Dark'}
    </Button>
  );
};

