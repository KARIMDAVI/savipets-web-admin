/**
 * useAdvancedFilters Hook
 * 
 * Hook for managing advanced filter state and filter presets.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { message } from 'antd';
import type { ClientFilters, FilterPreset } from '../types/filters.types';
import { FILTER_PRESETS_STORAGE_KEY, DEFAULT_FILTER_PRESET } from '../types/filters.types';
import { useAuth } from '@/contexts/AuthContext';

interface UseAdvancedFiltersOptions {
  onFiltersChange?: (filters: ClientFilters) => void;
  initialFilters?: ClientFilters;
}

/**
 * Hook for managing advanced filters
 */
export const useAdvancedFilters = (options: UseAdvancedFiltersOptions = {}) => {
  const { onFiltersChange, initialFilters } = options;
  const { user } = useAuth();
  const [filters, setFilters] = useState<ClientFilters>(initialFilters || {});
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FILTER_PRESETS_STORAGE_KEY);
      if (stored) {
        const parsedPresets = JSON.parse(stored) as FilterPreset[];
        setPresets(parsedPresets);
      } else {
        // Initialize with default preset
        setPresets([DEFAULT_FILTER_PRESET]);
      }
    } catch (error) {
      console.error('Error loading filter presets:', error);
      setPresets([DEFAULT_FILTER_PRESET]);
    }
  }, []);

  // Update filters and notify parent
  const updateFilters = useCallback(
    (newFilters: ClientFilters) => {
      setFilters(newFilters);
      setActivePresetId(null); // Clear preset when manually changing filters
      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }
    },
    [onFiltersChange]
  );

  // Apply a filter preset
  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = presets.find((p) => p.id === presetId);
      if (preset) {
        setFilters(preset.filters);
        setActivePresetId(presetId);
        if (onFiltersChange) {
          onFiltersChange(preset.filters);
        }
        message.success(`Applied filter preset: ${preset.name}`);
      }
    },
    [presets, onFiltersChange]
  );

  // Save current filters as a preset
  const savePreset = useCallback(
    (name: string, isDefault = false) => {
      if (!user) {
        message.error('You must be logged in to save filter presets');
        return;
      }

      const newPreset: FilterPreset = {
        id: `preset-${Date.now()}`,
        name,
        filters: { ...filters },
        isDefault,
        createdBy: user.id,
        createdAt: new Date(),
      };

      const updatedPresets = [...presets, newPreset];
      setPresets(updatedPresets);

      try {
        localStorage.setItem(FILTER_PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets));
        message.success(`Filter preset "${name}" saved successfully`);
      } catch (error) {
        console.error('Error saving filter preset:', error);
        message.error('Failed to save filter preset');
      }
    },
    [filters, presets, user]
  );

  // Delete a filter preset
  const deletePreset = useCallback(
    (presetId: string) => {
      if (presetId === DEFAULT_FILTER_PRESET.id) {
        message.error('Cannot delete the default preset');
        return;
      }

      const updatedPresets = presets.filter((p) => p.id !== presetId);
      setPresets(updatedPresets);

      if (activePresetId === presetId) {
        setActivePresetId(null);
        setFilters({});
        if (onFiltersChange) {
          onFiltersChange({});
        }
      }

      try {
        localStorage.setItem(FILTER_PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets));
        message.success('Filter preset deleted');
      } catch (error) {
        console.error('Error deleting filter preset:', error);
        message.error('Failed to delete filter preset');
      }
    },
    [presets, activePresetId, onFiltersChange]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setActivePresetId(null);
    if (onFiltersChange) {
      onFiltersChange({});
    }
    message.info('Filters cleared');
  }, [onFiltersChange]);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      !!filters.searchTerm ||
      (filters.segmentIds && filters.segmentIds.length > 0) ||
      (filters.tagIds && filters.tagIds.length > 0) ||
      !!filters.dateRange ||
      !!filters.revenueRange ||
      !!filters.bookingCountRange ||
      !!filters.ratingRange ||
      filters.isActive !== undefined
    );
  }, [filters]);

  return {
    filters,
    presets,
    activePresetId,
    hasActiveFilters,
    updateFilters,
    applyPreset,
    savePreset,
    deletePreset,
    clearFilters,
  };
};

