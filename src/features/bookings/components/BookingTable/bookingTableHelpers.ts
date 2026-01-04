/**
 * BookingTable Helper Functions
 * 
 * Utility functions for formatting and displaying booking data in tables.
 */

import { Tag, Space, Typography, Tooltip, Badge, Button, Popconfirm } from 'antd';

const { Text } = Typography;
import {
  UserOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  CrownOutlined,
  SwapOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Booking, BookingStatus, ServiceType } from '../../types/bookings.types';
import { formatCurrency } from '@/shared/utils/formatters';
import { getStatusColor, getServiceTypeDisplayName } from '../../utils/bookingHelpers';
import { EditableDateCell } from '../EditableDateCell';

const { Text: AntText } = Typography;

/**
 * Format user display name with fallback handling
 */
export const formatUserDisplayName = (
  userId: string | null | undefined,
  getUserName: (userId: string) => string,
  fallbackName?: string
): string => {
  if (!userId) return 'Unassigned';
  
  let name = getUserName(userId);
  
  if (name && name.includes('@')) {
    const emailName = name.split('@')[0];
    name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
  }
  
  if ((!name || name.includes('@') || name === 'Unassigned' || name === 'Loading...') && fallbackName) {
    if (fallbackName.includes('@')) {
      const emailName = fallbackName.split('@')[0];
      name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    } else {
      name = fallbackName;
    }
  }
  
  return name;
};

