import { useCallback } from 'react';
import { message } from 'antd';
import type { User } from '@/types';
import type { AddNoteFormValues, CreateSegmentFormValues } from '@/features/crm/types/crm.types';
import type { ExportFormat } from '@/features/crm/utils/exportUtils';
import { exportClients, exportClientsToCSV } from '@/features/crm/utils/exportUtils';
import type { Booking } from '@/types';
import type { ClientNote, ClientSegment } from '@/features/crm/types/crm.types';

interface UseCRMPageHandlersProps {
  selectedClient: User | null;
  setSelectedClient: (client: User | null) => void;
  setClientDetailVisible: (visible: boolean) => void;
  setNoteModalVisible: (visible: boolean) => void;
  setSegmentModalVisible: (visible: boolean) => void;
  setImportModalVisible: (visible: boolean) => void;
  setSelectedSegment: (segment: string) => void;
  setSelectedClientIds: (ids: string[]) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  form: any;
  segmentForm: any;
  clients: User[];
  filteredClients: User[];
  bookings: Booking[];
  clientNotes: ClientNote[];
  clientSegments: ClientSegment[];
  refetchClients: () => void;
  handleAddNote: (values: AddNoteFormValues, clientId: string) => Promise<void>;
  handleCreateSegment: (values: CreateSegmentFormValues) => Promise<void>;
  setClientNotes: React.Dispatch<React.SetStateAction<ClientNote[]>>;
  setClientSegments: React.Dispatch<React.SetStateAction<ClientSegment[]>>;
}

/**
 * Hook for CRM page event handlers
 */
export function useCRMPageHandlers({
  selectedClient,
  setSelectedClient,
  setClientDetailVisible,
  setNoteModalVisible,
  setSegmentModalVisible,
  setImportModalVisible,
  setSelectedSegment,
  setSelectedClientIds,
  setCurrentPage,
  setPageSize,
  form,
  segmentForm,
  clients,
  filteredClients,
  bookings,
  clientNotes,
  clientSegments,
  refetchClients,
  handleAddNote,
  handleCreateSegment,
  setClientNotes,
  setClientSegments,
}: UseCRMPageHandlersProps) {
  const handleViewClient = useCallback(
    async (clientId: string) => {
      try {
        const client = clients.find((c) => c.id === clientId);
        if (client) {
          setSelectedClient(client);
          setClientDetailVisible(true);
        }
      } catch (error) {
        message.error('Failed to load client details');
      }
    },
    [clients, setSelectedClient, setClientDetailVisible]
  );

  const handleAddNoteSubmit = useCallback(
    async (values: AddNoteFormValues) => {
      if (!selectedClient) return;
      await handleAddNote(values, selectedClient.id);
      setClientNotes((prev) => [...prev, {
        id: '',
        clientId: selectedClient.id,
        content: values.content,
        type: values.type,
        priority: values.priority,
        createdAt: new Date(),
        createdBy: '',
        isResolved: false,
      }]);
      setNoteModalVisible(false);
      form.resetFields();
    },
    [selectedClient, handleAddNote, setClientNotes, setNoteModalVisible, form]
  );

  const handleCreateSegmentSubmit = useCallback(
    async (values: CreateSegmentFormValues) => {
      await handleCreateSegment(values);
      setClientSegments((prev) => [...prev, {
        id: '',
        name: values.name,
        description: values.description,
        criteria: values.criteria,
        clientCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]);
      setSegmentModalVisible(false);
      segmentForm.resetFields();
    },
    [handleCreateSegment, setClientSegments, setSegmentModalVisible, segmentForm]
  );

  const handleAddNoteClick = useCallback((client: User) => {
    setSelectedClient(client);
    setNoteModalVisible(true);
  }, [setSelectedClient, setNoteModalVisible]);

  const handleCloseClientDetail = useCallback(() => {
    setClientDetailVisible(false);
  }, [setClientDetailVisible]);

  const handleCloseNoteModal = useCallback(() => {
    setNoteModalVisible(false);
    form.resetFields();
  }, [setNoteModalVisible, form]);

  const handleCloseSegmentModal = useCallback(() => {
    setSegmentModalVisible(false);
    segmentForm.resetFields();
  }, [setSegmentModalVisible, segmentForm]);

  const handleExport = useCallback(
    async (format: ExportFormat, selectedClientIds: string[]) => {
      try {
        const clientsToExport = selectedClientIds.length > 0
          ? filteredClients.filter((client) => selectedClientIds.includes(client.id))
          : filteredClients;

        await exportClients(format, clientsToExport, bookings, clientNotes);
        message.success(`Clients exported as ${format.toUpperCase()} successfully`);
      } catch (error) {
        console.error('Export error:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to export clients';
        message.error(errorMessage);
      }
    },
    [filteredClients, bookings, clientNotes]
  );

  const handleImportSuccess = useCallback(
    (importedCount: number) => {
      message.success(`Successfully imported ${importedCount} client(s)`);
      refetchClients();
      setImportModalVisible(false);
    },
    [refetchClients, setImportModalVisible]
  );

  const handleSegmentSelect = useCallback((segmentName: string) => {
    setSelectedSegment(segmentName);
  }, [setSelectedSegment]);

  const handleOpenSegmentModal = useCallback(() => {
    setSegmentModalVisible(true);
  }, [setSegmentModalVisible]);

  const handleOpenNoteModal = useCallback(() => {
    setNoteModalVisible(true);
  }, [setNoteModalVisible]);

  const handleBulkExport = useCallback(
    (clientIds: string[]) => {
      try {
        const clientsToExport = filteredClients.filter((client) =>
          clientIds.includes(client.id)
        );
        exportClientsToCSV(clientsToExport, bookings, clientNotes);
        message.success(`Exported ${clientsToExport.length} client(s)`);
      } catch (error) {
        console.error('Bulk export error:', error);
        message.error('Failed to export selected clients');
      }
    },
    [filteredClients, bookings, clientNotes]
  );

  const handleClearSelection = useCallback(() => {
    setSelectedClientIds([]);
  }, [setSelectedClientIds]);

  return {
    handleViewClient,
    handleAddNoteSubmit,
    handleCreateSegmentSubmit,
    handleAddNoteClick,
    handleCloseClientDetail,
    handleCloseNoteModal,
    handleCloseSegmentModal,
    handleExport,
    handleImportSuccess,
    handleSegmentSelect,
    handleOpenSegmentModal,
    handleOpenNoteModal,
    handleBulkExport,
    handleClearSelection,
  };
}


