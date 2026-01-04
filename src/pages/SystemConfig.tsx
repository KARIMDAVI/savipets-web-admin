import React, { useState, useEffect } from 'react';
import {
  Typography,
  Space,
  Button,
  message,
  Tabs,
  Form,
} from 'antd';
import {
  SettingOutlined,
} from '@ant-design/icons';
import type {
  ServiceType,
  PricingTier,
  FeatureFlag,
  BusinessHours,
  SystemSettings,
} from '@/features/system-config/types/system-config.types';
import { useSystemConfig, useConfigActions, useConfigStats } from '@/features/system-config/hooks';
import { ConfigStatsCards, ServiceTypesTab, PricingTab, FeatureFlagsTab, BusinessHoursTab, SettingsTab, ServiceDetailModal, CreateServiceModal, CreatePricingModal, CreateFeatureFlagModal } from '@/features/system-config/components';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const SystemConfigPage: React.FC = () => {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedPricing, setSelectedPricing] = useState<PricingTier | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureFlag | null>(null);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [pricingModalVisible, setPricingModalVisible] = useState(false);
  const [featureModalVisible, setFeatureModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [pricingForm] = Form.useForm();
  const [featureForm] = Form.useForm();
  const [settingsForm] = Form.useForm();

  // Use system config hook for data fetching
  const {
    serviceTypes,
    pricingTiers,
    featureFlags,
    businessHours,
    systemSettings,
    isLoading: configLoading,
    refetch: refetchConfig,
  } = useSystemConfig();

  // Use config actions hook
  const {
    handleCreateService: handleCreateServiceHook,
    handleCreatePricing: handleCreatePricingHook,
    handleCreateFeatureFlag: handleCreateFeatureFlagHook,
    handleUpdateBusinessHours: handleUpdateBusinessHoursHook,
    isCreating,
  } = useConfigActions(
    (newService) => {
      // Callback when service is created - refetch to update UI
      refetchConfig();
    },
    (newPricing) => {
      // Callback when pricing is created
      refetchConfig();
    },
    (newFeature) => {
      // Callback when feature is created
      refetchConfig();
    }
  );

  // Keep local state for UI (modals, selected items, filters)
  // Note: In a full refactoring, this would move to a Zustand store
  const [serviceTypesLocal, setServiceTypesLocal] = useState<ServiceType[]>([]);
  const [pricingTiersLocal, setPricingTiersLocal] = useState<PricingTier[]>([]);
  const [featureFlagsLocal, setFeatureFlagsLocal] = useState<FeatureFlag[]>([]);

  // Sync hook data to local state for immediate UI updates
  useEffect(() => {
    setServiceTypesLocal(serviceTypes);
    setPricingTiersLocal(pricingTiers);
    setFeatureFlagsLocal(featureFlags);
  }, [serviceTypes, pricingTiers, featureFlags]);

  const handleCreateService = async (values: any) => {
    try {
      await handleCreateServiceHook(values);
      // Update local state immediately for UI responsiveness
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
      setServiceTypesLocal(prev => [...prev, newService]);
      setServiceModalVisible(false);
      form.resetFields();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleCreatePricing = async (values: any) => {
    try {
      await handleCreatePricingHook(values);
      // Update local state immediately for UI responsiveness
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
      setPricingTiersLocal(prev => [...prev, newPricing]);
      setPricingModalVisible(false);
      pricingForm.resetFields();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleCreateFeatureFlag = async (values: any) => {
    try {
      await handleCreateFeatureFlagHook(values);
      // Update local state immediately for UI responsiveness
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
      setFeatureFlagsLocal(prev => [...prev, newFeature]);
      setFeatureModalVisible(false);
      featureForm.resetFields();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleUpdateBusinessHours = async (values: any) => {
    await handleUpdateBusinessHoursHook(values);
  };

  // Service types tab handlers
  const handleViewService = (service: ServiceType) => {
    setSelectedService(service);
  };

  const handleRefreshServices = () => {
    message.info('Refreshing services...');
    refetchConfig();
  };

  // Calculate statistics using hook
  const stats = useConfigStats({
    serviceTypes: serviceTypesLocal,
    pricingTiers: pricingTiersLocal,
    featureFlags: featureFlagsLocal,
    businessHours,
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <Space>
            <SettingOutlined />
            System Configuration
          </Space>
        </Title>
        <Text type="secondary">
          Manage service types, pricing, feature flags, and system settings
        </Text>
      </div>

      {/* Statistics Cards */}
      <ConfigStatsCards stats={stats} />

      <Tabs defaultActiveKey="services">
        <TabPane tab="Service Types" key="services">
          <ServiceTypesTab
            services={serviceTypesLocal}
            loading={loading}
            searchTerm={searchTerm}
            categoryFilter={categoryFilter}
            onSearchChange={setSearchTerm}
            onCategoryFilterChange={setCategoryFilter}
            onAddService={() => setServiceModalVisible(true)}
            onViewService={handleViewService}
            onRefresh={handleRefreshServices}
          />
        </TabPane>

        <TabPane tab="Pricing" key="pricing">
          <PricingTab
            pricingTiers={pricingTiersLocal}
            onAddPricing={() => setPricingModalVisible(true)}
            onViewPricing={(pricing) => setSelectedPricing(pricing)}
          />
        </TabPane>

        <TabPane tab="Feature Flags" key="features">
          <FeatureFlagsTab
            featureFlags={featureFlags}
            onAddFeatureFlag={() => setFeatureModalVisible(true)}
            onEditFeatureFlag={(flag: FeatureFlag) => {
              // TODO: Implement edit functionality
              message.info(`Edit feature flag: ${flag.name}`);
            }}
          />
        </TabPane>

        <TabPane tab="Business Hours" key="hours">
          <BusinessHoursTab
            businessHours={businessHours}
            form={form}
            onUpdateBusinessHours={handleUpdateBusinessHours}
          />
        </TabPane>

        <TabPane tab="System Settings" key="settings">
          <SettingsTab
            systemSettings={systemSettings}
            onAddSetting={() => setSettingsModalVisible(true)}
            onEditSetting={(setting) => {
              // TODO: Implement edit functionality
              message.info(`Edit setting: ${setting.key}`);
            }}
          />
        </TabPane>
      </Tabs>

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />

      {/* Create Service Modal */}
      <CreateServiceModal
        open={serviceModalVisible}
        form={form}
        onCancel={() => setServiceModalVisible(false)}
        onSubmit={handleCreateService}
      />

      {/* Create Pricing Modal */}
      <CreatePricingModal
        open={pricingModalVisible}
        form={pricingForm}
        serviceTypes={serviceTypesLocal}
        onCancel={() => setPricingModalVisible(false)}
        onSubmit={handleCreatePricing}
      />

      {/* Create Feature Flag Modal */}
      <CreateFeatureFlagModal
        open={featureModalVisible}
        form={featureForm}
        onCancel={() => setFeatureModalVisible(false)}
        onSubmit={handleCreateFeatureFlag}
      />
    </div>
  );
};

export default SystemConfigPage;
