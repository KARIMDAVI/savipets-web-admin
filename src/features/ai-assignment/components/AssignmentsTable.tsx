/**
 * Assignments Table Component
 * 
 * Displays AI assignment recommendations table.
 */

import React, { useMemo } from 'react';
import { Card, Table, Space, Typography, Tag, Button, Tooltip, Avatar } from 'antd';
import {
  EyeOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { AISitterAssignment } from '../types/ai-assignment.types';
import { getConfidenceColor, getConfidenceIcon } from '../utils/aiAssignmentHelpers';
import type { User } from '@/types';

const { Text } = Typography;

interface AssignmentsTableProps {
  assignments: AISitterAssignment[];
  sitters: User[];
  aiEnabled: boolean;
  isLoading: boolean;
  confidenceThreshold?: 'high' | 'medium' | 'low';
  onViewRecommendations: (assignment: AISitterAssignment) => void;
  onAssignSitter: (bookingId: string, sitterId: string) => void;
}

export const AssignmentsTable: React.FC<AssignmentsTableProps> = ({
  assignments,
  sitters,
  aiEnabled,
  isLoading,
  confidenceThreshold = 'low',
  onViewRecommendations,
  onAssignSitter,
}) => {
  // Filter assignments based on confidence threshold
  const filteredAssignments = useMemo(() => {
    if (confidenceThreshold === 'low') return assignments;
    
    return assignments.filter(assignment => {
      if (assignment.recommendations.length === 0) return true; // Show assignments with no recommendations
      const topRec = assignment.recommendations[0];
      
      if (confidenceThreshold === 'high') {
        return topRec.confidence === 'high';
      } else if (confidenceThreshold === 'medium') {
        return topRec.confidence === 'high' || topRec.confidence === 'medium';
      }
      return true;
    });
  }, [assignments, confidenceThreshold]);
  
  const columns = [
    {
      title: 'Booking',
      key: 'booking',
      render: (assignment: AISitterAssignment) => (
        <Space direction="vertical" size={0}>
          <Text strong>#{assignment.booking.id.slice(-8)}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {assignment.booking.serviceType.replace('-', ' ')}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(assignment.booking.scheduledDate).format('MMM DD, h:mm A')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Top Recommendation',
      key: 'topRecommendation',
      render: (assignment: AISitterAssignment) => {
        const topRec = assignment.recommendations[0];
        if (!topRec) return <Text type="secondary">No recommendations</Text>;
        
        return (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <div>
              <Text strong>{topRec.sitter.firstName} {topRec.sitter.lastName}</Text>
              <br />
              <Space>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Score: {topRec.score}
                </Text>
                <Tag
                  color={getConfidenceColor(topRec.confidence)}
                  icon={getConfidenceIcon(topRec.confidence)}
                >
                  {topRec.confidence}
                </Tag>
              </Space>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Current Assignment',
      key: 'currentAssignment',
      render: (assignment: AISitterAssignment) => {
        if (!assignment.currentAssignment) {
          return <Text type="secondary">Unassigned</Text>;
        }
        
        const currentSitter = sitters.find(s => s.id === assignment.currentAssignment);
        if (!currentSitter) {
          return <Text type="secondary">Unknown</Text>;
        }
        
        return (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <Text>{currentSitter.firstName} {currentSitter.lastName}</Text>
          </Space>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (assignment: AISitterAssignment) => {
        const statusColor = assignment.status === 'assigned' ? 'green' : 
                           assignment.status === 'overridden' ? 'orange' : 'blue';
        return (
          <Tag color={statusColor}>
            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (assignment: AISitterAssignment) => (
        <Space>
          <Tooltip title="View AI Recommendations">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onViewRecommendations(assignment)}
            />
          </Tooltip>
          {assignment.recommendations.length > 0 && (
            <Tooltip title="Auto-assign Top Recommendation">
              <Button
                type="text"
                icon={<ThunderboltOutlined />}
                onClick={() => onAssignSitter(assignment.bookingId, assignment.recommendations[0].sitter.id)}
                disabled={!aiEnabled}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Table
        columns={columns}
        dataSource={filteredAssignments}
        loading={isLoading}
        rowKey="bookingId"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} assignments`,
        }}
        scroll={{ x: 'max-content' }} // Mobile-friendly horizontal scroll
      />
    </Card>
  );
};

