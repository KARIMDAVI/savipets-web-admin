/**
 * Attachment Modal Component
 * 
 * Modal for displaying attachment details.
 */

import React from 'react';
import { Modal, Descriptions } from 'antd';
import type { Attachment } from '@/types';

interface AttachmentModalProps {
  visible: boolean;
  attachment: Attachment | null;
  onClose: () => void;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
  visible,
  attachment,
  onClose,
}) => {
  if (!attachment) return null;

  return (
    <Modal
      title="Attachment Details"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Name">
          {attachment.name}
        </Descriptions.Item>
        <Descriptions.Item label="Type">
          {attachment.type}
        </Descriptions.Item>
        <Descriptions.Item label="Size">
          {(attachment.size / 1024).toFixed(2)} KB
        </Descriptions.Item>
        <Descriptions.Item label="URL">
          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
            {attachment.url}
          </a>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

