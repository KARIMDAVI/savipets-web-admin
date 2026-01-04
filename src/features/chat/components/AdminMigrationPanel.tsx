import React, { useState } from 'react';
import { Button, Input, Space, Typography, message } from 'antd';
import { migrateConversationsBatch, migrateConversation } from '@/services/chat.migration';

const { Text } = Typography;

interface AdminMigrationPanelProps {
  defaultBatchSize?: number;
}

/**
 * Admin-only panel to trigger chat schema migrations in small batches.
 * Place behind an admin route/guard.
 */
const AdminMigrationPanel: React.FC<AdminMigrationPanelProps> = ({ defaultBatchSize = 50 }) => {
  const [batchSize, setBatchSize] = useState<number>(defaultBatchSize);
  const [conversationId, setConversationId] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRunBatch = async () => {
    try {
      setIsRunning(true);
      const result = await migrateConversationsBatch(batchSize);
      message.success(
        `Processed: ${result.ids.length}. Updated conversations: ${result.conversationsUpdated}. Fixed messages: ${result.messagesFixed}.`
      );
    } catch (e: any) {
      message.error(e?.message || 'Batch migration failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleMigrateOne = async () => {
    if (!conversationId.trim()) {
      message.warning('Enter a conversation ID');
      return;
    }
    try {
      setIsRunning(true);
      const res = await migrateConversation(conversationId.trim());
      message.success(
        `Migrated ${conversationId.trim()}. Updated conversation: ${res.conversationUpdated ? 1 : 0}. Fixed messages: ${res.messagesFixed}.`
      );
    } catch (e: any) {
      message.error(e?.message || 'Migration failed');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ padding: 12, border: '1px solid #f0f0f0', borderRadius: 8 }}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Text strong>Chat Schema Migration (Admin)</Text>
        <Text type="secondary">
          Runs safe, small migrations to align with iOS schema. Use during low traffic.
        </Text>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            type="number"
            min={1}
            max={200}
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            placeholder="Batch size"
          />
          <Button type="primary" loading={isRunning} onClick={handleRunBatch}>
            Migrate Batch
          </Button>
        </Space.Compact>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
            placeholder="Conversation ID"
          />
          <Button loading={isRunning} onClick={handleMigrateOne}>
            Migrate One
          </Button>
        </Space.Compact>
      </Space>
    </div>
  );
};

export default AdminMigrationPanel;


