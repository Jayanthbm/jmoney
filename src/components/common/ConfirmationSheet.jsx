// src/components/common/ConfirmationSheet.jsx
import React from 'react';
import { Drawer, Button, Typography, Space } from 'antd';
import { WarningOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ConfirmationSheet = ({ 
  open, 
  onCancel, 
  onConfirm, 
  title, 
  description, 
  confirmText = 'Confirm', 
  danger = false,
  loading = false 
}) => {
  return (
    <Drawer
      placement="bottom"
      onClose={onCancel}
      open={open}
      size="auto"
      closable={true}
      closeIcon={<CloseOutlined style={{ fontSize: 16 }} />}
      styles={{
        body: { padding: '24px 16px' },
        header: { border: 'none', padding: '16px 16px 0 16px' }
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <Space orientation="vertical" align="center" size="middle" style={{ width: '100%' }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: '50%', 
            backgroundColor: danger ? '#fff1f0' : '#e6f7ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8
          }}>
            <WarningOutlined style={{ fontSize: 24, color: danger ? '#ff4d4f' : '#1890ff' }} />
          </div>
          
          <Title level={4} style={{ margin: 0 }}>{title}</Title>
          <Text type="secondary">{description}</Text>
          
          <div style={{ width: '100%', marginTop: 24 }}>
            <Button 
              type="primary" 
              danger={danger} 
              block 
              size="large" 
              onClick={onConfirm}
              loading={loading}
              style={{ borderRadius: 12, height: 48 }}
            >
              {confirmText}
            </Button>
          </div>
        </Space>
      </div>
    </Drawer>
  );
};

export default ConfirmationSheet;
