import { db, functions } from '@/config/firebase.config';
import { 
  collection, 
  query, 
  where, 
  orderBy,
  getDocs
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import type { RecurringBatch, RecurringBatchVisit } from '@/types';

/**
 * Service for handling recurring batch operations
 */
export class RecurringBatchService {
  private readonly batchCollectionName = 'recurringSeriesBatches';

  /**
   * Get all recurring batches with a specific status
   */
  async getRecurringBatches(status: string = 'scheduled'): Promise<RecurringBatch[]> {
    const batchesQuery = query(
      collection(db, this.batchCollectionName),
      where('status', '==', status),
      orderBy('scheduledFor', 'asc')
    );

    const snapshot = await getDocs(batchesQuery);
    return snapshot.docs.map(doc => this.mapBatchDoc(doc));
  }

  /**
   * Approve a recurring batch
   */
  async approveRecurringBatch(batchId: string): Promise<void> {
    const fn = httpsCallable(functions, 'approveRecurringBatch');
    await fn({ batchId });
  }

  /**
   * Reject a recurring batch with a reason
   */
  async rejectRecurringBatch(batchId: string, reason: string): Promise<void> {
    const fn = httpsCallable(functions, 'rejectRecurringBatch');
    await fn({ batchId, reason });
  }

  /**
   * Snooze a recurring batch for a specified number of days
   */
  async snoozeRecurringBatch(batchId: string, days: number): Promise<void> {
    const fn = httpsCallable(functions, 'snoozeRecurringBatch');
    await fn({ batchId, days });
  }

  /**
   * Map Firestore document to RecurringBatch type
   */
  private mapBatchDoc(doc: any): RecurringBatch {
    const data = doc.data();
    const toDate = (value?: any): Date | undefined =>
      value?.toDate ? value.toDate() : undefined;

    const visits: RecurringBatchVisit[] = Array.isArray(data.visits)
      ? data.visits.map((visit: any) => ({
          visitNumber: Number(visit.visitNumber) || 0,
          scheduledDate: visit.scheduledDate?.toDate
            ? visit.scheduledDate.toDate()
            : new Date(),
        }))
      : [];

    return {
      id: doc.id,
      seriesId: data.seriesId,
      clientId: data.clientId,
      serviceType: data.serviceType,
      batchIndex: data.batchIndex ?? 0,
      visitCount: data.visitCount ?? visits.length,
      status: data.status ?? 'scheduled',
      scheduledFor: data.scheduledFor?.toDate() ?? new Date(),
      approvalDate: toDate(data.approvalDate),
      invoiceDate: toDate(data.invoiceDate),
      invoiceDueDate: toDate(data.invoiceDueDate),
      timeZoneIdentifier: data.timeZoneIdentifier,
      visits,
    };
  }
}

export const recurringBatchService = new RecurringBatchService();


