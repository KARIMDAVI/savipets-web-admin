/**
 * Chat Schema Migration Utilities
 * 
 * These helpers normalize existing Firestore documents to the canonical
 * cross-platform schema expected by the iOS app:
 * - conversations.participants: [string]
 * - conversations.lastMessage: string
 * - conversations.lastMessageAt: Timestamp (server)
 * - messages: use `text` (string) instead of `content`
 * 
 * Usage: Import and call from an admin-only UI action. Run in small batches.
 */

import { db } from '@/config/firebase.config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  writeBatch,
  query,
  orderBy,
  serverTimestamp,
  limit as limitQuery,
} from 'firebase/firestore';

type FirestoreConversation = {
  participants?: Array<string | { userId: string }>;
  participantRoles?: string[];
  lastMessage?: string | any;
  lastMessageAt?: any;
  isPinned?: boolean;
  type?: string;
  createdAt?: any;
  updatedAt?: any;
};

type FirestoreMessage = {
  content?: string;
  text?: string;
  timestamp?: any;
  senderId?: string;
};

const conversationsRef = collection(db, 'conversations');

/**
 * Normalize participants array to [string]
 */
function normalizeParticipants(input?: Array<string | { userId: string }>): string[] {
  if (!Array.isArray(input)) return [];
  if (input.length === 0) return [];
  if (typeof input[0] === 'string') return input as string[];
  return (input as Array<{ userId: string }>).map(p => p.userId).filter(Boolean);
}

/**
 * Migrate a single conversation:
 * - Normalize participants
 * - Ensure lastMessage is string, lastMessageAt is set
 * - For messages subcollection, ensure `text` exists (copy from `content` if needed)
 * - Optionally derive lastMessage/lastMessageAt from the most recent message
 */
export async function migrateConversation(conversationId: string): Promise<{ conversationUpdated: boolean; messagesFixed: number; }> {
  const conversationDoc = doc(conversationsRef, conversationId);
  const messagesRef = collection(conversationDoc, 'messages');
  const messagesSnap = await getDocs(query(messagesRef, orderBy('timestamp', 'asc')));

  // Fix messages text field if missing; collect latest message info
  let latestMessageText = '';
  let latestMessageTimestamp: any = null;
  let messagesFixed = 0;

  const messageBatch = writeBatch(db);
  messagesSnap.forEach(d => {
    const data = d.data() as FirestoreMessage;
    const needsText = !data.text && typeof data.content === 'string';
    if (needsText) {
      messageBatch.update(d.ref, {
        text: data.content,
      });
      messagesFixed += 1;
    }
    // Track latest message
    if (data.timestamp) {
      const ts = data.timestamp?.toDate?.() || data.timestamp;
      if (!latestMessageTimestamp || (ts && ts > latestMessageTimestamp)) {
        latestMessageTimestamp = ts;
        latestMessageText = (data.text ?? data.content ?? '').toString();
      }
    }
  });
  if (messagesFixed > 0) {
    await messageBatch.commit();
  }

  // Load conversation and prepare updates
  const convSnap = await getDoc(conversationDoc);
  if (!convSnap.exists()) {
    return { conversationUpdated: false, messagesFixed };
  }
  const conv = convSnap.data() as FirestoreConversation;

  const updates: Record<string, any> = {};

  // Normalize participants shape
  const normalizedParticipants = normalizeParticipants(conv.participants);
  if (normalizedParticipants.length > 0) {
    updates.participants = normalizedParticipants;
  }

  // Ensure lastMessage is string; if object or missing, backfill from latest message
  const hasStringLastMessage = typeof conv.lastMessage === 'string';
  if (!hasStringLastMessage) {
    if (latestMessageText) {
      updates.lastMessage = latestMessageText;
    } else if (conv.lastMessage?.content) {
      updates.lastMessage = conv.lastMessage.content;
    } else if (typeof conv.lastMessage === 'object') {
      updates.lastMessage = '';
    }
  }

  // Ensure lastMessageAt exists; backfill from latest message timestamp
  if (!conv.lastMessageAt) {
    if (latestMessageTimestamp) {
      updates.lastMessageAt = latestMessageTimestamp;
    } else {
      updates.lastMessageAt = serverTimestamp();
    }
  }

  // Always refresh updatedAt to server time
  updates.updatedAt = serverTimestamp();

  const conversationUpdated = Object.keys(updates).length > 0;
  if (conversationUpdated) {
    await updateDoc(conversationDoc, updates);
  }
  return { conversationUpdated, messagesFixed };
}

