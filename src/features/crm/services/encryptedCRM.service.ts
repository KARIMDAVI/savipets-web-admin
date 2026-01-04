/**
 * Encrypted CRM Service
 * 
 * Service wrapper that handles encryption/decryption of sensitive CRM data.
 */

import { crmService } from '@/services/crm.service';
import {
  encryptObjectFields,
  decryptObjectFields,
  maskSensitiveData,
} from '../utils/encryption';
import type { ClientNote } from '../types/crm.types';
import type { EncryptableField } from '../types/encryption.types';

/**
 * Fields that should be encrypted in notes
 */
const ENCRYPTED_NOTE_FIELDS: EncryptableField[] = ['notes'];

/**
 * Encrypted CRM Service Wrapper
 */
class EncryptedCRMService {
  /**
   * Create note with encryption
   */
  async createNote(noteData: Omit<ClientNote, 'id' | 'createdAt'>): Promise<ClientNote | null> {
    // Encrypt sensitive fields before saving
    const encryptedData = await encryptObjectFields(
      noteData as Record<string, unknown>,
      ['content'] as (keyof typeof noteData)[]
    );
    
    return crmService.createNote(encryptedData as Omit<ClientNote, 'id' | 'createdAt'>);
  }

  /**
   * Get note with decryption
   */
  async getNote(noteId: string): Promise<ClientNote | null> {
    const note = await crmService.getNote(noteId);
    if (!note) return null;
    
    // Decrypt sensitive fields
    const decrypted = await decryptObjectFields(
      note as unknown as Record<string, unknown>,
      ['content'] as (keyof ClientNote)[]
    );
    
    return decrypted as unknown as ClientNote;
  }

  /**
   * Get notes for client with decryption
   */
  async getClientNotes(clientId: string): Promise<ClientNote[]> {
    const notes = await crmService.getClientNotes(clientId);
    
    // Decrypt all notes
    const decryptedNotes = await Promise.all(
      notes.map(async (note) => {
        try {
          return await decryptObjectFields(
            note as unknown as Record<string, unknown>,
            ['content'] as (keyof ClientNote)[]
          ) as unknown as ClientNote;
        } catch (error) {
          console.error('Failed to decrypt note:', error);
          return note; // Return original if decryption fails
        }
      })
    );
    
    return decryptedNotes;
  }

  /**
   * Mask sensitive client data for display
   */
  maskClientData(client: {
    email?: string;
    phoneNumber?: string;
  }): {
    email: string;
    phoneNumber: string;
  } {
    return {
      email: client.email ? maskSensitiveData(client.email, 'email') : '',
      phoneNumber: client.phoneNumber ? maskSensitiveData(client.phoneNumber, 'phone') : '',
    };
  }
}

export const encryptedCRMService = new EncryptedCRMService();

