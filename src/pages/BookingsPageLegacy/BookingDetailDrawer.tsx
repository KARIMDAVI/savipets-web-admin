/**
 * Booking Detail Drawer Component
 * 
 * Drawer component for displaying detailed booking information.
 */

import React from 'react';
import { Drawer, Descriptions, Space, Tag, Typography, Divider } from 'antd';
import { UserOutlined, EnvironmentOutlined, LinkOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Booking } from '@/types';
import { formatCurrency } from '@/shared/utils/formatters';
import { getStatusColor, getServiceTypeDisplayName } from '@/features/bookings/utils/bookingHelpers';
import {
  formatPaymentMethod,
  getPaymentMethodIcon,
  getPaymentMethodColor,
  formatPaymentStatus,
  getPaymentStatusColor,
  hasInvoiceInfo,
  getInvoiceInfo,
} from '@/features/bookings/utils/paymentHelpers';

const { Text } = Typography;

interface BookingDetailDrawerProps {
  visible: boolean;
  loading: boolean;
  booking: Booking | null;
  getUserName: (userId: string | null | undefined) => string;
  onClose: () => void;
}

// Helper function to format user names (extracted for consistency)
const formatUserName = (userId: string | null | undefined, getUserName: (userId: string | null | undefined) => string, fallbackName?: string): string => {
  if (!userId) return 'Unassigned';
  
  let name = getUserName(userId);
  
  if (name && name.includes('@')) {
    const emailName = name.split('@')[0];
    name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
  }
  
  if ((!name || name === 'Unassigned' || name === 'Loading...') && fallbackName) {
    if (fallbackName.includes('@')) {
      const emailName = fallbackName.split('@')[0];
      name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    } else {
      name = fallbackName;
    }
  }
  
  return name;
};

