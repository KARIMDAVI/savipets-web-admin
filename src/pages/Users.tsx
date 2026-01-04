import React, { useEffect, useState, useMemo } from 'react';
import { App, Modal, Typography } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { bookingService } from '@/services/booking.service';
import type { User, UserFilters } from '@/types';
import RoleChangeForm from '@/components/features/users/RoleChangeForm';
import CreateUserForm from '@/components/features/users/CreateUserForm';
import DeleteUserForm from '@/components/features/users/DeleteUserForm';
import UserStatsCards from './Users/components/UserStatsCards';
import UserFiltersBar from './Users/components/UserFiltersBar';
import UserTable from './Users/components/UserTable';
import UserDetailModal from './Users/components/UserDetailModal';
import { buildUserColumns } from './Users/components/userColumns';
import { getRoleDisplayName } from '@/utils/roleUtils';

const UsersPage: React.FC = () => {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<UserFilters>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [roleChangeModalVisible, setRoleChangeModalVisible] = useState(false);
  const [createUserModalVisible, setCreateUserModalVisible] = useState(false);
  const [deleteUserModalVisible, setDeleteUserModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUpdatingMessaging, setIsUpdatingMessaging] = useState(false);

  const {
    data: users = [],
    isLoading,
    refetch,
    error,
  } = useQuery<User[], Error>({
    queryKey: ['users', filters],
    queryFn: () => userService.getAllUsers(filters),
    refetchInterval: 30000,
    retry: 1,
  });

  // Fetch all bookings to calculate totalBookings
  const {
    data: bookings = [],
    isLoading: isLoadingBookings,
  } = useQuery({
    queryKey: ['bookings-for-user-counts'],
    queryFn: () => bookingService.getAllBookings(),
    refetchInterval: 30000,
    retry: 1,
  });

  // Calculate totalBookings for each user
  const usersWithBookings = useMemo(() => {
    if (!bookings.length) {
      return users.map(user => ({ ...user, totalBookings: user.totalBookings || 0 }));
    }

    return users.map(user => {
      let totalBookings = 0;

      if (user.role === 'petOwner') {
        // Count bookings where user is the client
        totalBookings = bookings.filter(b => b.clientId === user.id).length;
      } else if (user.role === 'petSitter') {
        // Count bookings where user is the sitter
        totalBookings = bookings.filter(b => b.sitterId === user.id).length;
      }
      // Admins don't have bookings, so totalBookings remains 0

      return {
        ...user,
        totalBookings,
      };
    });
  }, [users, bookings]);

  useEffect(() => {
    if (error) {
      message.error(error?.message || 'Failed to load users');
    }
  }, [error, message]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleRoleFilter = (value: string[]) => {
    setFilters(prev => ({ ...prev, role: value }));
  };

  const handleStatusFilter = (value: boolean | undefined) => {
    setFilters(prev => ({ ...prev, isActive: value }));
  };

  const handleViewUser = async (userId: string) => {
    try {
      setLoading(true);
      const user = await userService.getUserById(userId);
      if (user) {
        // Calculate totalBookings for the selected user
        let totalBookings = 0;
        if (user.role === 'petOwner') {
          totalBookings = bookings.filter(b => b.clientId === user.id).length;
        } else if (user.role === 'petSitter') {
          totalBookings = bookings.filter(b => b.sitterId === user.id).length;
        }
        
        setSelectedUser({ ...user, totalBookings });
        setDetailModalVisible(true);
      }
    } catch (err) {
      message.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      setLoading(true);
      await userService.updateUserStatus(userId, isActive);
      message.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['bookings-for-user-counts'] });
      await refetch();
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      const errorMessage = err?.message || 'Failed to update user status';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string, reason: string) => {
    try {
      setLoading(true);
      await userService.updateUserRole(userId, newRole, reason);
      message.success('User role updated successfully');
      setRoleChangeModalVisible(false);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['bookings-for-user-counts'] });
      await refetch();
    } catch (err: any) {
      message.error(err?.message || 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  const handleSitterMessagingToggle = async (userId: string, allow: boolean) => {
    try {
      setIsUpdatingMessaging(true);
      await userService.updateSitterMessagingPermission(userId, allow);
      message.success(`Direct messaging ${allow ? 'enabled' : 'disabled'} successfully`);
      setSelectedUser(prev => {
        if (!prev || prev.id !== userId) {
          return prev;
        }
        return {
          ...prev,
          directMessaging: {
            ...(prev.directMessaging ?? {}),
            allowOwnerChats: allow,
          },
        };
      });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      message.error(err?.message || 'Failed to update messaging permissions');
    } finally {
      setIsUpdatingMessaging(false);
    }
  };

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      await userService.createUser(userData);
      message.success('User created successfully');
      setCreateUserModalVisible(false);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['bookings-for-user-counts'] });
      await refetch();
    } catch (err: any) {
      const errorMessage = err?.message || err?.toString() || 'Failed to create user';
      message.error(errorMessage);
      setCreateUserModalVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, reason: string) => {
    try {
      setLoading(true);
      await userService.deleteUser(userId, reason);
      message.success('User deleted successfully');
      setDeleteUserModalVisible(false);
      setSelectedUser(null);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['bookings-for-user-counts'] });
      await refetch();
    } catch (err: any) {
      message.error(err?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteUserModal = (user: User) => {
    setSelectedUser(user);
    setDeleteUserModalVisible(true);
  };

  const openRoleChangeModal = (user: User) => {
    setSelectedUser(user);
    setRoleChangeModalVisible(true);
  };

  const columns = buildUserColumns({
    onView: (user) => handleViewUser(user.id),
    onRoleChange: openRoleChangeModal,
    onToggleStatus: handleToggleUserStatus,
    onDelete: openDeleteUserModal,
  });

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Rating', 'Total Bookings', 'Joined Date'],
      ...usersWithBookings.map((user: User) => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        getRoleDisplayName(user.role),
        user.isActive ? 'Active' : 'Inactive',
        user.rating?.toFixed(1) || 'N/A',
        user.totalBookings || 0,
        new Date(user.createdAt).toLocaleDateString(),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    message.success('Users exported successfully');
  };

  const stats = {
    total: usersWithBookings.length,
    active: usersWithBookings.filter((u: User) => u.isActive).length,
    sitters: usersWithBookings.filter((u: User) => u.role === 'petSitter').length,
    owners: usersWithBookings.filter((u: User) => u.role === 'petOwner').length,
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Typography.Title level={2}>User Management</Typography.Title>
        <Typography.Text type="secondary">
          Manage all users in your pet care platform
        </Typography.Text>
      </div>

      <UserStatsCards stats={stats} />

      <UserFiltersBar
        onSearch={handleSearch}
        onRoleFilter={handleRoleFilter}
        onStatusFilter={handleStatusFilter}
        onRefresh={() => refetch()}
        onExport={exportUsers}
        onAddUser={() => setCreateUserModalVisible(true)}
        isRefreshing={isLoading}
      />

      <UserTable columns={columns} data={usersWithBookings} loading={isLoading || isLoadingBookings} />

      <UserDetailModal
        user={selectedUser}
        open={detailModalVisible}
        loading={loading}
        messagingLoading={isUpdatingMessaging}
        onClose={() => setDetailModalVisible(false)}
        onToggleStatus={handleToggleUserStatus}
        onMessagingToggle={handleSitterMessagingToggle}
      />

      <Modal
        title="Change User Role"
        open={roleChangeModalVisible}
        onCancel={() => setRoleChangeModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <RoleChangeForm
            user={selectedUser}
            onCancel={() => setRoleChangeModalVisible(false)}
            onSave={handleRoleChange}
          />
        )}
      </Modal>

      <Modal
        title="Create New User"
        open={createUserModalVisible}
        onCancel={() => setCreateUserModalVisible(false)}
        footer={null}
        width={600}
      >
        <CreateUserForm
          onCancel={() => setCreateUserModalVisible(false)}
          onSave={handleCreateUser}
        />
      </Modal>

      <Modal
        title="Delete User"
        open={deleteUserModalVisible}
        onCancel={() => setDeleteUserModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedUser && (
          <DeleteUserForm
            user={selectedUser}
            onCancel={() => setDeleteUserModalVisible(false)}
            onConfirm={handleDeleteUser}
          />
        )}
      </Modal>
    </div>
  );
};

export default UsersPage;