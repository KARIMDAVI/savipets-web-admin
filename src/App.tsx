import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntdApp, Spin, Card, Typography } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { ThemeProvider } from '@/design/utils/themeProvider';
import { useTheme } from '@/design/utils/useTheme';
import { colors, spacing, shadows, borders, typography } from '@/design/tokens';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import SaviPetsLogo from '@/assets/SaviPets-logo.png';

// Import enhanced cache configuration
import { createEnhancedQueryClientConfig } from '@/features/crm/utils/cacheConfig';

// Create enhanced QueryClient with advanced caching strategies
const queryClient = new QueryClient(createEnhancedQueryClientConfig());

const { Text } = Typography;

// Enhanced Loading Component with design tokens
const PageLoading: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: theme.colors.background,
    }}>
      <Card style={{ 
        width: 300, 
        textAlign: 'center',
        background: theme.colors.backgroundTertiary,
        boxShadow: shadows.card,
        borderRadius: borders.radius.md,
      }}>
        <img 
          src={SaviPetsLogo} 
          alt="SaviPets Logo" 
          style={{ 
            width: '120px', 
            height: '120px',
            objectFit: 'contain',
            marginBottom: spacing.md
          }} 
        />
        <Spin size="large" style={{ display: 'block', margin: `${spacing.md} auto` }} />
        <Text type="secondary">Loading page...</Text>
      </Card>
    </div>
  );
};

// Lazy load other pages for better performance
const UsersPage = React.lazy(() => import('./pages/Users'));
const BookingsPage = React.lazy(() => import('./pages/Bookings'));
const TrackingPage = React.lazy(() => import('./pages/LiveTracking'));
const RouteSnapshotsPage = React.lazy(() => import('./pages/RouteSnapshots'));
const ChatPage = React.lazy(() => import('./pages/Chat'));
const AnalyticsPage = React.lazy(() => import('./pages/Analytics'));
const AIAssignmentPage = React.lazy(() => import('./pages/AIAssignment'));
const SettingsPage = React.lazy(() => import('./pages/Settings'));
const SecurityPage = React.lazy(() => import('./pages/Security'));
const CRMPage = React.lazy(() => import('./pages/CRM'));
const WorkforcePage = React.lazy(() => import('./pages/Workforce'));
const AuditCompliancePage = React.lazy(() => import('./pages/AuditCompliance'));
const NotificationsPage = React.lazy(() => import('./pages/Notifications'));
const MigrationsPage = React.lazy(() => import('./pages/Migrations'));

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${colors.primary[300]} 0%, ${colors.primary[400]} 50%, ${colors.primary[500]} 100%)`
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" style={{ color: theme.colors.textInverse }} />
          <div style={{ 
            color: theme.colors.textInverse, 
            marginTop: spacing.md, 
            fontSize: typography.fontSize.base 
          }}>
            Loading SaviPets Admin...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${colors.primary[300]} 0%, ${colors.primary[400]} 50%, ${colors.primary[500]} 100%)`
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" style={{ color: theme.colors.textInverse }} />
          <div style={{ 
            color: theme.colors.textInverse, 
            marginTop: spacing.md, 
            fontSize: typography.fontSize.base 
          }}>
            Loading SaviPets Admin...
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<PageLoading />}>
              <UsersPage />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<PageLoading />}>
              <BookingsPage />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tracking"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<PageLoading />}>
              <TrackingPage />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/route-snapshots"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<PageLoading />}>
              <RouteSnapshotsPage />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-assignment"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<PageLoading />}>
              <AIAssignmentPage />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<PageLoading />}>
              <ChatPage />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<PageLoading />}>
              <AnalyticsPage />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<PageLoading />}>
              <SettingsPage />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/security"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<PageLoading />}>
              <SecurityPage />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/crm"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<PageLoading />}>
              <CRMPage />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workforce"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<PageLoading />}>
              <WorkforcePage />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-compliance"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<PageLoading />}>
              <AuditCompliancePage />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<PageLoading />}>
              <NotificationsPage />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/migrations"
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<PageLoading />}>
              <MigrationsPage />
            </React.Suspense>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log error for monitoring (can be extended to send to error tracking service)
        console.error('[App] Unhandled error:', error, errorInfo);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AntdApp>
            <AuthProvider>
              <Router>
                <ErrorBoundary>
                  <AppRoutes />
                </ErrorBoundary>
              </Router>
            </AuthProvider>
          </AntdApp>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;