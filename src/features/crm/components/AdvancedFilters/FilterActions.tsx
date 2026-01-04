import React from 'react';
import { Space, Button, Popover, Badge } from 'antd';
import {
  FilterOutlined,
  ClearOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { ExportFormat } from '../../utils/exportUtils';
import { ExportMenu } from '../ExportMenu';
import { FilterPresetsMenu } from './FilterPresetsMenu';
import type { FilterPreset } from '../../types/filters.types';

interface FilterActionsProps {
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  activeFilterCount: number;
  presets: FilterPreset[];
  activePresetId: string | null;
  onPresetApply: (presetId: string) => void;
  onPresetSave: (name: string) => void;
  onPresetDelete: (presetId: string) => void;
  onClearFilters: () => void;
  onRefresh?: () => void;
  onExport?: (format: ExportFormat) => void;
  loading?: boolean;
  hasResults?: boolean;
}

export const FilterActions: React.FC<FilterActionsProps> = ({
  showAdvanced,
  onToggleAdvanced,
  activeFilterCount,
  presets,
  activePresetId,
  onPresetApply,
  onPresetSave,
  onPresetDelete,
  onClearFilters,
  onRefresh,
  onExport,
  loading = false,
  hasResults = false,
}) => {
  const presetMenu = (
    <FilterPresetsMenu
      presets={presets}
      activePresetId={activePresetId}
      onPresetApply={onPresetApply}
      onPresetSave={onPresetSave}
      onPresetDelete={onPresetDelete}
    />
  );

  return (
    <Space>
      <Popover content={presetMenu} trigger="click" placement="bottomLeft">
        <Button icon={<SettingOutlined />}>
          Presets
          {activePresetId && (
            <Badge count={1} style={{ marginLeft: 4 }} />
          )}
        </Button>
      </Popover>
      <Button
        icon={<FilterOutlined />}
        onClick={onToggleAdvanced}
        type={showAdvanced ? 'primary' : 'default'}
      >
        {showAdvanced ? 'Hide' : 'Advanced'}
        {activeFilterCount > 0 && (
          <Badge count={activeFilterCount} style={{ marginLeft: 4 }} />
        )}
      </Button>
      <Button icon={<ClearOutlined />} onClick={onClearFilters}>
        Clear
      </Button>
      {onRefresh && (
        <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
          Refresh
        </Button>
      )}
      {onExport && <ExportMenu onExport={onExport} disabled={!hasResults} />}
    </Space>
  );
};

