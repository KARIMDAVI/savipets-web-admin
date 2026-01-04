/**
 * Email Service
 * 
 * Service for sending emails and managing email templates.
 * Note: This is a placeholder service. In production, integrate with
 * your email provider (SendGrid, AWS SES, Mailgun, etc.)
 */

import { db } from '@/config/firebase.config';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import type { EmailCommunication, EmailTemplate } from '../types/communication.types';
import { handleCRMError, withErrorHandling } from '../utils/errorHandler';

class EmailService {
  private readonly emailsCollection = 'crm_emails';
  private readonly templatesCollection = 'crm_email_templates';

  /**
   * Get all email templates
   */
  async getTemplates(): Promise<EmailTemplate[]> {
    return (
      (await withErrorHandling(async () => {
        const q = query(
          collection(db, this.templatesCollection),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name as string,
            subject: data.subject as string,
            body: data.body as string,
            variables: data.variables as string[],
            category: data.category as EmailTemplate['category'],
            createdBy: data.createdBy as string,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
          } as EmailTemplate;
        });
      })) || []
    );
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    return withErrorHandling(async () => {
      const docSnap = await getDoc(doc(db, this.templatesCollection, templateId));
      if (!docSnap.exists()) return null;
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name as string,
        subject: data.subject as string,
        body: data.body as string,
        variables: data.variables as string[],
        category: data.category as EmailTemplate['category'],
        createdBy: data.createdBy as string,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as EmailTemplate;
    });
  }

  /**
   * Create email template
   */
  async createTemplate(
    template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EmailTemplate | null> {
    return withErrorHandling(async () => {
      const docRef = await addDoc(collection(db, this.templatesCollection), {
        ...template,
        createdAt: serverTimestamp(),
      });
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...template,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as EmailTemplate;
    });
  }

  /**
   * Replace template variables with actual values
   */
  replaceTemplateVariables(
    template: EmailTemplate,
    variables: Record<string, string>
  ): { subject: string; body: string } {
    let subject = template.subject;
    let body = template.body;

    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, variables[key]);
      body = body.replace(regex, variables[key]);
    });

    return { subject, body };
  }

  /**
   * Send email
   * Note: This is a placeholder. In production, integrate with your email provider
   */
  async sendEmail(
    emailData: Omit<EmailCommunication, 'id' | 'createdAt' | 'status' | 'sentAt'>
  ): Promise<EmailCommunication | null> {
    return withErrorHandling(async () => {
      // TODO: Integrate with actual email provider (SendGrid, AWS SES, etc.)
      // For now, we'll just log it to Firestore
      
      const emailRecord: Omit<EmailCommunication, 'id'> = {
        ...emailData,
        status: 'sent', // In production, this would be set after successful send
        sentAt: new Date(),
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, this.emailsCollection), {
        ...emailRecord,
        createdAt: serverTimestamp(),
        sentAt: serverTimestamp(),
      });

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      const data = docSnap.data();

      return {
        id: docSnap.id,
        ...emailRecord,
        createdAt: data.createdAt?.toDate() || new Date(),
        sentAt: data.sentAt?.toDate(),
      } as EmailCommunication;
    });
  }

  /**
   * Get emails for a client
   */
  async getClientEmails(clientId: string): Promise<EmailCommunication[]> {
    return (
      (await withErrorHandling(async () => {
        const q = query(
          collection(db, this.emailsCollection),
          where('clientId', '==', clientId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            clientId: data.clientId as string,
            templateId: data.templateId as string | undefined,
            subject: data.subject as string,
            body: data.body as string,
            to: data.to as string,
            from: data.from as string,
            status: data.status as EmailCommunication['status'],
            sentAt: data.sentAt?.toDate(),
            deliveredAt: data.deliveredAt?.toDate(),
            readAt: data.readAt?.toDate(),
            openedCount: data.openedCount as number | undefined,
            clickedCount: data.clickedCount as number | undefined,
            error: data.error as string | undefined,
            metadata: data.metadata as Record<string, unknown> | undefined,
            createdBy: data.createdBy as string,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as EmailCommunication;
        });
      })) || []
    );
  }
}

export const emailService = new EmailService();

