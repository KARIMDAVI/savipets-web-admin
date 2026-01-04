/**
 * Hook for fetching system configuration data
 * 
 * Currently uses mock data. In production, this would fetch from a backend service.
 */

import { useState, useEffect } from 'react';
import type {
  ServiceType,
  PricingTier,
  FeatureFlag,
  BusinessHours,
  SystemSettings,
} from '../types/system-config.types';

interface UseSystemConfigReturn {
  serviceTypes: ServiceType[];
  pricingTiers: PricingTier[];
  featureFlags: FeatureFlag[];
  businessHours: BusinessHours[];
  systemSettings: SystemSettings[];
  isLoading: boolean;
  refetch: () => void;
}

/**
 * Hook to fetch system configuration data
 * 
 * @returns System configuration data and loading state
 */
export const useSystemConfig = (): UseSystemConfigReturn => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMockData = () => {
    setIsLoading(true);
    
    // Mock service types
    const mockServiceTypes: ServiceType[] = [
      {
        id: 'service1',
        name: 'Dog Walking',
        description: 'Professional dog walking service',
        category: 'walking',
        duration: 30,
        basePrice: 25,
        pricePerHour: 50,
        isActive: true,
        requiresSpecialSkills: false,
        maxPets: 3,
        icon: '🐕',
        color: '#52c41a',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'service2',
        name: 'Pet Sitting',
        description: 'In-home pet sitting service',
        category: 'sitting',
        duration: 60,
        basePrice: 40,
        pricePerHour: 40,
        isActive: true,
        requiresSpecialSkills: true,
        maxPets: 5,
        icon: '🏠',
        color: '#1890ff',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-10'),
      },
      {
        id: 'service3',
        name: 'Overnight Care',
        description: '24-hour overnight pet care',
        category: 'overnight',
        duration: 1440, // 24 hours
        basePrice: 120,
        pricePerHour: 5,
        isActive: true,
        requiresSpecialSkills: true,
        maxPets: 2,
        icon: '🌙',
        color: '#722ed1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-12'),
      },
    ];

    // Mock pricing tiers
    const mockPricingTiers: PricingTier[] = [
      {
        id: 'pricing1',
        name: 'Standard Walking',
        description: 'Regular 30-minute dog walk',
        serviceTypeId: 'service1',
        duration: 30,
        price: 25,
        isActive: true,
        conditions: {
          minPets: 1,
          maxPets: 3,
          timeOfDay: 'morning',
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'pricing2',
        name: 'Extended Walking',
        description: '60-minute extended dog walk',
        serviceTypeId: 'service1',
        duration: 60,
        price: 45,
        isActive: true,
        conditions: {
          minPets: 1,
          maxPets: 2,
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-10'),
      },
    ];

    // Mock feature flags
    const mockFeatureFlags: FeatureFlag[] = [
      {
        id: 'flag1',
        name: 'AI Sitter Assignment',
        description: 'Enable AI-powered sitter assignment',
        key: 'ai_assignment',
        isEnabled: true,
        rolloutPercentage: 100,
        conditions: {
          userRoles: ['admin'],
          platforms: ['web', 'ios'],
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'flag2',
        name: 'Advanced Tracking',
        description: 'Enable advanced route tracking features',
        key: 'advanced_tracking',
        isEnabled: true,
        rolloutPercentage: 50,
        conditions: {
          userRoles: ['admin', 'pet_sitter'],
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-10'),
      },
      {
        id: 'flag3',
        name: 'Beta Chat Features',
        description: 'Enable experimental chat features',
        key: 'beta_chat',
        isEnabled: false,
        rolloutPercentage: 0,
        conditions: {
          userRoles: ['admin'],
          platforms: ['web'],
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-08'),
      },
    ];

    // Mock business hours
    const mockBusinessHours: BusinessHours[] = [
      { id: 'sun', dayOfWeek: 0, dayName: 'Sunday', isOpen: false, openTime: '09:00', closeTime: '17:00' },
      { id: 'mon', dayOfWeek: 1, dayName: 'Monday', isOpen: true, openTime: '07:00', closeTime: '19:00' },
      { id: 'tue', dayOfWeek: 2, dayName: 'Tuesday', isOpen: true, openTime: '07:00', closeTime: '19:00' },
      { id: 'wed', dayOfWeek: 3, dayName: 'Wednesday', isOpen: true, openTime: '07:00', closeTime: '19:00' },
      { id: 'thu', dayOfWeek: 4, dayName: 'Thursday', isOpen: true, openTime: '07:00', closeTime: '19:00' },
      { id: 'fri', dayOfWeek: 5, dayName: 'Friday', isOpen: true, openTime: '07:00', closeTime: '19:00' },
      { id: 'sat', dayOfWeek: 6, dayName: 'Saturday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    ];

    // Mock system settings
    const mockSystemSettings: SystemSettings[] = [
      {
        id: 'setting1',
        category: 'general',
        key: 'company_name',
        value: 'SaviPets',
        type: 'string',
        description: 'Company name displayed in the application',
        isRequired: true,
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'setting2',
        category: 'booking',
        key: 'max_advance_booking_days',
        value: 30,
        type: 'number',
        description: 'Maximum days in advance bookings can be made',
        isRequired: true,
        updatedAt: new Date('2024-01-10'),
      },
      {
        id: 'setting3',
        category: 'payment',
        key: 'payment_processing_fee',
        value: 2.9,
        type: 'number',
        description: 'Payment processing fee percentage',
        isRequired: true,
        updatedAt: new Date('2024-01-12'),
      },
      {
        id: 'setting4',
        category: 'notification',
        key: 'email_notifications_enabled',
        value: true,
        type: 'boolean',
        description: 'Enable email notifications',
        isRequired: false,
        updatedAt: new Date('2024-01-08'),
      },
    ];

    setServiceTypes(mockServiceTypes);
    setPricingTiers(mockPricingTiers);
    setFeatureFlags(mockFeatureFlags);
    setBusinessHours(mockBusinessHours);
    setSystemSettings(mockSystemSettings);
    setIsLoading(false);
  };

  useEffect(() => {
    loadMockData();
  }, []);

  const refetch = () => {
    loadMockData();
  };

  return {
    serviceTypes,
    pricingTiers,
    featureFlags,
    businessHours,
    systemSettings,
    isLoading,
    refetch,
  };
};

