/**
 * Sitter Detail Modal Component
 * 
 * Displays detailed information about a tracked sitter.
 */

import React from 'react';
import { Modal, Descriptions, Space, Tag, Badge, Button } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { EnhancedSitterLocation } from '../types/live-tracking.types';
import type { VisitTrackingData } from '@/services/tracking.service';

interface SitterDetailModalProps {
  sitter: EnhancedSitterLocation | null;
  visible: boolean;
  visitTracking: VisitTrackingData | undefined;
  onClose: () => void;
  onExportRoute: (visitId: string) => void;
}

export const SitterDetailModal: React.FC<SitterDetailModalProps> = ({
  sitter,
  visible,
  visitTracking,
  onClose,
  onExportRoute,
}) => {
  if (!sitter) return null;

  return (
    <Modal
      title="Sitter Details"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Sitter">
          <Space>
            <UserOutlined />
            <span style={{ fontWeight: 'bold' }}>
              {sitter.sitter.firstName} {sitter.sitter.lastName}
            </span>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {sitter.sitter.email}
        </Descriptions.Item>
        <Descriptions.Item label="Phone">
          {sitter.sitter.phoneNumber || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Rating">
          {sitter.sitter.rating ? `${(sitter.sitter.rating || 0).toFixed(1)} ⭐` : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Service">
          <Tag color="blue">
            {sitter.booking.serviceType.replace('-', ' ')}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Scheduled Time">
          <Space>
            <ClockCircleOutlined />
            <span>
              {dayjs(sitter.booking.scheduledDate).format('MMMM DD, YYYY [at] h:mm A')}
            </span>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Duration">
          {sitter.booking.duration} minutes
        </Descriptions.Item>
        <Descriptions.Item label="Price">
          ${typeof sitter?.booking?.price === 'number' ? sitter.booking.price.toFixed(2) : '0.00'}
        </Descriptions.Item>
        <Descriptions.Item label="Current Location">
          <Space>
            <EnvironmentOutlined />
            <span>
              {(sitter.location.lat || 0).toFixed(6)}, {(sitter.location.lng || 0).toFixed(6)}
            </span>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Last Update">
          {dayjs(sitter.location.timestamp).format('MMMM DD, YYYY [at] h:mm:ss A')}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Badge
            status={sitter.status === 'active' ? 'processing' : 'default'}
            text={
              <Tag color={sitter.status === 'active' ? 'green' : 'orange'}>
                {sitter.status.charAt(0).toUpperCase() + sitter.status.slice(1)}
              </Tag>
            }
          />
        </Descriptions.Item>
        {visitTracking && visitTracking.routePoints.length > 0 && (
          <>
            <Descriptions.Item label="Route Points">
              {visitTracking.routePoints.length} points tracked
            </Descriptions.Item>
            <Descriptions.Item label="Total Distance">
              {visitTracking.totalDistance ? `${visitTracking.totalDistance.toFixed(2)} km` : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Actions">
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={() => onExportRoute(visitTracking.visitId)}
                size="small"
              >
                Export Route
              </Button>
            </Descriptions.Item>
          </>
        )}
        {sitter.booking.address && (
          <Descriptions.Item label="Visit Address">
            {sitter.booking.address.street}, {sitter.booking.address.city}, {sitter.booking.address.state} {sitter.booking.address.zipCode}
          </Descriptions.Item>
        )}
        {sitter.booking.specialInstructions && (
          <Descriptions.Item label="Special Instructions">
            {sitter.booking.specialInstructions}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Modal>
  );
};

