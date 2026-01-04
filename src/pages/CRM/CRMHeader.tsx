import React from 'react';
import { Typography, Button } from 'antd';
import { TeamOutlined, ImportOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface CRMHeaderProps {
  onImportClick: () => void;
}

export const CRMHeader: React.FC<CRMHeaderProps> = ({ onImportClick }) => {
  return (
    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Title level={2}>
          <span style={{ marginRight: '8px' }}>
            <TeamOutlined />
          </span>
          Customer Relationship Management
        </Title>
        <Text type="secondary">
          Client tracking, notes, tags, and communication history
        </Text>
      </div>
      <Button
        icon={<ImportOutlined />}
        onClick={onImportClick}
      >
        Import Clients
      </Button>
    </div>
  );
};


