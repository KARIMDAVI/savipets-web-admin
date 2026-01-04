/**
 * Empty State Illustration
 * SVG illustration for empty states
 */

import React from 'react';

interface EmptyStateIllustrationProps {
  width?: number;
  height?: number;
}

export const EmptyStateIllustration: React.FC<EmptyStateIllustrationProps> = ({
  width = 200,
  height = 200,
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <circle cx="100" cy="80" r="30" fill="#f0f0f0" />
      <rect x="70" y="110" width="60" height="40" rx="4" fill="#f0f0f0" />
      <path
        d="M100 50 L100 30 M100 50 L85 40 M100 50 L115 40"
        stroke="#d9d9d9"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

