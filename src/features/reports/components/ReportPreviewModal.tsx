/**
 * Report Preview Modal Component
 * 
 * Displays generated report preview with export options.
 */

import React from 'react';
import { Modal, Row, Col, Card, Statistic, Table, Button, Space } from 'antd';
import {
  DownloadOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import type { ReportTemplate, ReportData } from '../types/reports.types';

interface ReportPreviewModalProps {
  visible: boolean;
  template: ReportTemplate | null;
  reportData: ReportData | null;
  onClose: () => void;
  onExport: (format: 'pdf' | 'csv' | 'excel') => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  visible,
  template,
  reportData,
  onClose,
  onExport,
}) => {
  if (!reportData || !template) return null;

  return (
    <Modal
      title={`Report Preview: ${template.name}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1200}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Rows"
              value={reportData.summary.totalRows}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={reportData.summary.totalRevenue}
              prefix="$"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Booking Value"
              value={reportData.summary.averageBookingValue}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Top Sitter"
              value={reportData.summary.topSitter}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Table
        columns={reportData.headers.map((header, index) => ({
          title: header,
          dataIndex: index,
          key: index,
        }))}
        dataSource={reportData.rows.map((row, index) => ({
          key: index,
          ...row.reduce((acc, cell, cellIndex) => {
            acc[cellIndex] = cell;
            return acc;
          }, {} as any),
        }))}
        pagination={false}
        scroll={{ x: 800 }}
      />

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => onExport('pdf')}
            type="primary"
          >
            Export PDF
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => onExport('csv')}
          >
            Export CSV
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => onExport('excel')}
          >
            Export Excel
          </Button>
          <Button
            icon={<MailOutlined />}
            onClick={() => message.info('Email functionality would be implemented here')}
          >
            Email Report
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

