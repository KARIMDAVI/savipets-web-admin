/**
 * Route Request Button Component
 * 
 * Button for owners to request sitter route via admin chat.
 */

import React, { useState } from 'react';
import { Button, message, Modal } from 'antd';
import { EnvironmentOutlined, LoadingOutlined } from '@ant-design/icons';
import { routeRequestService } from '@/services/routeRequest.service';
import { trackingService } from '@/services/tracking.service';
import type { Conversation } from '@/types';

interface RouteRequestButtonProps {
  conversation: Conversation | null;
  ownerId?: string;
  visitId?: string;
  sitterId?: string;
}

export const RouteRequestButton: React.FC<RouteRequestButtonProps> = ({
  conversation,
  ownerId,
  visitId,
  sitterId,
}) => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Extract owner and sitter IDs from conversation if not provided
  const resolvedOwnerId = ownerId || (conversation?.participants?.find(
    (p: any) => {
      const userId = typeof p === 'string' ? p : p?.userId;
      const role = typeof p === 'string' ? undefined : p?.role;
      return role === 'petOwner' || (!role && userId !== conversation?.participants?.[0]);
    }
  ) as any);

  const resolvedSitterId = sitterId || (conversation?.participants?.find(
    (p: any) => {
      const userId = typeof p === 'string' ? p : p?.userId;
      const role = typeof p === 'string' ? undefined : p?.role;
      return role === 'petSitter';
    }
  ) as any);

  const handleRequestRoute = async () => {
    if (!resolvedOwnerId || !resolvedSitterId || !visitId) {
      message.error('Missing required information to request route');
      return;
    }

    setLoading(true);
    try {
      await routeRequestService.createRouteRequest(
        resolvedOwnerId,
        resolvedSitterId,
        visitId
      );
      message.success('Route request sent to admin. You will be notified when approved.');
      setModalVisible(false);
    } catch (error) {
      console.error('Error requesting route:', error);
      message.error('Failed to request route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!visitId) {
      message.warning('Please select a visit to request its route');
      return;
    }
    setModalVisible(true);
  };

  return (
    <>
      <Button
        type="default"
        icon={<EnvironmentOutlined />}
        onClick={handleClick}
        loading={loading}
        size="small"
      >
        Request Route
      </Button>
      <Modal
        title="Request Sitter Route"
        open={modalVisible}
        onOk={handleRequestRoute}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
      >
        <p>
          Request to view the route taken by the sitter during this visit.
          An admin will review your request and share the route if approved.
        </p>
      </Modal>
    </>
  );
};

