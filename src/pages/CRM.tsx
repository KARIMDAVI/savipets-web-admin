import React, { useMemo, useEffect } from 'react';
import { Typography, Tabs } from 'antd';
import { useDebounce } from '@/hooks/useDebounce';
import type { User } from '@/types';
import { useCRM, useCRMActions, useTagActions, useAdvancedFilters } from '@/features/crm/hooks';
import {
  CRMStatsCards,
  ClientSegments,
  ClientDetailDrawer,
  AddNoteModal,
  CreateSegmentModal,
  CRMErrorBoundary,
  StatsCardsSkeleton,
  SegmentCardsSkeleton,
} from '@/features/crm/components';
import {
  AnalyticsDashboardLazy,
  RevenueAnalyticsLazy,
  TaskManagerLazy,
  WorkflowManagerLazy,
  ImportModalLazy,
  TagManagementLazy,
} from '@/features/crm/utils/lazyComponents';
import { calculateCRMStats, getClientSegment } from '@/features/crm/utils/crmHelpers';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useAuth } from '@/contexts/AuthContext';
import { canCreateSegment } from '@/features/crm/utils/crmPermissions';
import { useCRMPageState } from './CRM/useCRMPageState';
import { useCRMPageHandlers } from './CRM/useCRMPageHandlers';
import { CRMHeader } from './CRM/CRMHeader';
import { ClientsTabContent } from './CRM/ClientsTabContent';

const { Title, Text } = Typography;

const CRMPage: React.FC = () => {
  const crmEnabled = useFeatureFlag('crmModuleEnabled');
  const { user } = useAuth();
  const canCreateSeg = canCreateSegment(user);
  
  const pageState = useCRMPageState();
  const {
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
  } = pageState;

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Use CRM hook for data fetching
  const {
    clients,
    bookings,
    clientNotes,
    clientSegments,
    clientTags,
    isLoading,
    refetchClients,
    refetchTags,
    setClientNotes,
    setClientSegments,
  } = useCRM();

  // Advanced filters hook
  const advancedFilters = useAdvancedFilters({
    onFiltersChange: (filters) => {
      if (filters.searchTerm !== undefined) {
        setSearchTerm(filters.searchTerm);
      }
      if (filters.segmentIds && filters.segmentIds.length > 0) {
        const segment = clientSegments.find((s) => s.id === filters.segmentIds?.[0]);
        if (segment) {
          setSelectedSegment(segment.name);
        }
      } else if (filters.segmentIds?.length === 0) {
        setSelectedSegment('all');
      }
    },
  });

  if (!crmEnabled) {
    return (
      <div>
        <Title level={2}>Customer Relationship Management</Title>
        <Text type="secondary">
          The CRM module is not enabled in this environment.
        </Text>
      </div>
    );
  }

  // Use CRM actions hook
  const { handleAddNote, handleCreateSegment } = useCRMActions({
    onNoteAdded: (note) => {
      setClientNotes((prev) => [...prev, note]);
      setNoteModalVisible(false);
      form.resetFields();
    },
    onSegmentCreated: (segment) => {
      setClientSegments((prev) => [...prev, segment]);
      setSegmentModalVisible(false);
      segmentForm.resetFields();
    },
  });

  // Use tag actions hook
  const { createTag, updateTag, deleteTag } = useTagActions();

  // Filter clients (using debounced search term)
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        (client.firstName || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (client.lastName || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (client.email || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesSegment =
        selectedSegment === 'all' ||
        getClientSegment(client.id, bookings, clientSegments, client) === selectedSegment;

      return matchesSearch && matchesSegment;
    });
  }, [clients, debouncedSearchTerm, selectedSegment, bookings, clientSegments]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedSegment, setCurrentPage]);

  // Calculate statistics
  const stats = useMemo(() => calculateCRMStats(clients, bookings, clientSegments), [clients, bookings, clientSegments]);

  // Use handlers hook
  const handlers = useCRMPageHandlers({
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
  });

  return (
    <CRMErrorBoundary>
      <div>
        <CRMHeader onImportClick={() => setImportModalVisible(true)} />

        {isLoading ? (
          <>
            <StatsCardsSkeleton />
            <SegmentCardsSkeleton />
          </>
        ) : (
          <>
            <CRMStatsCards
              totalClients={stats.totalClients}
              vipClients={stats.vipClients}
              atRiskClients={stats.atRiskClients}
              totalRevenue={stats.totalRevenue}
            />

        <ClientSegments
          segments={clientSegments}
          selectedSegment={selectedSegment}
          onSegmentSelect={handlers.handleSegmentSelect}
          onCreateSegment={canCreateSeg ? handlers.handleOpenSegmentModal : () => {}}
        />

        <TagManagementLazy
          tags={clientTags}
          onCreateTag={createTag}
          onUpdateTag={updateTag}
          onDeleteTag={deleteTag}
        />
          </>
        )}

        <Tabs
          defaultActiveKey="clients"
          items={[
            {
              key: 'clients',
              label: 'Clients',
              children: (
                <ClientsTabContent
                  useAdvancedFiltersMode={useAdvancedFiltersMode}
                  setUseAdvancedFiltersMode={setUseAdvancedFiltersMode}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedSegment={selectedSegment}
                  handleSegmentSelect={handlers.handleSegmentSelect}
                  filteredClients={filteredClients}
                  bookings={bookings}
                  clientSegments={clientSegments}
                  clientTags={clientTags}
                  isLoading={isLoading}
                  selectedClientIds={selectedClientIds}
                  setSelectedClientIds={setSelectedClientIds}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                  handleViewClient={handlers.handleViewClient}
                  handleAddNoteClick={handlers.handleAddNoteClick}
                  handleExport={handlers.handleExport}
                  handleBulkExport={handlers.handleBulkExport}
                  handleClearSelection={handlers.handleClearSelection}
                  refetchClients={refetchClients}
                  advancedFilters={advancedFilters}
                />
              ),
            },
            {
              key: 'tasks',
              label: 'Tasks',
              children: <TaskManagerLazy />,
            },
            {
              key: 'workflows',
              label: 'Workflows',
              children: <WorkflowManagerLazy />,
            },
            {
              key: 'analytics',
              label: 'Analytics Dashboard',
              children: <AnalyticsDashboardLazy />,
            },
            {
              key: 'revenue',
              label: 'Revenue Analytics',
              children: <RevenueAnalyticsLazy clients={clients} bookings={bookings} />,
            },
          ]}
        />

        <ClientDetailDrawer
          client={selectedClient}
          visible={clientDetailVisible}
          bookings={bookings}
          segments={clientSegments}
          notes={clientNotes}
          onClose={handlers.handleCloseClientDetail}
          onAddNote={handlers.handleOpenNoteModal}
        />

        <AddNoteModal
          visible={noteModalVisible}
          onCancel={handlers.handleCloseNoteModal}
          onFinish={handlers.handleAddNoteSubmit}
          form={form}
          client={selectedClient}
        />

        <CreateSegmentModal
          visible={segmentModalVisible}
          onCancel={handlers.handleCloseSegmentModal}
          onFinish={handlers.handleCreateSegmentSubmit}
          form={segmentForm}
        />

        {importModalVisible && (
          <ImportModalLazy
            visible={importModalVisible}
            onCancel={() => setImportModalVisible(false)}
            onSuccess={handlers.handleImportSuccess}
          />
        )}
      </div>
    </CRMErrorBoundary>
  );
};

export default CRMPage;
