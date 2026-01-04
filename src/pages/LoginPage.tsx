import React from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, Space, Alert, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SaviPetsLogo from '@/assets/SaviPets-logo.png';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const { signIn, loading } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [error, setError] = React.useState<string | null>(null);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  // Handle responsive breakpoint
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setError(null);
    try {
      console.log('🔐 Attempting sign in with:', values.email);
      await signIn(values.email, values.password);
      console.log('✅ Sign in successful, navigating to dashboard');
      message.success('Sign in successful!');
      navigate('/');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const errorMessage = error?.message || 'Failed to sign in. Please check your credentials.';
      setError(errorMessage);
      message.error(errorMessage);
      
      // Reset form if it's a credential error
      if (errorMessage.includes('invalid') || errorMessage.includes('password')) {
        form.setFields([
          { name: 'password', errors: [errorMessage] }
        ]);
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f6d55c 0%, #f9ca24 50%, #f0932b 100%)',
      padding: '16px'
    }}>
      <Row gutter={[24, 24]} style={{ width: '100%', maxWidth: 800 }}>
        {/* Logo Section */}
        <Col xs={24} md={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
                    <div 
                      style={{
                        width: isMobile ? '150px' : '200px',
                        height: isMobile ? '150px' : '200px',
                        backgroundColor: '#fff',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.8)',
                        border: '3px solid #fff',
                        padding: isMobile ? '20px' : '25px',
                        transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.2), 0 12px 24px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.8)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'perspective(1000px) rotateY(-5deg) rotateX(5deg) scale(1)';
                          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.8)';
                        }
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.05) 100%)',
                        borderRadius: '50%',
                        pointerEvents: 'none'
                      }} />
                      <img 
                        src={SaviPetsLogo} 
                        alt="SaviPets Logo" 
                        style={{
                          width: '90%',
                          height: '90%',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                          position: 'relative',
                          zIndex: 1
                        }}
                      />
                    </div>
            <Title level={1} style={{ 
              color: '#fff', 
              marginBottom: '8px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              fontSize: isMobile ? '32px' : '48px'
            }}>
              SaviPets
            </Title>
            <Text style={{ 
              color: '#fff', 
              fontSize: isMobile ? '14px' : '18px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              Professional Pet Care Management
            </Text>
          </div>
        </Col>

        {/* Login Form Section */}
        <Col xs={24} md={12}>
          <Card 
            style={{ 
              width: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              borderRadius: '16px',
              border: 'none',
              backgroundColor: '#fff'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '32px' }}>
              <Title level={2} style={{ marginBottom: '8px', color: '#f0932b', fontSize: isMobile ? '20px' : '24px' }}>
                Admin Portal
              </Title>
              <Text type="secondary" style={{ fontSize: isMobile ? '13px' : '14px' }}>
                Sign in to access the admin panel
              </Text>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
                style={{ marginBottom: '24px' }}
              />
            )}

            <Form
              form={form}
              name="login"
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#f0932b' }} />}
                  placeholder="admin@savipets.com"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please enter your password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#f0932b' }} />}
                  placeholder="Enter your password"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  style={{ 
                    height: '48px',
                    backgroundColor: '#f0932b',
                    borderColor: '#f0932b',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    minHeight: '44px', // Touch-friendly minimum
                  }}
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Admin access only. Contact support if you need assistance.
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;
