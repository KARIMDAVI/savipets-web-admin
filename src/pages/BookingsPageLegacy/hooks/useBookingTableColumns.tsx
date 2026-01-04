/**
 * Booking Table Columns Hook
 * 
 * Hook for generating table columns for the bookings table.
 */

import { useMemo } from 'react';
import { Table, Tag, Space, Typography, Button, Tooltip, Badge, Popconfirm } from 'antd';
import {
  UserOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  CrownOutlined,
  SwapOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Booking, BookingStatus, ServiceType, User } from '@/types';
import { formatCurrency } from '@/shared/utils/formatters';
import { getStatusColor, getServiceTypeDisplayName } from '@/features/bookings/utils/bookingHelpers';
import { EditableDateCell } from '@/features/bookings/components/EditableDateCell';

const { Text } = Typography;

interface UseBookingTableColumnsProps {
  userMap: Map<string, User>;
  onViewBooking: (bookingId: string) => void;
  onApproveBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string) => void;
  onAssignSitter: (booking: Booking) => void;
  onUnassignSitter: (bookingId: string) => void;
  onUpdateScheduledDate: (bookingId: string, newDate: Date) => Promise<void>;
  loading: boolean;
}

export const useBookingTableColumns = ({
  userMap,
  onViewBooking,
  onApproveBooking,
  onRejectBooking,
  onAssignSitter,
  onUnassignSitter,
  onUpdateScheduledDate,
  loading,
}: UseBookingTableColumnsProps) => {
  const columns = useMemo(() => {
    const stableGetUserName = (userId: string | null | undefined): string => {
      if (!userId) {
        return 'Unassigned';
      }
      
      const user = userMap.get(userId);
      
      if (!user) {
        return 'Unassigned';
      }
      
      let firstName = (user.firstName && String(user.firstName).trim()) || '';
      let lastName = (user.lastName && String(user.lastName).trim()) || '';
      
      if (firstName.includes('@')) {
        firstName = '';
      }
      if (lastName.includes('@')) {
        lastName = '';
      }
      
      const fullName = `${firstName} ${lastName}`.trim();
      
      if (fullName && fullName.length > 0) {
        return fullName;
      }
      
      if (user.email && typeof user.email === 'string') {
        const emailName = user.email.split('@')[0];
        const extractedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        return extractedName;
      }
      
      return 'Unassigned';
    };

    return [
      {
        title: 'Booking ID',
        dataIndex: 'id',
        key: 'id',
        render: (id: string) => (
          <code style={{ fontSize: '12px' }}>
            #{id.slice(-8)}
          </code>
        ),
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
          let displayName = stableGetUserName(record.clientId);
          
          if (displayName && displayName.includes('@')) {
            const emailName = displayName.split('@')[0];
            displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          }
          
          if ((!displayName || displayName.includes('@') || displayName === 'Unassigned' || displayName === 'Loading...') && record.clientName) {
            if (record.clientName.includes('@')) {
              const emailName = record.clientName.split('@')[0];
              displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
            } else {
              displayName = record.clientName;
            }
          }
          
          return (
            <Space>
              <UserOutlined />
              <strong>{displayName}</strong>
            </Space>
          );
        },
      },
      {
        title: 'Sitter',
        key: 'sitter',
        render: (record: Booking) => {
          if (!record.sitterId) {
            return <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>Unassigned</span>;
          }
          
          let name = stableGetUserName(record.sitterId);
          if (name && name.includes('@')) {
            const emailName = name.split('@')[0];
            name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          }
          
          return (
            <Space>
              <UserOutlined />
              <span>{name}</span>
            </Space>
          );
        },
      },
      {
        title: 'Scheduled Date',
        dataIndex: 'scheduledDate',
        key: 'scheduledDate',
        render: (date: Date, record: Booking) => (
          <EditableDateCell
            date={date}
            onSave={(newDate) => onUpdateScheduledDate(record.id, newDate)}
            loading={loading}
          />
        ),
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
            <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>No pets</span>
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
                      onConfirm={() => onUnassignSitter(record.id)}
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
  }, [userMap, onViewBooking, onApproveBooking, onRejectBooking, onAssignSitter, onUnassignSitter, onUpdateScheduledDate, loading]);

  return columns;
};


