/**
 * Security Score Card Component
 * 
 * Displays security score and recommendations.
 */

import React from 'react';
import { Card, Row, Col, Space, Typography, Progress } from 'antd';
import type { SecuritySettings } from '../types/security.types';

const { Text } = Typography;

interface SecurityScoreCardProps {
  settings: SecuritySettings;
  deviceCount: number;
}

export const SecurityScoreCard: React.FC<SecurityScoreCardProps> = ({
  settings,
  deviceCount,
}) => {
  const getSecurityScore = () => {
    let score = 0;
    if (settings.twoFactorEnabled) score += 30;
    if (deviceCount > 0) score += 20;
    if (settings.requireReauthForSensitive) score += 20;
    if (settings.loginNotifications) score += 15;
    if (settings.suspiciousActivityAlerts) score += 15;
    return Math.min(score, 100);
  };

  const securityScore = getSecurityScore();

  return (
    <Card style={{ marginBottom: '24px' }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12}>
          <Space direction="vertical" size="small">
            <Text strong>Security Score</Text>
            <Progress
              percent={securityScore}
              strokeColor={securityScore >= 80 ? '#52c41a' : securityScore >= 60 ? '#faad14' : '#f5222d'}
              format={() => `${securityScore}/100`}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {securityScore >= 80 ? 'Excellent' : securityScore >= 60 ? 'Good' : 'Needs Improvement'}
            </Text>
          </Space>
        </Col>
        <Col xs={24} sm={12}>
          <Space direction="vertical" size="small">
            <Text strong>Recommendations</Text>
            {!settings.twoFactorEnabled && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                • Enable two-factor authentication
              </Text>
            )}
            {deviceCount === 0 && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                • Add a security device
              </Text>
            )}
            {!settings.loginNotifications && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                • Enable login notifications
              </Text>
            )}
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

