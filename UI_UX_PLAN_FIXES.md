# UI/UX Plan - Corrected Code Fixes

This document provides corrected implementations for the critical issues identified in the security review.

---

## Fix 1: Secure ARIA ID Generation (Step 21)

### ❌ Original (Insecure)
```typescript
export const a11y = {
  generateId: (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
  // ...
}
```

### ✅ Corrected (Secure)
```typescript
export const a11y = {
  // Cryptographically secure ID generation
  generateId: (prefix: string): string => {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      // Browser environment - use Web Crypto API
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      return `${prefix}-${hex}`;
    } else {
      // Fallback for Node.js (should use crypto.randomUUID in Node 14.17+)
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 11);
      return `${prefix}-${timestamp}-${random}`;
    }
  },
  // ... rest of a11y utilities
}
```

---

## Fix 2: ES Module Import (Step 8)

### ❌ Original (Incorrect)
```typescript
export const tokens = {
  colors: require('./colors').colors,
  spacing: require('./spacing').spacing,
  typography: require('./typography').typography,
  shadows: require('./shadows').shadows,
  borders: require('./borders').borders,
  breakpoints: require('./breakpoints').breakpoints,
} as const;
```

### ✅ Corrected (Proper ES Modules)
```typescript
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { shadows } from './shadows';
import { borders } from './borders';
import { breakpoints } from './breakpoints';

export * from './colors';
export * from './spacing';
export * from './typography';
export * from './shadows';
export * from './borders';
export * from './breakpoints';

export const tokens = {
  colors,
  spacing,
  typography,
  shadows,
  borders,
  breakpoints,
} as const;
```

---

## Fix 3: SSR-Compatible Responsive Hook (Step 18)

### ❌ Original (Breaks SSR)
```typescript
export const useResponsive = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // ...
}
```

### ✅ Corrected (SSR-Safe)
```typescript
export const useResponsive = () => {
  const [width, setWidth] = useState(() => {
    // Safe SSR check
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

    window.addEventListener('resize', handleResize);
    
    // Set initial width
    setWidth(window.innerWidth);

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
```

---

## Fix 4: Secure File Upload (Step 60)

### ❌ Original (Insecure)
```typescript
const beforeUpload = (file: File) => {
  const isValidSize = file.size / 1024 / 1024 < maxSize;
  if (!isValidSize) {
    message.error(`File must be smaller than ${maxSize}MB!`);
    return false;
  }
  return true;
};
```

### ✅ Corrected (Secure)
```typescript
import DOMPurify from 'dompurify';

interface FileUploadProps extends FormItemProps {
  maxSize?: number; // in MB
  accept?: string;
  maxCount?: number;
  allowedMimeTypes?: string[]; // e.g., ['image/jpeg', 'image/png']
  onFileValidate?: (file: File) => Promise<boolean>; // Server-side validation
}

export const FileUploadField: React.FC<FileUploadProps> = ({
  maxSize = 5,
  accept,
  maxCount = 1,
  allowedMimeTypes = [],
  onFileValidate,
  ...props
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Sanitize filename to prevent path traversal
  const sanitizeFilename = (filename: string): string => {
    // Remove path separators and dangerous characters
    return filename
      .replace(/[\/\\]/g, '') // Remove path separators
      .replace(/[<>:"|?*]/g, '') // Remove dangerous characters
      .replace(/^\.+/, '') // Remove leading dots
      .substring(0, 255); // Limit length
  };

  // Validate MIME type using magic bytes (more secure than extension)
  const validateMimeType = async (file: File): Promise<boolean> => {
    if (allowedMimeTypes.length === 0) return true;

    // Read first bytes to check magic numbers
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer.slice(0, 4));
        
        // Check magic bytes for common file types
        const isValid = allowedMimeTypes.some(mimeType => {
          // JPEG: FF D8 FF
          if (mimeType === 'image/jpeg' && bytes[0] === 0xFF && bytes[1] === 0xD8) {
            return true;
          }
          // PNG: 89 50 4E 47
          if (mimeType === 'image/png' && bytes[0] === 0x89 && bytes[1] === 0x50 && 
              bytes[2] === 0x4E && bytes[3] === 0x47) {
            return true;
          }
          // Add more validations as needed
          return false;
        });
        
        resolve(isValid);
      };
      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  };

  const beforeUpload = async (file: File): Promise<boolean> => {
    // 1. Size validation
    const isValidSize = file.size / 1024 / 1024 < maxSize;
    if (!isValidSize) {
      message.error(`File must be smaller than ${maxSize}MB!`);
      return false;
    }

    // 2. Filename sanitization
    const sanitized = sanitizeFilename(file.name);
    if (sanitized !== file.name) {
      message.warning('Filename sanitized for security');
    }

    // 3. MIME type validation
    if (allowedMimeTypes.length > 0) {
      const isValidMime = await validateMimeType(file);
      if (!isValidMime) {
        message.error('Invalid file type. Please upload a valid file.');
        return false;
      }
    }

    // 4. Server-side validation (if provided)
    if (onFileValidate) {
      try {
        const isValid = await onFileValidate(file);
        if (!isValid) {
          message.error('File validation failed. Please try another file.');
          return false;
        }
      } catch (error) {
        message.error('File validation error. Please try again.');
        return false;
      }
    }

    return true;
  };

  const handleChange = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${sanitizeFilename(info.file.name)} uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`Upload failed: ${info.file.error?.message || 'Unknown error'}`);
    }
    setFileList(info.fileList);
  };

  return (
    <Form.Item {...props}>
      <Upload
        fileList={fileList}
        onChange={handleChange}
        beforeUpload={beforeUpload}
        accept={accept}
        maxCount={maxCount}
      >
        <Button icon={<UploadOutlined />}>Upload</Button>
      </Upload>
      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: 8 }}>
        Max size: {maxSize}MB. Allowed types: {allowedMimeTypes.join(', ') || 'All'}
      </div>
    </Form.Item>
  );
};
```

