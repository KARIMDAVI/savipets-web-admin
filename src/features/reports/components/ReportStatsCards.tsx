/**
 * Report Stats Cards Component
 * 
 * Displays report statistics.
 */

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  FileTextOutlined,
  ScheduleOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface ReportStatsCardsProps {
  totalTemplates: number;
  scheduledReports: number;
  totalExports: number;
  lastGenerated: Date;
}

export const ReportStatsCards: React.FC<ReportStatsCardsProps> = ({
  totalTemplates,
  scheduledReports,
  totalExports,
  lastGenerated,
}) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Report Templates"
            value={totalTemplates}
            prefix={<FileTextOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Scheduled Reports"
            value={scheduledReports}
            prefix={<ScheduleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Total Exports"
            value={totalExports}
            prefix={<DownloadOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={6}>
        <Card>
          <Statistic
            title="Last Generated"
            value={dayjs(lastGenerated).format('MMM DD')}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

