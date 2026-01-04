/**
 * useOnlineStatus Hook
 * 
 * Hook to monitor online/offline status of the browser.
 * Useful for showing connection status in CRM real-time features.
 */

import { useState, useEffect } from 'react';

interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

/**
 * Hook to track browser online/offline status
 */
export const useOnlineStatus = (): OnlineStatus => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // Reset wasOffline after a short delay
      setTimeout(() => setWasOffline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
};

