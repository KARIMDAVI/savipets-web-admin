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
  SafetyCertificateOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import type {
  AuditLog,
  ComplianceReport,
  DataRequest,
  DataRetentionPolicy,
} from '@/features/audit-compliance/types/audit-compliance.types';
import { useAuditCompliance, useAuditComplianceActions } from '@/features/audit-compliance/hooks';
import {
  AuditLogsTab,
  ComplianceReportsTab,
  DataRequestsTab,
  DataRetentionTab,
  AuditLogDetailDrawer,
  ProcessDataRequestModal,
  RetentionPolicyModal,
} from '@/features/audit-compliance/components';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

const { Title, Text } = Typography;

const AuditCompliancePage: React.FC = () => {
  const auditComplianceEnabled = useFeatureFlag('auditComplianceEnabled');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [logDetailVisible, setLogDetailVisible] = useState(false);
  const [dataRequestModalVisible, setDataRequestModalVisible] = useState(false);
  const [retentionModalVisible, setRetentionModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [form] = Form.useForm();
  const [dataRequestForm] = Form.useForm();

  if (!auditComplianceEnabled) {
    return (
      <div>
        <Title level={2}>Audit & Compliance</Title>
        <Text type="secondary">
          The Audit & Compliance module is not enabled in this environment.
        </Text>
      </div>
    );
  }

  // Use audit compliance hook for data fetching
  const {
    auditLogs,
    complianceReports,
    dataRequests,
    retentionPolicies,
    isLoading,
  } = useAuditCompliance();

  // Use audit compliance actions hook
  const {
    handleProcessDataRequest: handleProcessDataRequestHook,
    handleUpdateRetentionPolicy: handleUpdateRetentionPolicyHook,
  } = useAuditComplianceActions();

  // Filter logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.resource.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
      const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
      
      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [auditLogs, searchTerm, categoryFilter, severityFilter]);

  // Calculate statistics
  const stats = useMemo(() => ({
    totalLogs: auditLogs.length,
    criticalLogs: auditLogs.filter(l => l.severity === 'critical').length,
    failedActions: auditLogs.filter(l => !l.success).length,
    complianceScore: complianceReports.length > 0 ? 
      complianceReports.reduce((sum, r) => sum + r.score, 0) / complianceReports.length : 0,
    pendingRequests: dataRequests.filter(r => r.status === 'pending').length,
    activePolicies: retentionPolicies.length,
  }), [auditLogs, complianceReports, dataRequests, retentionPolicies]);

  // Handlers
  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    setLogDetailVisible(true);
  };

  const handleProcessDataRequest = async (values: any) => {
    try {
      await handleProcessDataRequestHook(values);
      setDataRequestModalVisible(false);
      dataRequestForm.resetFields();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleUpdateRetentionPolicy = async (values: any) => {
    try {
      await handleUpdateRetentionPolicyHook(values);
      setRetentionModalVisible(false);
      form.resetFields();
    } catch (error) {
      // Error already handled in hook
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <Space>
            <SafetyCertificateOutlined />
            Audit & Compliance
          </Space>
        </Title>
        <Text type="secondary">
          Comprehensive audit log viewer, compliance reports, and GDPR/CCPA tools
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Audit Logs"
              value={stats.totalLogs}
              prefix={<AuditOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Critical Events"
              value={stats.criticalLogs}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Compliance Score"
              value={stats.complianceScore}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pending Requests"
              value={stats.pendingRequests}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs 
        defaultActiveKey="audit-logs"
        items={[
          {
            key: 'audit-logs',
            label: 'Audit Logs',
            children: (
              <AuditLogsTab
                auditLogs={auditLogs}
                filteredLogs={filteredLogs}
                loading={isLoading}
                searchTerm={searchTerm}
                categoryFilter={categoryFilter}
                severityFilter={severityFilter}
                onSearchChange={setSearchTerm}
                onCategoryFilterChange={setCategoryFilter}
                onSeverityFilterChange={setSeverityFilter}
                onViewLog={handleViewLog}
              />
            ),
          },
          {
            key: 'compliance',
            label: 'Compliance Reports',
            children: (
              <ComplianceReportsTab
                complianceReports={complianceReports}
              />
            ),
          },
          {
            key: 'data-requests',
            label: 'Data Requests',
            children: (
              <DataRequestsTab
                dataRequests={dataRequests}
                onProcessRequest={() => setDataRequestModalVisible(true)}
              />
            ),
          },
          {
            key: 'retention',
            label: 'Data Retention',
            children: (
              <DataRetentionTab
                retentionPolicies={retentionPolicies}
                onAddPolicy={() => setRetentionModalVisible(true)}
              />
            ),
          },
        ]} 
      />

      {/* Modals and Drawers */}
      <AuditLogDetailDrawer
        log={selectedLog}
        visible={logDetailVisible}
        onClose={() => setLogDetailVisible(false)}
      />

      <ProcessDataRequestModal
        open={dataRequestModalVisible}
        form={dataRequestForm}
        onCancel={() => setDataRequestModalVisible(false)}
        onSubmit={handleProcessDataRequest}
      />

      <RetentionPolicyModal
        open={retentionModalVisible}
        form={form}
        onCancel={() => setRetentionModalVisible(false)}
        onSubmit={handleUpdateRetentionPolicy}
      />
    </div>
  );
};

export default AuditCompliancePage;
