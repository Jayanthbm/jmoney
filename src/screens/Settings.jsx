// src/screens/Settings.jsx
import React, { useState, useEffect } from 'react';
import {
  List,
  Switch,
  Button,
  Typography,
  Card,
  Modal,
  message,
  Divider,
  Space,
  Segmented
} from 'antd';
import {
  BgColorsOutlined,
  DatabaseOutlined,
  UserOutlined,
  LogoutOutlined,
  SyncOutlined,
  DeleteOutlined,
  RightOutlined,
  TagsOutlined,
  ContactsOutlined,
  ThunderboltOutlined,
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { runFullSync } from '../services/syncService';
import { db } from '../db/db';
import { STORAGE_KEYS } from '../constants';
import { getRelativeTime } from '../utils/dateUtils';
import ConfirmationSheet from '../components/common/ConfirmationSheet';

const { Title, Text } = Typography;

const Settings = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [resetSheetOpen, setResetSheetOpen] = useState(false);
  const [logoutSheetOpen, setLogoutSheetOpen] = useState(false);

  // Load last sync time on mount
  useEffect(() => {
    if (user) {
      const lastSync = localStorage.getItem(`${STORAGE_KEYS.LAST_SYNC_MASTER}${user.id}`);
      if (lastSync) {
        setLastSyncTime(getRelativeTime(lastSync));
      }
    }
  }, [user]);

  const handleResetData = async () => {
    try {
      await db.delete();
      await db.open();
      message.success('All local data has been reset.');
      window.location.reload();
    } catch (error) {
      message.error('Failed to reset data.');
      console.error(error);
    } finally {
      setResetSheetOpen(false);
    }
  };

  const handleCloudSync = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      await runFullSync(user.id, (status) => {
        message.loading({ content: `Syncing: ${status}`, key: 'sync' });
      });
      message.success({ content: 'Cloud sync complete!', key: 'sync', duration: 2 });
      // Update last sync time display
      const now = new Date().toISOString();
      setLastSyncTime(getRelativeTime(now));
    } catch (error) {
      message.error({ content: 'Sync failed.', key: 'sync' });
    } finally {
      setSyncing(false);
    }
  };

  const menuSections = [
    {
      title: 'Appearance',
      icon: <BgColorsOutlined />,
      items: [
        {
          title: 'Theme',
          description: 'Choose your preferred color theme',
          action: (
            <Segmented
              value={isDarkMode ? 'dark' : 'light'}
              onChange={(value) => {
                if ((value === 'dark' && !isDarkMode) || (value === 'light' && isDarkMode)) {
                  toggleTheme();
                }
              }}
              options={[
                { value: 'light', icon: <SunOutlined /> },
                { value: 'dark', icon: <MoonOutlined /> },
              ]}
            />
          ),
        },
      ],
    },
    {
      title: 'Manage Data',
      icon: <DatabaseOutlined />,
      items: [
        {
          title: 'Categories',
          description: 'Manage Categories',
          onClick: () => navigate('/categories'),
          suffix: <RightOutlined style={{ opacity: 0.3 }} />,
          icon: <TagsOutlined />
        },
        {
          title: 'Payees',
          description: 'Manage Payees',
          onClick: () => navigate('/payees'),
          suffix: <RightOutlined style={{ opacity: 0.3 }} />,
          icon: <ContactsOutlined />
        },
        {
          title: 'Quick Transactions',
          description: 'Setup shortcuts for frequent transactions',
          onClick: () => navigate('/settings/quick-transactions'),
          suffix: <RightOutlined style={{ opacity: 0.3 }} />,
          icon: <ThunderboltOutlined />
        },
        {
          title: 'Reset Data',
          description: 'Clear all local data from this device',
          onClick: () => setResetSheetOpen(true),
          danger: true,
          icon: <DeleteOutlined />
        },
        {
          title: 'Cloud Sync',
          description: lastSyncTime ? `Last synced ${lastSyncTime}` : 'Sync data with Supabase',
          onClick: handleCloudSync,
          suffix: <Button type="text" loading={syncing} icon={<SyncOutlined />} />,
          icon: <SyncOutlined />
        },
      ],
    },
    {
      title: 'Account',
      icon: <UserOutlined />,
      items: [
        {
          title: 'User Email',
          description: user?.email || 'Not logged in',
          icon: <UserOutlined />
        },
        {
          title: 'Sign Out',
          description: 'Logout from your account',
          onClick: () => setLogoutSheetOpen(true),
          danger: true,
          icon: <LogoutOutlined />
        },
      ],
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '16px auto', padding: '0 16px' }}>
      {menuSections.map((section, idx) => (
        <div key={section.title} style={{ marginBottom: 32 }}>
          <Space style={{ marginBottom: 16 }}>
            {section.icon}
            <Text strong style={{ fontSize: 16 }}>{section.title}</Text>
          </Space>
          <Card
            size="small"
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: isDarkMode ? 'none' : '0 1px 2px rgba(0,0,0,0.03)'
            }}
            bodyStyle={{ padding: 0 }}
          >
            <List
              itemLayout="horizontal"
              dataSource={section.items}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: '12px 16px',
                    cursor: item.onClick ? 'pointer' : 'default',
                    transition: 'background 0.2s'
                  }}
                  onClick={item.onClick}
                  actions={item.action ? [item.action] : []}
                  onMouseEnter={(e) => {
                    if (item.onClick) e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
                  }}
                  onMouseLeave={(e) => {
                    if (item.onClick) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <List.Item.Meta
                    avatar={item.icon && <div style={{
                      fontSize: 18,
                      color: item.danger ? '#ff4d4f' : (isDarkMode ? '#aaa' : '#555'),
                      marginTop: 4
                    }}>{item.icon}</div>}
                    title={<Text delete={false} style={{ color: item.danger ? '#ff4d4f' : 'inherit' }}>{item.title}</Text>}
                    description={item.description}
                  />
                  {item.suffix}
                </List.Item>
              )}
            />
          </Card>
        </div>
      ))}

      {/* Confirmation Sheets */}
      <ConfirmationSheet
        open={resetSheetOpen}
        onCancel={() => setResetSheetOpen(false)}
        onConfirm={handleResetData}
        title="Reset All Data?"
        description="This will permanently delete all your local transactions, categories, and other data. This action cannot be undone."
        confirmText="Reset Now"
        danger
      />

      <ConfirmationSheet
        open={logoutSheetOpen}
        onCancel={() => setLogoutSheetOpen(false)}
        onConfirm={signOut}
        title="Sign Out?"
        description="Are you sure you want to sign out of your account? Your local data will remain safe."
        confirmText="Sign Out"
        danger
      />
    </div>
  );
};

export default Settings;
