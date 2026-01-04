/**
 * Chat Messages Panel Component
 * 
 * Displays messages for a selected conversation.
 */

import React from 'react';
import { Card, Empty, Spin, Space, Typography, Button, Tooltip, Popconfirm, Input } from 'antd';
import {
  SendOutlined,
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  PictureOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Conversation, Message, User, Attachment } from '@/types';
import { getParticipantInfo } from '../utils/chatHelpers';

const { Text } = Typography;
const { TextArea } = Input;

interface ChatMessagesPanelProps {
  conversation: Conversation | null;
  messages: Message[];
  users: User[];
  newMessage: string;
  loading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFileUpload: (file: File) => void;
  onDeleteMessage: (messageId: string) => void;
  onExportConversation: () => void;
  onAttachmentClick: (attachment: Attachment) => void;
}

export const ChatMessagesPanel: React.FC<ChatMessagesPanelProps> = ({
  conversation,
  messages,
  users,
  newMessage,
  loading,
  messagesEndRef,
  fileInputRef,
  onMessageChange,
  onSendMessage,
  onKeyPress,
  onFileUpload,
  onDeleteMessage,
  onExportConversation,
  onAttachmentClick,
}) => {
  if (!conversation) {
    return (
      <Card>
        <Empty description="Select a conversation to view messages" />
      </Card>
    );
  }

  const getParticipantInfoForMessage = (participantId: string) => getParticipantInfo(participantId, users);

  return (
    <Card
      title={conversation.participants.map(p => {
        const user = getParticipantInfoForMessage(p.userId);
        return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
      }).join(', ')}
      extra={
        <Button
          icon={<DownloadOutlined />}
          onClick={onExportConversation}
          size="small"
        >
          Export
        </Button>
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
    >
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', marginBottom: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : messages.length === 0 ? (
          <Empty
            description="No messages yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div>
            {messages.map((message) => {
              const sender = getParticipantInfoForMessage(message.senderId);
              const isAdmin = message.senderType === 'admin';
              
              return (
                <div
                  key={message.id}
                  style={{
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: isAdmin ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      backgroundColor: isAdmin ? '#1890ff' : 'white',
                      color: isAdmin ? 'white' : 'black',
                      padding: '12px 16px',
                      borderRadius: '18px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ marginBottom: '4px' }}>
                      <Space>
                        <Text
                          style={{
                            fontSize: '12px',
                            color: isAdmin ? 'rgba(255,255,255,0.8)' : '#999',
                          }}
                        >
                          {isAdmin ? 'Admin' : sender?.firstName || 'Unknown'}
                        </Text>
                        {message.type === 'image' && <PictureOutlined />}
                        {message.type === 'document' && <FileTextOutlined />}
                      </Space>
                    </div>
                    <div>{message.content}</div>
                    {message.attachments && message.attachments.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        {message.attachments.map((attachment, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '8px',
                              backgroundColor: isAdmin ? 'rgba(255,255,255,0.1)' : '#f5f5f5',
                              borderRadius: '8px',
                              marginBottom: '4px',
                              cursor: 'pointer',
                            }}
                            onClick={() => onAttachmentClick(attachment)}
                          >
                            <Space>
                              <PaperClipOutlined />
                              <Text style={{ fontSize: '12px' }}>
                                {attachment.name}
                              </Text>
                              <Text style={{ fontSize: '11px', opacity: 0.7 }}>
                                {(attachment.size / 1024).toFixed(1)}KB
                              </Text>
                            </Space>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ marginTop: '4px' }}>
                      <Space>
                        <Text
                          style={{
                            fontSize: '11px',
                            color: isAdmin ? 'rgba(255,255,255,0.7)' : '#999',
                          }}
                        >
                          {dayjs(message.timestamp).format('h:mm A')}
                        </Text>
                        {message.readBy && message.readBy.length > 0 && (
                          <Tooltip title={`Read by ${message.readBy.length} users`}>
                            <CheckCircleOutlined
                              style={{
                                fontSize: '12px',
                                color: isAdmin ? 'rgba(255,255,255,0.7)' : '#999',
                              }}
                            />
                          </Tooltip>
                        )}
                        {isAdmin && (
                          <Popconfirm
                            title="Delete this message?"
                            onConfirm={() => onDeleteMessage(message.id)}
                          >
                            <Button
                              type="text"
                              icon={<DeleteOutlined />}
                              size="small"
                              danger
                              style={{ color: 'rgba(255,255,255,0.7)' }}
                            />
                          </Popconfirm>
                        )}
                      </Space>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div>
        <Space.Compact style={{ width: '100%' }}>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileUpload(file);
            }}
          />
          <Button
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
          />
          <TextArea
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Type a message..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={onSendMessage}
            loading={loading}
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </Space.Compact>
        <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
          Press Enter to send, Shift+Enter for new line
        </Text>
      </div>
    </Card>
  );
};

