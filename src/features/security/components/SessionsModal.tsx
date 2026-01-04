/**
 * Sessions Modal Component
 * 
 * Modal displaying all sessions.
 */

import React from 'react';
import { Modal, List, Space, Tag, Tooltip, Popconfirm, Button } from 'antd';
import {
  DesktopOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { SessionInfo } from '../types/security.types';

interface SessionsModalProps {
  visible: boolean;
  sessions: SessionInfo[];
  onClose: () => void;
  onTerminateSession: (sessionId: string) => void;
}

export const SessionsModal: React.FC<SessionsModalProps> = ({
  visible,
  sessions,
  onClose,
  onTerminateSession,
}) => {
  return (
    <Modal
      title="All Sessions"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <List
        dataSource={sessions}
        renderItem={(session) => (
          <List.Item
            actions={[
              <Tooltip key="terminate" title="Terminate Session">
                <Popconfirm
                  title="Terminate this session?"
                  onConfirm={() => onTerminateSession(session.id)}
                  disabled={session.isCurrent}
                >
                  <Button
                    type="text"
                    icon={<LogoutOutlined />}
                    danger
                    size="small"
                    disabled={session.isCurrent}
                  />
                </Popconfirm>
              </Tooltip>,
            ]}
          >
            <List.Item.Meta
              avatar={<DesktopOutlined />}
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
                    Started: {dayjs(session.createdAt).format('MMM DD, h:mm A')}
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
    </Modal>
  );
};

