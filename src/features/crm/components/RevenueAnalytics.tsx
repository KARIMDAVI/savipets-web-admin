/**
 * Revenue Analytics Component
 * 
 * Displays advanced revenue analytics including LTV, trends, and churn risk.
 */

import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography } from 'antd';
import { DollarOutlined, WarningOutlined, LineChartOutlined } from '@ant-design/icons';
import type { User, Booking } from '@/types';
import {
  calculateClientLTV,
  calculateRevenueTrends,
  calculateChurnRisk,
  type ClientLTV,
  type RevenueTrend,
  type ChurnRiskScore,
} from '../utils/revenueAnalytics';
import { ColumnType } from 'antd/es/table';

const { Title, Text } = Typography;

interface RevenueAnalyticsProps {
  clients: User[];
  bookings: Booking[];
}

export const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = ({
  clients,
  bookings,
}) => {
  // Calculate all analytics
  const clientLTVs = useMemo(
    () => clients.map((client) => calculateClientLTV(client, bookings)),
    [clients, bookings]
  );

  const revenueTrends = useMemo(() => calculateRevenueTrends(bookings, 'month'), [bookings]);

  const churnRisks = useMemo(
    () => clients.map((client) => calculateChurnRisk(client, bookings)),
    [clients, bookings]
  );

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalLTV = clientLTVs.reduce((sum, ltv) => sum + ltv.lifetimeValue, 0);
    const avgLTV = clientLTVs.length > 0 ? totalLTV / clientLTVs.length : 0;
    const avgAOV =
      clientLTVs.length > 0
        ? clientLTVs.reduce((sum, ltv) => sum + ltv.averageOrderValue, 0) / clientLTVs.length
        : 0;
    const highRiskClients = churnRisks.filter((risk) => risk.riskLevel === 'high').length;

    return {
      totalLTV,
      avgLTV,
      avgAOV,
      highRiskClients,
    };
  }, [clientLTVs, churnRisks]);

  // LTV table columns
  const ltvColumns: ColumnType<ClientLTV>[] = [
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Lifetime Value',
      dataIndex: 'lifetimeValue',
      key: 'lifetimeValue',
      render: (value: number) => `$${value.toFixed(2)}`,
      sorter: (a, b) => a.lifetimeValue - b.lifetimeValue,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Avg Order Value',
      dataIndex: 'averageOrderValue',
      key: 'averageOrderValue',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      title: 'Bookings/Month',
      dataIndex: 'purchaseFrequency',
      key: 'purchaseFrequency',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Projected Annual Value',
      dataIndex: 'projectedAnnualValue',
      key: 'projectedAnnualValue',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
  ];

  // Churn risk columns
  const churnColumns: ColumnType<ChurnRiskScore>[] = [
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Risk Level',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (level: string) => {
        const color = level === 'high' ? 'red' : level === 'medium' ? 'orange' : 'green';
        return <Tag color={color}>{level.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'High', value: 'high' },
        { text: 'Medium', value: 'medium' },
        { text: 'Low', value: 'low' },
      ],
      onFilter: (value, record) => record.riskLevel === value,
    },
    {
      title: 'Risk Score',
      dataIndex: 'riskScore',
      key: 'riskScore',
      sorter: (a, b) => a.riskScore - b.riskScore,
      render: (score: number) => `${score}/100`,
    },
    {
      title: 'Days Since Last Booking',
      dataIndex: 'daysSinceLastBooking',
      key: 'daysSinceLastBooking',
    },
    {
      title: 'Risk Factors',
      dataIndex: 'factors',
      key: 'factors',
      render: (factors: string[]) => (
        <div>
          {factors.map((factor, idx) => (
            <Tag key={idx} color="orange" style={{ marginBottom: '4px' }}>
              {factor}
            </Tag>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <Title level={3}>Revenue Analytics</Title>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Lifetime Value"
              value={summaryStats.totalLTV}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Average LTV"
              value={summaryStats.avgLTV}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Average Order Value"
              value={summaryStats.avgAOV}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="High Risk Clients"
              value={summaryStats.highRiskClients}
              prefix={<WarningOutlined />}
              valueStyle={{ color: summaryStats.highRiskClients > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Trends */}
      <Card title="Revenue Trends (Monthly)" style={{ marginBottom: '24px' }}>
        <Table
          dataSource={revenueTrends}
          columns={[
            {
              title: 'Period',
              dataIndex: 'period',
              key: 'period',
            },
            {
              title: 'Revenue',
              dataIndex: 'revenue',
              key: 'revenue',
              render: (value: number) => `$${value.toFixed(2)}`,
            },
            {
              title: 'Bookings',
              dataIndex: 'bookings',
              key: 'bookings',
            },
            {
              title: 'Avg Booking Value',
              dataIndex: 'averageBookingValue',
              key: 'averageBookingValue',
              render: (value: number) => `$${value.toFixed(2)}`,
            },
            {
              title: 'Active Clients',
              dataIndex: 'clientCount',
              key: 'clientCount',
            },
          ]}
          pagination={{ pageSize: 12 }}
          rowKey="period"
        />
      </Card>

      {/* Client Lifetime Value */}
      <Card title="Client Lifetime Value" style={{ marginBottom: '24px' }}>
        <Table
          dataSource={clientLTVs.filter((ltv) => ltv.totalBookings > 0)}
          columns={ltvColumns}
          pagination={{ pageSize: 10 }}
          rowKey="clientId"
        />
      </Card>

      {/* Churn Risk Analysis */}
      <Card title="Churn Risk Analysis">
        <Table
          dataSource={churnRisks.filter((risk) => risk.riskLevel !== 'low')}
          columns={churnColumns}
          pagination={{ pageSize: 10 }}
          rowKey="clientId"
        />
      </Card>
    </>
  );
};

