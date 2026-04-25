// src/screens/ManageQuickTransactions.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Space,
  Button,
  Input,
  Select,
  Card,
  List,
  message,
  Empty,
  Avatar,
  theme,
  Segmented,
  Popconfirm
} from 'antd';
import {
  SearchOutlined,
  SortAscendingOutlined,
  AppstoreOutlined,
  BarsOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { db } from '../db/db';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CategoryIcon from '../components/common/CategoryIcon';
import AddQuickTransactionSheet from '../components/common/AddQuickTransactionSheet';

const { Title, Text } = Typography;

const ManageQuickTransactions = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { token } = theme.useToken();

  // State
  const [quickTransactions, setQuickTransactions] = useState([]);
  const [categories, setCategories] = useState({});
  const [payees, setPayees] = useState({});
  const [loading, setLoading] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters and Views
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [viewType, setViewType] = useState(localStorage.getItem('qt_view_type') || 'card'); // card, list

  const handleViewChange = (type) => {
    setViewType(type);
    localStorage.setItem('qt_view_type', type);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qtData, catData, payeeData] = await Promise.all([
        db.quick_transactions.toArray(),
        db.categories.toArray(),
        db.payees.toArray()
      ]);

      setQuickTransactions(qtData);

      // Create maps for quick lookup
      const catMap = catData.reduce((acc, cat) => ({ ...acc, [cat.id]: cat }), {});
      const payMap = payeeData.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});

      setCategories(catMap);
      setPayees(payMap);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (values) => {
    if (!user) return;
    setActionLoading(true);
    try {
      if (editingItem) {
        await db.quick_transactions.update(editingItem.id, {
          ...values,
          user_id: user.id
        });
        message.success('Shortcut updated');
      } else {
        await db.quick_transactions.add({
          id: crypto.randomUUID(),
          ...values,
          user_id: user.id
        });
        message.success('Shortcut created');
      }
      setAddSheetOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save:', error);
      message.error('Failed to save transaction');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await db.quick_transactions.delete(id);
      message.success('Shortcut deleted');
      fetchData();
    } catch (error) {
      message.error('Failed to delete');
    }
  };

  const filteredItems = useMemo(() => {
    return quickTransactions
      .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        return 0;
      });
  }, [quickTransactions, searchQuery, sortBy]);

  const renderItemContent = (item) => {
    const category = categories[item.category_id];
    const payee = payees[item.payee_id];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {category && <CategoryIcon iconName={category.icon} size={14} />}
          <Text type="secondary" style={{ fontSize: 12 }}>
            {category?.name || 'No Category'} {payee ? `• ${payee.name}` : ''}
          </Text>
        </div>
        {item.amount && (
          <Text strong style={{ color: item.type === 'Income' ? '#52c41a' : '#ff4d4f' }}>
            {item.type === 'Income' ? '+' : '-'} ₹{item.amount.toLocaleString()}
          </Text>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100%', background: isDarkMode ? '#141414' : '#f5f5f5' }}>
      {/* Content */}
      <div style={{ padding: '16px 24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Controls */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'center',
            justifyContent: 'flex-start'
          }}>
            <Space wrap style={{ marginLeft: 'auto' }}>
              <Input
                placeholder="Search shortcuts"
                prefix={<SearchOutlined style={{ opacity: 0.5 }} />}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />

              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 140 }}
                options={[
                  { label: <><SortAscendingOutlined /> Name A-Z</>, value: 'name-asc' },
                  { label: <><SortAscendingOutlined style={{ transform: 'scaleY(-1)' }} /> Name Z-A</>, value: 'name-desc' },
                ]}
              />

              <Segmented
                value={viewType}
                onChange={handleViewChange}
                options={[
                  { value: 'card', icon: <AppstoreOutlined /> },
                  { value: 'list', icon: <BarsOutlined /> },
                ]}
              />

            </Space>
          </div>

          {/* Results */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <ThunderboltOutlined spin style={{ fontSize: 24, color: token.colorPrimary }} />
              <div style={{ marginTop: 16 }}>Loading shortcuts...</div>
            </div>
          ) : filteredItems.length > 0 ? (
            viewType === 'card' ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 16
              }}>
                {filteredItems.map(item => (
                  <Card
                    key={item.id}
                    hoverable
                    size="small"
                    style={{
                      borderRadius: 12,
                      background: token.colorBgContainer
                    }}
                    actions={[
                      <EditOutlined key="edit" onClick={() => {
                        setEditingItem(item);
                        setAddSheetOpen(true);
                      }} />,
                      <Popconfirm
                        title="Delete shortcut?"
                        onConfirm={() => handleDelete(item.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <DeleteOutlined key="delete" style={{ color: '#ff4d4f' }} />
                      </Popconfirm>
                    ]}
                  >
                    <Card.Meta
                      title={item.name}
                      description={renderItemContent(item)}
                    />
                  </Card>
                ))}
              </div>
            ) : (
              <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 12, overflow: 'hidden' }}>
                <List
                  dataSource={filteredItems}
                  renderItem={item => (
                    <List.Item
                      style={{ padding: '12px 20px' }}
                      actions={[
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setEditingItem(item);
                            setAddSheetOpen(true);
                          }}
                        />,
                        <Popconfirm
                          title="Delete shortcut?"
                          onConfirm={() => handleDelete(item.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={<ThunderboltOutlined />}
                            style={{ backgroundColor: item.type === 'Income' ? '#52c41a' : '#ff4d4f' }}
                          />
                        }
                        title={item.name}
                        description={renderItemContent(item)}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )
          ) : (
            <Empty
              description={searchQuery ? "No shortcuts match your search" : "No shortcuts found"}
              style={{ marginTop: 80 }}
            />
          )}

          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => {
              setEditingItem(null);
              setAddSheetOpen(true);
            }}
            style={{
              position: 'fixed',
              right: 24,
              bottom: 80,
              width: 56,
              height: 56,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 100
            }}
          />
        </Space>
      </div>

      <AddQuickTransactionSheet
        open={addSheetOpen}
        onCancel={() => {
          setAddSheetOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        loading={actionLoading}
        initialValues={editingItem}
      />
    </div>
  );
};

export default ManageQuickTransactions;
