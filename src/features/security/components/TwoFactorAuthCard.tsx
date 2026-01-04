/**
 * Two-Factor Authentication Card Component
 * 
 * Manages 2FA settings and actions.
 */

import React from 'react';
import { Card, Space, Alert, Button, Switch } from 'antd';
import {
  KeyOutlined,
  MobileOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { SecuritySettings } from '../types/security.types';

interface TwoFactorAuthCardProps {
  settings: SecuritySettings;
  loading: boolean;
  onToggle2FA: (enabled: boolean) => void;
  onAddPasskey: () => void;
  onAddTOTP: () => void;
  onOpenSettings: () => void;
}

export const TwoFactorAuthCard: React.FC<TwoFactorAuthCardProps> = ({
  settings,
  loading,
  onToggle2FA,
  onAddPasskey,
  onAddTOTP,
  onOpenSettings,
}) => {
  return (
    <Card
      title="Two-Factor Authentication"
      extra={
        <Switch
          checked={settings.twoFactorEnabled}
          onChange={(checked) => onToggle2FA(checked)}
          loading={loading}
        />
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message={settings.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}
          description={
            settings.twoFactorEnabled
              ? 'Your account is protected with two-factor authentication.'
              : 'Enable two-factor authentication to add an extra layer of security.'
          }
          type={settings.twoFactorEnabled ? 'success' : 'warning'}
          showIcon
        />
        
        <Space wrap>
          <Button
            icon={<KeyOutlined />}
            onClick={onAddPasskey}
            disabled={!settings.twoFactorEnabled}
          >
            Add Passkey
          </Button>
          <Button
            icon={<MobileOutlined />}
            onClick={onAddTOTP}
            disabled={!settings.twoFactorEnabled}
          >
            Add TOTP
          </Button>
          <Button
            icon={<SettingOutlined />}
            onClick={onOpenSettings}
          >
            Settings
          </Button>
        </Space>
      </Space>
    </Card>
  );
};

