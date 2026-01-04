import { useMemo } from 'react';
import { auth } from '@/config/firebase.config';
import type { Conversation } from '@/types';
import {
  isSupportConversation,
  isOwnerSitterConversation,
} from '@/features/chat/utils/conversationFilters';
import { deduplicateByParticipantPair } from '@/features/chat/utils/conversationDeduplication';
import { USE_NEW_CHAT_FILTERS } from '@/features/chat/utils/chatFeatureFlags';

export const useConversationDeduplication = (conversations: Conversation[]) => {
  const adminUid = auth.currentUser?.uid || null;

  const dedupedConversations = useMemo<Conversation[]>(() => {
    if (!conversations || conversations.length === 0) return [];
    const byClientId = new Map<string, Conversation>();

    const getOtherParticipantId = (c: Conversation): string | null => {
      const participantIds = Array.isArray(c.participants)
        ? c.participants.map((p: any) => (typeof p === 'string' ? p : p?.userId)).filter(Boolean)
        : [];
      if (participantIds.length === 0) return null;
      if (adminUid) {
        const others = participantIds.filter(id => id !== adminUid);
        return others[0] || participantIds[0] || null;
      }
      return participantIds[0] || null;
    };

    const getSortDate = (c: Conversation): number => {
      const ts =
        (c.lastMessage as any)?.timestamp ||
        (c as any).lastMessageAt ||
        (c as any).updatedAt ||
        (c as any).createdAt;
      const d = typeof ts?.toDate === 'function' ? ts.toDate() : ts;
      const asDate = d instanceof Date ? d : (d ? new Date(d) : null);
      return asDate?.getTime?.() || 0;
    };

    for (const c of conversations) {
      const key = getOtherParticipantId(c) || c.id;
      const existing = byClientId.get(key);
      if (!existing) {
        byClientId.set(key, c);
      } else {
        if (getSortDate(c) > getSortDate(existing)) {
          byClientId.set(key, c);
        }
      }
    }

    return Array.from(byClientId.values()).sort((a, b) => {
      const da =
        ((a.lastMessage as any)?.timestamp ||
          (a as any).lastMessageAt ||
          (a as any).updatedAt ||
          (a as any).createdAt) ?? 0;
      const db =
        ((b.lastMessage as any)?.timestamp ||
          (b as any).lastMessageAt ||
          (b as any).updatedAt ||
          (b as any).createdAt) ?? 0;
      const daNum = typeof (da as any)?.toDate === 'function' ? (da as any).toDate().getTime() : (da instanceof Date ? da.getTime() : new Date(da as any).getTime());
      const dbNum = typeof (db as any)?.toDate === 'function' ? (db as any).toDate().getTime() : (db instanceof Date ? db.getTime() : new Date(db as any).getTime());
      return dbNum - daNum;
    });
  }, [conversations, adminUid]);

  const supportConversations = useMemo(
    () => conversations.filter(isSupportConversation),
    [conversations]
  );

  const ownerSitterConversations = useMemo(
    () => conversations.filter(isOwnerSitterConversation),
    [conversations]
  );

  const listConversations = useMemo<Conversation[]>(() => {
    if (!USE_NEW_CHAT_FILTERS) {
      return dedupedConversations;
    }
    
    const dedupedSupport = deduplicateByParticipantPair(
      supportConversations,
      null
    );
    
    const dedupedOwnerSitter = deduplicateByParticipantPair(
      ownerSitterConversations,
      adminUid
    );
    
    const combined = [...dedupedSupport, ...dedupedOwnerSitter];
    
    return combined.sort((a, b) => {
      const aIsSupport = isSupportConversation(a);
      const bIsSupport = isSupportConversation(b);
      
      if (aIsSupport && !bIsSupport) return -1;
      if (!aIsSupport && bIsSupport) return 1;
      
      const dateA = (a.lastMessage as any)?.timestamp ||
        (a as any).lastMessageAt ||
        (a as any).updatedAt ||
        (a as any).createdAt;
      const dateB = (b.lastMessage as any)?.timestamp ||
        (b as any).lastMessageAt ||
        (b as any).updatedAt ||
        (b as any).createdAt;
      
      const dateANum = typeof (dateA as any)?.toDate === 'function' 
        ? (dateA as any).toDate().getTime() 
        : (dateA instanceof Date ? dateA.getTime() : new Date(dateA as any).getTime());
      const dateBNum = typeof (dateB as any)?.toDate === 'function' 
        ? (dateB as any).toDate().getTime() 
        : (dateB instanceof Date ? dateB.getTime() : new Date(dateB as any).getTime());
      
      return dateBNum - dateANum;
    });
  }, [dedupedConversations, supportConversations, ownerSitterConversations, adminUid]);

  return listConversations;
};


