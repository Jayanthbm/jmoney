// src/components/transactions/TransactionFilterSheet.jsx
import React, { useState, useEffect } from 'react';
import { Drawer, Input, Button, List, Checkbox, Typography, theme, Tag, Space } from 'antd';
import { SearchOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import CategoryIcon from '../common/CategoryIcon';

const { Title, Text } = Typography;

const TransactionFilterSheet = ({ 
  open, 
  onClose, 
  type, // 'Category' or 'Payee'
  items, 
  selectedItems, 
  onApply,
  title
}) => {
  const { token } = theme.useToken();
  const [searchText, setSearchText] = useState('');
  const [tempSelected, setTempSelected] = useState([]);

  useEffect(() => {
    if (open) {
      setTempSelected([...selectedItems]);
      setSearchText('');
    }
  }, [open, selectedItems]);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const toggleItem = (id) => {
    setTempSelected(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const handleApply = () => {
    onApply(tempSelected);
    onClose();
  };

  const handleClear = () => {
    setTempSelected([]);
  };

  return (
    <Drawer
      title={null}
      placement="bottom"
      onClose={onClose}
      open={open}
      size="large"
      styles={{
        body: { padding: '24px 20px', display: 'flex', flexDirection: 'column' },
        header: { border: 'none' }
      }}
      closeIcon={<CloseOutlined />}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>Filter by {title}</Title>
        <Button type="text" onClick={handleClear} disabled={tempSelected.length === 0}>
          Clear All
        </Button>
      </div>

      <Input
        placeholder={`Search ${title}...`}
        prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        size="large"
        style={{ marginBottom: 20, borderRadius: 12, backgroundColor: token.colorFillAlter }}
        allowClear
      />

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 20 }}>
        <List
          dataSource={filteredItems}
          renderItem={item => (
            <List.Item
              onClick={() => toggleItem(item.id)}
              style={{ 
                padding: '12px 0', 
                cursor: 'pointer',
                borderBottom: `1px solid ${token.colorBorderSecondary}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                {type === 'Category' && (
                  <CategoryIcon iconName={item.icon} appIcon={item.app_icon} size={24} />
                )}
                <Text style={{ flex: 1, fontSize: 16 }}>{item.name}</Text>
                <Checkbox checked={tempSelected.includes(item.id)} />
              </div>
            </List.Item>
          )}
        />
      </div>

      <div style={{ padding: '0 0 20px' }}>
        <Button 
          type="primary" 
          block 
          size="large" 
          icon={<CheckOutlined />}
          onClick={handleApply}
          style={{ height: 48, borderRadius: 12 }}
        >
          Apply Filters {tempSelected.length > 0 && `(${tempSelected.length})`}
        </Button>
      </div>
    </Drawer>
  );
};

export default TransactionFilterSheet;
