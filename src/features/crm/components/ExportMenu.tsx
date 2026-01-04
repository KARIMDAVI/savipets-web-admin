/**
 * Export Menu Component
 * 
 * Dropdown menu for selecting export format.
 */

import React from 'react';
import { Dropdown, Button, Space } from 'antd';
import type { MenuProps } from 'antd';
import {
  ExportOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ExportFormat } from '../utils/exportUtils';

interface ExportMenuProps {
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ onExport, disabled = false }) => {
  const items: MenuProps['items'] = [
    {
      key: 'csv',
      label: 'Export as CSV',
      icon: <FileTextOutlined />,
      onClick: () => onExport('csv'),
    },
    {
      key: 'excel',
      label: 'Export as Excel',
      icon: <FileExcelOutlined />,
      onClick: () => onExport('excel'),
    },
    {
      key: 'pdf',
      label: 'Export as PDF',
      icon: <FilePdfOutlined />,
      onClick: () => onExport('pdf'),
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} disabled={disabled}>
      <Button icon={<ExportOutlined />}>
        Export
      </Button>
    </Dropdown>
  );
};

