import React, { useState, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tabs,
  Statistic,
  Form,
} from 'antd';
import {
  BellOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import type {
  NotificationTemplate,
  NotificationCampaign,
  NotificationPreference,
  NotificationLog,
} from '@/features/notifications/types/notifications.types';
import { useNotifications, useNotificationActions } from '@/features/notifications/hooks';
import {
  TemplatesTab,
  CampaignsTab,
  PreferencesTab,
  LogsTab,
  TemplateDetailModal,
  CreateTemplateModal,
  CreateCampaignModal,
  SendTestModal,
} from '@/features/notifications/components';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

const { Title, Text } = Typography;

const NotificationsPage: React.FC = () => {
  const notificationsEnabled = useFeatureFlag('notificationsModuleEnabled');
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [campaignModalVisible, setCampaignModalVisible] = useState(false);
  const [preferenceModalVisible, setPreferenceModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [form] = Form.useForm();
  const [campaignForm] = Form.useForm();
  const [testForm] = Form.useForm();

  if (!notificationsEnabled) {
    return (
      <div>
        <Title level={2}>Notifications System</Title>
        <Text type="secondary">
          The Notifications module is not enabled in this environment.
        </Text>
      </div>
    );
  }

  // Use notifications hook for data fetching
  const {
    templates,
    campaigns,
    preferences,
    notificationLogs,
    isLoading,
    setTemplates,
    setCampaigns,
  } = useNotifications();

  // Use notification actions hook
  const {
    handleCreateTemplate: handleCreateTemplateHook,
    handleCreateCampaign: handleCreateCampaignHook,
    handleSendTest: handleSendTestHook,
  } = useNotificationActions({
    onTemplateCreated: (newTemplate) => {
      setTemplates(prev => [...prev, newTemplate]);
    },
    onCampaignCreated: (newCampaign) => {
      setCampaigns(prev => [...prev, newCampaign]);
    },
  });

  // Fetch users for targeting
  const { data: users = [] } = useQuery({
    queryKey: ['notification-users'],
    queryFn: () => userService.getAllUsers(),
  });

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || template.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
      
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [templates, searchTerm, typeFilter, categoryFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
    const totalDelivered = campaigns.reduce((sum, c) => sum + c.deliveredCount, 0);
    const totalOpened = campaigns.reduce((sum, c) => sum + c.openedCount, 0);
    
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
    
    return {
      totalTemplates: templates.length,
      activeTemplates: templates.filter(t => t.isActive).length,
      totalCampaigns: campaigns.length,
      sentNotifications: totalSent,
      deliveryRate: Number.isFinite(deliveryRate) ? deliveryRate : 0,
      openRate: Number.isFinite(openRate) ? openRate : 0,
    };
  }, [templates, campaigns]);

  // Handlers
  const handleCreateTemplate = async (values: any) => {
    try {
      await handleCreateTemplateHook(values);
      setTemplateModalVisible(false);
      form.resetFields();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleCreateCampaign = async (values: any) => {
    try {
      await handleCreateCampaignHook(values);
      setCampaignModalVisible(false);
      campaignForm.resetFields();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleSendTest = async (values: any) => {
    try {
      await handleSendTestHook(values);
      setTestModalVisible(false);
      testForm.resetFields();
    } catch (error) {
      // Error already handled in hook
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <Space>
            <BellOutlined />
            Notifications System
          </Space>
        </Title>
        <Text type="secondary">
          FCM, email, and SMS notifications with templates and preferences
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active Templates"
              value={stats.activeTemplates}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Campaigns"
              value={stats.totalCampaigns}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Delivery Rate"
              value={stats.deliveryRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Open Rate"
              value={stats.openRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs 
        defaultActiveKey="templates"
        items={[
          {
            key: 'templates',
            label: 'Templates',
            children: (
              <TemplatesTab
                templates={templates}
                filteredTemplates={filteredTemplates}
                loading={isLoading}
                searchTerm={searchTerm}
                typeFilter={typeFilter}
                categoryFilter={categoryFilter}
                onSearchChange={setSearchTerm}
                onTypeFilterChange={setTypeFilter}
                onCategoryFilterChange={setCategoryFilter}
                onAddTemplate={() => setTemplateModalVisible(true)}
                onViewTemplate={(template) => setSelectedTemplate(template)}
                onTestTemplate={() => setTestModalVisible(true)}
              />
            ),
          },
          {
            key: 'campaigns',
            label: 'Campaigns',
            children: (
              <CampaignsTab
                campaigns={campaigns}
                onAddCampaign={() => setCampaignModalVisible(true)}
              />
            ),
          },
          {
            key: 'preferences',
            label: 'Preferences',
            children: (
              <PreferencesTab
                preferences={preferences}
                onManagePreferences={() => setPreferenceModalVisible(true)}
              />
            ),
          },
          {
            key: 'logs',
            label: 'Logs',
            children: (
              <LogsTab
                notificationLogs={notificationLogs}
                loading={isLoading}
              />
            ),
          },
        ]}
      />

      {/* Modals */}
      <TemplateDetailModal
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
      />

      <CreateTemplateModal
        open={templateModalVisible}
        form={form}
        onCancel={() => setTemplateModalVisible(false)}
        onSubmit={handleCreateTemplate}
      />

      <CreateCampaignModal
        open={campaignModalVisible}
        form={campaignForm}
        templates={templates}
        users={users}
        onCancel={() => setCampaignModalVisible(false)}
        onSubmit={handleCreateCampaign}
      />

      <SendTestModal
        open={testModalVisible}
        form={testForm}
        templates={templates}
        onCancel={() => setTestModalVisible(false)}
        onSubmit={handleSendTest}
      />
    </div>
  );
};

export default NotificationsPage;
