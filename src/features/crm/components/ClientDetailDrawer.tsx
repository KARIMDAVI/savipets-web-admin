/**
 * Client Detail Drawer Component
 * 
 * Displays detailed information about a selected client.
 */

import React from 'react';
import { Drawer, Card, Descriptions, Row, Col, Statistic, List, Tag, Badge, Button, Space, Typography, Tabs } from 'antd';
import {
  CalendarOutlined,
  PlusOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { User, Booking } from '@/types';
import type { ClientNote, ClientSegment } from '../types/crm.types';
import { getClientStats, getClientSegment } from '../utils/crmHelpers';
import {
  buildActivitiesFromBookings,
  buildActivitiesFromNotes,
  buildActivitiesFromMessages,
  combineActivities,
} from '../utils/activityBuilder';
import { chatService } from '@/services/chat.service';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { canCreateNote, canEditNote, canDeleteNote } from '../utils/crmPermissions';
import { ClientTimeline } from './ClientTimeline';
import { QuickActions } from './QuickActions';
import { RelatedRecords } from './RelatedRecords';
import { CommunicationHistory } from './CommunicationHistory';

const { Text } = Typography;

interface ClientDetailDrawerProps {
  client: User | null;
  visible: boolean;
  bookings: Booking[]; // FIXED: Changed from any[]
  segments: ClientSegment[]; // FIXED: Changed from any[]
  notes: ClientNote[];
  onClose: () => void;
  onAddNote: () => void;
}

export const ClientDetailDrawer: React.FC<ClientDetailDrawerProps> = ({
  client,
  visible,
  bookings,
  segments,
  notes,
  onClose,
  onAddNote,
}) => {
  if (!client) return null;

  const stats = getClientStats(client.id, bookings);
  const segment = getClientSegment(client.id, bookings, segments, client); // Pass client for rating checks
  const clientNotes = notes.filter((note) => note.clientId === client.id);
  const { user } = useAuth();
  const canCreate = canCreateNote(user);

  // Fetch conversations for this client
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', client.id],
    queryFn: async () => {
      const allConversations = await chatService.getAllConversations();
      // Filter conversations involving this client
      return allConversations.filter((conv) => {
        const participantIds = conv.participants.map((p: any) =>
          typeof p === 'string' ? p : p?.userId
        );
        return participantIds.includes(client.id);
      });
    },
    enabled: !!client.id,
  });

  // Build real activities from bookings, notes, and messages
  const bookingActivities = buildActivitiesFromBookings(client.id, bookings);
  const noteActivities = buildActivitiesFromNotes(client.id, notes);
  const messageActivities = buildActivitiesFromMessages(client.id, conversations);
  const activities = combineActivities(bookingActivities, noteActivities, messageActivities);

  // RBAC checks (already defined above)
  const canEdit = (note: ClientNote) => canEditNote(user, note.createdBy);
  const canDelete = (note: ClientNote) => canDeleteNote(user, note.createdBy);

  return (
    <Drawer
      title={`Client Details: ${client.firstName} ${client.lastName}`}
      placement="right"
      onClose={onClose}
      open={visible}
      width={1000}
    >
      <Row gutter={[16, 16]}>
        {/* Left Column - Main Content */}
        <Col span={16}>
          <Card title="Client Information" style={{ marginBottom: '16px' }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Name">
                {client.firstName} {client.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {client.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {client.phoneNumber || 'Not provided'}
              </Descriptions.Item>
              <Descriptions.Item label="Segment">
                <Tag color="blue">{segment}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Member Since">
                {dayjs(client.createdAt).format('MMMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Badge status={client.isActive ? 'success' : 'error'} text={client.isActive ? 'Active' : 'Inactive'} />
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Client Statistics" style={{ marginBottom: '16px' }}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="Total Bookings"
                  value={stats.totalBookings}
                  prefix={<CalendarOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Total Spent"
                  value={stats.totalSpent}
                  prefix="$"
                  precision={2}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Avg Booking Value"
                  value={stats.avgBookingValue}
                  prefix="$"
                  precision={2}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Last Booking"
                  value={stats.lastBooking ? dayjs(stats.lastBooking).format('MMM DD') : 'Never'}
                />
              </Col>
            </Row>
          </Card>

          <Tabs
            defaultActiveKey="timeline"
            items={[
              {
                key: 'timeline',
                label: 'Activity Timeline',
                children: (
                  <ClientTimeline activities={activities} />
                ),
              },
              {
                key: 'communication',
                label: 'Communication History',
                children: (
                  <CommunicationHistory
                    conversations={conversations}
                    notes={clientNotes}
                    clientId={client.id}
                  />
                ),
              },
              {
                key: 'notes',
                label: `Notes (${clientNotes.length})`,
                children: (
                  <Card 
                    extra={
                      canCreate ? (
                        <Button
                          icon={<PlusOutlined />}
                          onClick={onAddNote}
                          size="small"
                        >
                          Add Note
                        </Button>
                      ) : null
                    }
                  >
                    <List
                      dataSource={clientNotes}
                      renderItem={(note) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<FileTextOutlined />}
                            title={
                              <Space>
                                <Text strong>
                                  {note.petName ? `${note.petName} - ` : ''}
                                  {note.type.replace('_', ' ')}
                                </Text>
                                {note.petId && (
                                  <Tag color="purple" icon={<FileTextOutlined />}>
                                    Pet-Specific
                                  </Tag>
                                )}
                                <Tag color={note.priority === 'high' ? 'red' : note.priority === 'medium' ? 'orange' : 'green'}>
                                  {note.priority}
                                </Tag>
                              </Space>
                            }
                            description={
                              <Space direction="vertical" size={0}>
                                <Text>{note.content}</Text>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  {dayjs(note.createdAt).format('MMM DD, YYYY h:mm A')}
                                </Text>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                ),
              },
            ]}
          />
        </Col>

        {/* Right Column - Sidebar */}
        <Col span={8}>
          <QuickActions
            client={client}
            onAddNote={onAddNote}
          />
          <div style={{ marginTop: '16px' }}>
            <RelatedRecords
              client={client}
              bookings={bookings}
            />
          </div>
        </Col>
      </Row>
    </Drawer>
  );
};