/**
 * Migrate a batch of conversations. Use small limits to avoid long transactions.
 */
export async function migrateConversationsBatch(limit = 50): Promise<{ ids: string[]; conversationsUpdated: number; messagesFixed: number; }> {
  const snap = await getDocs(
    query(conversationsRef, orderBy('lastMessageAt', 'desc'), limitQuery(limit))
  );
  const ids = snap.docs.map(d => d.id);
  let conversationsUpdated = 0;
  let messagesFixed = 0;
  for (const id of ids) {
    try {
      const result = await migrateConversation(id);
      if (result?.conversationUpdated) conversationsUpdated += 1;
      if (result?.messagesFixed) messagesFixed += result.messagesFixed;
    } catch (e) {
      console.error(`Migration failed for conversation ${id}:`, e);
    }
  }
  return { ids, conversationsUpdated, messagesFixed };
}

/**
 * Idempotently backfill directMessagingAllowed for owner↔sitter conversations.
 *
 * Criteria (conservative):
 * - type in {"client-sitter","sitter-to-client"}
 * - participants resolve to strings and participantRoles include exactly one "petOwner" and one "petSitter",
 *   or explicit ownerId/sitterId fields are present
 * - Only sets directMessagingAllowed to true if it is missing or false
 *
 * Notes:
 * - Does not alter requiresApproval
 * - Batches updates safely; keep limits small
 */
export async function backfillDirectMessagingAllowed(options?: {
  limit?: number;
  dryRun?: boolean;
}): Promise<{
  scanned: number;
  eligible: number;
  updated: number;
  skipped: number;
  idsUpdated: string[];
}> {
  const limit = options?.limit ?? 100;
  const dryRun = options?.dryRun ?? true;
  const snap = await getDocs(
    query(conversationsRef, orderBy('lastMessageAt', 'desc'), limitQuery(limit))
  );
  let scanned = 0;
  let eligible = 0;
  let updated = 0;
  let skipped = 0;
  const idsUpdated: string[] = [];
  const batch = writeBatch(db);

  for (const d of snap.docs) {
    scanned += 1;
    const conv = d.data() as FirestoreConversation & {
      directMessagingAllowed?: boolean;
      ownerId?: string;
      sitterId?: string;
      requiresApproval?: boolean;
    };

    const type = conv.type ?? '';
    if (type !== 'client-sitter' && type !== 'sitter-to-client') {
      skipped += 1;
      continue;
    }

    // Already allowed
    if (conv.directMessagingAllowed === true) {
      skipped += 1;
      continue;
    }

    const participants = normalizeParticipants(conv.participants);
    const roles = Array.isArray(conv.participantRoles) ? conv.participantRoles : [];

    // Determine owner/sitter presence
    const hasOwnerRole = roles.includes('petOwner');
    const hasSitterRole = roles.includes('petSitter');
    const hasExplicitIds = typeof conv.ownerId === 'string' && typeof conv.sitterId === 'string';
    const looksOwnerSitter =
      hasExplicitIds ||
      (participants.length >= 2 && hasOwnerRole && hasSitterRole);

    if (!looksOwnerSitter) {
      // Not strictly owner-sitter pair — skip conservatively
      skipped += 1;
      continue;
    }

    eligible += 1;

    if (!dryRun) {
      batch.update(d.ref, {
        directMessagingAllowed: true,
        updatedAt: serverTimestamp(),
      });
      idsUpdated.push(d.id);
      updated += 1;
    }
  }

  if (!dryRun && updated > 0) {
    await batch.commit();
  }

  return { scanned, eligible, updated, skipped, idsUpdated };
}


