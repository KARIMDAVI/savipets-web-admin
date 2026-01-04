/**
 * Security Headers Utilities
 * 
 * Utilities for setting security headers and implementing security best practices.
 */

/**
 * Content Security Policy configuration
 */
export const CSP_CONFIG = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Note: unsafe-eval needed for some libraries
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  fontSrc: ["'self'", "data:"],
  connectSrc: ["'self'", "https://*.firebaseio.com", "https://*.googleapis.com"],
  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  upgradeInsecureRequests: true,
};

/**
 * Generate Content Security Policy header
 */
export function generateCSPHeader(): string {
  const directives: string[] = [];

  if (CSP_CONFIG.defaultSrc.length > 0) {
    directives.push(`default-src ${CSP_CONFIG.defaultSrc.join(' ')}`);
  }
  if (CSP_CONFIG.scriptSrc.length > 0) {
    directives.push(`script-src ${CSP_CONFIG.scriptSrc.join(' ')}`);
  }
  if (CSP_CONFIG.styleSrc.length > 0) {
    directives.push(`style-src ${CSP_CONFIG.styleSrc.join(' ')}`);
  }
  if (CSP_CONFIG.imgSrc.length > 0) {
    directives.push(`img-src ${CSP_CONFIG.imgSrc.join(' ')}`);
  }
  if (CSP_CONFIG.fontSrc.length > 0) {
    directives.push(`font-src ${CSP_CONFIG.fontSrc.join(' ')}`);
  }
  if (CSP_CONFIG.connectSrc.length > 0) {
    directives.push(`connect-src ${CSP_CONFIG.connectSrc.join(' ')}`);
  }
  if (CSP_CONFIG.frameSrc.length > 0) {
    directives.push(`frame-src ${CSP_CONFIG.frameSrc.join(' ')}`);
  }
  if (CSP_CONFIG.objectSrc.length > 0) {
    directives.push(`object-src ${CSP_CONFIG.objectSrc.join(' ')}`);
  }
  if (CSP_CONFIG.baseUri.length > 0) {
    directives.push(`base-uri ${CSP_CONFIG.baseUri.join(' ')}`);
  }
  if (CSP_CONFIG.formAction.length > 0) {
    directives.push(`form-action ${CSP_CONFIG.formAction.join(' ')}`);
  }
  if (CSP_CONFIG.frameAncestors.length > 0) {
    directives.push(`frame-ancestors ${CSP_CONFIG.frameAncestors.join(' ')}`);
  }
  if (CSP_CONFIG.upgradeInsecureRequests) {
    directives.push('upgrade-insecure-requests');
  }

  return directives.join('; ');
}

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': generateCSPHeader(),
};

/**
 * Apply security headers to document
 * Note: In a real application, these should be set server-side
 */
export function applySecurityHeaders(): void {
  if (typeof document === 'undefined') return;

  // Create meta tags for security headers
  // Note: Some headers can only be set server-side (e.g., HSTS, CSP)
  const metaTags = [
    { name: 'referrer', content: 'strict-origin-when-cross-origin' },
  ];

  metaTags.forEach(({ name, content }) => {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  });
}

/**
 * Validate input against XSS patterns
 */
export function validateInput(input: string): { valid: boolean; sanitized: string } {
  // Remove potentially dangerous characters and patterns
  let sanitized = input;
  
  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (except for images)
  sanitized = sanitized.replace(/data:(?!image\/)/gi, '');
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /expression\(/i,
    /vbscript:/i,
  ];
  
  const hasSuspiciousPattern = suspiciousPatterns.some((pattern) => pattern.test(input));
  
  return {
    valid: !hasSuspiciousPattern,
    sanitized,
  };
}

/**
 * Generate nonce for CSP
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if request origin is allowed
 */
export function isAllowedOrigin(origin: string): boolean {
  const allowedOrigins = [
    window.location.origin,
    'https://savipets.com',
    'https://www.savipets.com',
    // Add other allowed origins
  ];
  
  return allowedOrigins.includes(origin);
}

/**
 * Sanitize file name to prevent path traversal
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path separators and dangerous characters
  return fileName
    .replace(/[\/\\]/g, '_') // Replace slashes
    .replace(/\.\./g, '_') // Replace parent directory references
    .replace(/[<>:"|?*]/g, '_') // Replace invalid characters
    .substring(0, 255); // Limit length
}

