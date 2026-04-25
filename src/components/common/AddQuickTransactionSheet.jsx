// src/components/common/AddQuickTransactionSheet.jsx
import React, { useEffect, useState } from 'react';
import { 
  Drawer, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Select, 
  InputNumber, 
  Segmented,
  theme 
} from 'antd';
import { 
  CloseOutlined, 
  CheckOutlined 
} from '@ant-design/icons';
import { db } from '../../db/db';
import CategoryIcon from './CategoryIcon';

const { Title } = Typography;

const AddQuickTransactionSheet = ({ open, onCancel, onSave, loading, initialValues }) => {
  const [form] = Form.useForm();
  const { token } = theme.useToken();
  const [categories, setCategories] = useState([]);
  const [payees, setPayees] = useState([]);
  const [type, setType] = useState('Expense');

  useEffect(() => {
    if (open) {
      fetchData();
      if (initialValues) {
        form.setFieldsValue(initialValues);
        setType(initialValues.type || 'Expense');
      } else {
        form.resetFields();
        form.setFieldsValue({ type: 'Expense' });
        setType('Expense');
      }
    }
  }, [open, initialValues, form]);

  const fetchData = async () => {
    const cats = await db.categories.toArray();
    const pays = await db.payees.toArray();
    setCategories(cats);
    setPayees(pays);
  };

  const handleSubmit = (values) => {
    onSave(values);
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
        {initialValues ? 'Edit Quick Transaction' : 'New Quick Transaction'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ type: 'Expense' }}
      >
        <Form.Item
          name="name"
          label="Template Name"
          rules={[{ required: true, message: 'Please enter a name for this shortcut' }]}
        >
          <Input 
            placeholder="e.g. Daily Coffee" 
            size="large" 
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item name="type" label="Type">
          <Segmented
            block
            options={['Expense', 'Income']}
            onChange={(val) => {
              setType(val);
              form.setFieldValue('type', val);
            }}
          />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount"
        >
          <InputNumber 
            prefix="₹" 
            placeholder="0.00" 
            size="large" 
            style={{ width: '100%', borderRadius: 8 }} 
          />
        </Form.Item>

        <Form.Item
          name="category_id"
          label="Category"
        >
          <Select
            size="large"
            placeholder="Select category"
            style={{ borderRadius: 8 }}
            showSearch
            filterOption={(input, option) =>
              String(option?.name ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={categories
              .filter(c => c.type === type)
              .map(c => ({
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CategoryIcon iconName={c.icon} size={16} />
                    {c.name}
                  </div>
                ),
                value: c.id,
                name: c.name // for filtering
              }))}
          />
        </Form.Item>

        <Form.Item
          name="payee_id"
          label="Payee"
        >
          <Select
            size="large"
            placeholder="Select payee (optional)"
            style={{ borderRadius: 8 }}
            showSearch
            allowClear
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={payees.map(p => ({
              label: p.name,
              value: p.id
            }))}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Remarks"
        >
          <Input.TextArea 
            placeholder="Additional notes" 
            rows={2}
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
            {initialValues ? 'Save Changes' : 'Create Shortcut'}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};

export default AddQuickTransactionSheet;
