/**
 * Skip Navigation Component
 * Allows keyboard users to skip to main content
 */

import React from 'react';
import './SkipNavigation.css';

export const SkipNavigation: React.FC = () => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href="#main-content"
      className="skip-navigation"
      onClick={handleClick}
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
};

