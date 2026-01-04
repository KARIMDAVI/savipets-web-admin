/**
 * Route Snapshots Page
 * 
 * Admin page for viewing historical route snapshots (screenshots).
 */

import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Image,
  Button,
  Space,
  Modal,
  message,
  Popconfirm,
  Statistic,
  Row,
  Col,
  DatePicker,
  Select,
  Empty,
  Typography
} from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { routeSnapshotService, RouteSnapshot } from '@/services/routeSnapshotService';
import { useSitters } from '@/features/bookings/hooks/useSitters';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const RouteSnapshots: React.FC = () => {
  const [snapshots, setSnapshots] = useState<RouteSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<RouteSnapshot | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [filters, setFilters] = useState<{
    sitterId?: string;
    dateRange: [Dayjs | null, Dayjs | null];
  }>({
    dateRange: [dayjs().subtract(30, 'days'), dayjs()]
  });
  const [stats, setStats] = useState({
    totalSnapshots: 0,
    totalDistance: 0,
    avgDistance: 0,
    last7Days: 0
  });

  const { data: sitters = [] } = useSitters();

  useEffect(() => {
    loadSnapshots();
    loadStats();
  }, [filters]);

  const loadSnapshots = async () => {
    setLoading(true);
    try {
      const data = await routeSnapshotService.getSnapshots({
        sitterId: filters.sitterId,
        startDate: filters.dateRange[0]?.toDate(),
        endDate: filters.dateRange[1]?.toDate()
      });
      setSnapshots(data);
    } catch (error) {
      console.error('Failed to load route snapshots:', error);
      message.error('Failed to load route snapshots');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await routeSnapshotService.getStats(filters.sitterId);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleView = (snapshot: RouteSnapshot) => {
    setSelectedSnapshot(snapshot);
    setPreviewVisible(true);
  };

  const handleDelete = async (snapshot: RouteSnapshot) => {
    try {
      await routeSnapshotService.deleteSnapshot(snapshot.visitId, snapshot.storagePath);
      message.success('Route snapshot deleted');
      loadSnapshots();
      loadStats();
    } catch (error) {
      console.error('Failed to delete snapshot:', error);
      message.error('Failed to delete snapshot. Admin access required.');
    }
  };

  const handleDownload = async (snapshot: RouteSnapshot) => {
    try {
      const response = await fetch(snapshot.screenshotURL);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `route_${snapshot.visitId}.jpg`;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('Download started');
    } catch (error) {
      console.error('Failed to download snapshot:', error);
      message.error('Failed to download snapshot');
    }
  };

  const getSitterName = (sitterId: string) => {
    const sitter = sitters.find(s => s.id === sitterId);
    return sitter ? `${sitter.firstName} ${sitter.lastName}` : 'Unknown Sitter';
  };

  const columns = [
    {
      title: 'Preview',
      dataIndex: 'screenshotURL',
      key: 'preview',
      width: 100,
      render: (url: string) => (
        <Image
          src={url}
          alt="Route preview"
          width={80}
          height={80}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          preview={false}
        />
      )
    },
    {
      title: 'Visit ID',
      dataIndex: 'visitId',
      key: 'visitId',
      width: 200,
      ellipsis: true
    },
    {
      title: 'Sitter',
      dataIndex: 'sitterId',
      key: 'sitterId',
      width: 150,
      render: (sitterId: string) => getSitterName(sitterId)
    },
    {
      title: 'Date',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (date: Date) => dayjs(date).format('MMM D, YYYY'),
      width: 150
    },
    {
      title: 'Time',
      dataIndex: 'startTime',
      key: 'time',
      render: (date: Date) => dayjs(date).format('h:mm A'),
      width: 100
    },
    {
      title: 'Distance',
      dataIndex: 'totalDistance',
      key: 'totalDistance',
      render: (distance: number) => `${(distance / 1000).toFixed(2)} km`,
      width: 120
    },
    {
      title: 'Duration',
      dataIndex: 'totalDuration',
      key: 'totalDuration',
      render: (duration: number) => `${Math.round(duration / 60)} min`,
      width: 120
    },
    {
      title: 'Points',
      dataIndex: 'pointCount',
      key: 'pointCount',
      width: 100
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: RouteSnapshot) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            size="small"
          >
            View
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
            size="small"
          />
          <Popconfirm
            title="Delete this route snapshot?"
            description="This action cannot be undone. Only admins can delete."
            onConfirm={() => handleDelete(record)}
            okText="Delete"
            okType="danger"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 250
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Route Snapshots</Title>
        <Text type="secondary">
          Permanent record of all completed pet care visits. Only administrators can delete snapshots.
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Snapshots" value={stats.totalSnapshots} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Distance"
              value={stats.totalDistance / 1000}
              suffix="km"
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Distance"
              value={stats.avgDistance / 1000}
              suffix="km"
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Last 7 Days" value={stats.last7Days} />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <RangePicker
            value={filters.dateRange}
            onChange={(dates) => setFilters({ ...filters, dateRange: dates || [null, null] })}
            format="YYYY-MM-DD"
          />
          <Select
            placeholder="Filter by sitter"
            style={{ width: 200 }}
            allowClear
            value={filters.sitterId}
            onChange={(value) => setFilters({ ...filters, sitterId: value })}
            options={sitters.map(sitter => ({
              label: `${sitter.firstName} ${sitter.lastName}`,
              value: sitter.id
            }))}
          />
          <Button icon={<FilterOutlined />} onClick={loadSnapshots}>
            Apply Filters
          </Button>
        </Space>
      </Card>

      {/* Snapshots Table */}
      <Card>
        {snapshots.length === 0 && !loading ? (
          <Empty description="No route snapshots found" />
        ) : (
          <Table
            columns={columns}
            dataSource={snapshots}
            rowKey="visitId"
            loading={loading}
            pagination={{ pageSize: 20 }}
          />
        )}
      </Card>

      {/* Full Preview Modal */}
      <Modal
        title={`Route Snapshot - Visit ${selectedSnapshot?.visitId}`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={900}
        footer={[
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() => selectedSnapshot && handleDownload(selectedSnapshot)}
          >
            Download
          </Button>,
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>
        ]}
      >
        {selectedSnapshot && (
          <div>
            <Image
              src={selectedSnapshot.screenshotURL}
              alt="Route snapshot"
              style={{ width: '100%' }}
            />
            <div style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <strong>Distance:</strong> {(selectedSnapshot.totalDistance / 1000).toFixed(2)} km
                </div>
                <div>
                  <strong>Duration:</strong> {Math.round(selectedSnapshot.totalDuration / 60)} minutes
                </div>
                <div>
                  <strong>Points Tracked:</strong> {selectedSnapshot.pointCount}
                </div>
                <div>
                  <strong>Start Time:</strong> {dayjs(selectedSnapshot.startTime).format('MMMM D, YYYY h:mm A')}
                </div>
                <div>
                  <strong>End Time:</strong> {dayjs(selectedSnapshot.endTime).format('MMMM D, YYYY h:mm A')}
                </div>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RouteSnapshots;

