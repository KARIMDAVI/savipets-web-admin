/**
 * Client Timeline Component
 * 
 * Enhanced timeline view for client activities with filtering and grouping.
 */

import React, { useState, useMemo } from 'react';
import { Timeline, Card, Select, Button, Space, Tag, Typography, Empty } from 'antd';
import {
  CalendarOutlined,
  FileTextOutlined,
  MessageOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ClientActivity } from '../types/crm.types';

const { Text } = Typography;
const { Option } = Select;

interface ClientTimelineProps {
  activities: ClientActivity[];
  loading?: boolean;
}

type ActivityFilter = 'all' | 'booking' | 'note' | 'message';

export const ClientTimeline: React.FC<ClientTimelineProps> = ({
  activities,
  loading = false,
}) => {
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [groupByDate, setGroupByDate] = useState(true);

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities;
    return activities.filter((activity) => activity.type === filter);
  }, [activities, filter]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    if (!groupByDate) {
      return { 'All': filteredActivities };
    }

    const groups: Record<string, ClientActivity[]> = {};
    filteredActivities.forEach((activity) => {
      const dateKey = dayjs(activity.timestamp).format('YYYY-MM-DD');
      const displayDate = dayjs(activity.timestamp).format('MMMM DD, YYYY');
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });

    // Convert to display format
    const result: Record<string, ClientActivity[]> = {};
    Object.keys(groups).sort().reverse().forEach((dateKey) => {
      const displayDate = dayjs(dateKey).format('MMMM DD, YYYY');
      result[displayDate] = groups[dateKey];
    });

    return result;
  }, [filteredActivities, groupByDate]);

  const getActivityIcon = (type: ClientActivity['type']) => {
    switch (type) {
      case 'booking':
        return <CalendarOutlined style={{ color: '#52c41a' }} />;
      case 'note':
        return <FileTextOutlined style={{ color: '#fa8c16' }} />;
      case 'message':
        return <MessageOutlined style={{ color: '#1890ff' }} />;
      default:
        return null;
    }
  };

  const getActivityColor = (type: ClientActivity['type']) => {
    switch (type) {
      case 'booking':
        return 'green';
      case 'note':
        return 'orange';
      case 'message':
        return 'blue';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return <Card loading />;
  }

  if (filteredActivities.length === 0) {
    return (
      <Card>
        <Empty description="No activities found" />
      </Card>
    );
  }

  return (
    <Card
      title="Activity Timeline"
      extra={
        <Space>
          <Select
            value={filter}
            onChange={setFilter}
            style={{ width: 120 }}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">All</Option>
            <Option value="booking">Bookings</Option>
            <Option value="note">Notes</Option>
            <Option value="message">Messages</Option>
          </Select>
          <Button
            size="small"
            onClick={() => setGroupByDate(!groupByDate)}
          >
            {groupByDate ? 'Ungroup' : 'Group by Date'}
          </Button>
        </Space>
      }
    >
      {Object.keys(groupedActivities).map((groupKey) => (
        <div key={groupKey} style={{ marginBottom: '24px' }}>
          {groupByDate && (
            <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '12px' }}>
              {groupKey}
            </Text>
          )}
          <Timeline>
            {groupedActivities[groupKey].map((activity) => (
              <Timeline.Item
                key={activity.id}
                color={getActivityColor(activity.type)}
                dot={getActivityIcon(activity.type)}
              >
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Space>
                    <Text strong style={{ textTransform: 'capitalize' }}>
                      {activity.type}
                    </Text>
                    {(() => {
                      const status = activity.metadata?.status;
                      if (status) {
                        return <Tag color="blue">{String(status)}</Tag>;
                      }
                      return null;
                    })()}
                    {(() => {
                      const priority = activity.metadata?.priority;
                      if (priority) {
                        const priorityStr = String(priority);
                        return (
                          <Tag
                            color={
                              priorityStr === 'high'
                                ? 'red'
                                : priorityStr === 'medium'
                                ? 'orange'
                                : 'green'
                            }
                          >
                            {priorityStr}
                          </Tag>
                        );
                      }
                      return null;
                    })()}
                  </Space>
                  <Text>{activity.description}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {dayjs(activity.timestamp).format('h:mm A')}
                  </Text>
                </Space>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      ))}
    </Card>
  );
};

