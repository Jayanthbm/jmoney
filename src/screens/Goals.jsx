import React, { useState, useEffect, useMemo } from 'react';
import { 
  Typography, 
  Space, 
  Button, 
  Card, 
  message,
  Empty,
  Progress,
  Select,
  theme
} from 'antd';
import { 
  SyncOutlined, 
  PlusOutlined,
  EditOutlined 
} from '@ant-design/icons';
import { db } from '../db/db';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { syncGoals, pushLocalGoals } from '../services/sync/goalSync';
import { STORAGE_KEYS, APP_CONFIG } from '../constants';
import { formatCurrency } from '../utils/formatters';
import CategoryIcon from '../components/common/CategoryIcon';
import AddGoalSheet from '../components/common/AddGoalSheet';
import CachedImage from '../components/common/CachedImage';

const { Title, Text } = Typography;

const Goals = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { token } = theme.useToken();

  // State
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [sortBy, setSortBy] = useState('name-asc');

  const fetchGoals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await db.goals.where('user_id').equals(user.id).toArray();
      setGoals(data.filter(g => g.deleted !== 1));
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      message.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();

    const handleLayoutSync = () => handleSync();
    window.addEventListener('trigger-sync-goals', handleLayoutSync);
    return () => window.removeEventListener('trigger-sync-goals', handleLayoutSync);
  }, [user]);

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    window.dispatchEvent(new CustomEvent('sync-start'));
    try {
      await syncGoals(user.id);
      message.success('Goals synced');
      fetchGoals();
    } catch (error) {
      console.error('Sync failed:', error);
      message.error('Sync failed');
    } finally {
      setSyncing(false);
      window.dispatchEvent(new CustomEvent('sync-end'));
    }
  };

  const handleSaveGoal = async (values) => {
    if (!user) return;
    try {
      if (editingGoal) {
        await db.goals.update(editingGoal.id, {
          ...values,
          sync_status: 1,
          updated_at: new Date().toISOString()
        });
        message.success('Goal updated locally');
      } else {
        const newGoal = {
          id: crypto.randomUUID(),
          ...values,
          user_id: user.id,
          sync_status: 1,
          deleted: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await db.goals.add(newGoal);
        message.success('Goal added locally');
      }
      
      setAddSheetOpen(false);
      setEditingGoal(null);
      fetchGoals();
      
      // Background sync
      pushLocalGoals(user.id).catch(console.error);
    } catch (error) {
      console.error('Failed to save goal:', error);
      message.error('Failed to save goal');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setAddSheetOpen(true);
  };

  const filteredGoals = useMemo(() => {
    return goals
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'amount-high') return b.goal_amount - a.goal_amount;
        if (sortBy === 'amount-low') return a.goal_amount - b.goal_amount;
        if (sortBy === 'progress') {
          const progressA = (a.current_amount || 0) / a.goal_amount;
          const progressB = (b.current_amount || 0) / b.goal_amount;
          return progressB - progressA;
        }
        return 0;
      });
  }, [goals, sortBy]);

  const renderGoalProgress = (goal) => {
    const percent = Math.min(100, Math.round(((goal.current_amount || 0) / goal.goal_amount) * 100));
    const remaining = Math.max(0, goal.goal_amount - (goal.current_amount || 0));
    
    return (
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {APP_CONFIG.CURRENCY_SYMBOL}{goal.current_amount || 0} / {APP_CONFIG.CURRENCY_SYMBOL}{goal.goal_amount}
          </Text>
          <Text strong style={{ fontSize: 12 }}>{percent}%</Text>
        </div>
        <Progress 
          percent={percent} 
          showInfo={false} 
          strokeColor={percent >= 100 ? '#52c41a' : token.colorPrimary}
          railColor={isDarkMode ? 'rgba(255,255,255,0.05)' : '#f0f0f0'}
        />
        {percent < 100 && (
          <div style={{ marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {APP_CONFIG.CURRENCY_SYMBOL}{remaining} more to go
            </Text>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ padding: '16px 24px' }}>
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: 180 }}
              options={[
                { label: 'Name (A-Z)', value: 'name-asc' },
                { label: 'Name (Z-A)', value: 'name-desc' },
                { label: 'Amount (High-Low)', value: 'amount-high' },
                { label: 'Amount (Low-High)', value: 'amount-low' },
                { label: 'Progress (%)', value: 'progress' },
              ]}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <SyncOutlined spin style={{ fontSize: 24, color: token.colorPrimary }} />
              <div style={{ marginTop: 16 }}>Loading goals...</div>
            </div>
          ) : filteredGoals.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 20
            }}>
              {filteredGoals.map(goal => (
                <Card
                  key={goal.id}
                  hoverable
                  style={{ borderRadius: 16, background: token.colorBgContainer }}
                  styles={{ body: { padding: 20 } }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f9f9f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      <CachedImage
                        src={goal.logo}
                        alt={goal.name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover'
                        }}
                        fallbackIcon={<CategoryIcon iconName="MdStars" size={28} style={{ opacity: 0.5 }} />}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Title level={5} style={{ margin: 0 }}>{goal.name}</Title>
                        <Button 
                          type="text" 
                          icon={<EditOutlined />} 
                          size="small" 
                          onClick={() => handleEdit(goal)}
                        />
                      </div>
                    </div>
                  </div>
                  {renderGoalProgress(goal)}
                </Card>
              ))}
            </div>
          ) : (
            <Empty
              description="No goals found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ marginTop: 80 }}
            >
              <Button type="primary" onClick={() => setAddSheetOpen(true)}>Add Goal</Button>
            </Empty>
          )}

          <Button 
            type="primary" 
            shape="circle" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={() => {
              setEditingGoal(null);
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

      <AddGoalSheet
        open={addSheetOpen}
        onCancel={() => {
          setAddSheetOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        loading={false}
        initialValues={editingGoal}
      />
    </div>
  );
};

export default Goals;
