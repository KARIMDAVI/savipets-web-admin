/**
 * Activity Builder Utilities
 * 
 * Utilities to build activity timelines from bookings, notes, messages, and other sources.
 */

import type { Booking, Conversation, Message } from '@/types';
import type { ClientNote, ClientActivity } from '../types/crm.types';

/**
 * Build activities from booking data
 */
export const buildActivitiesFromBookings = (
  clientId: string,
  bookings: Booking[]
): ClientActivity[] => {
  return bookings
    .filter((b) => b.clientId === clientId)
    .map((booking) => ({
      id: `booking-${booking.id}`,
      clientId,
      type: 'booking' as const,
      description: `${booking.serviceType} - $${booking.price.toFixed(2)}`,
      timestamp: booking.scheduledDate,
      metadata: {
        bookingId: booking.id,
        status: booking.status,
        serviceType: booking.serviceType,
      },
    }))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

/**
 * Build activities from note data
 */
export const buildActivitiesFromNotes = (
  clientId: string,
  notes: ClientNote[]
): ClientActivity[] => {
  return notes
    .filter((note) => note.clientId === clientId)
    .map((note) => ({
      id: `note-${note.id}`,
      clientId,
      type: 'note' as const,
      description: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
      timestamp: note.createdAt,
      metadata: {
        noteId: note.id,
        noteType: note.type,
        priority: note.priority,
      },
    }))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

/**
 * Build activities from conversation/message data
 */
export const buildActivitiesFromMessages = (
  clientId: string,
  conversations: Conversation[],
  messages?: Message[]
): ClientActivity[] => {
  const activities: ClientActivity[] = [];

  // Find conversations involving this client
  const clientConversations = conversations.filter((conv) => {
    const participantIds = conv.participants.map((p: any) =>
      typeof p === 'string' ? p : p?.userId
    );
    return participantIds.includes(clientId);
  });

  clientConversations.forEach((conversation) => {
    // Use last message timestamp if available
    const lastMessageTimestamp = conversation.lastMessage
      ? (conversation.lastMessage as any).timestamp instanceof Date
        ? (conversation.lastMessage as any).timestamp
        : new Date((conversation.lastMessage as any).timestamp)
      : conversation.lastMessageAt || conversation.updatedAt || conversation.createdAt;

    if (lastMessageTimestamp) {
      const timestamp =
        lastMessageTimestamp instanceof Date
          ? lastMessageTimestamp
          : new Date(lastMessageTimestamp);

      activities.push({
        id: `message-${conversation.id}`,
        clientId,
        type: 'message' as const,
        description: conversation.lastMessage
          ? (conversation.lastMessage as any).content?.substring(0, 100) ||
            'New message'
          : 'Conversation started',
        timestamp,
        metadata: {
          conversationId: conversation.id,
          messageId: (conversation.lastMessage as any)?.id,
        },
      });
    }

    // If we have detailed messages, add individual message activities (limited to recent)
    if (messages && messages.length > 0) {
      const conversationMessages = messages.filter((msg: any) => {
        // Match by conversation ID if available
        return (msg as any).conversationId === conversation.id;
      });

      conversationMessages
        .slice(-5) // Only last 5 messages per conversation
        .forEach((message: any) => {
          const msgTimestamp =
            message.timestamp instanceof Date
              ? message.timestamp
              : message.timestamp?.toDate
              ? message.timestamp.toDate()
              : new Date(message.timestamp || Date.now());

          activities.push({
            id: `msg-${message.id || Date.now()}`,
            clientId,
            type: 'message' as const,
            description: message.content?.substring(0, 100) || 'Message',
            timestamp: msgTimestamp,
            metadata: {
              conversationId: conversation.id,
              messageId: message.id,
              senderId: message.senderId,
            },
          });
        });
    }
  });

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

/**
 * Combine multiple activity arrays into a single sorted timeline
 * Limits to the 50 most recent activities
 */
export const combineActivities = (
  ...activityArrays: ClientActivity[][]
): ClientActivity[] => {
  return activityArrays
    .flat()
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 50); // Limit to 50 most recent
};

