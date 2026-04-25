// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { Layout, Menu, Button, Drawer, theme } from 'antd';
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
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { APP_CONFIG } from '../../constants';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  
  const {
    token: { colorBgContainer, borderRadiusLG, colorBgLayout },
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
        breakpoint="md" // Hide on mobile/tablet
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
        marginBottom: collapsed ? 64 : 0 // Space for bottom tabs on mobile
      }}>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer, 
          display: 'flex', 
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          width: '100%'
        }}>
          <h3 style={{ margin: 0 }}>{menuItems.find(i => i.key === currentKey)?.label}</h3>
          <div style={{ flex: 1 }} />
        </Header>
        <Content
          style={{
            minHeight: 280,
            overflow: 'auto',
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
            {/* Settings as the last tab */}
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
