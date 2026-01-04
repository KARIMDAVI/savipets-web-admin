import React, { useState, useMemo } from 'react';
import { Typography, Space } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { useAIAssignment, useAIAssignmentActions } from '@/features/ai-assignment/hooks';
import {
  AIControls,
  AIStatsCards,
  AIStatusAlert,
  AssignmentsTable,
  RecommendationsModal,
} from '@/features/ai-assignment/components';
import { calculateAIAssignmentStats } from '@/features/ai-assignment/utils/aiAssignmentHelpers';
import type { AISitterAssignment } from '@/features/ai-assignment/types/ai-assignment.types';
import { AIAssignmentErrorBoundary } from '@/features/ai-assignment/components';
import { spacing, typography } from '@/design/tokens';

const { Title, Text } = Typography;

const AIAssignmentPage: React.FC = () => {
  const [selectedAssignment, setSelectedAssignment] = useState<AISitterAssignment | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const {
    aiAssignments,
    sitters,
    aiEnabled,
    autoAssign,
    confidenceThreshold,
    isLoading,
    setAiEnabled,
    setAutoAssign,
    setConfidenceThreshold,
    refetchBookings,
  } = useAIAssignment();

  const {
    assignSitter,
    overrideAssignment,
  } = useAIAssignmentActions({
    onAssignSuccess: () => {
      refetchBookings();
      setDetailModalVisible(false);
    },
    onOverrideSuccess: () => {
      refetchBookings();
      setDetailModalVisible(false);
    },
  });

  const stats = useMemo(
    () => calculateAIAssignmentStats(aiAssignments),
    [aiAssignments]
  );

  const handleViewRecommendations = (assignment: AISitterAssignment) => {
    setSelectedAssignment(assignment);
    setDetailModalVisible(true);
  };

  const handleAssignSitter = async (bookingId: string, sitterId: string) => {
    try {
      await assignSitter(bookingId, sitterId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleOverrideAssignment = async (bookingId: string, sitterId: string) => {
    try {
      await overrideAssignment(bookingId, sitterId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  return (
    <AIAssignmentErrorBoundary>
      <div>
        <div style={{ marginBottom: spacing.lg }}>
          <Title level={2} style={{ marginBottom: spacing.xs }}>
            <Space>
              <RobotOutlined />
              AI Sitter Assignment
            </Space>
          </Title>
          <Text type="secondary" style={{ fontSize: typography.fontSize.sm }}>
            Intelligent sitter assignment with AI-powered recommendations
          </Text>
        </div>

        <AIControls
          aiEnabled={aiEnabled}
          autoAssign={autoAssign}
          confidenceThreshold={confidenceThreshold}
          isLoading={isLoading}
          onAIEnabledChange={setAiEnabled}
          onAutoAssignChange={setAutoAssign}
          onConfidenceThresholdChange={setConfidenceThreshold}
          onRefresh={refetchBookings}
        />

        <AIStatsCards stats={stats} />

        <AIStatusAlert aiEnabled={aiEnabled} />

        <AssignmentsTable
          assignments={aiAssignments}
          sitters={sitters}
          aiEnabled={aiEnabled}
          isLoading={isLoading}
          confidenceThreshold={confidenceThreshold}
          onViewRecommendations={handleViewRecommendations}
          onAssignSitter={handleAssignSitter}
        />

        <RecommendationsModal
          visible={detailModalVisible}
          assignment={selectedAssignment}
          onClose={() => setDetailModalVisible(false)}
          onAssign={handleAssignSitter}
          onOverride={handleOverrideAssignment}
        />
      </div>
    </AIAssignmentErrorBoundary>
  );
};

export default AIAssignmentPage;
