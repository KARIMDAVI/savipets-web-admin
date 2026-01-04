import React from 'react';
import { Alert, Space, Switch, Typography } from 'antd';

const { Text, Paragraph, Title } = Typography;

export interface SitterMessagingControlsProps {
  enabled: boolean;
  loading?: boolean;
  onChange: (value: boolean) => void;
}

const SitterMessagingControls: React.FC<SitterMessagingControlsProps> = ({ enabled, loading = false, onChange }) => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Title level={4} style={{ marginBottom: 0 }}>
        Direct Messaging
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 0 }}>
        Allow this sitter to exchange direct messages with pet owners. When disabled, sitters can only reach out to the admin
        team; existing owner threads will remain read-only for the sitter.
      </Paragraph>
      <Space align="center" size="large">
        <Switch
          checked={enabled}
          loading={loading}
          onChange={onChange}
        />
        <Text strong>{enabled ? 'Allowed' : 'Disabled'}</Text>
      </Space>
      {!enabled && (
        <Alert
          type="info"
          showIcon
          message="Sitters without direct messaging must communicate through the admin team."
        />
      )}
    </Space>
  );
};

export default SitterMessagingControls;
