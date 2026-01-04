import React, { useState } from 'react';
import { Input, Button, Space, Divider } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import type { FilterPreset } from '../../types/filters.types';

interface FilterPresetsMenuProps {
  presets: FilterPreset[];
  activePresetId: string | null;
  onPresetApply: (presetId: string) => void;
  onPresetSave: (name: string) => void;
  onPresetDelete: (presetId: string) => void;
}

export const FilterPresetsMenu: React.FC<FilterPresetsMenuProps> = ({
  presets,
  activePresetId,
  onPresetApply,
  onPresetSave,
  onPresetDelete,
}) => {
  const [presetName, setPresetName] = useState('');

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onPresetSave(presetName.trim());
      setPresetName('');
    }
  };

  return (
    <div style={{ width: '250px' }}>
      {presets.map((preset) => (
        <div
          key={preset.id}
          style={{
            padding: '8px',
            cursor: 'pointer',
            backgroundColor: activePresetId === preset.id ? '#e6f7ff' : 'transparent',
            borderRadius: '4px',
            marginBottom: '4px',
          }}
          onClick={() => onPresetApply(preset.id)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{preset.name}</span>
            {preset.id !== 'default' && (
              <Button
                type="text"
                size="small"
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  onPresetDelete(preset.id);
                }}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      ))}
      <Divider style={{ margin: '8px 0' }} />
      <Space direction="vertical" style={{ width: '100%', padding: '8px' }}>
        <Input
          placeholder="Preset name"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          onPressEnter={handleSavePreset}
        />
        <Button
          type="primary"
          block
          icon={<SaveOutlined />}
          onClick={handleSavePreset}
          disabled={!presetName.trim()}
        >
          Save Current Filters
        </Button>
      </Space>
    </div>
  );
};


