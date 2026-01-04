/**
 * EditableDateCell Component
 * 
 * Inline editable date cell for booking scheduled dates.
 * Allows admins to edit dates directly in the table with a DatePicker.
 */

import React, { useState } from 'react';
import { Space, Typography, DatePicker, Button, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';

const { Text } = Typography;

interface EditableDateCellProps {
  date: Date;
  onSave: (newDate: Date) => Promise<void>;
  loading?: boolean;
}

export const EditableDateCell: React.FC<EditableDateCellProps> = ({
  date,
  onSave,
  loading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDate, setEditedDate] = useState<Dayjs>(dayjs(date));
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedDate(dayjs(date));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedDate(dayjs(date));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const newDate = editedDate.toDate();
      await onSave(newDate);
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the mutation in useBookingActions
      console.error('Error saving date:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setEditedDate(date);
    }
  };

  if (isEditing) {
    return (
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <DatePicker
          showTime
          format="YYYY-MM-DD h:mm A"
          value={editedDate}
          onChange={handleDateChange}
          style={{ width: '100%', minWidth: '180px' }}
          disabledDate={(current) => current && current < dayjs().startOf('day')}
          autoFocus
        />
        <Space size="small">
          <Tooltip title="Save">
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={handleSave}
              loading={saving || loading}
              disabled={!editedDate || editedDate.isSame(dayjs(date), 'minute')}
            />
          </Tooltip>
          <Tooltip title="Cancel">
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={handleCancel}
              disabled={saving || loading}
            />
          </Tooltip>
        </Space>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={0} style={{ cursor: 'pointer', width: '100%' }} onClick={handleEdit}>
      <Text>{dayjs(date).format('MMM DD, YYYY')}</Text>
      <Space size={4}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {dayjs(date).format('h:mm A')}
        </Text>
        <Tooltip title="Click to edit date">
          <EditOutlined style={{ fontSize: '12px', color: '#1890ff', marginLeft: '4px' }} />
        </Tooltip>
      </Space>
    </Space>
  );
};












