// src/components/common/AddGoalSheet.jsx
import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  Form, 
  Input, 
  Button, 
  InputNumber, 
  Space, 
  Typography, 
  theme 
} from 'antd';
import { 
  CloseOutlined, 
  CheckOutlined 
} from '@ant-design/icons';
import CategoryIcon from './CategoryIcon';

const { Title } = Typography;

const AddGoalSheet = ({ open, onCancel, onSave, loading, initialValues }) => {
  const [form] = Form.useForm();
  const { token } = theme.useToken();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleSubmit = (values) => {
    onSave(values);
    form.resetFields();
  };

  return (
    <Drawer
      title={null}
      placement="bottom"
      onClose={onCancel}
      open={open}
      height="auto"
      closable={true}
      closeIcon={<CloseOutlined style={{ fontSize: 16 }} />}
      styles={{
        body: { padding: '24px 20px 40px' },
        header: { border: 'none', padding: '16px 16px 0 16px' }
      }}
    >
      <Title level={4} style={{ marginBottom: 24 }}>
        {initialValues ? 'Edit Goal' : 'Add Goal'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Goal Name"
          rules={[{ required: true, message: 'Please enter goal name' }]}
        >
          <Input 
            placeholder="e.g. New Laptop" 
            size="large" 
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          name="logo"
          label="Image URL"
          rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
        >
          <Input 
            placeholder="https://example.com/image.png" 
            size="large" 
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            name="goal_amount"
            label="Target Amount"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber
              style={{ width: '100%', borderRadius: 8 }}
              size="large"
              min={1}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="current_amount"
            label="Current Saved"
          >
            <InputNumber
              style={{ width: '100%', borderRadius: 8 }}
              size="large"
              min={0}
              formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\₹\s?|(,*)/g, '')}
            />
          </Form.Item>
        </div>

        <div style={{ marginTop: 32 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            block 
            size="large" 
            loading={loading}
            style={{ borderRadius: 12, height: 48 }}
            icon={<CheckOutlined />}
          >
            {initialValues ? 'Save Changes' : 'Add Goal'}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};

export default AddGoalSheet;
