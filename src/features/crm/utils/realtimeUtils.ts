/**
 * Real-Time Utilities
 * 
 * Utility functions for managing real-time subscriptions and connection status.
 */

import type { Unsubscribe } from 'firebase/firestore';

/**
 * Connection status type
 */
export interface ConnectionStatus {
  isConnected: boolean;
  lastConnectedAt: Date | null;
  errorCount: number;
  lastError: Error | null;
}

/**
 * Manage multiple real-time subscriptions
 */
export class RealtimeSubscriptionManager {
  private subscriptions: Map<string, Unsubscribe> = new Map();
  private status: ConnectionStatus = {
    isConnected: false,
    lastConnectedAt: null,
    errorCount: 0,
    lastError: null,
  };

  /**
   * Add a subscription
   */
  addSubscription(key: string, unsubscribe: Unsubscribe): void {
    // Remove existing subscription if any
    this.removeSubscription(key);

    this.subscriptions.set(key, unsubscribe);
    this.updateStatus({ isConnected: true, lastConnectedAt: new Date() });
  }

  /**
   * Remove a subscription
   */
  removeSubscription(key: string): void {
    const unsubscribe = this.subscriptions.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(key);
    }

    // Update status if no subscriptions remain
    if (this.subscriptions.size === 0) {
      this.updateStatus({ isConnected: false });
    }
  }

  /**
   * Remove all subscriptions
   */
  removeAllSubscriptions(): void {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions.clear();
    this.updateStatus({ isConnected: false });
  }

  /**
   * Get current status
   */
  getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  /**
   * Update connection status
   */
  updateStatus(updates: Partial<ConnectionStatus>): void {
    this.status = { ...this.status, ...updates };
  }

  /**
   * Record an error
   */
  recordError(error: Error): void {
    this.status = {
      ...this.status,
      isConnected: false,
      errorCount: this.status.errorCount + 1,
      lastError: error,
    };
  }

  /**
   * Reset error count
   */
  resetErrorCount(): void {
    this.status = {
      ...this.status,
      errorCount: 0,
      lastError: null,
    };
  }

  /**
   * Get subscription count
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }
}

/**
 * Global subscription manager instance
 */
export const globalSubscriptionManager = new RealtimeSubscriptionManager();

/**
 * Get connection status message
 */
export const getConnectionStatusMessage = (status: ConnectionStatus): string => {
  if (status.isConnected) {
    return 'Connected';
  }
  if (status.lastError) {
    return `Disconnected: ${status.lastError.message}`;
  }
  return 'Disconnected';
};

/**
 * Check if should retry connection
 */
export const shouldRetryConnection = (status: ConnectionStatus): boolean => {
  // Retry if error count is less than 5 and last error was more than 5 seconds ago
  if (status.errorCount >= 5) {
    return false;
  }
  if (status.lastError && status.lastConnectedAt) {
    const timeSinceError = Date.now() - status.lastConnectedAt.getTime();
    return timeSinceError > 5000; // Wait 5 seconds before retry
  }
  return true;
};

