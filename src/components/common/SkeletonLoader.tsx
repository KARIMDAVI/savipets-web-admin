/**
 * Skeleton Loader Component
 * Loading placeholders for better UX
 */

import React from 'react';
import { Skeleton, Card, Row, Col } from 'antd';
import { spacing } from '@/design/tokens';

interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'list' | 'form';
  count?: number;
  rows?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  count = 1,
  rows = 2,
}) => {
  if (type === 'card') {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: count }).map((_, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card>
              <Skeleton active paragraph={{ rows }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (type === 'table') {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: rows || 8 }} />
      </Card>
    );
  }

  if (type === 'list') {
    return (
      <Card>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} active avatar paragraph={{ rows: 1 }} style={{ marginBottom: spacing.md }} />
        ))}
      </Card>
    );
  }

  if (type === 'form') {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: rows || 4 }} />
      </Card>
    );
  }

  return <Skeleton active paragraph={{ rows }} />;
};

