// src/components/common/AddCategorySheet.jsx
import React, { useState } from 'react';
import { 
  Drawer, 
  Form, 
  Input, 
  Button, 
  Segmented, 
  Space, 
  Typography, 
  ConfigProvider,
  theme 
} from 'antd';
import { 
  CloseOutlined, 
  CheckOutlined 
} from '@ant-design/icons';
import CategoryIcon from './CategoryIcon';

const { Title, Text } = Typography;

const CATEGORY_ICONS = [
  'MdReceipt', 'MdVolunteerActivism', 'MdCoffee', 'MdMovie', 'MdFastfood', 
  'MdLocalGasStation', 'MdAccountBalance', 'MdRedeem', 'MdHealthAndSafety', 
  'MdHome', 'MdAttachMoney', 'MdLocalConvenienceStore', 'MdPerson', 'MdBuild', 
  'MdLocalDining', 'MdAddShoppingCart', 'MdSports', 'MdHotel', 'MdSubscriptions', 
  'MdGavel', 'MdConfirmationNumber', 'MdTrain', 'MdDriveEta', 'MdFlightTakeoff'
];

const AddCategorySheet = ({ open, onCancel, onSave, loading }) => {
  const [form] = Form.useForm();
  const { token } = theme.useToken();
  const [selectedIcon, setSelectedIcon] = useState('MdReceipt');

  const handleSubmit = (values) => {
    onSave({
      ...values,
      icon: selectedIcon
    });
    form.resetFields();
    setSelectedIcon('MdReceipt');
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
      <Title level={4} style={{ marginBottom: 24 }}>New Category</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ type: 'Expense' }}
      >
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
        >
          {({ getFieldValue }) => {
            const type = getFieldValue('type');
            return (
              <Form.Item
                name="type"
                label="Category Type"
                rules={[{ required: true }]}
              >
                <ConfigProvider
                  theme={{
                    components: {
                      Segmented: {
                        itemSelectedBg: type === 'Expense' ? '#ff4d4f' : '#52c41a',
                        itemSelectedColor: '#fff',
                      },
                    },
                  }}
                >
                  <Segmented
                    options={['Expense', 'Income']}
                    block
                    size="large"
                  />
                </ConfigProvider>
              </Form.Item>
            );
          }}
        </Form.Item>

        <Form.Item
          name="name"
          label="Category Name"
          rules={[{ required: true, message: 'Please enter category name' }]}
        >
          <Input 
            placeholder="e.g. Shopping" 
            size="large" 
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item label="Select Icon">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(6, 1fr)', 
            gap: 12,
            maxHeight: 200,
            overflowY: 'auto',
            padding: '4px'
          }}>
            {CATEGORY_ICONS.map(icon => (
              <div 
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                style={{
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  cursor: 'pointer',
                  border: `2px solid ${selectedIcon === icon ? token.colorPrimary : 'transparent'}`,
                  backgroundColor: selectedIcon === icon ? `${token.colorPrimary}10` : 'rgba(0,0,0,0.02)',
                  transition: 'all 0.2s'
                }}
              >
                <CategoryIcon iconName={icon} size={24} />
              </div>
            ))}
          </div>
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
            Create Category
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};

export default AddCategorySheet;
