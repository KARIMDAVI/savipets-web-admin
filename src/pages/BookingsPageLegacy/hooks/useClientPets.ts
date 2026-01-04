/**
 * Client Pets Hook
 * 
 * Hook for loading and managing pets for a selected client.
 */

import { useEffect, useRef } from 'react';
import { message } from 'antd';
import type { FormInstance } from 'antd';
import { userService } from '@/services/user.service';
import { extractPetNames } from '@/shared/utils/formatters';
import type { User } from '@/types';

interface UseClientPetsProps {
  selectedClientId: string | undefined;
  clients: User[];
  isAuthorized: boolean;
  authLoading: boolean;
  createBookingForm: FormInstance;
  setAvailablePets: (pets: string[]) => void;
  setPetOptionsLoading: (loading: boolean) => void;
}

export const useClientPets = ({
  selectedClientId,
  clients,
  isAuthorized,
  authLoading,
  createBookingForm,
  setAvailablePets,
  setPetOptionsLoading,
}: UseClientPetsProps) => {
  const previousSelectedClientRef = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading || !isAuthorized) {
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
      createBookingForm.setFieldsValue({ pets: [] });
      previousSelectedClientRef.current = selectedClientId;
    }

    let isActive = true;

    const loadPetsForClient = async () => {
      setPetOptionsLoading(true);
      try {
        const localClient = clients.find(client => client.id === selectedClientId);
        let petData = localClient?.pets;
        let petNames: string[] | undefined = undefined;

        if (localClient && (localClient as any).petNames) {
          petNames = (localClient as any).petNames;
        }

        if (!petData && !petNames) {
          const remoteClient = await userService.getUserById(selectedClientId);
          petData = remoteClient?.pets;
          
          if (remoteClient && (remoteClient as any).petNames) {
            petNames = (remoteClient as any).petNames;
          }
        }

        if (isActive) {
          if (petNames && Array.isArray(petNames) && petNames.length > 0) {
            setAvailablePets(petNames.filter(name => name && typeof name === 'string' && name.trim().length > 0));
          } else if (petData) {
            setAvailablePets(extractPetNames(petData));
          } else {
            setAvailablePets([]);
          }
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
  }, [selectedClientId, clients, createBookingForm, isAuthorized, authLoading, setAvailablePets, setPetOptionsLoading]);
};


