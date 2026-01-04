import { useState } from 'react';
import { Form } from 'antd';
import type { User } from '@/types';

/**
 * Hook for managing CRM page state
 */
export function useCRMPageState() {
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [clientDetailVisible, setClientDetailVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [segmentModalVisible, setSegmentModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [useAdvancedFiltersMode, setUseAdvancedFiltersMode] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();
  const [segmentForm] = Form.useForm();

  return {
    selectedClient,
    setSelectedClient,
    clientDetailVisible,
    setClientDetailVisible,
    noteModalVisible,
    setNoteModalVisible,
    segmentModalVisible,
    setSegmentModalVisible,
    importModalVisible,
    setImportModalVisible,
    searchTerm,
    setSearchTerm,
    selectedSegment,
    setSelectedSegment,
    useAdvancedFiltersMode,
    setUseAdvancedFiltersMode,
    selectedClientIds,
    setSelectedClientIds,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    form,
    segmentForm,
  };
}


