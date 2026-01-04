/**
 * Keyboard Navigation Hook
 * Handles keyboard events for accessible navigation
 */

import { useEffect, useRef, useCallback } from 'react';

interface KeyboardNavigationOptions {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  enabled?: boolean;
}

export const useKeyboardNavigation = ({
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onEnter,
  onEscape,
  onHome,
  onEnd,
  enabled = true,
}: KeyboardNavigationOptions) => {
  const ref = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      switch (e.key) {
        case 'ArrowUp':
          if (onArrowUp) {
            e.preventDefault();
            onArrowUp();
          }
          break;
        case 'ArrowDown':
          if (onArrowDown) {
            e.preventDefault();
            onArrowDown();
          }
          break;
        case 'ArrowLeft':
          if (onArrowLeft) {
            e.preventDefault();
            onArrowLeft();
          }
          break;
        case 'ArrowRight':
          if (onArrowRight) {
            e.preventDefault();
            onArrowRight();
          }
          break;
        case 'Enter':
          if (onEnter) {
            e.preventDefault();
            onEnter();
          }
          break;
        case 'Escape':
          if (onEscape) {
            e.preventDefault();
            onEscape();
          }
          break;
        case 'Home':
          if (onHome) {
            e.preventDefault();
            onHome();
          }
          break;
        case 'End':
          if (onEnd) {
            e.preventDefault();
            onEnd();
          }
          break;
      }
    },
    [enabled, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onEnter, onEscape, onHome, onEnd]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    element.addEventListener('keydown', handleKeyDown);
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  return ref;
};

