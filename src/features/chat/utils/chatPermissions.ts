import type { Conversation } from '@/types';
import { ADMIN_INQUIRY_TYPE } from './chatType';

export type ChatSendBlockReason =
  | 'no-conversation'
  | 'inactive-conversation';

export interface ChatSendPermissionResult {
  canSend: boolean;
  reason?: ChatSendBlockReason;
}

/**
 * Evaluate whether an admin (web) is allowed to send a message
 * to the given conversation, based on conversation metadata.
 *
 * This mirrors the high-level rules used on iOS, while staying
 * conservative until we wire in more detailed flags.
 */
export function evaluateAdminSendPermission(
  conversation: Conversation | null | undefined
): ChatSendPermissionResult {
  if (!conversation) {
    return {
      canSend: false,
      reason: 'no-conversation',
    };
  }

  // Admin inquiries should always be sendable for participants
  const type = (conversation as any).type;
  if (type === ADMIN_INQUIRY_TYPE) {
    return { canSend: true };
  }

  // If the conversation is explicitly marked inactive, block sends.
  if ((conversation as any).isActive === false) {
    return {
      canSend: false,
      reason: 'inactive-conversation',
    };
  }

  // Default: allow send. We will tighten this as we add more metadata.
  return { canSend: true };
}


