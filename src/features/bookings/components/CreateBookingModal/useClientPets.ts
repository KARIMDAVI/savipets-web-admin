import { useEffect, useRef } from 'react';
import { message } from 'antd';
import type { User } from '@/types';
import { useBookingStore } from '../../stores/useBookingStore';
import { extractPetNames } from '@/shared/utils/formatters';
import { userService } from '@/services/user.service';

/**
 * Hook for managing client selection and pet loading
 */
export function useClientPets(
  selectedClientId: string | undefined,
  clients: User[],
  authLoading: boolean,
  form: any
) {
  const previousSelectedClientRef = useRef<string | null>(null);
  const availablePets = useBookingStore(state => state.availablePets);
  const setAvailablePets = useBookingStore(state => state.setAvailablePets);
  const setPetOptionsLoading = useBookingStore(state => state.setPetOptionsLoading);

  useEffect(() => {
    if (authLoading) {
      setAvailablePets([]);
      setPetOptionsLoading(false);
      previousSelectedClientRef.current = null;
      return;
    }

    if (!selectedClientId) {
      setAvailablePets([]);
      setPetOptionsLoading(false);
      previousSelectedClientRef.current = null;
      return;
    }

    if (previousSelectedClientRef.current !== selectedClientId) {
      form.setFieldsValue({ pets: [] });
      previousSelectedClientRef.current = selectedClientId;
    }

    let isActive = true;

    const loadPetsForClient = async () => {
      setPetOptionsLoading(true);
      try {
        const localClient = clients.find(client => client.id === selectedClientId);
        let petData = localClient?.pets;

        if (!petData) {
          const remoteClient = await userService.getUserById(selectedClientId);
          petData = remoteClient?.pets;
        }

        if (isActive) {
          setAvailablePets(extractPetNames(petData));
        }
      } catch (error) {
        console.error('Failed to load pets for client:', error);
        if (isActive) {
          message.error('Unable to load pets for the selected client. You can add them manually.');
          setAvailablePets([]);
        }
      } finally {
        if (isActive) {
          setPetOptionsLoading(false);
        }
      }
    };

    loadPetsForClient();

    return () => {
      isActive = false;
    };
  }, [selectedClientId, clients, form, authLoading, setAvailablePets, setPetOptionsLoading]);

  return {
    availablePets,
    previousSelectedClientRef,
  };
}


