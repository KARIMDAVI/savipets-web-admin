import React, { useState, useMemo } from 'react';
import { Typography, Row, Col, Form, message } from 'antd';
import { SecurityScanOutlined } from '@ant-design/icons';
import { useSecurity, useSecurityActions } from '@/features/security/hooks';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import {
  SecurityScoreCard,
  SecurityStatsCards,
  TwoFactorAuthCard,
  SecurityDevicesList,
  ActiveSessionsList,
  AddPasskeyModal,
  AddTOTPModal,
  SessionsModal,
  SecuritySettingsModal,
} from '@/features/security/components';
import type { SecuritySettings } from '@/features/security/types/security.types';

const { Title, Text } = Typography;

const SecurityPage: React.FC = () => {
  const securityEnabled = useFeatureFlag('securityCenterEnabled');
  const [totpModalVisible, setTotpModalVisible] = useState(false);
  const [passkeyModalVisible, setPasskeyModalVisible] = useState(false);
  const [sessionsModalVisible, setSessionsModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [form] = Form.useForm();

  if (!securityEnabled) {
    return (
      <div>
        <Title level={2}>Security & Authentication</Title>
        <Text type="secondary">
          The Security & Authentication module is not enabled in this environment.
        </Text>
      </div>
    );
  }

  // Use security hook
  const {
    devices,
    sessions,
    settings,
    isLoading,
    setDevices,
    setSessions,
    setSettings,
  } = useSecurity();

  // Use security actions hook
  const {
    enable2FA,
    disable2FA,
    addPasskey,
    addTOTP,
    removeDevice,
    terminateSession,
    terminateAllSessions,
    updateSettings,
  } = useSecurityActions({
    onDeviceRemoved: (deviceId) => {
      setDevices(prev => prev.filter(d => d.id !== deviceId));
    },
    onSessionTerminated: (sessionId) => {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    },
    onSettingsUpdated: (newSettings) => {
      setSettings(newSettings);
    },
  });

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalDevices: devices.length,
      activeSessions: sessions.filter(s => s.isCurrent).length,
      totalSessions: sessions.length,
      lastLogin: sessions.length > 0 ? sessions[0].lastActivity : new Date(),
    };
  }, [devices, sessions]);

  // Handlers
  const handleToggle2FA = async (enabled: boolean) => {
    try {
      if (enabled) {
        await enable2FA();
        setSettings(prev => ({ ...prev, twoFactorEnabled: true }));
      } else {
        await disable2FA();
        setSettings(prev => ({ ...prev, twoFactorEnabled: false }));
      }
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleAddPasskey = async () => {
    try {
      await addPasskey();
      setPasskeyModalVisible(false);
      form.resetFields();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleAddTOTP = async () => {
    try {
      await addTOTP();
      setTotpModalVisible(false);
      form.resetFields();
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      await removeDevice(deviceId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await terminateSession(sessionId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleTerminateAllSessions = async () => {
    try {
      await terminateAllSessions();
      setSessions(prev => prev.filter(s => s.isCurrent));
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleUpdateSettings = async (values: SecuritySettings) => {
    try {
      await updateSettings(values);
      setSettingsModalVisible(false);
    } catch (error) {
      // Error already handled in hook
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <span style={{ marginRight: '8px' }}>
            <SecurityScanOutlined />
          </span>
          Security & Authentication
        </Title>
        <Text type="secondary">
          Manage two-factor authentication, security devices, and session security
        </Text>
      </div>

      <SecurityScoreCard
        settings={settings}
        deviceCount={devices.length}
      />

      <SecurityStatsCards
        totalDevices={stats.totalDevices}
        activeSessions={stats.activeSessions}
        totalSessions={stats.totalSessions}
        lastLogin={stats.lastLogin}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <TwoFactorAuthCard
            settings={settings}
            loading={isLoading}
            onToggle2FA={handleToggle2FA}
            onAddPasskey={() => setPasskeyModalVisible(true)}
            onAddTOTP={() => setTotpModalVisible(true)}
            onOpenSettings={() => setSettingsModalVisible(true)}
          />
        </Col>

        <Col xs={24} lg={12}>
          <SecurityDevicesList
            devices={devices}
            loading={isLoading}
            onAddDevice={() => setPasskeyModalVisible(true)}
            onRemoveDevice={handleRemoveDevice}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} lg={12}>
          <ActiveSessionsList
            sessions={sessions}
            loading={isLoading}
            onViewAll={() => setSessionsModalVisible(true)}
            onTerminateSession={handleTerminateSession}
            onTerminateAll={handleTerminateAllSessions}
          />
        </Col>
      </Row>

      <AddPasskeyModal
        visible={passkeyModalVisible}
        loading={isLoading}
        onCancel={() => {
          setPasskeyModalVisible(false);
          form.resetFields();
        }}
        onFinish={handleAddPasskey}
        form={form}
      />

      <AddTOTPModal
        visible={totpModalVisible}
        loading={isLoading}
        onCancel={() => {
          setTotpModalVisible(false);
          form.resetFields();
        }}
        onFinish={handleAddTOTP}
        form={form}
      />

      <SessionsModal
        visible={sessionsModalVisible}
        sessions={sessions}
        onClose={() => setSessionsModalVisible(false)}
        onTerminateSession={handleTerminateSession}
      />

      <SecuritySettingsModal
        visible={settingsModalVisible}
        loading={isLoading}
        settings={settings}
        onCancel={() => setSettingsModalVisible(false)}
        onFinish={handleUpdateSettings}
      />
    </div>
  );
};

export default SecurityPage;
