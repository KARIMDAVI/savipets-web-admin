import React, { useState, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Input,
  Select,
  Button,
  Statistic,
  Form,
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  StarOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  ExportOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';
import { userService } from '@/services/user.service';
import type { User } from '@/types';
import type {
  SitterAvailability,
  SitterPerformance,
  SitterSchedule,
  SitterCertification,
} from '@/features/workforce/types/workforce.types';
import { useWorkforce, useWorkforceActions } from '@/features/workforce/hooks';
import {
  SittersTable,
  SitterDetailDrawer,
  AvailabilityModal,
  ScheduleModal,
} from '@/features/workforce/components';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const WorkforcePage: React.FC = () => {
  const workforceEnabled = useFeatureFlag('workforceModuleEnabled');
  const [selectedSitter, setSelectedSitter] = useState<User | null>(null);
  const [sitterDetailVisible, setSitterDetailVisible] = useState(false);
  const [availabilityModalVisible, setAvailabilityModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [form] = Form.useForm();
  const [scheduleForm] = Form.useForm();

  if (!workforceEnabled) {
    return (
      <div>
        <Title level={2}>Workforce Management</Title>
        <Text type="secondary">
          The Workforce module is not enabled in this environment.
        </Text>
      </div>
    );
  }

  // Fetch sitters
  const {
    data: sitters = [],
    isLoading: sittersLoading,
    refetch: refetchSitters,
  } = useQuery({
    queryKey: ['workforce-sitters'],
    queryFn: () => userService.getUsersByRole('petSitter'),
    refetchInterval: 30000,
  });

  // Fetch bookings for performance analysis
  const { data: bookings = [] } = useQuery({
    queryKey: ['workforce-bookings'],
    queryFn: () => bookingService.getAllBookings({}),
  });

  // Use workforce hook for data fetching
  const {
    sitterAvailability,
    sitterPerformance,
    sitterSchedules,
    sitterCertifications,
    setSitterSchedules,
  } = useWorkforce();

  // Use workforce actions hook
  const {
    handleUpdateAvailability: handleUpdateAvailabilityHook,
    handleCreateSchedule: handleCreateScheduleHook,
  } = useWorkforceActions({
    onScheduleCreated: (newSchedule) => {
      setSitterSchedules(prev => [...prev, newSchedule]);
    },
  });

  // Filter sitters
  const filteredSitters = useMemo(() => {
    return sitters.filter(sitter => {
      const matchesSearch = sitter.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sitter.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sitter.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && sitter.isActive) ||
                           (statusFilter === 'inactive' && !sitter.isActive);
      
      return matchesSearch && matchesStatus;
    });
  }, [sitters, searchTerm, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => ({
    totalSitters: sitters.length,
    activeSitters: sitters.filter(s => s.isActive).length,
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.price, 0),
    avgRating: sitterPerformance.length > 0 ? 
      sitterPerformance.reduce((sum, p) => sum + p.averageRating, 0) / sitterPerformance.length : 0,
    avgCompletionRate: sitterPerformance.length > 0 ?
      sitterPerformance.reduce((sum, p) => sum + p.completionRate, 0) / sitterPerformance.length : 0,
  }), [sitters, bookings, sitterPerformance]);

  // Helper functions
  const getSitterPerformance = (sitterId: string): SitterPerformance | undefined => {
    return sitterPerformance.find(p => p.sitterId === sitterId);
  };

  const getSitterAvailability = (sitterId: string): SitterAvailability[] => {
    return sitterAvailability.filter(a => a.sitterId === sitterId);
  };

  const getSitterCertifications = (sitterId: string): SitterCertification[] => {
    return sitterCertifications.filter(c => c.sitterId === sitterId);
  };

  // Handlers
  const handleViewSitter = async (sitterId: string) => {
    try {
      const sitter = sitters.find(s => s.id === sitterId);
      if (sitter) {
        setSelectedSitter(sitter);
        setSitterDetailVisible(true);
      }
    } catch (error) {
      // Error handling
    }
  };

  const handleUpdateAvailability = async (values: any) => {
    try {
      await handleUpdateAvailabilityHook(values);
      setAvailabilityModalVisible(false);
      form.resetFields();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleCreateSchedule = async (values: any) => {
    try {
      if (!selectedSitter) return;
      await handleCreateScheduleHook(values, selectedSitter.id);
      setScheduleModalVisible(false);
      scheduleForm.resetFields();
    } catch (error) {
      // Error already handled in hook
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <Space>
            <TeamOutlined />
            Workforce Management
          </Space>
        </Title>
        <Text type="secondary">
          Sitter scheduling, availability management, and performance tracking
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Sitters"
              value={stats.totalSitters}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active Sitters"
              value={stats.activeSitters}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Avg Rating"
              value={stats.avgRating}
              precision={1}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={stats.avgCompletionRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Search
              placeholder="Search sitters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={24} sm={10}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetchSitters()}
                loading={sittersLoading}
              >
                Refresh
              </Button>
              <Button
                icon={<ExportOutlined />}
                disabled={filteredSitters.length === 0}
              >
                Export
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Sitters Table */}
      <SittersTable
        sitters={sitters}
        filteredSitters={filteredSitters}
        loading={sittersLoading}
        sitterPerformance={sitterPerformance}
        sitterCertifications={sitterCertifications}
        getSitterPerformance={getSitterPerformance}
        getSitterCertifications={getSitterCertifications}
        onViewSitter={handleViewSitter}
        onManageAvailability={(sitter) => {
          setSelectedSitter(sitter);
          setAvailabilityModalVisible(true);
        }}
        onCreateSchedule={(sitter) => {
          setSelectedSitter(sitter);
          setScheduleModalVisible(true);
        }}
      />

      {/* Modals and Drawers */}
      <SitterDetailDrawer
        sitter={selectedSitter}
        visible={sitterDetailVisible}
        performance={selectedSitter ? getSitterPerformance(selectedSitter.id) : undefined}
        certifications={selectedSitter ? getSitterCertifications(selectedSitter.id) : []}
        availability={selectedSitter ? getSitterAvailability(selectedSitter.id) : []}
        onClose={() => setSitterDetailVisible(false)}
      />

      <AvailabilityModal
        open={availabilityModalVisible}
        form={form}
        onCancel={() => setAvailabilityModalVisible(false)}
        onSubmit={handleUpdateAvailability}
      />

      <ScheduleModal
        open={scheduleModalVisible}
        form={scheduleForm}
        onCancel={() => setScheduleModalVisible(false)}
        onSubmit={handleCreateSchedule}
      />
    </div>
  );
};

export default WorkforcePage;
