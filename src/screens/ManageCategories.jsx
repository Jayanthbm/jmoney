// src/screens/ManageCategories.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Typography, 
  Space, 
  Button, 
  Segmented, 
  Input, 
  Select, 
  Card, 
  List, 
  message,
  Tooltip,
  Empty,
  Badge,
  theme
} from 'antd';
import { 
  SyncOutlined, 
  SearchOutlined, 
  SortAscendingOutlined, 
  AppstoreOutlined, 
  BarsOutlined, 
  PlusOutlined, 
  ArrowLeftOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { syncCategories } from '../services/syncService';
import { getRelativeTime } from '../utils/dateUtils';
import { STORAGE_KEYS } from '../constants';
import CategoryIcon from '../components/common/CategoryIcon';
import AddCategorySheet from '../components/common/AddCategorySheet';
import { pushLocalCategories } from '../services/sync/categorySync';

const { Title, Text } = Typography;

const ManageCategories = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { token } = theme.useToken();

  // State
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(localStorage.getItem(`${STORAGE_KEYS.LAST_SYNC_CATEGORIES}${user?.id}`));
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  // Filters and Views
  const [typeFilter, setTypeFilter] = useState('Expense'); // Expense, Income
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [viewType, setViewType] = useState(localStorage.getItem('categories_view_type') || 'card'); // card, list

  const handleViewChange = (type) => {
    setViewType(type);
    localStorage.setItem('categories_view_type', type);
  };

  // Fetch categories from Dexie
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await db.categories.toArray();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    
    // Sync on mount if last sync is null
    if (user && !lastSyncTime) {
      handleSync();
    }

    // Listen for layout sync trigger
    const handleLayoutSync = () => handleSync();
    window.addEventListener('trigger-sync-categories', handleLayoutSync);
    return () => window.removeEventListener('trigger-sync-categories', handleLayoutSync);
  }, [user]);

  // Handle Sync
  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    window.dispatchEvent(new CustomEvent('sync-start'));
    try {
      await syncCategories(user.id);
      message.success('Categories synced successfully');
      const now = new Date().toISOString();
      localStorage.setItem(`${STORAGE_KEYS.LAST_SYNC_CATEGORIES}${user.id}`, now);
      setLastSyncTime(now);
      fetchCategories();
    } catch (error) {
      console.error('Sync failed:', error);
      message.error('Sync failed');
    } finally {
      setSyncing(false);
      window.dispatchEvent(new CustomEvent('sync-end'));
    }
  };

  const handleSaveCategory = async (values) => {
    if (!user) return;
    setAdding(true);
    try {
      const newCategory = {
        id: crypto.randomUUID(),
        name: values.name,
        type: values.type,
        icon: values.icon,
        user_id: user.id,
        sync_status: 1 // For tracking local change
      };

      await db.categories.add(newCategory);
      message.success('Category added locally');
      setAddSheetOpen(false);
      fetchCategories();

      // Trigger sync in background
      pushLocalCategories(user.id).catch(err => console.error('Background sync failed:', err));
    } catch (error) {
      console.error('Failed to add category:', error);
      message.error('Failed to add category');
    } finally {
      setAdding(false);
    }
  };

  // Filter and Sort logic
  const filteredCategories = useMemo(() => {
    return categories
      .filter(cat => {
        const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = cat.type.toLowerCase() === typeFilter.toLowerCase();
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        return 0;
      });
  }, [categories, searchQuery, typeFilter, sortBy]);

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
            justifyContent: 'space-between'
          }}>
            <Segmented
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { label: 'Expense', value: 'Expense' },
                { label: 'Income', value: 'Income' },
              ]}
              size="large"
            />

            <Space wrap>
              <Input
                placeholder="Search categories"
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
              <SyncOutlined spin style={{ fontSize: 24, color: token.colorPrimary }} />
              <div style={{ marginTop: 16 }}>Loading categories...</div>
            </div>
          ) : filteredCategories.length > 0 ? (
            viewType === 'card' ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 16
              }}>
                {filteredCategories.map(cat => (
                  <Card
                    key={cat.id}
                    hoverable
                    size="small"
                    style={{
                      borderRadius: 12,
                      textAlign: 'center',
                      background: token.colorBgContainer
                    }}
                    bodyStyle={{ padding: '20px 12px' }}
                  >
                    <div style={{
                      fontSize: 32,
                      marginBottom: 12,
                      background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f9f9f9',
                      width: 60,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      margin: '0 auto 12px'
                    }}>
                      <CategoryIcon iconName={cat.icon} size={32} />
                    </div>
                    <Title level={5} style={{ margin: 0, fontSize: 14 }}>{cat.name}</Title>
                  </Card>
                ))}
              </div>
            ) : (
              <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 12, overflow: 'hidden' }}>
                <List
                  dataSource={filteredCategories}
                  renderItem={cat => (
                    <List.Item style={{ padding: '12px 20px' }}>
                      <List.Item.Meta
                        avatar={
                          <div style={{
                            fontSize: 24,
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f9f9f9',
                            borderRadius: 8
                          }}>
                            <CategoryIcon iconName={cat.icon} size={24} />
                          </div>
                        }
                        title={cat.name}
                        description={cat.type}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )
          ) : (
            <Empty
              description={searchQuery ? "No categories match your search" : "No categories found"}
              style={{ marginTop: 80 }}
            />
          )}

          <Button 
            type="primary" 
            shape="circle" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={() => setAddSheetOpen(true)}
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

      <AddCategorySheet
        open={addSheetOpen}
        onCancel={() => setAddSheetOpen(false)}
        onSave={handleSaveCategory}
        loading={adding}
      />
    </div>
  );
};

export default ManageCategories;
