/**
 * Map Container Component
 * 
 * Mapbox map container with loading state.
 */

import React from 'react';
import { Card, Spin, Button, Result } from 'antd';

export type MapStatus = 'initializing' | 'ready' | 'timeout' | 'error';

interface MapContainerProps {
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  status: MapStatus;
  onRetry: () => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  mapContainerRef,
  isLoading,
  status,
  onRetry,
}) => {
  const shouldShowSpinner = status === 'initializing' || (status === 'ready' && isLoading);
  const showTimeout = status === 'timeout';
  const showError = status === 'error';

  return (
    <Card>
      <div style={{ position: 'relative', width: '100%', minHeight: '600px' }}>
        <div
          ref={mapContainerRef}
          id="map-container"
          style={{
            height: '600px',
            width: '100%',
            borderRadius: '8px',
          }}
        />
        {shouldShowSpinner && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
            }}
          >
            <Spin size="large" />
          </div>
        )}
        {showTimeout && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.92)',
              zIndex: 1001,
              padding: '16px',
            }}
          >
            <Result
              status="warning"
              title="Map is taking longer than expected to load."
              subTitle="Tap to retry loading the map style."
              extra={
                <Button type="primary" onClick={onRetry}>
                  Tap to Retry
                </Button>
              }
            />
          </div>
        )}
        {showError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.92)',
              zIndex: 1001,
              padding: '16px',
            }}
          >
            <Result
              status="error"
              title="Something went wrong while loading the map."
              subTitle="Please try again."
              extra={
                <Button type="primary" onClick={onRetry}>
                  Retry Loading Map
                </Button>
              }
            />
          </div>
        )}
      </div>
    </Card>
  );
};

