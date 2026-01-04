import { message } from 'antd';
import { db } from '@/config/firebase.config';
import { getDoc, doc } from 'firebase/firestore';
import type { AdminBookingCreate, AdminRecurringBookingCreate } from '../../types/bookings.types';
import { useBookingStore } from '../../stores/useBookingStore';

/**
 * Hook for handling booking form submission
 */
export function useBookingFormSubmission(
  form: any,
  onCreateBooking: (data: AdminBookingCreate) => void,
  onCreateRecurringBooking: (data: AdminRecurringBookingCreate) => void,
  setAvailablePets: (pets: string[]) => void,
  setPetOptionsLoading: (loading: boolean) => void,
  previousSelectedClientRef: React.MutableRefObject<string | null>
) {
  const handleFinish = async (values: any) => {
    const isRecurringBooking = values.isRecurring === 'recurring';
    
    if (isRecurringBooking) {
      const recurringData: AdminRecurringBookingCreate = {
        clientId: values.clientId,
        sitterId: values.sitterId || null,
        serviceType: values.serviceType,
        numberOfVisits: values.numberOfVisits || 5,
        frequency: values.frequency || 'weekly',
        startDate: values.scheduledDate.toDate(),
        preferredTime: values.scheduledDate.format('h:mm A'),
        preferredDays: values.preferredDays || [],
        visitsPerDay: values.visitsPerDay || 1,
        duration: values.duration,
        basePrice: values.price,
        pets: values.pets || [],
        specialInstructions: values.specialInstructions || '',
        address: values.address || null,
        paymentMethod: values.paymentMethod,
        adminNotes: values.adminNotes || '',
      };
      
      onCreateRecurringBooking(recurringData);
      
      form.resetFields();
      setAvailablePets([]);
      setPetOptionsLoading(false);
      previousSelectedClientRef.current = null;
    } else {
      try {
        const clientDoc = await getDoc(doc(db, 'users', values.clientId));
        const clientData = clientDoc.data();
        const clientName = `${clientData?.firstName || ''} ${clientData?.lastName || ''}`.trim() || 'Unknown Client';
        
        const bookingData: AdminBookingCreate = {
          clientId: values.clientId,
          clientName: clientName,
          sitterId: values.sitterId || null,
          serviceType: values.serviceType,
          scheduledDate: values.scheduledDate.toDate(),
          duration: values.duration,
          pets: values.pets || [],
          specialInstructions: values.specialInstructions || '',
          address: values.address || null,
          price: values.price,
          paymentMethod: values.paymentMethod,
          adminNotes: values.adminNotes || '',
        };
        
        onCreateBooking(bookingData);
        
        form.resetFields();
        setAvailablePets([]);
        setPetOptionsLoading(false);
        previousSelectedClientRef.current = null;
      } catch (error: any) {
        message.error(error.message || 'Failed to fetch client information');
        console.error('Error fetching client:', error);
      }
    }
  };

  return { handleFinish };
}


