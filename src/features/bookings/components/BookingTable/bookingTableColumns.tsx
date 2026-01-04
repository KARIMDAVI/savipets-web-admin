/**
 * BookingTable Columns Definition
 * 
 * Column definitions for the bookings table.
 */

import React from 'react';
import { Tag, Space, Typography, Tooltip, Badge, Button, Popconfirm } from 'antd';
import {
  UserOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  CrownOutlined,
  SwapOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Booking, BookingStatus, ServiceType } from '../../types/bookings.types';
import { formatCurrency } from '@/shared/utils/formatters';
import { getStatusColor, getServiceTypeDisplayName } from '../../utils/bookingHelpers';
import { EditableDateCell } from '../EditableDateCell';
import { formatUserDisplayName } from './bookingTableHelpers';

const { Text } = Typography;

interface BookingTableColumnsProps {
  getUserName: (userId: string) => string;
  onViewBooking: (bookingId: string) => void;
  onApproveBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string) => void;
  onAssignSitter: (booking: Booking) => void;
  onUnassignSitter: (booking: Booking) => void;
  onUpdateScheduledDate?: (bookingId: string, newDate: Date) => Promise<void>;
  isUpdatingScheduledDate?: boolean;
}

export const createBookingTableColumns = ({
  getUserName,
  onViewBooking,
  onApproveBooking,
  onRejectBooking,
  onAssignSitter,
  onUnassignSitter,
  onUpdateScheduledDate,
  isUpdatingScheduledDate,
}: BookingTableColumnsProps) => [
  {
    title: 'Booking ID',
    dataIndex: 'id',
    key: 'id',
    render: (id: string, record: Booking) => (
      <Space direction="vertical" size={0}>
        <Text code style={{ fontSize: '12px' }}>
          #{id.slice(-8)}
        </Text>
        {record.recurringSeriesId && record.visitNumber && (
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Visit {record.visitNumber}
          </Text>
        )}
      </Space>
    ),
  },
  {
    title: 'Series',
    key: 'series',
    render: (record: Booking) => {
      if (record.recurringSeriesId) {
        return (
          <Space>
            <Tag color="blue" icon={<CalendarOutlined />}>
              Series #{record.recurringSeriesId.slice(-6)}
            </Tag>
          </Space>
        );
      }
      return <Text type="secondary">Single</Text>;
    },
  },
  {
    title: 'Created By',
    key: 'createdBy',
    render: (record: Booking) => {
      if (record.adminCreated) {
        return (
          <Tooltip title={`Created by admin via ${record.createdVia}`}>
            <Tag color="purple" icon={<CrownOutlined />}>
              Admin
            </Tag>
          </Tooltip>
        );
      }
      return <Tag color="default">Client</Tag>;
    },
  },
  {
    title: 'Service',
    dataIndex: 'serviceType',
    key: 'serviceType',
    render: (serviceType: ServiceType) => (
      <Tag color="blue">
        {getServiceTypeDisplayName(serviceType)}
      </Tag>
    ),
  },
  {
    title: 'Client',
    key: 'client',
    render: (record: Booking) => {
      const displayName = formatUserDisplayName(record.clientId, getUserName, record.clientName);
      return (
        <Space>
          <UserOutlined />
          <Text strong>{displayName}</Text>
        </Space>
      );
    },
  },
  {
    title: 'Sitter',
    key: 'sitter',
    render: (record: Booking) => {
      if (!record.sitterId) {
        return <Text type="secondary">Unassigned</Text>;
      }
      const displayName = formatUserDisplayName(record.sitterId, getUserName);
      return (
        <Space>
          <UserOutlined />
          <Text>{displayName}</Text>
        </Space>
      );
    },
  },
  {
    title: 'Scheduled Date',
    dataIndex: 'scheduledDate',
    key: 'scheduledDate',
    render: (date: Date, record: Booking) => {
      if (onUpdateScheduledDate) {
        return (
          <EditableDateCell
            date={date}
            onSave={(newDate) => onUpdateScheduledDate(record.id, newDate)}
            loading={isUpdatingScheduledDate}
          />
        );
      }
      return (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(date).format('MMM DD, YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(date).format('h:mm A')}
          </Text>
        </Space>
      );
    },
  },
  {
    title: 'Duration',
    dataIndex: 'duration',
    key: 'duration',
    render: (duration: number) => `${duration} min`,
  },
  {
    title: 'Pets',
    key: 'pets',
    render: (record: Booking) => (
      record.pets && record.pets.length > 0 ? (
        <Space wrap>
          {record.pets.slice(0, 2).map((pet, index) => (
            <Tag key={index} color="purple">
              {pet}
            </Tag>
          ))}
          {record.pets.length > 2 && (
            <Tag color="default">
              +{record.pets.length - 2}
            </Tag>
          )}
        </Space>
      ) : (
        <Text type="secondary">No pets</Text>
      )
    ),
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    render: (price: number | string) => formatCurrency(price),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: BookingStatus) => (
      <Badge
        status={status === 'active' ? 'processing' : 'default'}
        text={
          <Tag color={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        }
      />
    ),
    filters: [
      { text: 'Pending', value: 'pending' },
      { text: 'Approved', value: 'approved' },
      { text: 'Scheduled', value: 'scheduled' },
      { text: 'Active', value: 'active' },
      { text: 'Completed', value: 'completed' },
      { text: 'Cancelled', value: 'cancelled' },
      { text: 'Rejected', value: 'rejected' },
    ],
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (record: Booking) => (
      <Space>
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onViewBooking(record.id)}
          />
        </Tooltip>
        {record.status === 'pending' && (
          <>
            <Tooltip title="Approve">
              <Popconfirm
                title="Approve this booking?"
                onConfirm={() => onApproveBooking(record.id)}
              >
                <Button type="text" icon={<CheckOutlined />} />
              </Popconfirm>
            </Tooltip>
            <Tooltip title="Reject">
              <Popconfirm
                title="Reject this booking?"
                onConfirm={() => onRejectBooking(record.id)}
              >
                <Button type="text" icon={<CloseOutlined />} />
              </Popconfirm>
            </Tooltip>
          </>
        )}
        {(record.status === 'approved' || record.status === 'scheduled') && (
          <>
            <Tooltip title={record.sitterId ? 'Change Sitter' : 'Assign Sitter'}>
              <Button
                type="text"
                icon={record.sitterId ? <SwapOutlined /> : <UserOutlined />}
                onClick={() => onAssignSitter(record)}
              />
            </Tooltip>
            {record.sitterId && (
              <Tooltip title="Unassign Sitter">
                <Popconfirm
                  title="Unassign this sitter?"
                  description="This booking will be marked as unassigned."
                  okText="Yes, unassign"
                  cancelText="No"
                  onConfirm={() => onUnassignSitter(record)}
                >
                  <Button type="text" danger icon={<CloseCircleOutlined />} />
                </Popconfirm>
              </Tooltip>
            )}
          </>
        )}
      </Space>
    ),
  },
];

