import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Empty,
  Result,
  Form,
  message,
} from 'antd';
import {
  PlusOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';
import { userService } from '@/services/user.service';
import type { Booking, BookingFilters, User } from '@/types';
import dayjs from 'dayjs';
import { useAuth } from '@/contexts/AuthContext';
import { useSitters } from '@/features/bookings/hooks/useSitters';

const { Text } = Typography;

import { DayScheduleConfigurator } from './BookingsPageLegacy/DayScheduleConfigurator';
import { CalendarView } from './BookingsPageLegacy/CalendarView';
import { CreateBookingModal } from './BookingsPageLegacy/CreateBookingModal';
import { AssignSitterModal } from './BookingsPageLegacy/AssignSitterModal';
import { ListView } from './BookingsPageLegacy/ListView';
import { BookingDetailDrawer } from './BookingsPageLegacy/BookingDetailDrawer';
import { BookingStatsCards } from './BookingsPageLegacy/BookingStatsCards';
import { BookingFiltersComponent } from './BookingsPageLegacy/BookingFilters';
import { BookingPageHeader } from './BookingsPageLegacy/BookingPageHeader';
import { useBookingHandlers } from './BookingsPageLegacy/hooks/useBookingHandlers';
import { useBookingTableColumns } from './BookingsPageLegacy/hooks/useBookingTableColumns';
import { useClientPets } from './BookingsPageLegacy/hooks/useClientPets';
import { useBookingFilters } from './BookingsPageLegacy/hooks/useBookingFilters';
import { exportBookingsToCSV } from './BookingsPageLegacy/utils/bookingHelpers';
import { getUserDisplayName, getUserInitials } from './BookingsPageLegacy/utils/userHelpers';
import { filterClients, generateClientOptions } from './BookingsPageLegacy/utils/clientHelpers';
import { getStatusColor, getServiceTypeDisplayName } from '@/features/bookings/utils/bookingHelpers';

const BookingsPageLegacy: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const isAuthorized = isAdmin;
  const [filters, setFilters] = useState<BookingFilters>({});
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState<'table' | 'calendar' | 'list'>('table');
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [createBookingModalVisible, setCreateBookingModalVisible] = useState(false);
  const [createBookingForm] = Form.useForm();
  const selectedClientId = Form.useWatch('clientId', createBookingForm);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');
  const [isRecurring, setIsRecurring] = useState(false);
  const [numberOfVisits, setNumberOfVisits] = useState(1);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [preferredDays, setPreferredDays] = useState<number[]>([]);
  const [availablePets, setAvailablePets] = useState<string[]>([]);
  const [petOptionsLoading, setPetOptionsLoading] = useState(false);

  useEffect(() => {
    if (!assignModalVisible) {
      form.resetFields();
      return;
    }

    form.setFieldsValue({
      sitterId: selectedBooking?.sitterId ?? undefined,
    });
  }, [assignModalVisible, selectedBooking?.sitterId, form]);

  // Fetch bookings
  const {
    data: bookings = [],
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['bookings', filters],
    queryFn: async () => {
      try {
        const result = await bookingService.getAllBookings(filters);
        console.log('📊 Bookings loaded:', result.length);
        return result;
      } catch (error) {
        console.error('❌ Bookings query error:', error);
        message.error('Failed to load bookings.');
        return [];
      }
    },
    refetchInterval: 30000,
    retry: 1,
    enabled: isAuthorized && !authLoading,
  });

  // Fetch all users for name resolution
  const { data: allUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      try {
        const users = await userService.getAllUsers();
        console.log('📊 Users loaded for bookings:', users.length);
        console.log('📊 Sample user:', users[0] ? { id: users[0].id, firstName: users[0].firstName, lastName: users[0].lastName, email: users[0].email } : 'No users');
        return users;
      } catch (error) {
        console.error('❌ Error fetching users:', error);
        return [];
      }
    },
    enabled: isAuthorized && !authLoading,
  });

  // Fetch sitters for assignment
  const { data: sitters = [] } = useSitters();

  // Create a stable userMap using useMemo with a stable key
  // Use a serialized version of user IDs to ensure stability
  const userMapKey = useMemo(() => {
    return allUsers.map(u => u.id).sort().join(',');
  }, [allUsers]);
  
  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    allUsers.forEach(user => {
      map.set(user.id, user);
    });
    return map;
  }, [userMapKey]);

  const getUserName = useCallback((userId: string | null | undefined): string => {
    return getUserDisplayName(userId, userMap, allUsers, isLoadingUsers);
  }, [userMap, allUsers, isLoadingUsers]);

  const {
    handleSearch,
    handleStatusFilter,
    handleServiceTypeFilter,
    handleDateRangeFilter,
  } = useBookingFilters({ filters, setFilters });

  const [viewBookingLoading, setViewBookingLoading] = useState(false);

  const handleViewBooking = useCallback(async (bookingId: string) => {
    try {
      setViewBookingLoading(true);
      const booking = await bookingService.getBookingById(bookingId);
      if (booking) {
        setSelectedBooking(booking);
        setDetailDrawerVisible(true);
      } else {
        message.error('Booking not found');
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      message.error('Failed to load booking details');
    } finally {
      setViewBookingLoading(false);
    }
  }, []);

  const {
    loading: handlersLoading,
    assigningSitter,
    handleApproveBooking,
    handleRejectBooking,
    handleAssignSitter: handleAssignSitterAction,
    handleUnassignSitter,
    handleUpdateScheduledDate,
    handleCreateBooking,
  } = useBookingHandlers({
    refetch,
    onBookingCreated: () => {
      setCreateBookingModalVisible(false);
      createBookingForm.resetFields();
      setAvailablePets([]);
      setPetOptionsLoading(false);
    },
  });

  const handleAssignSitter = async (values: { sitterId: string }) => {
    if (!selectedBooking) return;
    const success = await handleAssignSitterAction(selectedBooking.id, values.sitterId);
    if (success) {
      setAssignModalVisible(false);
      form.resetFields();
    }
  };


  const columns = useBookingTableColumns({
    userMap,
    onViewBooking: handleViewBooking,
    onApproveBooking: handleApproveBooking,
    onRejectBooking: handleRejectBooking,
    onAssignSitter: (booking) => {
      setSelectedBooking(booking);
                    setAssignModalVisible(true);
    },
    onUnassignSitter: handleUnassignSitter,
    onUpdateScheduledDate: handleUpdateScheduledDate,
    loading: handlersLoading,
  });

  const exportBookings = () => {
    exportBookingsToCSV(bookings, getUserName);
  };


  const clients = useMemo(() => filterClients(allUsers, isAuthorized), [allUsers, isAuthorized]);
  const clientOptions = useMemo(() => generateClientOptions(clients), [clients]);

  useClientPets({
    selectedClientId,
    clients,
    isAuthorized,
    authLoading,
    createBookingForm,
    setAvailablePets,
    setPetOptionsLoading,
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    active: bookings.filter(b => b.status === 'active').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    revenue: bookings.reduce((sum, b) => sum + b.price, 0),
  };



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
      <BookingPageHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Action Bar - Create Booking */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 500, lineHeight: '24px' }}>Actions</h4>
            <Text type="secondary" ellipsis={false}>Create new bookings on behalf of clients</Text>
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

      <BookingStatsCards stats={stats} />

      {viewMode === 'table' && (
        <BookingFiltersComponent
          filters={filters}
          bookingsCount={bookings.length}
          isLoading={isLoading}
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          onServiceTypeFilter={handleServiceTypeFilter}
          onDateRangeFilter={handleDateRangeFilter}
          onRefresh={refetch}
          onExport={exportBookings}
        />
      )}

      {/* Main Content */}
      {viewMode === 'table' && (
        <Card>
          <Table
            columns={columns}
            dataSource={bookings}
            loading={isLoading}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} bookings`,
            }}
            scroll={{ x: 1400 }}
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
      )}

      {viewMode === 'calendar' && (
        <Card>
          <CalendarView
            bookings={bookings}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onBookingClick={handleViewBooking}
          />
        </Card>
      )}

      {viewMode === 'list' && (
        <ListView
          bookings={bookings}
          getUserName={getUserName}
          onBookingClick={handleViewBooking}
        />
      )}

      <BookingDetailDrawer
        visible={detailDrawerVisible}
        loading={viewBookingLoading}
        booking={selectedBooking}
        getUserName={getUserName}
        onClose={() => setDetailDrawerVisible(false)}
      />

      <CreateBookingModal
        visible={createBookingModalVisible}
        loading={handlersLoading}
        form={createBookingForm}
        clientOptions={clientOptions}
        availablePets={availablePets}
        petOptionsLoading={petOptionsLoading}
        selectedClientId={selectedClientId}
        sitters={sitters}
        isLoadingUsers={isLoadingUsers}
        authLoading={authLoading}
        onCancel={() => {
          setCreateBookingModalVisible(false);
          createBookingForm.resetFields();
          setAvailablePets([]);
          setPetOptionsLoading(false);
        }}
        onSubmit={handleCreateBooking}
        onClientChange={(clientId) => {
          createBookingForm.setFieldsValue({ clientId });
        }}
        onPetsChange={(pets) => {
                  setAvailablePets(prev => {
                    const merged = new Set(prev);
            pets.forEach(name => merged.add(name));
                    return Array.from(merged);
                  });
        }}
      />

      <AssignSitterModal
        visible={assignModalVisible}
        booking={selectedBooking}
        sitters={sitters}
        loading={assigningSitter}
        onCancel={() => {
          setAssignModalVisible(false);
          form.resetFields();
        }}
        onSubmit={handleAssignSitter}
        onUnassign={handleUnassignSitter}
      />
    </div>
  );
};

export default BookingsPageLegacy;
