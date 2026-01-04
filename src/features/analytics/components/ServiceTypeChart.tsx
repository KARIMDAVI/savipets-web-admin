/**
 * Service Type Chart Component
 * 
 * Displays service type distribution pie chart.
 */

import React from 'react';
import { Card } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ServiceTypeDataPoint } from '../types/analytics.types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface ServiceTypeChartProps {
  data: ServiceTypeDataPoint[];
}

export const ServiceTypeChart: React.FC<ServiceTypeChartProps> = ({ data }) => {
  return (
    <Card title="Service Types" extra={<CalendarOutlined />}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

