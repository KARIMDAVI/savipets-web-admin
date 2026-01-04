/**
 * Historical Routes Page
 * 
 * Admin page for viewing historical sitter routes.
 */

import React from 'react';
import { Typography } from 'antd';
import { HistoricalRouteViewer } from '@/features/live-tracking/components/HistoricalRouteViewer';
import type { HistoricalRoute } from '@/features/live-tracking/hooks/useHistoricalRoutes';

const { Title, Text } = Typography;

const HistoricalRoutesPage: React.FC = () => {
  const handleRouteSelect = (route: HistoricalRoute) => {
    // This could open a map view or modal with the route
    console.log('Selected route:', route);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Historical Routes</Title>
        <Text type="secondary">
          View past sitter routes by sitter name, visit date, and time
        </Text>
      </div>

      <HistoricalRouteViewer onRouteSelect={handleRouteSelect} />
    </div>
  );
};

export default HistoricalRoutesPage;

