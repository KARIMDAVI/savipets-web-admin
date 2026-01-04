import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Space, Typography, Drawer, type MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  MessageOutlined,
  EnvironmentOutlined,
  GroupOutlined,
  RobotOutlined,
  BarChartOutlined,
  FileTextOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  TeamOutlined,
  UserAddOutlined,
  SafetyCertificateOutlined,
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { SkipNavigation, ThemeToggle } from '@/components/common';
import { useTheme } from '@/design/utils/useTheme';
import { colors, spacing, shadows, borders, typography } from '@/design/tokens';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// Mobile breakpoint (matches Ant Design's default)
const MOBILE_BREAKPOINT = 768;

type MenuItem = Required<MenuProps>['items'][number];

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < MOBILE_BREAKPOINT);

  // Handle window resize for mobile detection
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      // Auto-collapse sidebar on mobile
      if (mobile) {
        setCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems: MenuItem[] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Users',
    },
    {
      type: 'divider' as const,
    },
    {
      key: '/bookings',
      icon: <CalendarOutlined />,
      label: 'Bookings',
    },
    {
      type: 'divider' as const,
    },
    {
      key: '/tracking',
      icon: <EnvironmentOutlined />,
      label: 'Live Tracking',
    },
    {
      key: '/route-snapshots',
      icon: <HistoryOutlined />,
      label: 'Route Snapshots',
    },
    {
      key: '/ai-assignment',
      icon: <RobotOutlined />,
      label: 'AI Assignment',
    },
    {
      type: 'divider' as const,
    },
    {
      key: '/chat',
      icon: <MessageOutlined />,
      label: 'Chat & Messages',
    },
    {
      type: 'divider' as const,
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics & Reports',
    },
    {
      type: 'divider' as const,
    },
    {
      key: '/crm',
      icon: <TeamOutlined />,
      label: 'CRM & Clients',
    },
    {
      key: '/workforce',
      icon: <UserAddOutlined />,
      label: 'Workforce & Sitters',
    },
    {
      type: 'divider' as const,
    },
    {
      key: '/audit-compliance',
      icon: <SafetyCertificateOutlined />,
      label: 'Audit & Compliance',
    },
    {
      key: '/notifications',
      icon: <BellOutlined />,
      label: 'Notifications',
    },
    {
      type: 'divider',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      key: '/security',
      icon: <SecurityScanOutlined />,
      label: 'Security',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    // Close mobile drawer after navigation
    if (isMobile) {
      setMobileDrawerVisible(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      onClick: handleSignOut,
    },
  ];

  // Menu component to avoid duplication
  const menuComponent = (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={handleMenuClick}
      style={{ border: 'none' }}
    />
  );

  // Sidebar header component
  const sidebarHeader = (
    <div style={{ 
      padding: spacing.md, 
      textAlign: 'center',
      borderBottom: `1px solid ${theme.colors.border}`
    }}>
      <Text strong style={{ 
        fontSize: isMobile ? typography.fontSize.lg : (collapsed ? typography.fontSize.base : typography.fontSize.lg),
        color: theme.colors.text
      }}>
        {isMobile ? 'SaviPets Admin' : (collapsed ? 'SP' : 'SaviPets Admin')}
      </Text>
    </div>
  );

  return (
    <>
      <SkipNavigation />
      <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          style={{
            background: theme.colors.backgroundTertiary,
            boxShadow: shadows.sidebar,
          }}
          breakpoint="lg"
          collapsedWidth={isMobile ? 0 : 80}
        >
          {sidebarHeader}
          {menuComponent}
        </Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          title={sidebarHeader}
          placement="left"
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          styles={{ body: { padding: 0 } }}
          width={280}
        >
          {menuComponent}
        </Drawer>
      )}
      
      <Layout>
        <Header style={{ 
          padding: isMobile ? `0 ${spacing.sm}` : `0 ${spacing.lg}`, 
          background: theme.colors.backgroundTertiary,
          boxShadow: shadows.header,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: isMobile ? '56px' : '64px',
        }}>
          <Button
            type="text"
            icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={() => {
              if (isMobile) {
                setMobileDrawerVisible(true);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            style={{ 
              fontSize: typography.fontSize.base, 
              width: isMobile ? 48 : 64, 
              height: isMobile ? 48 : 64,
              minWidth: isMobile ? 48 : 64,
            }}
          />
          
          <Space size={isMobile ? 'small' : 'middle'} wrap>
            {!isMobile && (
              <Text strong style={{ 
                fontSize: typography.fontSize.sm,
                color: theme.colors.text
              }}>
                Welcome, {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email || 'Admin'}
              </Text>
            )}
            <ThemeToggle />
            <Dropdown
              menu={{ 
                items: userMenuItems,
                onClick: ({ key }) => {
                  if (key === 'profile') {
                    navigate('/settings');
                  }
                }
              }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: 'pointer' }} size="small">
                <Avatar 
                  size={isMobile ? 'default' : 'large'} 
                  src={user?.profileImage}
                  icon={<UserOutlined />}
                />
                {!isMobile && (
                  <Text type="secondary" style={{ display: collapsed ? 'none' : 'inline' }}>
                    {user?.role || 'admin'}
                  </Text>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content 
          id="main-content"
          tabIndex={-1}
          style={{ 
            margin: isMobile ? `${spacing.sm} ${spacing.xs}` : `${spacing.lg} ${spacing.md}`,
            padding: isMobile ? spacing.md : spacing.lg,
            background: theme.colors.backgroundTertiary,
            borderRadius: borders.radius.md,
            boxShadow: shadows.card,
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
    </>
  );
};

export default AdminLayout;
