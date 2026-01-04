/**
 * Advanced Filters Component
 * 
 * Advanced filtering controls for CRM clients with multiple filter options.
 */

import React, { useState, useMemo } from 'react';
import { Card, Row, Col } from 'antd';
import type { ClientFilters, FilterPreset } from '../types/filters.types';
import type { ClientSegment, ClientTag } from '../types/crm.types';
import type { ExportFormat } from '../utils/exportUtils';
import { BasicFilterControls } from './AdvancedFilters/BasicFilterControls';
import { AdvancedFilterControls } from './AdvancedFilters/AdvancedFilterControls';
import { FilterActions } from './AdvancedFilters/FilterActions';
import { useFilterHandlers } from './AdvancedFilters/useFilterHandlers';

interface AdvancedFiltersProps {
  filters: ClientFilters;
  segments: ClientSegment[];
  tags: ClientTag[];
  presets: FilterPreset[];
  activePresetId: string | null;
  loading?: boolean;
  hasResults?: boolean;
  onFiltersChange: (filters: ClientFilters) => void;
  onPresetApply: (presetId: string) => void;
  onPresetSave: (name: string) => void;
  onPresetDelete: (presetId: string) => void;
  onRefresh?: () => void;
  onExport?: (format: ExportFormat) => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  segments,
  tags,
  presets,
  activePresetId,
  loading = false,
  hasResults = false,
  onFiltersChange,
  onPresetApply,
  onPresetSave,
  onPresetDelete,
  onRefresh,
  onExport,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    handleSearchChange,
    handleSegmentChange,
    handleTagChange,
    handleDateRangeChange,
    handleRevenueRangeChange,
    handleBookingCountRangeChange,
    handleRatingRangeChange,
    handleActiveStatusChange,
    handleClearFilters,
  } = useFilterHandlers({ filters, onFiltersChange });

  const activeFilterCount = useMemo(
    () =>
      (filters.searchTerm ? 1 : 0) +
      (filters.segmentIds?.length || 0) +
      (filters.tagIds?.length || 0) +
      (filters.dateRange ? 1 : 0) +
      (filters.revenueRange ? 1 : 0) +
      (filters.bookingCountRange ? 1 : 0) +
      (filters.ratingRange ? 1 : 0) +
      (filters.isActive !== undefined ? 1 : 0),
    [filters]
  );

  return (
    <Card style={{ marginBottom: '16px' }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={18} md={20}>
          <BasicFilterControls
            filters={filters}
            segments={segments}
            tags={tags}
            onSearchChange={handleSearchChange}
            onSegmentChange={handleSegmentChange}
            onTagChange={handleTagChange}
          />
        </Col>
        <Col xs={24} sm={6} md={4}>
          <FilterActions
            showAdvanced={showAdvanced}
            onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
            activeFilterCount={activeFilterCount}
            presets={presets}
            activePresetId={activePresetId}
            onPresetApply={onPresetApply}
            onPresetSave={onPresetSave}
            onPresetDelete={onPresetDelete}
            onClearFilters={handleClearFilters}
            onRefresh={onRefresh}
            onExport={onExport}
            loading={loading}
            hasResults={hasResults}
          />
        </Col>
      </Row>

      {showAdvanced && (
        <AdvancedFilterControls
          filters={filters}
          onDateRangeChange={handleDateRangeChange}
          onRevenueRangeChange={handleRevenueRangeChange}
          onBookingCountRangeChange={handleBookingCountRangeChange}
          onRatingRangeChange={handleRatingRangeChange}
          onActiveStatusChange={handleActiveStatusChange}
        />
      )}
    </Card>
  );
};

