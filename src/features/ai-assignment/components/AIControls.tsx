/**
 * AI Controls Component
 * 
 * Controls for AI assignment settings.
 */

import React from 'react';
import { Card, Row, Col, Space, Typography, Switch, Select } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ConfidenceThreshold } from '../types/ai-assignment.types';
import { spacing, typography } from '@/design/tokens';
import { useTheme } from '@/design/utils/useTheme';
import { CompactControlButton } from '@/components/common/CompactControlButton';

const { Text } = Typography;
const { Option } = Select;

interface AIControlsProps {
  aiEnabled: boolean;
  autoAssign: boolean;
  confidenceThreshold: ConfidenceThreshold;
  isLoading: boolean;
  onAIEnabledChange: (enabled: boolean) => void;
  onAutoAssignChange: (enabled: boolean) => void;
  onConfidenceThresholdChange: (threshold: ConfidenceThreshold) => void;
  onRefresh: () => void;
}

export const AIControls: React.FC<AIControlsProps> = ({
  aiEnabled,
  autoAssign,
  confidenceThreshold,
  isLoading,
  onAIEnabledChange,
  onAutoAssignChange,
  onConfidenceThresholdChange,
  onRefresh,
}) => {
  const { theme } = useTheme();

  return (
    <Card 
      style={{ 
        marginBottom: spacing.lg,
        padding: spacing.md,
      }}
      styles={{ body: { padding: spacing.sm } }}
    >
      <Row gutter={[16, 8]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <Space size="small" style={{ justifyContent: 'flex-start', gap: '4px' }} wrap={false}>
            <Text 
              style={{ 
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.normal,
                color: theme.colors.textSecondary,
                whiteSpace: 'nowrap',
              }}
            >
              AI Assignment:
            </Text>
            <Switch
              size="small"
              checked={aiEnabled}
              onChange={onAIEnabledChange}
              className="compact-switch"
            />
          </Space>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Space size="small" style={{ justifyContent: 'flex-start', gap: '4px' }} wrap={false}>
            <Text 
              style={{ 
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.normal,
                color: theme.colors.textSecondary,
                whiteSpace: 'nowrap',
              }}
            >
              Auto-assign:
            </Text>
            <Switch
              size="small"
              checked={autoAssign}
              onChange={onAutoAssignChange}
              disabled={!aiEnabled}
              className="compact-switch"
            />
          </Space>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Space size="small" style={{ width: '100%', justifyContent: 'flex-start' }}>
            <Text 
              style={{ 
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.normal,
                color: theme.colors.textSecondary,
                whiteSpace: 'nowrap',
              }}
            >
              Confidence Threshold:
            </Text>
            <Select
              size="small"
              value={confidenceThreshold}
              onChange={onConfidenceThresholdChange}
              style={{ 
                width: '100px',
                minWidth: '100px',
              }}
              disabled={!aiEnabled}
            >
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Space>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Space size="small" style={{ width: '100%', justifyContent: 'flex-start' }}>
            <CompactControlButton
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={isLoading}
              title="Refresh"
              aria-label="Refresh"
            />
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

