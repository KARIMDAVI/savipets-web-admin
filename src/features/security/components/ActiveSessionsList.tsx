/**
 * Active Sessions List Component
 * 
 * Displays list of active sessions.
 */

import React from 'react';
import { Card, List, Button, Space, Tag, Tooltip, Popconfirm } from 'antd';
import {
  EyeOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { SessionInfo } from '../types/security.types';

interface ActiveSessionsListProps {
  sessions: SessionInfo[];
  loading: boolean;
  onViewAll: () => void;
  onTerminateSession: (sessionId: string) => void;
  onTerminateAll: () => void;
}

export const ActiveSessionsList: React.FC<ActiveSessionsListProps> = ({
  sessions,
  loading,
  onViewAll,
  onTerminateSession,
  onTerminateAll,
}) => {
  const activeSessions = sessions.filter(s => s.isCurrent);

  return (
    <Card
      title="Active Sessions"
      extra={
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={onViewAll}
            size="small"
          >
            View All
          </Button>
          {activeSessions.length > 1 && (
            <Popconfirm
              title="Terminate all other sessions?"
              onConfirm={onTerminateAll}
            >
              <Button
                icon={<LogoutOutlined />}
                danger
                size="small"
              >
                Terminate All
              </Button>
            </Popconfirm>
          )}
        </Space>
      }
    >
      <List
        dataSource={activeSessions.slice(0, 3)}
        renderItem={(session) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Tag color="green">Active</Tag>}
              title={
                <Space>
                  <span style={{ fontWeight: 'bold' }}>{session.device}</span>
                  {session.isCurrent && <Tag color="green">Current</Tag>}
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    {session.location} • {session.ipAddress}
                  </span>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    Last activity: {dayjs(session.lastActivity).format('MMM DD, h:mm A')}
                  </span>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

