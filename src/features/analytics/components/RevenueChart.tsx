/**
 * Revenue Chart Component
 * 
 * Displays revenue trend chart.
 */

import React from 'react';
import { Card } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { RevenueChartDataPoint } from '../types/analytics.types';

interface RevenueChartProps {
  data: RevenueChartDataPoint[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const chartDescription = `Revenue trend chart showing ${data.length} data points over time`;
  
  return (
    <Card title="Revenue Trend" extra={<DollarOutlined />}>
      <div 
        role="img" 
        aria-label={chartDescription}
        aria-describedby="revenue-chart-description"
      >
        <div id="revenue-chart-description" className="sr-only">
          {chartDescription}. Interactive chart showing revenue and bookings over time.
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} aria-label={chartDescription}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `$${value}` : value,
                name === 'revenue' ? 'Revenue' : 'Bookings'
              ]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#1890ff"
              fill="#1890ff"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