export const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = ({
  visible,
  loading,
  booking,
  getUserName,
  onClose,
}) => {
  if (!booking) return null;

  const invoiceInfo = hasInvoiceInfo(booking) ? getInvoiceInfo(booking) : null;

  return (
    <Drawer
      title="Booking Details"
      placement="right"
      onClose={onClose}
      open={visible}
      width={600}
      loading={loading}
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Booking ID">
          <Text code ellipsis={false}>{booking.id}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Service Type">
          <Tag color="blue">
            {getServiceTypeDisplayName(booking.serviceType)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={getStatusColor(booking.status)}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Scheduled Date">
          {dayjs(booking.scheduledDate).format('MMMM DD, YYYY [at] h:mm A')}
        </Descriptions.Item>
        <Descriptions.Item label="Duration">
          {booking.duration} minutes
        </Descriptions.Item>
        <Descriptions.Item label="Price">
          {formatCurrency(booking.price)}
        </Descriptions.Item>
        <Descriptions.Item label="Client">
          <Space>
            <UserOutlined />
            <Text strong ellipsis={false}>
              {formatUserName(booking.clientId, getUserName, booking.clientName)}
            </Text>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Sitter">
          <Space>
            <UserOutlined />
            <Text type={booking.sitterId ? undefined : 'secondary'} ellipsis={false}>
              {booking.sitterId ? formatUserName(booking.sitterId, getUserName) : 'Unassigned'}
            </Text>
          </Space>
        </Descriptions.Item>
        {booking.specialInstructions && (
          <Descriptions.Item label="Special Instructions">
            {booking.specialInstructions}
          </Descriptions.Item>
        )}
        {booking.pets && booking.pets.length > 0 && (
          <Descriptions.Item label="Pets">
            <Space wrap>
              {booking.pets.map((pet, index) => (
                <Tag key={index} color="purple">
                  {pet}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
        )}
        {booking.address && (
          <Descriptions.Item label="Address">
            <EnvironmentOutlined />{' '}
            {booking.address.street}, {booking.address.city}, {booking.address.state} {booking.address.zipCode}
          </Descriptions.Item>
        )}
        {booking.checkInTime && (
          <Descriptions.Item label="Check-in Time">
            {dayjs(booking.checkInTime).format('MMMM DD, YYYY [at] h:mm A')}
          </Descriptions.Item>
        )}
        {booking.checkOutTime && (
          <Descriptions.Item label="Check-out Time">
            {dayjs(booking.checkOutTime).format('MMMM DD, YYYY [at] h:mm A')}
          </Descriptions.Item>
        )}
        {booking.visitNotes && (
          <Descriptions.Item label="Visit Notes">
            {booking.visitNotes}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Created">
          {dayjs(booking.createdAt).format('MMMM DD, YYYY [at] h:mm A')}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated">
          {dayjs(booking.updatedAt).format('MMMM DD, YYYY [at] h:mm A')}
        </Descriptions.Item>
      </Descriptions>

      {/* Payment Information Section */}
      <Divider orientation="left" style={{ marginTop: 24, marginBottom: 16 }}>
        Payment Information
      </Divider>
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Payment Method">
          <Space>
            {(() => {
              const IconComponent = getPaymentMethodIcon(booking.paymentMethod);
              return IconComponent ? <IconComponent /> : null;
            })()}
            <Tag color={getPaymentMethodColor(booking.paymentMethod)}>
              {formatPaymentMethod(booking.paymentMethod)}
            </Tag>
          </Space>
        </Descriptions.Item>
        {booking.paymentStatus && (
          <Descriptions.Item label="Payment Status">
            <Tag color={getPaymentStatusColor(booking.paymentStatus)}>
              {formatPaymentStatus(booking.paymentStatus)}
            </Tag>
          </Descriptions.Item>
        )}
        {booking.paymentAmount && booking.paymentAmount !== booking.price && (
          <Descriptions.Item label="Amount Paid">
            {formatCurrency(booking.paymentAmount)}
          </Descriptions.Item>
        )}
        {booking.paymentReceivedAt && (
          <Descriptions.Item label="Payment Received">
            {dayjs(booking.paymentReceivedAt).format('MMMM DD, YYYY [at] h:mm A')}
          </Descriptions.Item>
        )}
        {booking.paymentCollectedBy && (
          <Descriptions.Item label="Collected By">
            <Space>
              <UserOutlined />
              <Text>{formatUserName(booking.paymentCollectedBy, getUserName)}</Text>
            </Space>
          </Descriptions.Item>
        )}
        {booking.paymentTransactionId && (
          <Descriptions.Item label="Transaction ID">
            <Text code copyable ellipsis={false}>{booking.paymentTransactionId}</Text>
          </Descriptions.Item>
        )}
        {(invoiceInfo?.invoiceUrl || (booking as any).squareInvoiceUrl) && (
          <Descriptions.Item label="Invoice Link">
            <Space>
              <LinkOutlined />
              <a 
                href={invoiceInfo?.invoiceUrl || (booking as any).squareInvoiceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View Invoice
              </a>
            </Space>
          </Descriptions.Item>
        )}
      </Descriptions>

      {/* Invoice Information Section */}
      {invoiceInfo && (
        <>
          <Divider orientation="left" style={{ marginTop: 24, marginBottom: 16 }}>
            Invoice Information
          </Divider>
          <Descriptions column={1} bordered size="small">
            {invoiceInfo.invoiceNumber && (
              <Descriptions.Item label="Invoice Number">
                <Text strong>{invoiceInfo.invoiceNumber}</Text>
              </Descriptions.Item>
            )}
            {invoiceInfo.invoiceId && (
              <Descriptions.Item label="Invoice ID">
                <Text code copyable ellipsis={{ tooltip: invoiceInfo.invoiceId }}>
                  {invoiceInfo.invoiceId}
                </Text>
              </Descriptions.Item>
            )}
            {invoiceInfo.orderId && (
              <Descriptions.Item label="Order ID">
                <Text code copyable ellipsis={false}>{invoiceInfo.orderId}</Text>
              </Descriptions.Item>
            )}
            {invoiceInfo.paymentId && (
              <Descriptions.Item label="Payment ID">
                <Text code copyable ellipsis={false}>{invoiceInfo.paymentId}</Text>
              </Descriptions.Item>
            )}
            {invoiceInfo.customerId && (
              <Descriptions.Item label="Customer ID">
                <Text code copyable ellipsis={false}>{invoiceInfo.customerId}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </>
      )}
    </Drawer>
  );
};


