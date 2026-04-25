// src/components/transactions/TransactionCard.jsx
import React from 'react';
import { Card, Typography, theme, Button, Space } from 'antd';
import {
  EnvironmentOutlined,
  LinkOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { formatCurrency } from '../../utils/formatters';
import CategoryIcon from '../common/CategoryIcon';
import CachedImage from '../common/CachedImage';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const TransactionCard = ({ transaction, onEdit }) => {
  const { token } = theme.useToken();
  const isExpense = transaction?.type.toLowerCase() === 'expense';

  const handleLocationClick = (e) => {
    e.stopPropagation();
    if (transaction.latitude && transaction.longitude) {
      window.open(`https://www.google.com/maps?q=${transaction.latitude},${transaction.longitude}`, '_blank');
    }
  };

  const handleLinkClick = (e) => {
    e.stopPropagation();
    if (transaction.product_link) {
      window.open(transaction.product_link, '_blank');
    }
  };

  return (
    <Card
      hoverable
      size="small"
      style={{
        marginBottom: 8,
        borderRadius: 12,
        border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        cursor: 'pointer'
      }}
      styles={{ body: { padding: '12px 16px' } }}
      onClick={() => onEdit(transaction)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <CategoryIcon
          iconName={transaction.category_icon}
          appIcon={transaction.category_app_icon}
          size={44}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text strong style={{ fontSize: 16, display: 'block', lineHeight: 1.2 }} ellipsis>
                {transaction.category_name || 'Uncategorized'}
              </Text>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }} ellipsis>
                {transaction.description || (transaction.payee_name ? transaction.payee_name : '')}
              </Text>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                {dayjs(transaction.transaction_timestamp || transaction.date).format('DD MMM, YYYY · HH:mm')}
              </Text>
            </div>

            <Text
              strong
              style={{
                fontSize: 17,
                color: isExpense ? token.colorError : token.colorSuccess,
                marginLeft: 8,
                whiteSpace: 'nowrap'
              }}
            >
              {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
            </Text>
          </div>

          {(transaction.latitude || transaction.product_link || transaction.payee_name) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                {transaction.payee_logo && (
                  <CachedImage
                    src={transaction.payee_logo}
                    style={{ width: 18, height: 18, borderRadius: 4 }}
                  />
                )}
                {transaction.payee_name && (
                  <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                    {transaction.payee_name}
                  </Text>
                )}
              </div>

              <Space size={12}>
                {transaction.latitude && transaction.longitude && (
                  <Button
                    type="text"
                    icon={<EnvironmentOutlined style={{ fontSize: 16 }} />}
                    size="small"
                    style={{ padding: 0, height: 'auto', color: token.colorPrimary }}
                    onClick={handleLocationClick}
                  />
                )}
                {transaction.product_link && (
                  <Button
                    type="text"
                    icon={<LinkOutlined style={{ fontSize: 16 }} />}
                    size="small"
                    style={{ padding: 0, height: 'auto', color: token.colorPrimary }}
                    onClick={handleLinkClick}
                  />
                )}
              </Space>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TransactionCard;
