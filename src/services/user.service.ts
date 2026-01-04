import type { User, UserFilters } from '@/types';
import { userQueryService } from './users/UserQueryService';
import { userManagementService } from './users/UserManagementService';
import { userSubscriptionService } from './users/UserSubscriptionService';

/**
 * User Service - Facade for all user operations
 * Delegates to specialized services for queries, management, and subscriptions
 */
class UserService {

  async getAllUsers(filters?: UserFilters): Promise<User[]> {
    return userQueryService.getAllUsers(filters);
  }

  async getUserById(userId: string): Promise<User | null> {
    return userQueryService.getUserById(userId);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return userQueryService.getUsersByRole(role);
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    return userManagementService.updateUserStatus(userId, isActive);
  }

  async updateUserRole(
    userId: string, 
    newRole: string, 
    reason: string
  ): Promise<void> {
    return userManagementService.updateUserRole(userId, newRole, reason);
  }

  async createUser(userData: Partial<User>): Promise<string> {
    return userManagementService.createUser(userData);
  }

  async deleteUser(userId: string, reason: string): Promise<void> {
    return userManagementService.deleteUser(userId, reason);
  }

  async updateSitterMessagingPermission(userId: string, allow: boolean): Promise<void> {
    return userManagementService.updateSitterMessagingPermission(userId, allow);
  }

  subscribeToUsers(callback: (users: User[]) => void): () => void {
    return userSubscriptionService.subscribeToUsers(callback);
  }

}

export const userService = new UserService();
