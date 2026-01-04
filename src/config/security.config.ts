/**
 * Security Configuration
 * Centralized security settings and constants
 */

export const securityConfig = {
  // File upload security
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'],
    scanForViruses: true, // Enable when virus scanning service is available
  },

  // CSRF protection
  csrf: {
    tokenHeader: 'X-CSRF-Token',
    cookieName: 'csrf-token',
    cookieOptions: {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'strict' as const,
    },
  },

  // Content Security Policy
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // Remove unsafe-inline in production
    styleSrc: ["'self'", "'unsafe-inline'"], // Remove unsafe-inline in production
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.firebase.com'],
    fontSrc: ["'self'", 'data:'],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  },

  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    checkBreaches: true, // Check Have I Been Pwned API
  },

  // Rate limiting (to be implemented server-side)
  rateLimit: {
    login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  },
} as const;

export type SecurityConfig = typeof securityConfig;

