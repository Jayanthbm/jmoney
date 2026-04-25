// src/components/transactions/TransactionSectionHeader.jsx
import React from 'react';
import { Typography, theme } from 'antd';
import { formatTransactionDate, formatCurrency } from '../../utils/formatters';

const { Text } = Typography;

const TransactionSectionHeader = ({ date, total }) => {
  const { token } = theme.useToken();
  const isPositive = total >= 0;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 4px 8px 4px',
        backgroundColor: 'transparent',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Text strong style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', color: token.colorTextSecondary }}>
        {formatTransactionDate(date)}
      </Text>
      <Text strong style={{ fontSize: 13, color: isPositive ? token.colorSuccess : token.colorTextSecondary }}>
        {isPositive ? '+' : ''}{formatCurrency(total)}
      </Text>
    </div>
  );
};

export default TransactionSectionHeader;
