import React from 'react';
import { Typography, Alert } from 'antd';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { AdminMigrationPanel } from '@/features/chat/components';

const { Title, Text } = Typography;

const MigrationsPage: React.FC = () => {
  const migrationsEnabled = useFeatureFlag('chatMigrationsEnabled');

  if (!migrationsEnabled) {
    return (
      <div>
        <Title level={2}>Admin Migrations</Title>
        <Text type="secondary">
          The Chat Migrations tool is not enabled in this environment.
        </Text>
        <div style={{ marginTop: 16 }}>
          <Alert
            type="info"
            message="Access Restricted"
            description="Enable the 'chatMigrationsEnabled' feature flag to access this tool."
            showIcon
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Admin Migrations</Title>
      <Text type="secondary">
        Run safe, small chat schema migrations. Use during low traffic.
      </Text>
      <div style={{ marginTop: 16 }}>
        <AdminMigrationPanel defaultBatchSize={50} />
      </div>
    </div>
  );
};

export default MigrationsPage;


