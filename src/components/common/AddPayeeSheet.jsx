// src/components/common/AddPayeeSheet.jsx
import React from 'react';
import { 
  Drawer, 
  Form, 
  Input, 
  Button, 
  Typography, 
  theme 
} from 'antd';
import { 
  CloseOutlined, 
  CheckOutlined 
} from '@ant-design/icons';

const { Title } = Typography;

const AddPayeeSheet = ({ open, onCancel, onSave, loading }) => {
  const [form] = Form.useForm();
  const { token } = theme.useToken();

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
      <Title level={4} style={{ marginBottom: 24 }}>New Payee</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Payee Name"
          rules={[{ required: true, message: 'Please enter payee name' }]}
        >
          <Input 
            placeholder="e.g. Amazon, Starbucks" 
            size="large" 
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          name="logo"
          label="Logo URL (Optional)"
        >
          <Input 
            placeholder="https://example.com/logo.png" 
            size="large" 
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

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
            Create Payee
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};

export default AddPayeeSheet;
