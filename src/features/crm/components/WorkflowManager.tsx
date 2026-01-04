/**
 * Workflow Manager Component
 * 
 * Main component for managing workflow automation.
 */

import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import { useWorkflows } from '../hooks/useWorkflows';
import { WorkflowList } from './WorkflowList';
import { WorkflowBuilder } from './WorkflowBuilder';
import type { WorkflowRule, WorkflowFormValues } from '../types/workflows.types';

export const WorkflowManager: React.FC = () => {
  const [workflowModalVisible, setWorkflowModalVisible] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRule | null>(null);

  const {
    workflows,
    isLoading,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflow,
  } = useWorkflows();

  const handleCreateWorkflow = async (values: WorkflowFormValues) => {
    await createWorkflow.mutateAsync(values);
    setWorkflowModalVisible(false);
    setSelectedWorkflow(null);
  };

  const handleUpdateWorkflow = async (values: WorkflowFormValues) => {
    if (!selectedWorkflow) return;
    await updateWorkflow.mutateAsync({
      workflowId: selectedWorkflow.id,
      updates: values,
    });
    setWorkflowModalVisible(false);
    setSelectedWorkflow(null);
  };

  const handleEditWorkflow = (workflow: WorkflowRule) => {
    setSelectedWorkflow(workflow);
    setWorkflowModalVisible(true);
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    await deleteWorkflow.mutateAsync(workflowId);
  };

  const handleToggleWorkflow = async (workflowId: string, enabled: boolean) => {
    await toggleWorkflow.mutateAsync({ workflowId, enabled });
  };

  const handleWorkflowFinish = async (values: WorkflowFormValues) => {
    if (selectedWorkflow) {
      await handleUpdateWorkflow(values);
    } else {
      await handleCreateWorkflow(values);
    }
  };

  const activeWorkflows = workflows.filter((w) => w.enabled);
  const inactiveWorkflows = workflows.filter((w) => !w.enabled);

  const tabItems = [
    {
      key: 'all',
      label: `All Workflows (${workflows.length})`,
      children: (
        <WorkflowList
          workflows={workflows}
          loading={isLoading}
          onEdit={handleEditWorkflow}
          onDelete={handleDeleteWorkflow}
          onToggle={handleToggleWorkflow}
          onCreate={() => {
            setSelectedWorkflow(null);
            setWorkflowModalVisible(true);
          }}
        />
      ),
    },
    {
      key: 'active',
      label: `Active (${activeWorkflows.length})`,
      children: (
        <WorkflowList
          workflows={activeWorkflows}
          loading={isLoading}
          onEdit={handleEditWorkflow}
          onDelete={handleDeleteWorkflow}
          onToggle={handleToggleWorkflow}
        />
      ),
    },
    {
      key: 'inactive',
      label: `Inactive (${inactiveWorkflows.length})`,
      children: (
        <WorkflowList
          workflows={inactiveWorkflows}
          loading={isLoading}
          onEdit={handleEditWorkflow}
          onDelete={handleDeleteWorkflow}
          onToggle={handleToggleWorkflow}
        />
      ),
    },
  ];

  return (
    <>
      <Card>
        <Tabs items={tabItems} />
      </Card>

      <WorkflowBuilder
        visible={workflowModalVisible}
        workflow={selectedWorkflow}
        onCancel={() => {
          setWorkflowModalVisible(false);
          setSelectedWorkflow(null);
        }}
        onFinish={handleWorkflowFinish}
        loading={createWorkflow.isPending || updateWorkflow.isPending}
      />
    </>
  );
};

