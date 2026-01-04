import React from 'react';
import { Card, Button } from 'antd';
import type { User, Booking } from '@/types';
import type { ClientNote, ClientSegment } from '@/features/crm/types/crm.types';
import { ClientsTable, ClientFilters, ClientTableSkeleton } from '@/features/crm/components';
import {
  AdvancedFiltersLazy,
  BulkActionsToolbarLazy,
} from '@/features/crm/utils/lazyComponents';

interface ClientsTabContentProps {
  useAdvancedFiltersMode: boolean;
  setUseAdvancedFiltersMode: (mode: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedSegment: string;
  handleSegmentSelect: (segment: string) => void;
  filteredClients: User[];
  bookings: Booking[];
  clientSegments: ClientSegment[];
  clientTags: any[];
  isLoading: boolean;
  selectedClientIds: string[];
  setSelectedClientIds: (ids: string[]) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  handleViewClient: (clientId: string) => void;
  handleAddNoteClick: (client: User) => void;
  handleExport: (format: any, selectedClientIds: string[]) => void;
  handleBulkExport: (clientIds: string[]) => void;
  handleClearSelection: () => void;
  refetchClients: () => void;
  advancedFilters: any;
}

export const ClientsTabContent: React.FC<ClientsTabContentProps> = ({
  useAdvancedFiltersMode,
  setUseAdvancedFiltersMode,
  searchTerm,
  setSearchTerm,
  selectedSegment,
  handleSegmentSelect,
  filteredClients,
  bookings,
  clientSegments,
  clientTags,
  isLoading,
  selectedClientIds,
  setSelectedClientIds,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  handleViewClient,
  handleAddNoteClick,
  handleExport,
  handleBulkExport,
  handleClearSelection,
  refetchClients,
  advancedFilters,
}) => {
  const rowSelection = {
    selectedRowKeys: selectedClientIds,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedClientIds(selectedKeys as string[]);
    },
    getCheckboxProps: (record: User) => ({
      name: record.id,
    }),
  };

  return (
    <>
      {useAdvancedFiltersMode ? (
        <AdvancedFiltersLazy
          filters={advancedFilters.filters}
          segments={clientSegments}
          tags={clientTags}
          presets={advancedFilters.presets}
          activePresetId={advancedFilters.activePresetId}
          loading={isLoading}
          hasResults={filteredClients.length > 0}
          onFiltersChange={advancedFilters.updateFilters}
          onPresetApply={advancedFilters.applyPreset}
          onPresetSave={advancedFilters.savePreset}
          onPresetDelete={advancedFilters.deletePreset}
          onRefresh={refetchClients}
          onExport={handleExport}
        />
      ) : (
        <>
          <ClientFilters
            searchTerm={searchTerm}
            selectedSegment={selectedSegment}
            segments={clientSegments}
            loading={isLoading}
            hasResults={filteredClients.length > 0}
            onSearchChange={setSearchTerm}
            onSegmentChange={handleSegmentSelect}
            onRefresh={refetchClients}
            onExport={handleExport}
          />
          <div style={{ marginBottom: '16px', textAlign: 'right' }}>
            <Button
              type="link"
              onClick={() => setUseAdvancedFiltersMode(true)}
            >
              Switch to Advanced Filters
            </Button>
          </div>
        </>
      )}
      {useAdvancedFiltersMode && (
        <div style={{ marginBottom: '16px', textAlign: 'right' }}>
          <Button
            type="link"
            onClick={() => setUseAdvancedFiltersMode(false)}
          >
            Switch to Basic Filters
          </Button>
        </div>
      )}

      <BulkActionsToolbarLazy
        selectedCount={selectedClientIds.length}
        selectedClientIds={selectedClientIds}
        tags={clientTags}
        segments={clientSegments}
        onBulkExport={handleBulkExport}
        onClearSelection={handleClearSelection}
      />

      {isLoading && filteredClients.length === 0 ? (
        <ClientTableSkeleton />
      ) : (
        <Card>
          <ClientsTable
            clients={filteredClients}
            bookings={bookings}
            segments={clientSegments}
            loading={isLoading}
            onViewClient={handleViewClient}
            onAddNote={handleAddNoteClick}
            rowSelection={rowSelection}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredClients.length,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} clients`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
                setSelectedClientIds([]);
              },
            }}
          />
        </Card>
      )}
    </>
  );
};


