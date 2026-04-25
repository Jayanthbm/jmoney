// src/components/layout/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer, theme, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  TransactionOutlined,
  WalletOutlined,
  TrophyOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  SyncOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { APP_CONFIG, STORAGE_KEYS } from '../../constants';
import { getRelativeTime } from '../../utils/dateUtils';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleSyncStart = () => setIsSyncing(true);
    const handleSyncEnd = () => setIsSyncing(false);

    window.addEventListener('sync-start', handleSyncStart);
    window.addEventListener('sync-end', handleSyncEnd);
    return () => {
      window.removeEventListener('sync-start', handleSyncStart);
      window.removeEventListener('sync-end', handleSyncEnd);
    };
  }, []);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/transactions', icon: <TransactionOutlined />, label: 'Transactions' },
    { key: '/budgets', icon: <WalletOutlined />, label: 'Budgets' },
    { key: '/goals', icon: <TrophyOutlined />, label: 'Goals' },
    { key: '/reports', icon: <BarChartOutlined />, label: 'Reports' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const currentKey = menuItems.find(item => location.pathname === item.key)?.key || '/';

  const getHeaderConfig = (path) => {
    switch (path) {
      case '/':
        return { title: 'Dashboard' };
      case '/transactions':
        return { title: 'Transactions' };
      case '/budgets':
        return { title: 'Budgets' };
      case '/goals':
        return { 
          title: 'Goals',
          subtitle: () => {
            const time = localStorage.getItem(`${STORAGE_KEYS.LAST_SYNC_GOALS}${user?.id}`);
            return time ? `Last synced ${getRelativeTime(time)}` : 'Never synced';
          },
          rightIcon: <SyncOutlined />,
          onRightClick: () => window.dispatchEvent(new CustomEvent('trigger-sync-goals'))
        };
      case '/reports':
        return { title: 'Reports' };
      case '/settings':
        return { title: 'Settings' };
      case '/quick-transactions':
        return {
          title: 'Quick Transactions',
          showBack: true,
          backPath: '/settings'
        };
      case '/categories':
        return {
          title: 'Categories',
          showBack: true,
          backPath: '/settings',
          subtitle: () => {
            const time = localStorage.getItem(`${STORAGE_KEYS.LAST_SYNC_CATEGORIES}${user?.id}`);
            return time ? `Last synced ${getRelativeTime(time)}` : 'Never synced';
          },
          rightIcon: <SyncOutlined />,
          onRightClick: () => window.dispatchEvent(new CustomEvent('trigger-sync-categories'))
        };
      case '/payees':
        return {
          title: 'Payees',
          showBack: true,
          backPath: '/settings',
          subtitle: () => {
            const time = localStorage.getItem(`${STORAGE_KEYS.LAST_SYNC_PAYEES}${user?.id}`);
            return time ? `Last synced ${getRelativeTime(time)}` : 'Never synced';
          },
          rightIcon: <SyncOutlined />,
          onRightClick: () => window.dispatchEvent(new CustomEvent('trigger-sync-payees'))
        };
      default:
        return { title: 'Dashboard' };
    }
  };

  const config = getHeaderConfig(location.pathname);

  return (
    <Layout style={{
      minHeight: '100vh',
      fontFamily: "'Underdog', system-ui, Avenir, Helvetica, Arial, sans-serif"
    }}>
      {/* Desktop Sider */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="md"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          setCollapsed(broken);
        }}
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          display: collapsed ? 'none' : 'block'
        }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#fff', margin: 0 }}>{APP_CONFIG.NAME}</h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentKey]}
          items={menuItems}
          onClick={handleMenuClick}
        />
        <div style={{ position: 'absolute', bottom: 20, width: '100%', padding: '0 16px' }}>
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            block
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </Sider>

      <Layout style={{
        marginLeft: collapsed ? 0 : 200,
        transition: 'all 0.2s',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          zIndex: 99,
          width: '100%',
          boxShadow: isDarkMode ? '0 1px 0 rgba(255,255,255,0.05)' : '0 1px 0 rgba(0,0,0,0.05)',
          height: 64
        }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 12 }}>
            {config.showBack && (
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(config.backPath || '/')}
                style={{ fontSize: 18, padding: 0, width: 32 }}
              />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 'normal' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{config.title}</h3>
              {config.subtitle && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {typeof config.subtitle === 'function' ? config.subtitle() : config.subtitle}
                </Text>
              )}
            </div>
            <div style={{ flex: 1 }} />
            {config.rightIcon && (
              <Button 
                shape="circle" 
                icon={React.isValidElement(config.rightIcon) ? React.cloneElement(config.rightIcon, { spin: isSyncing }) : config.rightIcon} 
                onClick={config.onRightClick}
                type="text"
              />
            )}
          </div>
        </Header>
        <Content
          style={{
            flex: 1,
            overflowX: 'hidden',
            overflowY: 'auto',
            paddingBottom: collapsed ? 80 : 24, // Extra space for mobile bottom bar
            background: isDarkMode ? '#141414' : '#f5f5f5',
          }}
        >
          <Outlet />
        </Content>

        {/* Mobile Bottom Tabs */}
        {collapsed && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            width: '100%',
            height: 64,
            background: colorBgContainer,
            borderTop: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 1000
          }}>
            {menuItems.slice(0, 5).map(item => (
              <div
                key={item.key}
                onClick={() => handleMenuClick(item)}
                style={{
                  textAlign: 'center',
                  color: currentKey === item.key ? '#1677ff' : (isDarkMode ? '#888' : '#666'),
                  cursor: 'pointer',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div style={{ fontSize: 20 }}>{item.icon}</div>
                <div style={{ fontSize: 10 }}>{item.label}</div>
              </div>
            ))}
            <div
              onClick={() => handleMenuClick({ key: '/settings' })}
              style={{
                textAlign: 'center',
                color: currentKey === '/settings' ? '#1677ff' : (isDarkMode ? '#888' : '#666'),
                cursor: 'pointer',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div style={{ fontSize: 20 }}><SettingOutlined /></div>
              <div style={{ fontSize: 10 }}>Settings</div>
            </div>
          </div>
        )}
      </Layout>
    </Layout>
  );
};

export default MainLayout;
