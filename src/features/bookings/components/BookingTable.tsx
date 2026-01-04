/**
 * BookingTable Component
 * 
 * Table component for displaying bookings in a table view.
 * Extracted from BookingsPageRefactored for reusability and testability.
 */

import React from 'react';
import { Table, Card, Empty } from 'antd';
import type { Booking } from '../types/bookings.types';
import { createBookingTableColumns } from './BookingTable/bookingTableColumns';
import { ExpandedSeriesRow } from './BookingTable/ExpandedSeriesRow';
import { useBookingGrouping } from './BookingTable/useBookingGrouping';

interface BookingTableProps {
  bookings: Booking[];
  loading?: boolean;
  error?: Error | null;
  getUserName: (userId: string) => string;
  onViewBooking: (bookingId: string) => void;
  onApproveBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string) => void;
  onAssignSitter: (booking: Booking) => void;
  onUnassignSitter: (booking: Booking) => void;
  onUpdateScheduledDate?: (bookingId: string, newDate: Date) => Promise<void>;
  isUpdatingScheduledDate?: boolean;
}


export const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  loading = false,
  error = null,
  getUserName,
  onViewBooking,
  onApproveBooking,
  onRejectBooking,
  onAssignSitter,
  onUnassignSitter,
  onUpdateScheduledDate,
  isUpdatingScheduledDate = false,
}) => {
  const groupedBySeries = useBookingGrouping(bookings);

  const columns = createBookingTableColumns({
    getUserName,
    onViewBooking,
    onApproveBooking,
    onRejectBooking,
    onAssignSitter,
    onUnassignSitter,
    onUpdateScheduledDate,
    isUpdatingScheduledDate,
  });

  const expandedRowRender = (record: Booking) => {
    if (!record.recurringSeriesId) return null;
    const seriesBookings = groupedBySeries[record.recurringSeriesId] || [];
    return (
      <ExpandedSeriesRow
        record={record}
        seriesBookings={seriesBookings}
        getUserName={getUserName}
        onAssignSitter={onAssignSitter}
      />
    );
  };

  return (
    <Card>
      <Table
        columns={columns}
        dataSource={bookings}
        loading={loading}
        rowKey="id"
        expandable={{
          expandedRowRender,
          rowExpandable: (record) => !!record.recurringSeriesId,
          expandRowByClick: false,
        }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} bookings`,
        }}
        scroll={{ x: 'max-content' }} // Mobile-friendly horizontal scroll
        locale={{
          emptyText: (
            <Empty
              description={
                error
                  ? 'Error loading bookings. Please try again.'
                  : bookings.length === 0
                  ? 'No bookings found'
                  : null
              }
            />
          ),
        }}
      />
    </Card>
  );
};

