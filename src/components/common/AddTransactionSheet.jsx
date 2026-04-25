// src/components/common/AddTransactionSheet.jsx
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
  ConfigProvider,
  DatePicker,
  theme,
  message 
} from 'antd';
import { 
  CloseOutlined, 
  CheckOutlined,
  DeleteOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { db } from '../../db/db';
import CategoryIcon from './CategoryIcon';
import { saveTransactionAsync, deleteTransactionAsync } from '../../services/transactionService';
import { Popconfirm } from 'antd';
const { Title, Text } = Typography;

const AddTransactionSheet = ({ open, onCancel, onSave, initialValues }) => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const { token } = theme.useToken();
  const [categories, setCategories] = useState([]);
  const [payees, setPayees] = useState([]);
  const [type, setType] = useState('expense');
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
      if (initialValues) {
        // Prioritize transaction_timestamp to ensure time is shown
        const displayDate = initialValues.transaction_timestamp || initialValues.date;
        
        // Combine lat/lng for the edit field
        let location_coords = '';
        if (initialValues.latitude && initialValues.longitude) {
          location_coords = `${initialValues.latitude}, ${initialValues.longitude}`;
        }

        form.setFieldsValue({
          ...initialValues,
          date: dayjs(displayDate),
          location_coords
        });
        const valType = (initialValues.type || 'Expense').toLowerCase() === 'expense' ? 'Expense' : 'Income';
        setType(valType.toLowerCase());
        form.setFieldValue('type', valType);
      } else {
        form.resetFields();
        const defaultType = 'Expense';
        form.setFieldsValue({ 
          type: defaultType,
          date: dayjs()
        });
        setType(defaultType.toLowerCase());
      }
    }
  }, [open, initialValues, form]);

  const fetchData = async () => {
    const cats = await db.categories.toArray();
    const pays = await db.payees.toArray();
    setCategories(cats);
    setPayees(pays);
  };

  const handleLocationToggle = () => {
    const currentLat = form.getFieldValue('latitude');
    if (!currentLat) {
      if (!navigator.geolocation) {
        messageApi.error('Geolocation is not supported by your browser');
        return;
      }
      setFetchingLocation(true);
      messageApi.loading({ content: 'Fetching location...', key: 'loc_fetch' });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setFieldsValue({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setFetchingLocation(false);
          messageApi.success({ content: 'Location pinned', key: 'loc_fetch' });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setFetchingLocation(false);
          let errorMsg = 'Failed to fetch location';
          if (error.code === 1) errorMsg = 'Location permission denied';
          else if (error.code === 2) errorMsg = 'Location unavailable';
          else if (error.code === 3) errorMsg = 'Location request timed out';
          messageApi.error({ content: errorMsg, key: 'loc_fetch' });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      form.setFieldsValue({ latitude: null, longitude: null });
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const selectedCat = categories.find(c => c.id === values.category_id);
      const selectedPayee = payees.find(p => p.id === values.payee_id);
      
      const valuesToSave = { ...values };
      
      // Parse coordinates if available
      if (valuesToSave.location_coords) {
        const parts = valuesToSave.location_coords.split(',').map(s => s.trim());
        if (parts.length === 2) {
          valuesToSave.latitude = parts[0];
          valuesToSave.longitude = parts[1];
        }
      }
      delete valuesToSave.location_coords;

      const transactionData = {
        ...initialValues,
        ...valuesToSave,
        date: values.date.format('YYYY-MM-DD'),
        transaction_timestamp: values.date.format('YYYY-MM-DD HH:mm:ss'),
        category_name: selectedCat?.name,
        category_icon: selectedCat?.icon,
        category_app_icon: selectedCat?.app_icon,
        payee_name: selectedPayee?.name,
        payee_logo: selectedPayee?.logo,
      };

      await onSave(transactionData);
      onCancel();
    } catch (error) {
      console.error('Failed to save transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialValues?.id) return;
    setLoading(true);
    try {
      const tx = await db.transactions.get(initialValues.id);
      if (tx?.user_id) {
        await deleteTransactionAsync(initialValues.id, tx.user_id);
        onCancel();
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!initialValues?.id;

  return (
    <Drawer
      title={null}
      placement="bottom"
      onClose={onCancel}
      open={open}
      size="auto"
      closable={true}
      closeIcon={<CloseOutlined style={{ fontSize: 16 }} />}
      styles={{
        body: { padding: '24px 20px 40px' },
        header: { border: 'none', padding: '16px 16px 0 16px' }
      }}
    >
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Title level={4} style={{ margin: 0 }}>
              {isEdit ? 'Edit Transaction' : 'New Transaction'}
            </Title>
            {!isEdit && (
              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.latitude !== curr.latitude}>
                {({ getFieldValue }) => {
                  const lat = getFieldValue('latitude');
                  const lng = getFieldValue('longitude');
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Button 
                        type={lat ? 'primary' : 'default'}
                        shape="circle"
                        size="small"
                        icon={<EnvironmentOutlined />}
                        loading={fetchingLocation}
                        onClick={handleLocationToggle}
                        style={{ 
                          backgroundColor: lat ? token.colorSuccess : 'transparent',
                          borderColor: lat ? token.colorSuccess : token.colorBorder
                        }}
                      />
                      {lat && (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          ({lat.toFixed(4)}, {lng.toFixed(4)})
                        </Text>
                      )}
                    </div>
                  );
                }}
              </Form.Item>
            )}
          </div>
          
          {isEdit && (
            <Popconfirm
              title="Delete this transaction?"
              onConfirm={handleDelete}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </div>
        {!isEdit && (
          <Form.Item name="type" label="Transaction Type">
            <ConfigProvider
              theme={{
                components: {
                  Segmented: {
                    itemSelectedBg: type.toLowerCase() === 'expense' ? token.colorError : token.colorSuccess,
                    itemSelectedColor: '#fff',
                  },
                },
              }}
            >
              <Segmented
                block
                options={[
                  { label: 'Expense', value: 'Expense' },
                  { label: 'Income', value: 'Income' }
                ]}
                value={type === 'expense' ? 'Expense' : type === 'income' ? 'Income' : type}
                onChange={(val) => {
                  setType(val);
                  form.setFieldValue('type', val);
                }}
              />
            </ConfigProvider>
          </Form.Item>
        )}

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="amount"
            label="Amount"
            style={{ flex: 1 }}
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <InputNumber 
              prefix="₹" 
              placeholder="0.00" 
              size="large" 
              style={{ width: '100%', borderRadius: 8 }} 
              min={0.01}
              step={0.01}
              autoFocus={!isEdit}
            />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date & Time"
            style={{ flex: 1 }}
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker 
              size="large" 
              style={{ width: '100%', borderRadius: 8 }} 
              format="DD MMM YYYY HH:mm"
              showTime={{ format: 'HH:mm' }}
            />
          </Form.Item>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            name="category_id"
            label="Category"
            style={{ flex: 1 }}
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select
              size="large"
              placeholder="Category"
              style={{ borderRadius: 8 }}
              showSearch
              filterOption={(input, option) =>
                String(option?.name ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={categories
                .filter(c => c.type.toLowerCase() === type.toLowerCase())
                .map(c => ({
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CategoryIcon iconName={c.icon} appIcon={c.app_icon} size={16} />
                      {c.name}
                    </div>
                  ),
                  value: c.id,
                  name: c.name
                }))}
            />
          </Form.Item>

          <Form.Item
            name="payee_id"
            label="Payee"
            style={{ flex: 1 }}
          >
            <Select
              size="large"
              placeholder="Payee (optional)"
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
        </div>

        <Form.Item
          name="description"
          label="Description / Remarks"
        >
          <Input.TextArea 
            placeholder="What was this for?" 
            rows={2}
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        {isEdit && (
          <>
            <Form.Item
              name="product_link"
              label="Product Link"
            >
              <Input placeholder="https://..." style={{ borderRadius: 8 }} />
            </Form.Item>

            <Form.Item
              name="location_coords"
              label="Coordinates (Lat, Lng)"
              extra="Paste from Google Maps (e.g. 12.9797, 77.5995)"
            >
              <Input placeholder="0.0000, 0.0000" style={{ borderRadius: 8 }} />
            </Form.Item>
            
            {/* Hidden fields for actual values */}
            <Form.Item name="latitude" style={{ display: 'none' }}><Input /></Form.Item>
            <Form.Item name="longitude" style={{ display: 'none' }}><Input /></Form.Item>
          </>
        )}

        {!isEdit && (
          <>
            <Form.Item name="latitude" style={{ display: 'none' }}><Input /></Form.Item>
            <Form.Item name="longitude" style={{ display: 'none' }}><Input /></Form.Item>
          </>
        )}

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
            {initialValues?.id ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};

export default AddTransactionSheet;
