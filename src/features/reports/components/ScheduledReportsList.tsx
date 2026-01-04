/**
 * Scheduled Reports List Component
 * 
 * Displays list of scheduled reports.
 */

import React from 'react';
import { Card, List, Button, Space, Tag, Typography, Badge } from 'antd';
import {
  ScheduleOutlined,
  MailOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ReportSchedule } from '../types/reports.types';

const { Text } = Typography;

interface ScheduledReportsListProps {
  schedules: ReportSchedule[];
  templates: Array<{ id: string; name: string }>;
  onSchedule: () => void;
}

export const ScheduledReportsList: React.FC<ScheduledReportsListProps> = ({
  schedules,
  templates,
  onSchedule,
}) => {
  return (
    <Card
      title="Scheduled Reports"
      extra={
        <Button
          icon={<ScheduleOutlined />}
          onClick={onSchedule}
          type="primary"
          size="small"
        >
          Schedule Report
        </Button>
      }
    >
      {schedules.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Text type="secondary">No scheduled reports</Text>
        </div>
      ) : (
        <List
          dataSource={schedules}
          renderItem={(schedule) => {
            const template = templates.find(t => t.id === schedule.id);
            return (
              <List.Item>
                <List.Item.Meta
                  avatar={<ScheduleOutlined />}
                  title={
                    <Space>
                      <Text strong>{template?.name || 'Unknown Report'}</Text>
                      <Badge status={schedule.isActive ? 'success' : 'default'} />
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">
                        {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} at {schedule.time}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        <MailOutlined /> {schedule.recipients.length} recipient(s) • {schedule.format.toUpperCase()}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};

