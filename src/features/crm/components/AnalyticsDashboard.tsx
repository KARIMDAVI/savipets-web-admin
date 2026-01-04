/**
 * Analytics Dashboard Component
 * 
 * Comprehensive analytics dashboard with multiple metrics and visualizations.
 */

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Space,
  Typography,
  Statistic,
  Spin,
} from 'antd';
import {
  DollarOutlined,
  UserAddOutlined,
  RetweetOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { useAnalytics } from '../hooks/useAnalytics';
import type { AnalyticsQuery, TimePeriod } from '../types/analytics.types';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

export const AnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: dayjs().subtract(30, 'day').toDate(),
    end: dayjs().toDate(),
  });
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('day');

  const queryParams: AnalyticsQuery = {
    dateRange,
    timePeriod,
  };

  const {
    acquisitionMetrics,
    revenueMetrics,
    retentionMetrics,
    engagementMetrics,
    servicePerformance,
    performanceComparison,
    isLoading,
  } = useAnalytics(queryParams);

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setDateRange({
        start: dates[0].toDate(),
        end: dates[1].toDate(),
      });
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Prepare chart data
  const revenueChartData = revenueMetrics?.revenueByPeriod || [];
  const acquisitionChartData = acquisitionMetrics?.newClientsByPeriod || [];
  const serviceChartData = servicePerformance || [];

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={4}>Analytics Dashboard</Title>
          <Space>
            <RangePicker
              value={[dayjs(dateRange.start), dayjs(dateRange.end)]}
              onChange={handleDateRangeChange}
            />
            <Select
              value={timePeriod}
              onChange={setTimePeriod}
              style={{ width: 150 }}
            >
              <Option value="day">Daily</Option>
              <Option value="week">Weekly</Option>
              <Option value="month">Monthly</Option>
              <Option value="quarter">Quarterly</Option>
              <Option value="year">Yearly</Option>
            </Select>
          </Space>
        </Space>
      </Card>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={revenueMetrics?.totalRevenue || 0}
              prefix={<DollarOutlined />}
              precision={2}
            />
            {performanceComparison && (
              <div style={{ marginTop: '8px', fontSize: '12px' }}>
                <span
                  style={{
                    color: performanceComparison.changes.revenue >= 0 ? '#52c41a' : '#ff4d4f',
                  }}
                >
                  {performanceComparison.changes.revenue >= 0 ? '+' : ''}
                  {performanceComparison.changes.revenue.toFixed(1)}%
                </span>
                {' vs previous period'}
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="New Clients"
              value={acquisitionMetrics?.totalNewClients || 0}
              prefix={<UserAddOutlined />}
            />
            {acquisitionMetrics && (
              <div style={{ marginTop: '8px', fontSize: '12px' }}>
                <span
                  style={{
                    color: acquisitionMetrics.growthRate >= 0 ? '#52c41a' : '#ff4d4f',
                  }}
                >
                  {acquisitionMetrics.growthRate >= 0 ? '+' : ''}
                  {acquisitionMetrics.growthRate.toFixed(1)}% growth
                </span>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Retention Rate"
              value={retentionMetrics?.retentionRate || 0}
              prefix={<RetweetOutlined />}
              suffix="%"
              precision={1}
            />
            <div style={{ marginTop: '8px', fontSize: '12px' }}>
              {retentionMetrics?.activeClients || 0} active clients
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg Revenue/Client"
              value={revenueMetrics?.averageRevenuePerClient || 0}
              prefix={<TrophyOutlined />}
              precision={2}
            />
            <div style={{ marginTop: '8px', fontSize: '12px' }}>
              {revenueMetrics?.averageRevenuePerBooking || 0} per booking
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Revenue Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1890ff"
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Client Acquisition">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={acquisitionChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#1890ff" name="New Clients" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Service Performance">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ serviceType, totalRevenue }) =>
                    `${serviceType}: $${totalRevenue.toFixed(2)}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalRevenue"
                >
                  {serviceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Retention Metrics">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <strong>Retention Rate:</strong>{' '}
                {retentionMetrics?.retentionRate.toFixed(1) || 0}%
              </div>
              <div>
                <strong>Churn Rate:</strong> {retentionMetrics?.churnRate.toFixed(1) || 0}%
              </div>
              <div>
                <strong>Average Lifetime Value:</strong> $
                {retentionMetrics?.lifetimeValue.toFixed(2) || 0}
              </div>
              <div>
                <strong>Repeat Booking Rate:</strong>{' '}
                {retentionMetrics?.repeatBookingRate.toFixed(1) || 0}%
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

