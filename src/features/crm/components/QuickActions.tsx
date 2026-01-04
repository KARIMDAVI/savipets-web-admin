/**
 * Quick Actions Component
 * 
 * Quick action buttons for common client operations.
 */

import React, { useState } from 'react';
import { Card, Space, Button, Divider } from 'antd';
import {
  PlusOutlined,
  MailOutlined,
  PhoneOutlined,
  MessageOutlined,
  CalendarOutlined,
  FileTextOutlined,
  UserOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import type { User } from '@/types';
import { EmailComposer } from './EmailComposer';
import { SMSComposer } from './SMSComposer';
import { CallLogger } from './CallLogger';
import { SendMessageModal } from './SendMessageModal';

interface QuickActionsProps {
  client: User;
  onAddNote: () => void;
  onSendEmail?: () => void;
  onCall?: () => void;
  onSendMessage?: () => void;
  onSendInAppMessage?: () => void;
  onCreateBooking?: () => void;
  onViewProfile?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  client,
  onAddNote,
  onSendEmail,
  onCall,
  onSendMessage,
  onSendInAppMessage,
  onCreateBooking,
  onViewProfile,
}) => {
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [smsModalVisible, setSMSModalVisible] = useState(false);
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [inAppMessageModalVisible, setInAppMessageModalVisible] = useState(false);

  const handleCall = () => {
    if (client.phoneNumber) {
      setCallModalVisible(true);
    } else if (onCall) {
      onCall();
    }
  };

  const handleEmail = () => {
    if (client.email) {
      setEmailModalVisible(true);
    } else if (onSendEmail) {
      onSendEmail();
    }
  };

  const handleSMS = () => {
    if (client.phoneNumber) {
      setSMSModalVisible(true);
    } else if (onSendMessage) {
      onSendMessage();
    }
  };

  return (
    <Card title="Quick Actions" size="small">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAddNote}
            block
          >
            Add Note
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={onAddNote}
            block
          >
            View Notes
          </Button>
        </Space>

        <Divider style={{ margin: '8px 0' }} />

        <Space wrap>
          <Button
            icon={<MailOutlined />}
            onClick={handleEmail}
            disabled={!client.email && !onSendEmail}
            block
          >
            Send Email
          </Button>
          <Button
            icon={<PhoneOutlined />}
            onClick={handleCall}
            disabled={!client.phoneNumber && !onCall}
            block
          >
            Log Call
          </Button>
          <Button
            icon={<MessageOutlined />}
            onClick={handleSMS}
            disabled={!client.phoneNumber && !onSendMessage}
            block
          >
            Send SMS
          </Button>
          <Button
            icon={<CommentOutlined />}
            onClick={() => setInAppMessageModalVisible(true)}
            block
          >
            Send In-App Message
          </Button>
        </Space>

        <Divider style={{ margin: '8px 0' }} />

        <Space wrap>
          <Button
            icon={<CalendarOutlined />}
            onClick={onCreateBooking}
            disabled={!onCreateBooking}
            block
          >
            Create Booking
          </Button>
          <Button
            icon={<UserOutlined />}
            onClick={onViewProfile}
            disabled={!onViewProfile}
            block
          >
            View Full Profile
          </Button>
        </Space>
      </Space>

      <EmailComposer
        visible={emailModalVisible}
        client={client}
        onCancel={() => setEmailModalVisible(false)}
        onSuccess={() => {
          setEmailModalVisible(false);
          if (onSendEmail) onSendEmail();
        }}
      />

      <SMSComposer
        visible={smsModalVisible}
        client={client}
        onCancel={() => setSMSModalVisible(false)}
        onSuccess={() => {
          setSMSModalVisible(false);
          if (onSendMessage) onSendMessage();
        }}
      />

      <CallLogger
        visible={callModalVisible}
        client={client}
        onCancel={() => setCallModalVisible(false)}
        onSuccess={() => {
          setCallModalVisible(false);
          if (onCall) onCall();
        }}
      />

      <SendMessageModal
        visible={inAppMessageModalVisible}
        client={client}
        onCancel={() => setInAppMessageModalVisible(false)}
        onSuccess={() => {
          setInAppMessageModalVisible(false);
          if (onSendInAppMessage) onSendInAppMessage();
        }}
      />
    </Card>
  );
};

