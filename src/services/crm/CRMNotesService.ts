import { db } from '@/config/firebase.config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
  serverTimestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import type { ClientNote } from '@/features/crm/types/crm.types';
import type {
  PaginationParams,
  PaginatedResponse,
} from '@/features/crm/types/pagination.types';
import {
  validatePaginationParams,
  createPaginatedResponse,
} from '@/features/crm/utils/paginationUtils';
import { withErrorHandling } from '@/features/crm/utils/errorHandler';
import {
  optimizeQueryLimit,
  generateCacheKey,
  queryCache,
} from '@/features/crm/utils/queryOptimizer';

/**
 * Service for CRM notes operations
 */
export class CRMNotesService {
  private readonly notesCollection = 'crm_notes';

  /**
   * Get all notes for a specific client
   */
  async getClientNotes(clientId: string): Promise<ClientNote[]> {
    return (
      (await withErrorHandling(async () => {
        const q = query(
          collection(db, this.notesCollection),
          where('clientId', '==', clientId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            clientId: data.clientId as string,
            petId: data.petId as string | undefined,
            petName: data.petName as string | undefined,
            content: data.content as string,
            type: data.type as ClientNote['type'],
            priority: data.priority as ClientNote['priority'],
            createdAt: data.createdAt?.toDate() || new Date(),
            createdBy: data.createdBy as string,
            updatedAt: data.updatedAt?.toDate(),
            isResolved: data.isResolved || false,
          } as ClientNote;
        });
      })) || []
    );
  }

  /**
   * Get all notes (optionally limited)
   * Optimized with caching and query limits
   */
  async getAllNotes(limitCount?: number): Promise<ClientNote[]> {
    return (
      (await withErrorHandling(async () => {
        const optimizedLimit = optimizeQueryLimit(limitCount);
        
        const cacheKey = generateCacheKey(this.notesCollection, { limit: optimizedLimit });
        const cached = queryCache.get<ClientNote[]>(cacheKey);
        if (cached) {
          return cached;
        }
        
        let q = query(
          collection(db, this.notesCollection),
          orderBy('createdAt', 'desc')
        );
        
        if (optimizedLimit) {
          q = query(q, limit(optimizedLimit));
        }
        
        const snapshot = await getDocs(q);
        const notes = snapshot.docs.map((doc) => this.mapNoteDocument(doc));
        
        queryCache.set(cacheKey, notes);
        return notes;
      })) || []
    );
  }

  /**
   * Create a new note
   */
  async createNote(
    noteData: Omit<ClientNote, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'resolvedBy'>
  ): Promise<ClientNote | null> {
    return withErrorHandling(async () => {
      const docRef = await addDoc(collection(db, this.notesCollection), {
        ...noteData,
        createdAt: serverTimestamp(),
        isResolved: false,
      });
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Note creation failed');
      }
      const data = docSnap.data();
      return {
        id: docSnap.id,
        clientId: noteData.clientId,
        petId: noteData.petId,
        petName: noteData.petName,
        content: noteData.content,
        type: noteData.type,
        priority: noteData.priority,
        createdAt: data.createdAt?.toDate() || new Date(),
        createdBy: noteData.createdBy,
        updatedAt: data.updatedAt?.toDate(),
        isResolved: data.isResolved || false,
      } as ClientNote;
    });
  }

  /**
   * Get a single note by ID
   */
  async getNote(noteId: string): Promise<ClientNote | null> {
    return withErrorHandling(async () => {
      const docRef = doc(db, this.notesCollection, noteId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return null;
      }
      const data = docSnap.data();
      return {
        id: docSnap.id,
        clientId: data.clientId as string,
        petId: data.petId as string | undefined,
        petName: data.petName as string | undefined,
        content: data.content as string,
        type: data.type as ClientNote['type'],
        priority: data.priority as ClientNote['priority'],
        createdAt: data.createdAt?.toDate() || new Date(),
        createdBy: data.createdBy as string,
        updatedAt: data.updatedAt?.toDate(),
        isResolved: data.isResolved || false,
      } as ClientNote;
    });
  }

  /**
   * Update an existing note
   */
  async updateNote(noteId: string, updates: Partial<ClientNote>): Promise<void> {
    await withErrorHandling(async () => {
      await updateDoc(doc(db, this.notesCollection, noteId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    });
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId: string): Promise<void> {
    await withErrorHandling(async () => {
      await deleteDoc(doc(db, this.notesCollection, noteId));
    });
  }

  /**
   * Get notes with pagination
   */
  async getNotesPaginated(
    params: PaginationParams & {
      clientId?: string;
      type?: ClientNote['type'];
      priority?: ClientNote['priority'];
      isResolved?: boolean;
    }
  ): Promise<PaginatedResponse<ClientNote>> {
    return (
      (await withErrorHandling(async () => {
        const validatedParams = validatePaginationParams(params);
        let q = query(collection(db, this.notesCollection));

        if (params.clientId) {
          q = query(q, where('clientId', '==', params.clientId));
        }
        if (params.type) {
          q = query(q, where('type', '==', params.type));
        }
        if (params.priority) {
          q = query(q, where('priority', '==', params.priority));
        }
        if (params.isResolved !== undefined) {
          q = query(q, where('isResolved', '==', params.isResolved));
        }

        const sortField = validatedParams.sortBy || 'createdAt';
        const sortOrder = validatedParams.sortOrder === 'asc' ? 'asc' : 'desc';
        q = query(q, orderBy(sortField, sortOrder));

        const countSnapshot = await getCountFromServer(q);
        const total = countSnapshot.data().count;

        q = query(q, limit(validatedParams.pageSize));
        const snapshot = await getDocs(q);
        const notes = snapshot.docs.map((doc) => this.mapNoteDocument(doc));

        return createPaginatedResponse(notes, total, validatedParams);
      })) || createPaginatedResponse([], 0, params)
    );
  }

  /**
   * Map Firestore document to ClientNote type
   */
  private mapNoteDocument(doc: QueryDocumentSnapshot<DocumentData>): ClientNote {
    const data = doc.data();
    return {
      id: doc.id,
      clientId: data.clientId as string,
      petId: data.petId as string | undefined,
      petName: data.petName as string | undefined,
      content: data.content as string,
      type: data.type as ClientNote['type'],
      priority: data.priority as ClientNote['priority'],
      createdAt: data.createdAt?.toDate() || new Date(),
      createdBy: data.createdBy as string,
      updatedAt: data.updatedAt?.toDate(),
      isResolved: data.isResolved || false,
      resolvedAt: data.resolvedAt?.toDate(),
      resolvedBy: data.resolvedBy as string | undefined,
    } as ClientNote;
  }
}

export const crmNotesService = new CRMNotesService();


