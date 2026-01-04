import React from 'react';
import { Card, Row, Col, Statistic, Typography, List, Avatar, Tag, Button, Space, Spin } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  StarOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { bookingService } from '@/services/booking.service';
import { notificationService } from '@/services/notification.service';
import type { Notification } from '@/types';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch real data
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const result = await userService.getAllUsers();
      console.log('📊 Dashboard - Users loaded:', result.length);
      return result;
    },
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['all-bookings'],
    queryFn: async () => {
      const result = await bookingService.getAllBookings();
      console.log('📊 Dashboard - Bookings loaded:', result.length);
      return result;
    },
  });

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['recent-notifications'],
    queryFn: async () => {
      const result = await notificationService.getRecentNotifications(5);
      console.log('📊 Dashboard - Notifications loaded:', result.length);
      return result;
    },
  });

  // Calculate real statistics
  const stats = {
    totalUsers: users.length,
    activeBookings: bookings.filter(b => b.status === 'active' || b.status === 'approved').length,
    totalRevenue: bookings.reduce((sum, b) => sum + (b.price || 0), 0),
    averageRating: 4.7, // This would come from ratings data if we had it
  };

  // Format notification into activity format with time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  // Convert notifications to activity format
  let recentActivities = notifications.map((notification: Notification) => {
    // Map notification type to UI status
    let status = 'pending';
    if (notification.type === 'booking_started' || notification.type === 'visit_started') {
      status = 'active';
    } else if (notification.type === 'booking_completed' || notification.type === 'visit_completed' || notification.type === 'booking_approved') {
      status = 'completed';
    }

    return {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      time: formatTimeAgo(notification.createdAt),
      status: status,
    };
  });

  // If no notifications, use recent bookings as fallback
  if (recentActivities.length === 0) {
    recentActivities = bookings.slice(0, 5).map((booking) => {
      const status = booking.status === 'pending' ? 'pending' : 
                     booking.status === 'approved' || booking.status === 'active' ? 'active' : 
                     'completed';
      
      return {
        id: booking.id,
        type: 'booking',
        message: `${booking.serviceType} booking ${booking.status}`,
        time: formatTimeAgo(booking.updatedAt || booking.createdAt),
        status: status,
      };
    });
  }

  const quickActions = [
    {
      title: 'View All Bookings',
      description: 'Manage pending and active bookings',
      icon: <CalendarOutlined />,
      color: '#1890ff',
      onClick: () => navigate('/bookings'),
    },
    {
      title: 'User Management',
      description: 'View and manage user accounts',
      icon: <UserOutlined />,
      color: '#52c41a',
      onClick: () => navigate('/users'),
    },
    {
      title: 'Live Tracking',
      description: 'Monitor active visits in real-time',
      icon: <EyeOutlined />,
      color: '#faad14',
      onClick: () => navigate('/tracking'),
    },
    {
      title: 'Analytics',
      description: 'View business insights and reports',
      icon: <StarOutlined />,
      color: '#722ed1',
      onClick: () => navigate('/analytics'),
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'active':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
    }
  };

  if (usersLoading || bookingsLoading || notificationsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          Welcome back, {user?.firstName ? user.firstName : user?.email ? user.email.split('@')[0] : 'Admin'}!
        </Title>
        <Text type="secondary">
          Here's what's happening with your pet care business today.
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Bookings"
              value={stats.activeBookings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#722ed1' }}
              formatter={(value) => `$${value?.toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Average Rating"
              value={stats.averageRating}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Activity */}
        <Col xs={24} lg={12}>
          <Card 
            title="Recent Activity" 
            extra={<Button type="link" onClick={() => navigate('/bookings')}>View All</Button>}
          >
            <List
              dataSource={recentActivities}
              locale={{ emptyText: 'No recent activity' }}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={getStatusIcon(item.status)} />}
                    title={item.message}
                    description={
                      <Space>
                        <Text type="secondary">{item.time}</Text>
                        <Tag color={item.status === 'pending' ? 'orange' : item.status === 'active' ? 'blue' : 'green'}>
                          {item.status}
                        </Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col xs={24} lg={12}>
          <Card title="Quick Actions">
            <Row gutter={[16, 16]}>
              {quickActions.map((action, index) => (
                <Col xs={24} sm={12} key={index}>
                  <Card
                    hoverable
                    size="small"
                    onClick={action.onClick}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', color: action.color, marginBottom: '8px' }}>
                        {action.icon}
                      </div>
                      <Text strong>{action.title}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {action.description}
                      </Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
