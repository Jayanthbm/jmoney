// src/screens/ManageCategories.jsx
import React from 'react';
import { Button, Typography, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const ManageCategories = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/settings')} 
          />
          <Title level={4} style={{ margin: 0 }}>Manage Categories</Title>
        </Space>
        
        <div style={{ marginTop: 24 }}>
          <p>Category management functionality will be implemented here.</p>
        </div>
      </Space>
    </div>
  );
};

export default ManageCategories;
