/**
 * Tracking Actions Component
 * 
 * Action buttons for map screenshot and report generation.
 */

import React from 'react';
import { Card, Row, Col, Button } from 'antd';
import {
  CameraOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

interface TrackingActionsProps {
  hasLocations: boolean;
  onCaptureScreenshot: () => void;
  onGenerateReport: () => void;
}

export const TrackingActions: React.FC<TrackingActionsProps> = ({
  hasLocations,
  onCaptureScreenshot,
  onGenerateReport,
}) => {
  return (
    <Card style={{ marginBottom: '16px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Button
            icon={<CameraOutlined />}
            onClick={onCaptureScreenshot}
            style={{ width: '100%' }}
            disabled={!hasLocations}
          >
            Capture Map Screenshot
          </Button>
        </Col>
        <Col xs={24} sm={12}>
          <Button
            icon={<FileTextOutlined />}
            onClick={onGenerateReport}
            style={{ width: '100%' }}
            disabled={!hasLocations}
          >
            Generate Tracking Report
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

