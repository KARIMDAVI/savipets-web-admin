/**
 * Bookings Page - Refactored Version
 * 
 * Uses Zustand store, custom hooks, and extracted components.
 * Target: <300 lines
 */

import React, { useMemo } from 'react';
import { Card, Button, Space, Typography, Row, Col, Result } from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useBookings, useBookingStats, useBookingExport } from '@/features/bookings/hooks';
import { useBookingActions } from '@/features/bookings/hooks/useBookingActions';
import { useUserMap } from '@/shared/hooks/useUserMap';
import { useSitters } from '@/features/bookings/hooks/useSitters';
import { useBookingStore } from '@/features/bookings/stores/useBookingStore';
import {
  BookingViewSwitcher,
  AssignSitterModal,
  BookingFiltersComponent,
  BookingDetailDrawer,
  BookingTable,
  CreateBookingModal,
  BookingStatsCards,
  BookingCalendarView,
  BookingListView,
} from '@/features/bookings/components';
import { useAuth } from '@/contexts/AuthContext';
import type { Booking } from '@/features/bookings/types/bookings.types';

const { Title, Text } = Typography;

const BookingsPageRefactored: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const isAuthorized = isAdmin;
  
  // Zustand store state
  const filters = useBookingStore(state => state.filters);
  const setFilters = useBookingStore(state => state.setFilters);
  const selectedBooking = useBookingStore(state => state.selectedBooking);
  const setSelectedBooking = useBookingStore(state => state.setSelectedBooking);
  const detailDrawerVisible = useBookingStore(state => state.detailDrawerVisible);
  const setDetailDrawerVisible = useBookingStore(state => state.setDetailDrawerVisible);
  const assignModalVisible = useBookingStore(state => state.assignModalVisible);
  const setAssignModalVisible = useBookingStore(state => state.setAssignModalVisible);
  const viewMode = useBookingStore(state => state.viewMode);
  const setViewMode = useBookingStore(state => state.setViewMode);
  const selectedDate = useBookingStore(state => state.selectedDate);
  const setSelectedDate = useBookingStore(state => state.setSelectedDate);
  const createBookingModalVisible = useBookingStore(state => state.createBookingModalVisible);
  const setCreateBookingModalVisible = useBookingStore(state => state.setCreateBookingModalVisible);

  // Data fetching hooks
  const { bookings, isLoading, error, refetch } = useBookings({
    filters: filters,
    enabled: isAuthorized && !authLoading,
  });

  const { data: sitters = [] } = useSitters();
  const { getUserName, allUsers, isLoadingUsers } = useUserMap();

  // Action hooks
  const {
    handleAssignSitter: handleAssignSitterHook,
    handleUnassignSitter: handleUnassignSitterHook,
    handleApproveBooking: handleApproveBookingHook,
    handleRejectBooking: handleRejectBookingHook,
    handleViewBooking: handleViewBookingHook,
    handleCreateBooking: handleCreateBookingHook,
    handleCreateRecurringBooking: handleCreateRecurringBookingHook,
    handleUpdateScheduledDate: handleUpdateScheduledDateHook,
    isAssigning,
    isCreating,
    isCreatingRecurring,
    isViewing,
    isUpdatingScheduledDate,
  } = useBookingActions();

  // Stats and export hooks
  const stats = useBookingStats(bookings);
  const { exportBookings } = useBookingExport({ bookings, getUserName });

  // Helper functions
  const handleAssignSitter = (sitterId: string) => {
    if (!selectedBooking) return;
    handleAssignSitterHook(selectedBooking.id, sitterId);
  };

  const handleAssignSitterFromTable = (booking: Booking) => {
    setSelectedBooking(booking);
    setAssignModalVisible(true);
  };

  const handleUnassignSitterFromTable = (booking: Booking) => {
    setSelectedBooking(booking);
    handleUnassignSitterHook(booking.id);
  };

  const handleUnassignSitter = () => {
    if (!selectedBooking) return;
    handleUnassignSitterHook(selectedBooking.id);
  };

  const clients = useMemo(() => {
    if (!isAuthorized) {
      return [];
    }
    return allUsers.filter((user) => {
      const normalizedRole = (user.role || '').toLowerCase();
      return normalizedRole === 'petowner' || normalizedRole === 'owner' || normalizedRole === 'client';
    });
  }, [allUsers, isAuthorized]);

  // Loading and authorization checks
  if (authLoading) {
    return (
      <Result
        status="info"
        title="Verifying Access"
        subTitle="Please wait while we confirm your admin permissions."
      />
    );
  }

  if (!authLoading && !isAuthorized) {
    return (
      <Result
        status="403"
        title="Restricted Access"
        subTitle="Bookings can only be managed by admins. Please contact an administrator if you need assistance."
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <CalendarOutlined /> Booking Management
            </Title>
            <Text type="secondary">
              Manage all pet care bookings, assignments, and schedules
            </Text>
          </div>
          <Space>
            <BookingViewSwitcher viewMode={viewMode} onChange={setViewMode} />
          </Space>
        </Space>
      </div>

      {/* Action Bar - Create Booking */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>Actions</Title>
            <Text type="secondary">Create new bookings on behalf of clients</Text>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setCreateBookingModalVisible(true)}
              size="large"
            >
              Create Booking for Client
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <BookingStatsCards stats={stats} />

      {/* Filters and Actions */}
      {viewMode === 'table' && (
        <BookingFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          onRefresh={refetch}
          onExport={exportBookings}
          isLoading={isLoading}
          bookingsCount={bookings.length}
        />
      )}

      {/* Main Content - Table View */}
      {viewMode === 'table' && (
        <BookingTable
          bookings={bookings}
          loading={isLoading}
          error={error}
          getUserName={getUserName}
          onViewBooking={handleViewBookingHook}
          onApproveBooking={handleApproveBookingHook}
          onRejectBooking={handleRejectBookingHook}
          onAssignSitter={handleAssignSitterFromTable}
          onUnassignSitter={handleUnassignSitterFromTable}
          onUpdateScheduledDate={handleUpdateScheduledDateHook}
          isUpdatingScheduledDate={isUpdatingScheduledDate}
        />
      )}

      {/* Main Content - Calendar View */}
      {viewMode === 'calendar' && (
        <Card>
          <BookingCalendarView
            bookings={bookings}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onViewBooking={handleViewBookingHook}
          />
        </Card>
      )}

      {/* Main Content - List View */}
      {viewMode === 'list' && (
        <BookingListView
          bookings={bookings}
          getUserName={getUserName}
          onViewBooking={handleViewBookingHook}
        />
      )}

      {/* Booking Detail Drawer */}
      <BookingDetailDrawer
        visible={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        booking={selectedBooking}
        getUserName={getUserName}
        loading={isViewing}
      />

      {/* Create Booking Modal */}
      <CreateBookingModal
        visible={createBookingModalVisible}
        onCancel={() => setCreateBookingModalVisible(false)}
        onCreateBooking={handleCreateBookingHook}
        onCreateRecurringBooking={handleCreateRecurringBookingHook}
        clients={clients}
        sitters={sitters}
        isLoadingUsers={isLoadingUsers}
        authLoading={authLoading}
        isCreating={isCreating}
        isCreatingRecurring={isCreatingRecurring}
      />

      {/* Sitter Assignment Modal */}
      <AssignSitterModal
        visible={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        onAssign={handleAssignSitter}
        sitters={sitters}
        loading={isAssigning}
        initialSitterId={selectedBooking?.sitterId ?? null}
        onUnassign={selectedBooking?.sitterId ? handleUnassignSitter : undefined}
      />
    </div>
  );
};

export default BookingsPageRefactored;
