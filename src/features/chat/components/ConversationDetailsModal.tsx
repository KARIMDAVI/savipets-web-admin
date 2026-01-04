/**
 * Conversation Details Modal Component
 * 
 * Modal for displaying conversation details.
 */

import React from 'react';
import { Modal, Descriptions, Tag, Badge, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import type { Conversation } from '@/types';
import { getParticipantInfo } from '../utils/chatHelpers';
import type { User } from '@/types';

const { Text } = Typography;

interface ConversationDetailsModalProps {
  visible: boolean;
  conversation: Conversation | null;
  users: User[];
  onClose: () => void;
}

export const ConversationDetailsModal: React.FC<ConversationDetailsModalProps> = ({
  visible,
  conversation,
  users,
  onClose,
}) => {
  if (!conversation) return null;

  return (
    <Modal
      title="Conversation Details"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Conversation ID">
          <Text code>{conversation.id}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Participants">
          {conversation.participants.map((participant, index) => {
            const user = getParticipantInfo(participant.userId, users);
            return (
              <Tag key={index} color="blue" style={{ marginBottom: '4px' }}>
                {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
              </Tag>
            );
          })}
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          {dayjs(conversation.createdAt).format('MMMM DD, YYYY [at] h:mm A')}
        </Descriptions.Item>
        <Descriptions.Item label="Last Message">
          {conversation.lastMessage ? (
            <Space direction="vertical" size={0}>
              <Text>{conversation.lastMessage.content}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {dayjs(conversation.lastMessage.timestamp).format('MMMM DD, YYYY [at] h:mm A')}
              </Text>
            </Space>
          ) : (
            'No messages yet'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Unread Messages">
          <Badge count={conversation.unreadCount || 0} />
        </Descriptions.Item>
        <Descriptions.Item label="Total Messages">
          {conversation.messageCount || 0}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

