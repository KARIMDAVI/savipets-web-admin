/**
 * Communication History Component
 * 
 * Organized view of all communications with a client.
 */

import React, { useState, useMemo } from 'react';
import { Card, Tabs, List, Tag, Typography, Empty, Space } from 'antd';
import {
  MailOutlined,
  MessageOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Conversation } from '@/types';
import type { ClientNote } from '../types/crm.types';
import { useCommunicationActions } from '../hooks/useCommunicationActions';

const { Text } = Typography;

interface CommunicationHistoryProps {
  conversations: Conversation[];
  notes: ClientNote[];
  clientId: string;
  onViewConversation?: (conversationId: string) => void;
}

interface CommunicationItem {
  id: string;
  type: 'email' | 'message' | 'call' | 'note';
  title: string;
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export const CommunicationHistory: React.FC<CommunicationHistoryProps> = ({
  conversations,
  notes,
  clientId,
  onViewConversation,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const { clientEmails, clientSMS, clientCalls } = useCommunicationActions(clientId);

  // Build communication items from all sources
  const communicationItems = useMemo<CommunicationItem[]>(() => {
    const items: CommunicationItem[] = [];

    // Add emails
    clientEmails.forEach((email) => {
      items.push({
        id: `email-${email.id}`,
        type: 'email',
        title: email.subject,
        content: email.body.substring(0, 150),
        timestamp: email.createdAt,
        metadata: {
          emailId: email.id,
          status: email.status,
          to: email.to,
        },
      });
    });

    // Add SMS
    clientSMS.forEach((sms) => {
      items.push({
        id: `sms-${sms.id}`,
        type: 'message', // Using message type for SMS
        title: 'SMS Message',
        content: sms.message,
        timestamp: sms.createdAt,
        metadata: {
          smsId: sms.id,
          status: sms.status,
          to: sms.to,
        },
      });
    });

    // Add calls
    clientCalls.forEach((call) => {
      items.push({
        id: `call-${call.id}`,
        type: 'call',
        title: `${call.direction === 'inbound' ? 'Inbound' : 'Outbound'} Call`,
        content: call.notes || `Call ${call.status}${call.duration ? ` (${call.duration}s)` : ''}`,
        timestamp: call.startedAt,
        metadata: {
          callLogId: call.id,
          status: call.status,
          duration: call.duration,
          direction: call.direction,
        },
      });
    });

    // Add conversations as messages
    conversations.forEach((conv) => {
      const lastMessage = conv.lastMessage;
      items.push({
        id: `conv-${conv.id}`,
        type: 'message',
        title: `Conversation ${conv.id.substring(0, 8)}`,
        content: lastMessage?.content || 'No message content',
        timestamp: conv.lastMessageAt || conv.updatedAt || conv.createdAt,
        metadata: {
          conversationId: conv.id,
        },
      });
    });

    // Add notes
    notes.forEach((note) => {
      items.push({
        id: `note-${note.id}`,
        type: 'note',
        title: `${note.type} Note`,
        content: note.content,
        timestamp: note.createdAt,
        metadata: {
          noteId: note.id,
          priority: note.priority,
          petId: note.petId,
        },
      });
    });

    // Sort by timestamp (most recent first)
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [conversations, notes, clientEmails, clientSMS, clientCalls]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return communicationItems;
    return communicationItems.filter((item) => item.type === activeTab);
  }, [communicationItems, activeTab]);

  const getIcon = (type: CommunicationItem['type']) => {
    switch (type) {
      case 'email':
        return <MailOutlined style={{ color: '#1890ff' }} />;
      case 'message':
        return <MessageOutlined style={{ color: '#52c41a' }} />;
      case 'call':
        return <PhoneOutlined style={{ color: '#fa8c16' }} />;
      case 'note':
        return <CalendarOutlined style={{ color: '#722ed1' }} />;
    }
  };

  const getTypeTag = (type: CommunicationItem['type']) => {
    const colors: Record<CommunicationItem['type'], string> = {
      email: 'blue',
      message: 'green',
      call: 'orange',
      note: 'purple',
    };
    return <Tag color={colors[type]}>{type.toUpperCase()}</Tag>;
  };

  const tabItems = [
    {
      key: 'all',
      label: `All (${communicationItems.length})`,
    },
    {
      key: 'email',
      label: `Emails (${communicationItems.filter((i) => i.type === 'email').length})`,
    },
    {
      key: 'message',
      label: `Messages/SMS (${communicationItems.filter((i) => i.type === 'message').length})`,
    },
    {
      key: 'call',
      label: `Calls (${communicationItems.filter((i) => i.type === 'call').length})`,
    },
    {
      key: 'note',
      label: `Notes (${communicationItems.filter((i) => i.type === 'note').length})`,
    },
  ];

  return (
    <Card title="Communication History">
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      <List
        dataSource={filteredItems}
        renderItem={(item) => (
          <List.Item
            actions={[
              item.type === 'message' && item.metadata?.conversationId && onViewConversation ? (
                <a
                  onClick={() => onViewConversation(item.metadata!.conversationId as string)}
                >
                  View
                </a>
              ) : null,
            ].filter(Boolean)}
          >
            <List.Item.Meta
              avatar={getIcon(item.type)}
              title={
                <Space>
                  {getTypeTag(item.type)}
                  <Text strong>{item.title}</Text>
                  {(() => {
                    const priority = item.metadata?.priority;
                    if (priority) {
                      const priorityStr = String(priority);
                      return (
                        <Tag
                          color={
                            priorityStr === 'high'
                              ? 'red'
                              : priorityStr === 'medium'
                              ? 'orange'
                              : 'green'
                          }
                        >
                          {priorityStr}
                        </Tag>
                      );
                    }
                    return null;
                  })()}
                </Space>
              }
              description={
                <Space direction="vertical" size={4}>
                  <Text>{item.content.substring(0, 150)}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {dayjs(item.timestamp).format('MMM DD, YYYY h:mm A')}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: <Empty description="No communications found" /> }}
      />
    </Card>
  );
};

