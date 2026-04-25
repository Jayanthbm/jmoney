// src/screens/Login.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Row, Col, theme } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../constants';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, colorBgLayout, borderRadiusLG, colorTextBase },
  } = theme.useToken();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { error } = await signIn({
        email: values.email,
        password: values.password,
      });
      if (error) throw error;
      message.success('Logged in successfully');
      navigate('/');
    } catch (error) {
      message.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: colorBgLayout,
      fontFamily: "'Underdog', system-ui, Avenir, Helvetica, Arial, sans-serif"
    }}>
      <Row justify="center" style={{ width: '100%', padding: '0 15px' }}>
        <Col xs={24} sm={18} md={12} lg={8} xl={6}>
          <Card 
            bordered={false} 
            style={{ 
              borderRadius: 16, 
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              overflow: 'hidden'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={2}>{APP_CONFIG.NAME}</Title>
              <Text type="secondary">Welcome back! Please login to your account.</Text>
              <br />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: '0.8em' }}>v{APP_CONFIG.VERSION}</Text>
              </div>
            </div>
            
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              size="large"
              layout="vertical"
            >
              <Form.Item
                name="email"
                rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Email" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your Password!' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  loading={loading}
                  icon={<LoginOutlined />}
                  style={{ borderRadius: 8, height: 48 }}
                >
                  Log in
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
