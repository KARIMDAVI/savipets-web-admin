import React, { useMemo, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Typography,
  message,
  Modal,
  Input,
  InputNumber,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { RecurringBatch } from '@/types';
import { useRecurringBatches } from '../hooks';
import { bookingService } from '@/services/booking.service';

const { Title, Text } = Typography;

interface RecurringApprovalQueueProps {
  getUserName: (userId: string) => string;
}

interface RejectModalState {
  visible: boolean;
  batchId: string | null;
  reason: string;
}

interface SnoozeModalState {
  visible: boolean;
  batchId: string | null;
  days: number;
}

export const RecurringApprovalQueue: React.FC<RecurringApprovalQueueProps> = ({ getUserName }) => {
  const { data: batches = [], isLoading, refetch } = useRecurringBatches();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [processingBatchId, setProcessingBatchId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<RejectModalState>({ visible: false, batchId: null, reason: '' });
  const [snoozeModal, setSnoozeModal] = useState<SnoozeModalState>({ visible: false, batchId: null, days: 1 });
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const dataSource = useMemo(
    () =>
      batches.map((batch) => ({
        ...batch,
        key: batch.id,
      })),
    [batches]
  );

  const handleApprove = async (batchId: string) => {
    setProcessingBatchId(batchId);
    try {
      await bookingService.approveRecurringBatch(batchId);
      message.success('Batch approved and queued for processing.');
      await refetch();
    } catch (error: any) {
      console.error(error);
      message.error(error?.message || 'Failed to approve batch.');
    } finally {
      setProcessingBatchId(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRowKeys.length === 0) return;
    setBulkActionLoading(true);
    try {
      await Promise.all(selectedRowKeys.map((key) => bookingService.approveRecurringBatch(String(key))));
      message.success(`Approved ${selectedRowKeys.length} batches.`);
      setSelectedRowKeys([]);
      await refetch();
    } catch (error: any) {
      console.error(error);
      message.error(error?.message || 'Bulk approval failed.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.batchId) return;
    setProcessingBatchId(rejectModal.batchId);
    try {
      await bookingService.rejectRecurringBatch(rejectModal.batchId, rejectModal.reason || 'Rejected by admin');
      message.success('Batch rejected.');
      setRejectModal({ visible: false, batchId: null, reason: '' });
      await refetch();
    } catch (error: any) {
      console.error(error);
      message.error(error?.message || 'Failed to reject batch.');
    } finally {
      setProcessingBatchId(null);
    }
  };

  const handleSnooze = async () => {
    if (!snoozeModal.batchId) return;
    setProcessingBatchId(snoozeModal.batchId);
    try {
      await bookingService.snoozeRecurringBatch(snoozeModal.batchId, snoozeModal.days || 1);
      message.success(`Batch buffered by ${snoozeModal.days} day(s).`);
      setSnoozeModal({ visible: false, batchId: null, days: 1 });
      await refetch();
    } catch (error: any) {
      console.error(error);
      message.error(error?.message || 'Failed to insert buffer day.');
    } finally {
      setProcessingBatchId(null);
    }
  };

  const columns = [
    {
      title: 'Series',
      dataIndex: 'seriesId',
      key: 'series',
      render: (seriesId: string) => (
        <Tag color="blue">Series #{seriesId.slice(-6)}</Tag>
      ),
    },
    {
      title: 'Client',
      dataIndex: 'clientId',
      key: 'client',
      render: (clientId: string) => (
        <Space direction="vertical" size={0}>
          <Text strong>{getUserName(clientId)}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{clientId.slice(-6)}</Text>
        </Space>
      ),
    },
    {
      title: 'Week Starts',
      dataIndex: 'scheduledFor',
      key: 'week',
      render: (date: Date) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(date).format('MMM DD, YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(date).format('dddd')}</Text>
        </Space>
      ),
    },
    {
      title: 'Visits',
      dataIndex: 'visitCount',
      key: 'visits',
      render: (count: number) => <Tag color="purple">{count} visits</Tag>,
    },
    {
      title: 'Approval Locks',
      dataIndex: 'approvalDate',
      key: 'approval',
      render: (date?: Date) =>
        date ? dayjs(date).format('MMM DD, YYYY') : <Text type="secondary">TBD</Text>,
    },
    {
      title: 'Invoice Due',
      dataIndex: 'invoiceDueDate',
      key: 'invoiceDue',
      render: (date?: Date) =>
        date ? dayjs(date).format('MMM DD, YYYY') : <Text type="secondary">Pending</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: RecurringBatch['status']) => {
        let color: string = 'default';
        if (status === 'scheduled') color = 'gold';
        if (status === 'processing') color = 'blue';
        if (status === 'completed') color = 'green';
        if (status === 'rejected') color = 'red';
        if (status === 'failed') color = 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: RecurringBatch, record: RecurringBatch) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            loading={processingBatchId === record.id}
            onClick={() => handleApprove(record.id)}
          >
            Approve
          </Button>
          <Button
            size="small"
            icon={<PauseCircleOutlined />}
            onClick={() => setSnoozeModal({ visible: true, batchId: record.id, days: 1 })}
          >
            Buffer
          </Button>
          <Button
            danger
            size="small"
            icon={<StopOutlined />}
            onClick={() => setRejectModal({ visible: true, batchId: record.id, reason: '' })}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card style={{ marginBottom: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              <ClockCircleOutlined /> Recurring Approval Queue
            </Title>
            <Text type="secondary">
              Upcoming weekly batches waiting for review before billing is finalized.
            </Text>
          </div>
          <Space>
            <Button
              type="primary"
              disabled={selectedRowKeys.length === 0}
              loading={bulkActionLoading}
              onClick={handleBulkApprove}
            >
              Approve Selected
            </Button>
          </Space>
        </Space>

        <Table
          dataSource={dataSource}
          columns={columns}
          loading={isLoading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{ pageSize: 5 }}
        />
      </Space>

      <Modal
        title="Reject Batch"
        open={rejectModal.visible}
        onCancel={() => setRejectModal({ visible: false, batchId: null, reason: '' })}
        onOk={handleReject}
        confirmLoading={processingBatchId === rejectModal.batchId}
        okText="Reject Batch"
        okButtonProps={{ danger: true }}
      >
        <Text>Provide a brief reason for rejecting this approval window.</Text>
        <Input.TextArea
          rows={3}
          value={rejectModal.reason}
          onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
          placeholder="Reason for rejection"
          style={{ marginTop: 12 }}
        />
      </Modal>

      <Modal
        title="Insert Buffer Days"
        open={snoozeModal.visible}
        onCancel={() => setSnoozeModal({ visible: false, batchId: null, days: 1 })}
        onOk={handleSnooze}
        confirmLoading={processingBatchId === snoozeModal.batchId}
        okText="Apply Buffer"
      >
        <Text>How many days should we push this approval window?</Text>
        <InputNumber
          min={1}
          max={14}
          value={snoozeModal.days}
          onChange={(value) => setSnoozeModal((prev) => ({ ...prev, days: Number(value) || 1 }))}
          style={{ width: '100%', marginTop: 12 }}
        />
      </Modal>
    </Card>
  );
};

