/**
 * Data Normalization Utilities
 * 
 * Utilities for normalizing chat data from Firestore to UI format,
 * handling edge cases and malformed data gracefully.
 */

/**
 * Normalize participants array from Firestore to UI format.
 * Handles both string[] and { userId: string }[] formats.
 */
export function normalizeParticipants(
  rawParticipants: any
): Array<{ userId: string }> {
  if (!rawParticipants) {
    return [];
  }

  if (!Array.isArray(rawParticipants)) {
    console.warn('[DataNormalization] Participants is not an array:', rawParticipants);
    return [];
  }

  if (rawParticipants.length === 0) {
    return [];
  }

  // Handle string[] format: ["userId1", "userId2"]
  if (typeof rawParticipants[0] === 'string') {
    return (rawParticipants as string[])
      .filter((id): id is string => Boolean(id && typeof id === 'string'))
      .map((userId) => ({ userId }));
  }

  // Handle { userId: string }[] format
  if (typeof rawParticipants[0] === 'object' && rawParticipants[0] !== null) {
    return (rawParticipants as Array<{ userId?: string }>)
      .filter((p): p is { userId: string } => Boolean(p?.userId && typeof p.userId === 'string'))
      .map((p) => ({ userId: p.userId! }));
  }

  console.warn('[DataNormalization] Unknown participants format:', rawParticipants);
  return [];
}

/**
 * Safely convert Firestore timestamp to Date.
 * Handles Timestamp, Date, number, and string formats.
 */
export function normalizeTimestamp(raw: any): Date | null {
  if (!raw) {
    return null;
  }

  // Firestore Timestamp
  if (raw.toDate && typeof raw.toDate === 'function') {
    try {
      return raw.toDate();
    } catch (error) {
      console.warn('[DataNormalization] Error converting Firestore timestamp:', error);
      return null;
    }
  }

  // Already a Date
  if (raw instanceof Date) {
    return raw;
  }

  // Number (milliseconds)
  if (typeof raw === 'number') {
    const date = new Date(raw);
    if (!isNaN(date.getTime())) {
      return date;
    }
    return null;
  }

  // String
  if (typeof raw === 'string') {
    const date = new Date(raw);
    if (!isNaN(date.getTime())) {
      return date;
    }
    return null;
  }

  console.warn('[DataNormalization] Unknown timestamp format:', raw);
  return null;
}

/**
 * Safely extract message text from message data.
 * Handles both 'content' (web) and 'text' (iOS) fields.
 */
export function normalizeMessageText(messageData: any): string {
  if (typeof messageData?.content === 'string') {
    return messageData.content;
  }
  if (typeof messageData?.text === 'string') {
    return messageData.text;
  }
  return '';
}

