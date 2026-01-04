import React, { useMemo } from 'react';
import { Typography, Row, Col, Spin, message, Alert, Empty } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useAnalytics } from '@/features/analytics/hooks';
import {
  AnalyticsControls,
  AnalyticsStatsCards,
  RevenueChart,
  ServiceTypeChart,
  PerformanceMetrics,
  TopSittersTable,
} from '@/features/analytics/components';
import {
  calculateAnalyticsData,
  prepareRevenueChartData,
  prepareServiceTypeData,
  calculateTopSitters,
  exportAnalyticsToCSV,
} from '@/features/analytics/utils/analyticsHelpers';

const { Title, Text } = Typography;

const AnalyticsPage: React.FC = () => {
  const {
    bookings,
    users,
    dateRange,
    timeframe,
    isLoading,
    bookingsLoading,
    usersLoading,
    error,
    isError,
    setDateRange,
    setTimeframe,
    refetchBookings,
    refetchAll,
  } = useAnalytics();

  // Calculate analytics data
  const analyticsData = useMemo(
    () => calculateAnalyticsData(bookings, users),
    [bookings, users]
  );

  // Prepare chart data with timeframe and date range
  const revenueChartData = useMemo(
    () => prepareRevenueChartData(
      bookings,
      timeframe,
      dateRange ? {
        start: dateRange[0].toDate(),
        end: dateRange[1].toDate(),
      } : undefined
    ),
    [bookings, timeframe, dateRange]
  );

  const serviceTypeData = useMemo(
    () => prepareServiceTypeData(bookings),
    [bookings]
  );

  const topSitters = useMemo(
    () => calculateTopSitters(users, bookings),
    [users, bookings]
  );

  const handleExport = () => {
    try {
      exportAnalyticsToCSV(analyticsData);
      message.success('Analytics data exported successfully');
    } catch (error) {
      console.error('[AnalyticsPage] Export error:', error);
      message.error('Failed to export analytics data. Please try again.');
    }
  };

  // Check for empty data
  const hasNoData = !isLoading && bookings.length === 0 && users.length === 0;
  const hasNoBookings = !isLoading && bookings.length === 0;

  return (
    <ErrorBoundary>
      <main>
        <header style={{ marginBottom: '24px' }}>
          <Title level={1} style={{ marginBottom: '8px' }}>Analytics Dashboard</Title>
          <Text type="secondary">
            Comprehensive insights into your pet care platform performance
          </Text>
        </header>

        <AnalyticsControls
          dateRange={dateRange}
          timeframe={timeframe}
          isLoading={isLoading}
          onDateRangeChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              setDateRange([dates[0], dates[1]]);
            } else {
              // Reset to default range if null
              setDateRange([
                dayjs().subtract(30, 'days'),
                dayjs(),
              ]);
            }
          }}
        onTimeframeChange={setTimeframe}
        onRefresh={refetchAll}
        onExport={handleExport}
        />

        {isError && (
          <Alert
            message="Error Loading Analytics Data"
            description={
              error instanceof Error
                ? error.message
                : 'Failed to load analytics data. Please try refreshing.'
            }
            type="error"
            showIcon
            action={
              <ReloadOutlined
                onClick={() => refetchAll()}
                style={{ cursor: 'pointer', fontSize: '16px' }}
              />
            }
            style={{ marginBottom: '24px' }}
          />
        )}

        {(bookingsLoading || usersLoading) ? (
          <>
            {bookingsLoading && usersLoading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>
                  <Text type="secondary">Loading analytics data...</Text>
                </div>
              </div>
            ) : (
              <>
                {/* Show partial data while loading */}
                {!bookingsLoading && bookings.length > 0 && (
                  <>
                    <AnalyticsStatsCards data={analyticsData} />
                    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                      <Col xs={24} lg={16}>
                        <RevenueChart data={revenueChartData} />
                      </Col>
                      <Col xs={24} lg={8}>
                        <ServiceTypeChart data={serviceTypeData} />
                      </Col>
                    </Row>
                    <PerformanceMetrics data={analyticsData} />
                    <TopSittersTable data={topSitters} />
                  </>
                )}
                {bookingsLoading && (
                  <div style={{ textAlign: 'center', padding: '30px' }}>
                    <Spin />
                    <div style={{ marginTop: '16px' }}>
                      <Text type="secondary">Loading bookings...</Text>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : hasNoData ? (
          <Empty
            description="No analytics data available"
            style={{ padding: '50px 0' }}
          >
            <Text type="secondary">
              There is no data available for the selected date range.
              Try selecting a different date range or check back later.
            </Text>
          </Empty>
        ) : hasNoBookings ? (
          <Empty
            description="No bookings found"
            style={{ padding: '50px 0' }}
          >
            <Text type="secondary">
              No bookings found for the selected date range.
              Try selecting a different date range.
            </Text>
          </Empty>
        ) : (
          <>
            <AnalyticsStatsCards data={analyticsData} />

            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} lg={16}>
                <RevenueChart data={revenueChartData} />
              </Col>
              <Col xs={24} lg={8}>
                <ServiceTypeChart data={serviceTypeData} />
              </Col>
            </Row>

            <PerformanceMetrics data={analyticsData} />

            <TopSittersTable data={topSitters} />
          </>
        )}
      </main>
    </ErrorBoundary>
  );
};

export default AnalyticsPage;
