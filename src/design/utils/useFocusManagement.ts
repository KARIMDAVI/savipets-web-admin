/**
 * Focus Management Hook
 * Manages focus trap for modals and dialogs
 */

import { useEffect, useRef } from 'react';

/**
 * Get all focusable elements within a container
 */
const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll(selectors)) as HTMLElement[];
};

/**
 * Focus trap hook for modals and dialogs
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get focusable elements
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement?.focus();

    // Handle Tab key
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTab);

    return () => {
      container.removeEventListener('keydown', handleTab);
      // Restore focus to previous element
      previousActiveElement.current?.focus();
    };
  }, [isActive]);

  return containerRef;
};

/**
 * Focus management for restoring focus
 */
export const useFocusRestore = (shouldRestore: boolean) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (shouldRestore) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else {
      previousFocusRef.current?.focus();
    }
  }, [shouldRestore]);
};