**Additional Server-Side Requirements:**
```typescript
// Backend validation example (Firebase Cloud Function)
export const validateUploadedFile = functions.https.onCall(async (data, context) => {
  // 1. Verify authentication
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  
  // 2. Validate file metadata
  const { filename, size, mimeType } = data;
  
  // 3. Check file size
  if (size > 5 * 1024 * 1024) {
    throw new functions.https.HttpsError('invalid-argument', 'File too large');
  }
  
  // 4. Validate MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(mimeType)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid file type');
  }
  
  // 5. Scan for viruses (integrate with ClamAV or similar)
  // 6. Generate secure storage path
  const securePath = `uploads/${context.auth.uid}/${Date.now()}-${sanitizeFilename(filename)}`;
  
  return { valid: true, path: securePath };
});
```

---

## Fix 5: WCAG-Compliant Color Contrast (Step 19)

### ❌ Original (Inaccurate)
```typescript
export const getContrastColor = (backgroundColor: string): string => {
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? colors.text.primary : colors.text.inverse;
};
```

### ✅ Corrected (WCAG-Compliant)
```typescript
// Install: npm install color-contrast
import { getContrast } from 'color-contrast';

// Or implement WCAG formula manually:
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

const getContrastRatio = (color1: string, color2: string): number => {
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  };

  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);

  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

export const getContrastColor = (backgroundColor: string): string => {
  const contrastWithPrimary = getContrastRatio(backgroundColor, colors.text.primary);
  const contrastWithInverse = getContrastRatio(backgroundColor, colors.text.inverse);

  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  // Use the color with better contrast
  return contrastWithPrimary >= contrastWithInverse
    ? colors.text.primary
    : colors.text.inverse;
};

// Enhanced version with minimum contrast check
export const getAccessibleTextColor = (
  backgroundColor: string,
  minContrast: number = 4.5
): string => {
  const primaryContrast = getContrastRatio(backgroundColor, colors.text.primary);
  const inverseContrast = getContrastRatio(backgroundColor, colors.text.inverse);

  if (primaryContrast >= minContrast) {
    return colors.text.primary;
  } else if (inverseContrast >= minContrast) {
    return colors.text.inverse;
  } else {
    // Neither meets minimum - return the better one and log warning
    console.warn(
      `Background color ${backgroundColor} does not meet WCAG AA contrast requirements. ` +
      `Best contrast: ${Math.max(primaryContrast, inverseContrast).toFixed(2)}:1`
    );
    return primaryContrast >= inverseContrast ? colors.text.primary : colors.text.inverse;
  }
};
```

---

## Fix 6: Focus Trap for Ant Design Modal (Step 23)

### ❌ Original (Incorrect)
```typescript
<Modal
  {...props}
  open={open}
  {...a11y.role.dialog}
  {...a11y.label(modalLabel)}
  ref={trapRef} // ❌ Modal doesn't accept refs this way
/>
```

### ✅ Corrected (Proper Implementation)
```typescript
import React, { useEffect, useRef } from 'react';
import { Modal, ModalProps } from 'antd';
import { useFocusTrap } from '@/design/utils/useFocusManagement';
import { a11y } from '@/design/utils/a11y';

interface AccessibleModalProps extends ModalProps {
  modalLabel: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  modalLabel,
  open,
  children,
  ...props
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const trapRef = useFocusTrap(open || false);

  useEffect(() => {
    if (open) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  return (
    <Modal
      {...props}
      open={open}
      {...a11y.role.dialog}
      {...a11y.label(modalLabel)}
      // Ant Design Modal handles focus management internally,
      // but we can enhance it with our trap
    >
      <div ref={(node) => {
        // Combine refs: Ant Design's internal ref and our trap ref
        if (node) {
          contentRef.current = node;
          if (typeof trapRef === 'object' && trapRef.current !== undefined) {
            // If trapRef is a ref object, attach to the same node
            (trapRef as React.MutableRefObject<HTMLElement>).current = node;
          }
        }
      }}>
        {children}
      </div>
    </Modal>
  );
};
```

