/**
 * Moderation Settings Drawer Component
 * 
 * Drawer for managing chat moderation settings.
 */

import React from 'react';
import { Drawer, Space, Typography, Switch, InputNumber, Select } from 'antd';
import type { ChatModerationSettings } from '../types/enhanced-chat.types';

const { Text } = Typography;
const { Option } = Select;

interface ModerationSettingsDrawerProps {
  visible: boolean;
  settings: ChatModerationSettings;
  onClose: () => void;
  onSettingsChange: (settings: ChatModerationSettings) => void;
}

export const ModerationSettingsDrawer: React.FC<ModerationSettingsDrawerProps> = ({
  visible,
  settings,
  onClose,
  onSettingsChange,
}) => {
  return (
    <Drawer
      title="Moderation Settings"
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Text strong>Require Approval</Text>
          <Switch
            checked={settings.requireApproval}
            onChange={(checked) => onSettingsChange({ ...settings, requireApproval: checked })}
            style={{ marginLeft: '16px' }}
          />
        </div>
        
        <div>
          <Text strong>Auto Approve</Text>
          <Switch
            checked={settings.autoApprove}
            onChange={(checked) => onSettingsChange({ ...settings, autoApprove: checked })}
            style={{ marginLeft: '16px' }}
          />
        </div>
        
        <div>
          <Text strong>Keyword Filtering</Text>
          <Switch
            checked={settings.keywordFiltering}
            onChange={(checked) => onSettingsChange({ ...settings, keywordFiltering: checked })}
            style={{ marginLeft: '16px' }}
          />
        </div>
        
        <div>
          <Text strong>Allow Attachments</Text>
          <Switch
            checked={settings.allowAttachments}
            onChange={(checked) => onSettingsChange({ ...settings, allowAttachments: checked })}
            style={{ marginLeft: '16px' }}
          />
        </div>
        
        <div>
          <Text strong>Max Message Length</Text>
          <InputNumber
            min={100}
            max={5000}
            value={settings.maxMessageLength}
            onChange={(value) => value && onSettingsChange({ ...settings, maxMessageLength: value })}
            style={{ width: '100%', marginTop: '8px' }}
          />
        </div>
        
        <div>
          <Text strong>Max Attachment Size (MB)</Text>
          <InputNumber
            min={1}
            max={100}
            value={settings.maxAttachmentSize}
            onChange={(value) => value && onSettingsChange({ ...settings, maxAttachmentSize: value })}
            style={{ width: '100%', marginTop: '8px' }}
          />
        </div>
        
        <div>
          <Text strong>Banned Words</Text>
          <Select
            mode="tags"
            style={{ width: '100%', marginTop: '8px' }}
            placeholder="Add banned words"
            value={settings.bannedWords}
            onChange={(value) => onSettingsChange({ ...settings, bannedWords: value })}
          />
        </div>
      </Space>
    </Drawer>
  );
};

