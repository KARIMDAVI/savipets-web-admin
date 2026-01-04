import React, { useState } from 'react';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
  Typography
} from 'antd';
import type { User } from '@/types';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export interface CreateUserFormProps {
  onCancel: () => void;
  onSave: (userData: Partial<User>) => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onCancel, onSave }) => {
  const [form] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const userData: Partial<User> & Record<string, unknown> = {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        role: values.role,
        phoneNumber: values.phoneNumber,
        isActive: values.isActive !== undefined ? values.isActive : true
      };

      if (selectedRole === 'petOwner') {
        if (values.addressStreet) {
          userData.address = {
            street: values.addressStreet,
            addressLine2: values.addressLine2 || '',
            city: values.city,
            state: values.state,
            zipCode: values.zipCode,
            country: values.country || 'USA'
          };
        }

        if (values.paymentMethod) {
          userData.paymentMethodPreference = values.paymentMethod;
        }

        if (values.emergencyContactName) {
          userData.emergencyContact = {
            name: values.emergencyContactName,
            relationship: values.emergencyContactRelationship,
            phoneNumber: values.emergencyContactPhone,
            alternatePhone: values.emergencyContactAltPhone
          };
        }
      }

      if (selectedRole === 'petSitter') {
        if (values.petFirstAidCertified !== undefined) {
          userData.petFirstAidCertified = values.petFirstAidCertified;
        }

        if (values.bio) {
          userData.bio = values.bio;
        }

        if (values.sitterAddress) {
          userData.address = {
            street: values.sitterAddress,
            city: values.sitterCity,
            state: values.sitterState,
            zipCode: values.sitterZipCode,
            country: values.sitterCountry || 'USA'
          };
        }
      }

      onSave(userData);
    } catch (error) {
      // validation errors already surfaced by antd form rules
    }
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setShowAdditionalFields(false);
    form.setFieldsValue({
      addressStreet: undefined,
      city: undefined,
      state: undefined,
      zipCode: undefined,
      country: undefined,
      paymentMethod: undefined,
      petFirstAidCertified: undefined,
      bio: undefined,
      sitterAddress: undefined,
      sitterCity: undefined,
      sitterState: undefined,
      sitterZipCode: undefined,
      sitterCountry: undefined,
      emergencyContactName: undefined,
      emergencyContactRelationship: undefined,
      emergencyContactPhone: undefined,
      emergencyContactAltPhone: undefined
    });
  };

  return (
    <Form form={form} layout="vertical" initialValues={{ isActive: true, country: 'USA' }}>
      <Title level={4}>Basic Information</Title>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Please enter email' },
          { type: 'email', message: 'Please enter a valid email' }
        ]}
      >
        <Input placeholder="user@example.com" />
      </Form.Item>

      <Form.Item
        label="First Name"
        name="firstName"
        rules={[{ required: true, message: 'Please enter first name' }]}
      >
        <Input placeholder="First Name" />
      </Form.Item>

      <Form.Item
        label="Last Name"
        name="lastName"
        rules={[{ required: true, message: 'Please enter last name' }]}
      >
        <Input placeholder="Last Name" />
      </Form.Item>

      <Form.Item
        label="Role"
        name="role"
        rules={[{ required: true, message: 'Please select a role' }]}
      >
        <Select placeholder="Select role" onChange={handleRoleChange}>
          <Option value="petOwner">Pet Owner</Option>
          <Option value="petSitter">Pet Sitter</Option>
          <Option value="admin">Admin</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Phone Number"
        name="phoneNumber"
        rules={[{ pattern: /^[\d\s\-\+\(\)]+$/, message: 'Please enter a valid phone number' }]}
      >
        <Input placeholder="+1 (555) 123-4567" />
      </Form.Item>

      {selectedRole && (
        <>
          <Divider />
          <Button
            type="link"
            onClick={() => setShowAdditionalFields(!showAdditionalFields)}
            style={{ padding: 0, marginBottom: 16 }}
          >
            {showAdditionalFields ? 'Hide' : 'Show'}{' '}
            {selectedRole === 'petOwner' ? 'Pet Owner' : 'Sitter'} Details (Optional)
          </Button>
        </>
      )}

      {showAdditionalFields && selectedRole === 'petOwner' && (
        <>
          <Title level={5}>Address Information</Title>

          <Form.Item label="Street Address" name="addressStreet">
            <Input placeholder="123 Main St" />
          </Form.Item>

          <Form.Item label="Address Line 2" name="addressLine2">
            <Input placeholder="Apt 4B" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="City" name="city">
                <Input placeholder="City" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="State" name="state">
                <Input placeholder="State" maxLength={2} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="ZIP Code" name="zipCode">
                <Input placeholder="12345" maxLength={10} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Country" name="country">
                <Input placeholder="Country" />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5}>Payment Preferences</Title>

          <Form.Item label="Preferred Payment Method" name="paymentMethod">
            <Select placeholder="Select payment method">
              <Option value="square">Square</Option>
              <Option value="apple_pay">Apple Pay</Option>
              <Option value="cash">Cash</Option>
              <Option value="check">Check</Option>
            </Select>
          </Form.Item>

          <Title level={5}>Emergency Contact</Title>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Contact Name" name="emergencyContactName">
                <Input placeholder="Emergency Contact" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Relationship" name="emergencyContactRelationship">
                <Input placeholder="Friend/Relative/etc" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Phone Number" name="emergencyContactPhone">
                <Input placeholder="Phone" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Alternate Phone (Optional)" name="emergencyContactAltPhone">
                <Input placeholder="Alternate Phone" />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      {showAdditionalFields && selectedRole === 'petSitter' && (
        <>
          <Title level={5}>Sitter Information</Title>

          <Form.Item label="Address" name="sitterAddress">
            <Input placeholder="Service location address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="City" name="sitterCity">
                <Input placeholder="City" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="State" name="sitterState">
                <Input placeholder="State" maxLength={2} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="ZIP Code" name="sitterZipCode">
                <Input placeholder="ZIP" maxLength={10} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Country"
            name="sitterCountry"
          >
            <Input placeholder="Country" />
          </Form.Item>

          <Form.Item
            label="Pet First Aid Certified"
            name="petFirstAidCertified"
            valuePropName="checked"
            tooltip="Is this sitter certified in Pet First Aid?"
          >
            <Switch />
          </Form.Item>

          <Form.Item label="Bio" name="bio">
            <TextArea
              rows={3}
              placeholder="Tell us about your experience with pets..."
              maxLength={500}
            />
          </Form.Item>
        </>
      )}

      <Form.Item
        label="Active Status"
        name="isActive"
        valuePropName="checked"
        style={{ marginTop: 20 }}
      >
        <Switch />
      </Form.Item>

      <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 20 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" onClick={handleSubmit}>
          Create User
        </Button>
      </Space>
    </Form>
  );
};

export default CreateUserForm;
