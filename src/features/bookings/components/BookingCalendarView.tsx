/**
 * Booking Calendar View Component
 * 
 * Displays bookings in a monthly calendar grid format.
 */

import React from 'react';
import { Table, Button, Typography, Tag, Space } from 'antd';
import dayjs from 'dayjs';
import type { Booking } from '../types/bookings.types';
import { getStatusColor, getServiceTypeDisplayName } from '../utils/bookingHelpers';

const { Title } = Typography;

interface BookingCalendarViewProps {
  bookings: Booking[];
  selectedDate: dayjs.Dayjs;
  onDateChange: (date: dayjs.Dayjs) => void;
  onViewBooking: (bookingId: string) => void;
}

export const BookingCalendarView: React.FC<BookingCalendarViewProps> = ({
  bookings,
  selectedDate,
  onDateChange,
  onViewBooking,
}) => {
  const getBookingsForDate = (date: dayjs.Dayjs) => {
    return bookings.filter(booking =>
      dayjs(booking.scheduledDate).isSame(date, 'day')
    );
  };

  const getBookingsForMonth = (date: dayjs.Dayjs) => {
    return bookings.filter(booking => {
      return dayjs(booking.scheduledDate).isSame(date, 'month');
    });
  };

  const renderCalendarMonth = () => {
    const monthBookings = getBookingsForMonth(selectedDate);
    
    // Get first day of month and days in month
    const firstDay = selectedDate.startOf('month');
    const daysInMonth = selectedDate.daysInMonth();
    const startOffset = firstDay.day(); // 0 = Sunday, 6 = Saturday

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeks: dayjs.Dayjs[][] = [];
    
    let currentWeek: dayjs.Dayjs[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startOffset; i++) {
      currentWeek.push(firstDay.subtract(startOffset - i, 'day'));
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(selectedDate.date(day));
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Add days after month ends
    if (currentWeek.length > 0) {
      const lastDay = selectedDate.endOf('month');
      const remainingDays = 7 - currentWeek.length;
      for (let i = 1; i <= remainingDays; i++) {
        currentWeek.push(lastDay.add(i, 'day'));
      }
      weeks.push(currentWeek);
    }

    return (
      <div style={{ marginTop: '24px' }}>
        {/* Month Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Button onClick={() => onDateChange(selectedDate.subtract(1, 'month'))}>
            {'<'}
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {selectedDate.format('MMMM YYYY')}
          </Title>
          <Button onClick={() => onDateChange(selectedDate.add(1, 'month'))}>
            {'>'}
          </Button>
        </div>

        {/* Calendar Grid */}
        <Table
          columns={weekDays.map(day => ({
            title: day,
            dataIndex: day.toLowerCase(),
            key: day.toLowerCase(),
            width: '14%',
            align: 'center',
          }))}
          dataSource={weeks.map((week, weekIdx) => {
            const row: any = { key: weekIdx };
            week.forEach((date, dayIdx) => {
              row[weekDays[dayIdx].toLowerCase()] = (
                <div style={{
                  minHeight: '80px',
                  padding: '4px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '4px',
                  background: date.isSame(dayjs(), 'day') ? '#f0f5ff' : '#fff',
                }}>
                  <div style={{ 
                    fontWeight: date.isSame(dayjs(), 'day') ? 'bold' : 'normal',
                    color: date.month() !== selectedDate.month() ? '#ccc' : '#333',
                    marginBottom: '4px',
                  }}>
                    {date.format('D')}
                  </div>
                  {getBookingsForDate(date).slice(0, 2).map(booking => (
                    <div
                      key={booking.id}
                      onClick={() => onViewBooking(booking.id)}
                      style={{
                        fontSize: '10px',
                        padding: '2px 4px',
                        margin: '2px 0',
                        borderRadius: '2px',
                        background: getStatusColor(booking.status),
                        color: 'white',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {dayjs(booking.scheduledDate).format('h:mm')} - {getServiceTypeDisplayName(booking.serviceType)}
                      {booking.pets && booking.pets.length > 0 && (
                        <span style={{ opacity: 0.9 }}>
                          {' '}• {booking.pets.length} pet{booking.pets.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  ))}
                  {getBookingsForDate(date).length > 2 && (
                    <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
                      +{getBookingsForDate(date).length - 2} more
                    </div>
                  )}
                </div>
              );
            });
            return row;
          })}
          pagination={false}
          showHeader={true}
        />

        {/* Legend */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Space>
            <Tag color="orange">Pending</Tag>
            <Tag color="blue">Approved</Tag>
            <Tag color="green">Active</Tag>
            <Tag color="purple">Completed</Tag>
            <Tag color="red">Cancelled/Rejected</Tag>
          </Space>
        </div>
      </div>
    );
  };

  return renderCalendarMonth();
};

