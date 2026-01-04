/**
 * Compliance Reports Tab Component
 * 
 * Displays compliance reports.
 */

import React from 'react';
import { Row, Col, Card, Space, Tag, Progress, Descriptions, Badge, Button } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ComplianceReport } from '../types/audit-compliance.types';
import { getComplianceStatusColor } from '../utils/auditHelpers';

interface ComplianceReportsTabProps {
  complianceReports: ComplianceReport[];
}

export const ComplianceReportsTab: React.FC<ComplianceReportsTabProps> = ({
  complianceReports,
}) => {
  return (
    <Row gutter={[16, 16]}>
      {complianceReports.map(report => (
        <Col xs={24} sm={12} lg={8} key={report.id}>
          <Card
            title={
              <Space>
                <SafetyCertificateOutlined />
                {report.name}
              </Space>
            }
            extra={
              <Tag color={getComplianceStatusColor(report.status)}>
                {report.status.replace('_', ' ').toUpperCase()}
              </Tag>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <Progress
                  type="circle"
                  percent={report.score}
                  strokeColor={report.score >= 90 ? '#52c41a' : report.score >= 70 ? '#faad14' : '#f5222d'}
                />
              </div>
              <Descriptions size="small" column={1}>
                <Descriptions.Item label="Last Audit">
                  {dayjs(report.lastAudit).format('MMM DD, YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Next Audit">
                  {dayjs(report.nextAudit).format('MMM DD, YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Findings">
                  <Badge count={report.findings.length} showZero />
                </Descriptions.Item>
              </Descriptions>
              <Button type="primary" block>
                View Report
              </Button>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

