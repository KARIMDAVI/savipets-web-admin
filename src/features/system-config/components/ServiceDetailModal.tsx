/**
 * Service Detail Modal Component
 * 
 * Displays detailed information about a service type.
 */

import React from 'react';
import { Modal, Descriptions, Tag, Badge } from 'antd';
import type { ServiceType } from '../types/system-config.types';
import { getCategoryColor } from '../utils/configHelpers';

interface ServiceDetailModalProps {
  service: ServiceType | null;
  onClose: () => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
}) => {
  if (!service) return null;

  return (
    <Modal
      title={`Service: ${service.name}`}
      open={!!service}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="Name">
          {service.name}
        </Descriptions.Item>
        <Descriptions.Item label="Category">
          <Tag color={getCategoryColor(service.category)}>
            {service.category.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Duration">
          {service.duration} minutes
        </Descriptions.Item>
        <Descriptions.Item label="Base Price">
          ${service.basePrice}
        </Descriptions.Item>
        <Descriptions.Item label="Max Pets">
          {service.maxPets}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Badge 
            status={service.isActive ? 'success' : 'default'} 
            text={service.isActive ? 'Active' : 'Inactive'} 
          />
        </Descriptions.Item>
        <Descriptions.Item label="Description" span={2}>
          {service.description}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

