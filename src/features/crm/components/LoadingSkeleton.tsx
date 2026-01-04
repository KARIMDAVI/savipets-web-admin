/**
 * Loading Skeleton Component
 * 
 * Skeleton loading placeholders for better UX during data loading.
 */

import React from 'react';
import { Card, Skeleton, Row, Col, Table } from 'antd';

/**
 * Client Table Skeleton
 */
export const ClientTableSkeleton: React.FC = () => {
  return (
    <Card>
      <Table
        dataSource={Array.from({ length: 5 }, (_, i) => ({ key: i }))}
        pagination={false}
        columns={[
          {
            title: 'Client',
            key: 'client',
            render: () => (
              <Skeleton
                avatar={{ size: 'default', shape: 'circle' }}
                title={{ width: '60%' }}
                paragraph={{ rows: 1, width: '100%' }}
                active
              />
            ),
          },
          {
            title: 'Segment',
            key: 'segment',
            render: () => <Skeleton.Button active size="small" style={{ width: 80 }} />,
          },
          {
            title: 'Total Bookings',
            key: 'bookings',
            render: () => <Skeleton.Button active size="small" style={{ width: 40 }} />,
          },
          {
            title: 'Total Spent',
            key: 'spent',
            render: () => <Skeleton.Button active size="small" style={{ width: 80 }} />,
          },
          {
            title: 'Last Booking',
            key: 'lastBooking',
            render: () => <Skeleton.Button active size="small" style={{ width: 100 }} />,
          },
          {
            title: 'Actions',
            key: 'actions',
            render: () => <Skeleton.Button active size="small" style={{ width: 60 }} />,
          },
        ]}
      />
    </Card>
  );
};

/**
 * Stats Cards Skeleton
 */
export const StatsCardsSkeleton: React.FC = () => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      {[1, 2, 3, 4].map((i) => (
        <Col xs={24} sm={12} md={6} key={i}>
          <Card>
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

/**
 * Segment Cards Skeleton
 */
export const SegmentCardsSkeleton: React.FC = () => {
  return (
    <Card title="Client Segments" style={{ marginBottom: '24px' }}>
      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={24} sm={8} md={6} key={i}>
            <Card size="small">
              <Skeleton active paragraph={{ rows: 1 }} title={{ width: '40%' }} />
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};