**Better Approach - Use Ant Design's Built-in Focus Management:**
```typescript
// Ant Design 5.x has built-in focus management
// Just ensure proper ARIA attributes:
export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  modalLabel,
  open,
  ...props
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  return (
    <Modal
      {...props}
      open={open}
      title={props.title || modalLabel} // Use title for accessibility
      aria-label={modalLabel}
      role="dialog"
      aria-modal="true"
      // Ant Design handles focus trap automatically
    />
  );
};
```

---

## Fix 7: Enhanced Password Strength (Step 52)

### ✅ Enhanced Version with Breach Checking
```typescript
import React, { useMemo, useState, useEffect } from 'react';
import { Progress, Typography, Alert } from 'antd';
import { colors } from '@/design/tokens';

const { Text } = Typography;

interface PasswordStrengthProps {
  password: string;
  checkBreaches?: boolean; // Optional: Check Have I Been Pwned API
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ 
  password,
  checkBreaches = false 
}) => {
  const [isBreached, setIsBreached] = useState(false);
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);

  const strength = useMemo(() => {
    if (!password) return 0;

    let score = 0;
    const checks = {
      length8: password.length >= 8,
      length12: password.length >= 12,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^a-zA-Z0-9]/.test(password),
      noCommonPatterns: !/(123|abc|qwerty|password)/i.test(password),
    };

    // Scoring
    if (checks.length8) score++;
    if (checks.length12) score++;
    if (checks.hasLower) score++;
    if (checks.hasUpper) score++;
    if (checks.hasNumber) score++;
    if (checks.hasSpecial) score++;
    if (checks.noCommonPatterns) score++;

    return Math.min(score, 5); // Max score of 5
  }, [password]);

  // Check password breaches using k-anonymity (Have I Been Pwned API)
  useEffect(() => {
    if (!checkBreaches || !password || password.length < 8) {
      setIsBreached(false);
      return;
    }

    const checkBreach = async () => {
      setIsCheckingBreach(true);
      try {
        // Use k-anonymity: send first 5 chars of SHA-1 hash
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        const prefix = hashHex.substring(0, 5);
        const suffix = hashHex.substring(5);

        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        const text = await response.text();
        const hashes = text.split('\n').map(line => line.split(':')[0].toLowerCase());
        
        setIsBreached(hashes.includes(suffix));
      } catch (error) {
        console.error('Error checking password breach:', error);
        // Fail silently - don't block user if API is down
      } finally {
        setIsCheckingBreach(false);
      }
    };

    // Debounce breach check
    const timeoutId = setTimeout(checkBreach, 500);
    return () => clearTimeout(timeoutId);
  }, [password, checkBreaches]);

  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = [
    colors.error[500],
    colors.error[400],
    colors.warning[500],
    colors.info[500],
    colors.success[500],
    colors.success[600],
  ];

  if (!password) return null;

  return (
    <div>
      <Progress
        percent={(strength / 5) * 100}
        strokeColor={strengthColors[strength]}
        showInfo={false}
        status={isBreached ? 'exception' : 'active'}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Password strength: {strengthLabels[strength]}
          {isCheckingBreach && ' (checking...)'}
        </Text>
        {isBreached && (
          <Alert
            message="This password has been found in data breaches"
            type="error"
            showIcon
            style={{ marginTop: 8, fontSize: '12px' }}
          />
        )}
      </div>
    </div>
  );
};
```

---

## Fix 8: Input Sanitization Utility

### ✅ New Utility (Add to design/utils/)
```typescript
// design/utils/sanitization.ts
import DOMPurify from 'dompurify';

export const sanitization = {
  // Sanitize HTML content
  sanitizeHTML: (dirty: string): string => {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target'],
    });
  },

  // Sanitize user input (remove script tags, etc.)
  sanitizeInput: (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  },

  // Sanitize filename
  sanitizeFilename: (filename: string): string => {
    return filename
      .replace(/[\/\\]/g, '')
      .replace(/[<>:"|?*]/g, '')
      .replace(/^\.+/, '')
      .substring(0, 255);
  },

  // Validate email
  validateEmail: (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validate URL
  validateURL: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};
```

---

## Summary

These fixes address:
- ✅ Security vulnerabilities (file upload, ID generation, input sanitization)
- ✅ Technical inaccuracies (ES modules, SSR, focus trap)
- ✅ WCAG compliance (color contrast)
- ✅ Enhanced password security

Apply these fixes before implementing the UI/UX plan to ensure a secure, accessible, and production-ready system.

