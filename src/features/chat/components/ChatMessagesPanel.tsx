/**
 * Chat Messages Panel Component
 * 
 * Displays messages for a selected conversation.
 */

import React from 'react';
import { Card, Empty, Spin, Space, Typography, Button, Tooltip, Input, Avatar } from 'antd';
import {
  SendOutlined,
  ReloadOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Conversation, Message, User } from '@/types';
import { getConversationTitle, getParticipantInfo } from '../utils/chatHelpers';

dayjs.extend(relativeTime);

const { Text } = Typography;
const { TextArea } = Input;

interface ChatMessagesPanelProps {
  conversation: Conversation | null;
  messages: Message[];
  users: User[];
  newMessage: string;
  loading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onRefresh: () => void;
  isSending?: boolean;
}

export const ChatMessagesPanel: React.FC<ChatMessagesPanelProps> = ({
  conversation,
  messages,
  users,
  newMessage,
  loading,
  messagesEndRef,
  onMessageChange,
  onSendMessage,
  onKeyPress,
  onRefresh,
  isSending = false,
}) => {
  if (!conversation) {
    return (
      <Card
        style={{
          height: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Empty
          description={
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Select a conversation to start messaging
            </Text>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  const getParticipantInfoForMessage = (participantId: string) => getParticipantInfo(participantId, users);

  const conversationTitle = getConversationTitle(conversation, users);
  const isSupportChat = (conversation as any).type === 'admin-inquiry';

  return (
    <Card
      title={
        <Space>
          <Avatar
            size="small"
            icon={<MessageOutlined />}
            style={{
              backgroundColor: isSupportChat ? '#ff9800' : '#1890ff',
            }}
          />
          <div>
            <Text strong style={{ fontSize: '16px' }}>
              {conversationTitle}
            </Text>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {conversation.participants.length} participant{conversation.participants.length !== 1 ? 's' : ''}
              </Text>
            </div>
          </div>
        </Space>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={loading}
          size="small"
          type="text"
        />
      }
      style={{
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
      }}
      styles={{
        body: {
          flex: 1,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Messages Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '20px 16px',
            backgroundColor: '#f5f5f5',
            scrollBehavior: 'smooth',
          }}
        >
          {loading && messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px' }}>
                <Text type="secondary">Loading messages...</Text>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <MessageOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
              <Text type="secondary" style={{ fontSize: '14px', display: 'block' }}>
                No messages yet
              </Text>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
                Start the conversation by sending a message
              </Text>
            </div>
          ) : (
            <div style={{ maxWidth: '100%' }}>
              {messages.map((message, index) => {
                const sender = getParticipantInfoForMessage(message.senderId);
                // Handle both 'admin' senderType and check if sender is admin user
                // Note: senderType is the primary indicator; role check is fallback
                const isAdmin = message.senderType === 'admin' || 
                               (sender?.role && String(sender.role).toLowerCase() === 'admin');
                
                // Handle both 'content' (web) and 'text' (iOS) message fields
                const messageText = message.content || (message as any).text || '';
                
                // Safely handle timestamp (can be Date, Firestore Timestamp, or number)
                let messageTimestamp: Date;
                if (message.timestamp instanceof Date) {
                  messageTimestamp = message.timestamp;
                } else if ((message.timestamp as any)?.toDate) {
                  messageTimestamp = (message.timestamp as any).toDate();
                } else if (typeof message.timestamp === 'number') {
                  messageTimestamp = new Date(message.timestamp);
                } else {
                  messageTimestamp = new Date(message.timestamp as any);
                }
                
                // Get sender display name
                const senderName = isAdmin 
                  ? 'Admin' 
                  : (sender?.firstName 
                      ? `${sender.firstName}${sender.lastName ? ' ' + sender.lastName : ''}` 
                      : 'Unknown User');
                
                // Check if previous message is from same sender (for grouping)
                const prevMessage = index > 0 ? messages[index - 1] : null;
                const isSameSender = prevMessage && prevMessage.senderId === message.senderId;
                const timeDiff = prevMessage 
                  ? Math.abs(messageTimestamp.getTime() - (prevMessage.timestamp instanceof Date 
                      ? prevMessage.timestamp.getTime() 
                      : new Date(prevMessage.timestamp as any).getTime())) 
                  : Infinity;
                const showSenderInfo = !isSameSender || timeDiff > 300000; // 5 minutes
                
                return (
                  <div
                    key={message.id}
                    style={{
                      marginBottom: showSenderInfo ? '16px' : '4px',
                      display: 'flex',
                      justifyContent: isAdmin ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-end',
                      gap: '8px',
                    }}
                  >
                    {!isAdmin && showSenderInfo && (
                      <Avatar
                        size="small"
                        icon={<UserOutlined />}
                        style={{
                          backgroundColor: '#1890ff',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div
                      style={{
                        maxWidth: '70%',
                        minWidth: '120px',
                        backgroundColor: isAdmin ? '#1890ff' : '#ffffff',
                        color: isAdmin ? '#ffffff' : '#262626',
                        padding: showSenderInfo ? '10px 14px' : '6px 14px',
                        borderRadius: isAdmin 
                          ? showSenderInfo ? '18px 18px 4px 18px' : '18px 18px 4px 18px'
                          : showSenderInfo ? '18px 18px 18px 4px' : '18px 18px 18px 4px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {showSenderInfo && (
                        <div style={{ marginBottom: '4px' }}>
                          <Text
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: isAdmin ? 'rgba(255,255,255,0.9)' : '#595959',
                            }}
                          >
                            {senderName}
                          </Text>
                        </div>
                      )}
                      <div
                        style={{
                          wordBreak: 'break-word',
                          lineHeight: '1.5',
                          fontSize: '14px',
                        }}
                      >
                        {messageText || '(Empty message)'}
                      </div>
                      <div
                        style={{
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          justifyContent: isAdmin ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: '11px',
                            color: isAdmin ? 'rgba(255,255,255,0.7)' : '#8c8c8c',
                          }}
                        >
                          {dayjs(messageTimestamp).format('h:mm A')}
                        </Text>
                        {message.readBy && message.readBy.length > 0 && (
                          <Tooltip title={`Read by ${message.readBy.length} user${message.readBy.length !== 1 ? 's' : ''}`}>
                            <CheckCircleOutlined
                              style={{
                                fontSize: '12px',
                                color: isAdmin ? 'rgba(255,255,255,0.7)' : '#52c41a',
                              }}
                            />
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    {isAdmin && showSenderInfo && (
                      <Avatar
                        size="small"
                        icon={<UserOutlined />}
                        style={{
                          backgroundColor: '#1890ff',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} style={{ height: '1px' }} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #e8e8e8',
            backgroundColor: '#ffffff',
          }}
        >
          <Space.Compact style={{ width: '100%', display: 'flex', gap: '8px' }}>
            <TextArea
              value={newMessage}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onMessageChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Type your message..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{
                flex: 1,
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '14px',
              }}
              disabled={loading || isSending}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={onSendMessage}
              loading={loading || isSending}
              disabled={!newMessage.trim() || loading || isSending}
              style={{
                borderRadius: '20px',
                height: 'auto',
                padding: '8px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Send
            </Button>
          </Space.Compact>
        </div>
      </div>
    </Card>
  );
};

