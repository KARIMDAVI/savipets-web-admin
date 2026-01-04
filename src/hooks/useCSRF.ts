/**
 * CSRF Protection Hook
 * Manages CSRF tokens for secure API requests
 */

import { useState, useEffect, useCallback } from 'react';
import { generateCSRFToken } from '@/utils/security/idGenerator';
import { securityConfig } from '@/config/security.config';

export const useCSRF = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Generate or retrieve CSRF token
    if (typeof window !== 'undefined') {
      const storedToken = sessionStorage.getItem(securityConfig.csrf.cookieName);
      if (storedToken) {
        setToken(storedToken);
      } else {
        const newToken = generateCSRFToken();
        sessionStorage.setItem(securityConfig.csrf.cookieName, newToken);
        setToken(newToken);
      }
    }
  }, []);

  const getCSRFHeaders = useCallback((): Record<string, string> => {
    if (!token) return {};
    return {
      [securityConfig.csrf.tokenHeader]: token,
    };
  }, [token]);

  const refreshToken = useCallback(() => {
    const newToken = generateCSRFToken();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(securityConfig.csrf.cookieName, newToken);
    }
    setToken(newToken);
  }, []);

  return {
    token,
    getCSRFHeaders,
    refreshToken,
  };
};

