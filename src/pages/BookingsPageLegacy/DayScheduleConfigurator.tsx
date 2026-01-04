/**
 * Day Schedule Configurator Component
 * 
 * Component for configuring day-by-day schedules for recurring bookings.
 */

import React from 'react';
import { Row, Col, Checkbox, Select, TimePicker, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import type { DayScheduleConfig } from '@/features/bookings/types/bookings.types';

const { Option } = Select;

// Helper function to get day name
const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || 'Unknown';
};

interface DayScheduleConfiguratorProps {
  value?: DayScheduleConfig[];
  onChange?: (value: DayScheduleConfig[]) => void;
}

export const DayScheduleConfigurator: React.FC<DayScheduleConfiguratorProps> = ({ value, onChange }) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  React.useEffect(() => {
    console.log('🔍 [DEBUG] DayScheduleConfigurator value prop changed:', {
      hasValue: !!value,
      isArray: Array.isArray(value),
      length: Array.isArray(value) ? value.length : 0,
      enabledCount: Array.isArray(value) ? value.filter(d => d.enabled).length : 0,
      value: value
    });
  }, [value]);
  
  const schedules = value || [
    { dayOfWeek: 0, enabled: false, numberOfVisits: 1, visitTimes: [] },
    { dayOfWeek: 1, enabled: false, numberOfVisits: 1, visitTimes: [] },
    { dayOfWeek: 2, enabled: false, numberOfVisits: 1, visitTimes: [] },
    { dayOfWeek: 3, enabled: false, numberOfVisits: 1, visitTimes: [] },
    { dayOfWeek: 4, enabled: false, numberOfVisits: 1, visitTimes: [] },
    { dayOfWeek: 5, enabled: false, numberOfVisits: 1, visitTimes: [] },
    { dayOfWeek: 6, enabled: false, numberOfVisits: 1, visitTimes: [] },
  ];
  
  const updateSchedule = (index: number, updates: Partial<DayScheduleConfig>) => {
    const newSchedules = [...schedules];
    newSchedules[index] = { ...schedules[index], ...updates };
    console.log('🔍 [DEBUG] DayScheduleConfigurator updateSchedule:', {
      index,
      updates,
      newSchedules: newSchedules.map(s => ({
        dayOfWeek: s.dayOfWeek,
        enabled: s.enabled,
        numberOfVisits: s.numberOfVisits,
        visitTimes: s.visitTimes
      }))
    });
    onChange?.(newSchedules);
  };
  
  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: '4px', padding: '16px', background: '#fff' }}>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: '12px' }}>
        Configure each day: enable the day, set number of visits (1 or 2), and set the exact time(s) for each visit.
      </Typography.Text>
      {schedules.map((schedule: DayScheduleConfig, index: number) => (
        <div key={schedule.dayOfWeek} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: index < schedules.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
          <Row gutter={16} align="middle">
            <Col span={4}>
              <Checkbox
                checked={schedule.enabled}
                onChange={(e) => {
                  updateSchedule(index, { enabled: e.target.checked });
                  console.log('🔍 [DEBUG] Day enabled changed:', getDayName(schedule.dayOfWeek), e.target.checked);
                }}
              >
                <strong>{dayNames[schedule.dayOfWeek]}</strong>
              </Checkbox>
            </Col>
            {schedule.enabled && (
              <>
                <Col span={4}>
                  <Typography.Text>Visits:</Typography.Text>
                  <Select
                    value={schedule.numberOfVisits}
                    style={{ width: '100%', marginTop: '4px' }}
                    onChange={(visits) => {
                      const newVisitTimes = schedule.visitTimes.slice(0, visits);
                      while (newVisitTimes.length < visits) {
                        newVisitTimes.push(schedule.visitTimes[0] || '09:00');
                      }
                      updateSchedule(index, { numberOfVisits: visits, visitTimes: newVisitTimes });
                      console.log('🔍 [DEBUG] Number of visits changed:', getDayName(schedule.dayOfWeek), visits);
                    }}
                  >
                    <Option value={1}>1 Visit</Option>
                    <Option value={2}>2 Visits</Option>
                  </Select>
                </Col>
                <Col span={16}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {Array.from({ length: schedule.numberOfVisits }).map((_, visitIndex) => (
                      <Row key={visitIndex} gutter={8} align="middle">
                        <Col span={6}>
                          <Typography.Text>Visit {visitIndex + 1}:</Typography.Text>
                        </Col>
                        <Col span={18}>
                          <TimePicker
                            value={schedule.visitTimes[visitIndex] ? dayjs(schedule.visitTimes[visitIndex], 'HH:mm') : null}
                            format="h:mm A"
                            style={{ width: '100%' }}
                            onChange={(time) => {
                              const newVisitTimes = [...schedule.visitTimes];
                              newVisitTimes[visitIndex] = time ? time.format('HH:mm') : '';
                              updateSchedule(index, { visitTimes: newVisitTimes });
                              console.log('🔍 [DEBUG] Visit time changed:', getDayName(schedule.dayOfWeek), `Visit ${visitIndex + 1}`, time?.format('HH:mm'));
                            }}
                          />
                        </Col>
                      </Row>
                    ))}
                  </Space>
                </Col>
              </>
            )}
          </Row>
        </div>
      ))}
    </div>
  );
};


