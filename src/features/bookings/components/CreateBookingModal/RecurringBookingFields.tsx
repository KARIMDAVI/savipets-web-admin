import React from 'react';
import { Form, Select, InputNumber, Card, Row, Col } from 'antd';
import { useBookingStore } from '../../stores/useBookingStore';

const { Option } = Select;

interface RecurringBookingFieldsProps {
  form: any;
  formFrequency: string | undefined;
}

export const RecurringBookingFields: React.FC<RecurringBookingFieldsProps> = ({
  form,
  formFrequency,
}) => {
  const recurringFrequency = useBookingStore(state => state.recurringFrequency);
  const setNumberOfVisits = useBookingStore(state => state.setNumberOfVisits);
  const setRecurringFrequency = useBookingStore(state => state.setRecurringFrequency);

  const currentFreq = formFrequency || recurringFrequency || form.getFieldValue('frequency') || 'weekly';
  const isWeekly = currentFreq === 'weekly';
  const isMonthly = currentFreq === 'monthly';
  const showDaysSelector = isWeekly || isMonthly;
  const showVisitsPerDay = isWeekly || isMonthly;

  return (
    <Card style={{ marginBottom: '16px', background: '#f9f9f9' }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Number of Visits"
            name="numberOfVisits"
            rules={[{ required: true, message: 'Please enter number of visits' }]}
            initialValue={5}
          >
            <InputNumber 
              min={2} 
              max={30} 
              style={{ width: '100%' }}
              onChange={(val) => setNumberOfVisits(val || 5)}
            />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            label="Frequency"
            name="frequency"
            rules={[{ required: true, message: 'Please select frequency' }]}
            initialValue={recurringFrequency || "weekly"}
          >
            <Select 
              value={recurringFrequency || form.getFieldValue('frequency') || 'weekly'}
              onChange={(val) => {
                form.setFieldsValue({ frequency: val });
                setRecurringFrequency(val as 'daily' | 'weekly' | 'monthly');
              }}
            >
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      
      {showDaysSelector && (
        <Form.Item 
          label={isWeekly ? "Days of Week" : "Days of Month"}
          name="preferredDays"
          rules={isWeekly ? [{ required: true, message: 'Please select at least one day' }] : []}
        >
          <Select
            mode="multiple"
            placeholder={
              isWeekly 
                ? "Select days (e.g., Monday, Wednesday, Friday)"
                : "Select days of month (e.g., 1st, 15th, 30th) - Leave empty for same day each month"
            }
            style={{ width: '100%' }}
          >
            {isWeekly ? (
              <>
                <Option value={1}>Monday</Option>
                <Option value={2}>Tuesday</Option>
                <Option value={3}>Wednesday</Option>
                <Option value={4}>Thursday</Option>
                <Option value={5}>Friday</Option>
                <Option value={6}>Saturday</Option>
                <Option value={0}>Sunday</Option>
              </>
            ) : (
              Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <Option key={day} value={day}>
                  {day}{day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th'}
                </Option>
              ))
            )}
          </Select>
        </Form.Item>
      )}
      
      {showVisitsPerDay && (
        <Form.Item
          label="Visits Per Day"
          name="visitsPerDay"
          tooltip="How many visits to schedule on each selected day"
          initialValue={1}
        >
          <InputNumber 
            min={1} 
            max={5} 
            style={{ width: '100%' }}
            placeholder="1"
          />
        </Form.Item>
      )}
    </Card>
  );
};


