/**
 * Accessibility Utilities
 * ARIA helpers and accessibility utilities
 */

import { generateSecureId } from '@/utils/security/idGenerator';

export const a11y = {
  /**
   * Generate unique ID for ARIA relationships (secure)
   */
  generateId: (prefix: string): string => {
    return generateSecureId(prefix);
  },

  /**
   * ARIA label helpers
   */
  label: (text: string) => ({ 'aria-label': text }),
  labelledBy: (id: string) => ({ 'aria-labelledby': id }),
  describedBy: (id: string) => ({ 'aria-describedby': id }),
  controls: (id: string) => ({ 'aria-controls': id }),

  /**
   * Live regions for screen readers
   */
  live: {
    polite: { 'aria-live': 'polite' as const },
    assertive: { 'aria-live': 'assertive' as const },
    off: { 'aria-live': 'off' as const },
  },

  /**
   * ARIA roles
   */
  role: {
    button: { role: 'button' as const },
    dialog: { role: 'dialog' as const },
    alert: { role: 'alert' as const },
    status: { role: 'status' as const },
    region: { role: 'region' as const },
    navigation: { role: 'navigation' as const },
    main: { role: 'main' as const },
    complementary: { role: 'complementary' as const },
    banner: { role: 'banner' as const },
    contentinfo: { role: 'contentinfo' as const },
  },

  /**
   * ARIA states
   */
  state: {
    expanded: (expanded: boolean) => ({ 'aria-expanded': expanded }),
    hidden: (hidden: boolean) => ({ 'aria-hidden': hidden }),
    disabled: (disabled: boolean) => ({ 'aria-disabled': disabled }),
    required: (required: boolean) => ({ 'aria-required': required }),
    invalid: (invalid: boolean) => ({ 'aria-invalid': invalid }),
    busy: (busy: boolean) => ({ 'aria-busy': busy }),
    pressed: (pressed: boolean | 'mixed') => ({ 'aria-pressed': pressed }),
    checked: (checked: boolean | 'mixed') => ({ 'aria-checked': checked }),
    selected: (selected: boolean) => ({ 'aria-selected': selected }),
  },

  /**
   * ARIA properties
   */
  property: {
    modal: (modal: boolean) => ({ 'aria-modal': modal }),
    atomic: (atomic: boolean) => ({ 'aria-atomic': atomic }),
    relevant: (relevant: 'additions' | 'removals' | 'text' | 'all') => ({
      'aria-relevant': relevant,
    }),
  },
};

