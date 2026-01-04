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
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import type { ClientTag } from '@/features/crm/types/crm.types';
import { withErrorHandling } from '@/features/crm/utils/errorHandler';
import {
  generateCacheKey,
  queryCache,
  deduplicateResults,
} from '@/features/crm/utils/queryOptimizer';

/**
 * Service for CRM tags operations
 */
export class CRMTagsService {
  private readonly tagsCollection = 'crm_tags';

  /**
   * Get all tags
   * Optimized with caching and query limits
   */
  async getTags(): Promise<ClientTag[]> {
    return (
      (await withErrorHandling(async () => {
        const cacheKey = generateCacheKey(this.tagsCollection);
        const cached = queryCache.get<ClientTag[]>(cacheKey);
        if (cached) {
          return cached;
        }
        
        const q = query(
          collection(db, this.tagsCollection),
          orderBy('category', 'asc'),
          orderBy('name', 'asc')
        );
        
        const snapshot = await getDocs(q);
        const tags = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name as string,
            color: data.color as string,
            category: data.category as ClientTag['category'],
          } as ClientTag;
        });
        
        const deduplicatedTags = deduplicateResults(tags);
        queryCache.set(cacheKey, deduplicatedTags);
        
        return deduplicatedTags;
      })) || []
    );
  }

  /**
   * Create a new tag
   */
  async createTag(tagData: Omit<ClientTag, 'id'>): Promise<ClientTag | null> {
    return withErrorHandling(async () => {
      if (!tagData.name || tagData.name.trim().length === 0) {
        throw new Error('Tag name is required');
      }
      if (tagData.name.length > 50) {
        throw new Error('Tag name must be 50 characters or less');
      }
      
      interface ColorPickerLike {
        toHexString?: () => string;
        toHex?: () => string;
        hex?: string;
      }
      
      let colorValue: string = typeof tagData.color === 'string' ? tagData.color : '#1890ff';
      if (typeof tagData.color !== 'string' && tagData.color && typeof tagData.color === 'object') {
        const colorObj = tagData.color as ColorPickerLike;
        if (colorObj.toHexString && typeof colorObj.toHexString === 'function') {
          colorValue = colorObj.toHexString();
        } else if (colorObj.toHex && typeof colorObj.toHex === 'function') {
          colorValue = colorObj.toHex();
        } else if (colorObj.hex && typeof colorObj.hex === 'string') {
          colorValue = colorObj.hex;
        } else {
          colorValue = '#1890ff';
        }
      }
      
      const cacheKey = generateCacheKey(this.tagsCollection);
      queryCache.invalidateKey(cacheKey);
      
      const docRef = await addDoc(collection(db, this.tagsCollection), {
        name: tagData.name.trim(),
        color: colorValue,
        category: tagData.category,
        createdAt: serverTimestamp(),
      });
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Tag creation failed');
      }
      const data = docSnap.data();
      const newTag = {
        id: docSnap.id,
        name: tagData.name.trim(),
        color: colorValue,
        category: tagData.category,
      } as ClientTag;
      
      return newTag;
    });
  }

  /**
   * Update a tag
   */
  async updateTag(tagId: string, updates: Partial<ClientTag>): Promise<void> {
    await withErrorHandling(async () => {
      await updateDoc(doc(db, this.tagsCollection, tagId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    });
  }

  /**
   * Delete a tag
   */
  async deleteTag(tagId: string): Promise<void> {
    await withErrorHandling(async () => {
      await deleteDoc(doc(db, this.tagsCollection, tagId));
    });
  }
}

export const crmTagsService = new CRMTagsService();


