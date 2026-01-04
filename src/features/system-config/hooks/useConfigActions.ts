/**
 * Hook for system configuration actions (mutations)
 * 
 * Handles creating, updating, and deleting configuration items.
 */

import { useState } from 'react';
import { message } from 'antd';
import type {
  ServiceType,
  PricingTier,
  FeatureFlag,
} from '../types/system-config.types';

interface UseConfigActionsReturn {
  handleCreateService: (values: any) => Promise<void>;
  handleCreatePricing: (values: any) => Promise<void>;
  handleCreateFeatureFlag: (values: any) => Promise<void>;
  handleUpdateBusinessHours: (values: any) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
}

/**
 * Hook for system configuration actions
 * 
 * @param onServiceCreated - Callback when service is created
 * @param onPricingCreated - Callback when pricing is created
 * @param onFeatureCreated - Callback when feature flag is created
 * @returns Action handlers and loading states
 */
export const useConfigActions = (
  onServiceCreated?: (service: ServiceType) => void,
  onPricingCreated?: (pricing: PricingTier) => void,
  onFeatureCreated?: (feature: FeatureFlag) => void,
): UseConfigActionsReturn => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCreateService = async (values: any) => {
    try {
      setIsCreating(true);
      const newService: ServiceType = {
        id: `service-${Date.now()}`,
        name: values.name,
        description: values.description,
        category: values.category,
        duration: values.duration,
        basePrice: values.basePrice,
        pricePerHour: values.pricePerHour,
        isActive: values.isActive ?? true,
        requiresSpecialSkills: values.requiresSpecialSkills ?? false,
        maxPets: values.maxPets,
        icon: values.icon || '📋',
        color: values.color || '#1890ff',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // In a real implementation, you would save to backend here
      // await configService.createService(newService);
      
      onServiceCreated?.(newService);
      message.success('Service created successfully');
    } catch (error) {
      message.error('Failed to create service');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreatePricing = async (values: any) => {
    try {
      setIsCreating(true);
      const newPricing: PricingTier = {
        id: `pricing-${Date.now()}`,
        name: values.name,
        description: values.description,
        serviceTypeId: values.serviceTypeId,
        duration: values.duration,
        price: values.price,
        isActive: values.isActive ?? true,
        conditions: {
          minPets: values.minPets,
          maxPets: values.maxPets,
          timeOfDay: values.timeOfDay,
          dayOfWeek: values.dayOfWeek,
          isWeekend: values.isWeekend,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // In a real implementation, you would save to backend here
      // await configService.createPricing(newPricing);
      
      onPricingCreated?.(newPricing);
      message.success('Pricing tier created successfully');
    } catch (error) {
      message.error('Failed to create pricing tier');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateFeatureFlag = async (values: any) => {
    try {
      setIsCreating(true);
      const newFeature: FeatureFlag = {
        id: `flag-${Date.now()}`,
        name: values.name,
        description: values.description,
        key: values.key,
        isEnabled: values.isEnabled ?? false,
        rolloutPercentage: values.rolloutPercentage ?? 0,
        targetUsers: values.targetUsers,
        conditions: {
          userRoles: values.userRoles,
          platforms: values.platforms,
          regions: values.regions,
          dateRange: values.dateRange ? {
            start: values.dateRange[0].toDate(),
            end: values.dateRange[1].toDate(),
          } : undefined,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // In a real implementation, you would save to backend here
      // await configService.createFeatureFlag(newFeature);
      
      onFeatureCreated?.(newFeature);
      message.success('Feature flag created successfully');
    } catch (error) {
      message.error('Failed to create feature flag');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateBusinessHours = async (values: any) => {
    try {
      setIsUpdating(true);
      // In a real implementation, you would update business hours in backend
      // await configService.updateBusinessHours(values);
      message.success('Business hours updated successfully');
    } catch (error) {
      message.error('Failed to update business hours');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    handleCreateService,
    handleCreatePricing,
    handleCreateFeatureFlag,
    handleUpdateBusinessHours,
    isCreating,
    isUpdating,
  };
};

