/**
 * Animation Utilities
 * Reusable animation patterns
 */

export const animations = {
  // Fade animations
  fadeIn: {
    animation: 'fadeIn 0.3s ease-in',
  },
  fadeOut: {
    animation: 'fadeOut 0.3s ease-out',
  },

  // Slide animations
  slideUp: {
    animation: 'slideUp 0.3s ease-out',
  },
  slideDown: {
    animation: 'slideDown 0.3s ease-out',
  },
  slideLeft: {
    animation: 'slideLeft 0.3s ease-out',
  },
  slideRight: {
    animation: 'slideRight 0.3s ease-out',
  },

  // Scale animations
  scaleIn: {
    animation: 'scaleIn 0.2s ease-out',
  },
  scaleOut: {
    animation: 'scaleOut 0.2s ease-out',
  },

  // Transition helpers
  transition: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
  },
};

// CSS keyframes (to be added to index.css)
export const animationKeyframes = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideLeft {
  from { transform: translateX(10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideRight {
  from { transform: translateX(-10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes scaleOut {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.95); opacity: 0; }
}
`;

