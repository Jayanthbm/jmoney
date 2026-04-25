import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Input, 
  Button, 
  Typography, 
  Tag, 
  Empty, 
  theme, 
  Spin, 
  FloatButton,
  Space 
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  FilterOutlined, 
  CloseOutlined,
  DownOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { 
  fetchTransactions, 
  fetchTransactionFilterData, 
  deleteTransactionAsync,
  saveTransactionAsync
} from '../services/transactionService';
import TransactionCard from '../components/transactions/TransactionCard';
import TransactionSectionHeader from '../components/transactions/TransactionSectionHeader';
import TransactionFilterSheet from '../components/transactions/TransactionFilterSheet';
import AddTransactionSheet from '../components/common/AddTransactionSheet';
import { formatCurrency } from '../utils/formatters';

const { Title, Text } = Typography;

const Transactions = () => {
  const { user } = useAuth();
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(true);
  const [listData, setListData] = useState([]);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  
  // Filters state
  const [selectedCats, setSelectedCats] = useState([]);
  const [selectedPayees, setSelectedPayees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [payees, setPayees] = useState([]);
  
  // UI Controls
  const [filterType, setFilterType] = useState(null); // 'Category' or 'Payee'
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const loadData = useCallback(async (pageNum = 1, isAppend = false) => {
    if (!user?.id) return;
    if (isAppend) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const { listData: data, totalFiltered: total, hasMore: more } = await fetchTransactions({
        userId: user.id,
        search: debouncedSearch,
        selectedCats,
        selectedPayees,
        page: pageNum,
        pageSize: 40
      });

      if (isAppend) {
        // Special logic to handle headers when appending
        setListData(prev => {
          const lastHeader = [...prev].reverse().find(item => item.itemType === 'header');
          const firstItemIsHeader = data[0]?.itemType === 'header';
          
          if (firstItemIsHeader && lastHeader && data[0].date === lastHeader.date) {
            // Remove the duplicate header from the new data
            return [...prev, ...data.slice(1)];
          }
          return [...prev, ...data];
        });
      } else {
        setListData(data);
      }
      
      setTotalFiltered(total);
      setHasMore(more);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user, debouncedSearch, selectedCats, selectedPayees]);

  const loadFilters = useCallback(async () => {
    if (!user?.id) return;
    const { categories: cats, payees: p } = await fetchTransactionFilterData(user.id);
    setCategories(cats);
    setPayees(p);
  }, [user]);

  // Initial load or filter change
  useEffect(() => {
    loadData(1, false);
  }, [user, debouncedSearch, selectedCats, selectedPayees, loadData]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      loadData(page + 1, true);
    }
  };

  useEffect(() => {
    loadFilters();
    
    // Listen for sync events to refresh
    const handleSync = () => loadData(1, false);
    window.addEventListener('trigger-sync-transactions', handleSync);
    return () => window.removeEventListener('trigger-sync-transactions', handleSync);
  }, [loadFilters, loadData]);

  const handleDelete = async (id) => {
    if (!user?.id) return;
    await deleteTransactionAsync(id, user.id);
    loadData(1, false);
  };

  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setIsAddSheetOpen(true);
  };

  const handleSave = async (txData) => {
    if (!user?.id) return;
    await saveTransactionAsync(txData, user.id);
    loadData(1, false);
  };

  const clearFilter = (type) => {
    if (type === 'Category') setSelectedCats([]);
    if (type === 'Payee') setSelectedPayees([]);
  };

  const hasActiveFilters = selectedCats.length > 0 || selectedPayees.length > 0;

  return (
    <div style={{ padding: '16px 16px 80px' }}>
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search items, shops, categories..."
          prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
          size="large"
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
          style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        <Button
          shape="round"
          icon={<FilterOutlined />}
          style={{ 
            backgroundColor: selectedCats.length > 0 ? token.colorPrimaryBg : token.colorBgContainer,
            color: selectedCats.length > 0 ? token.colorPrimary : token.colorTextSecondary,
            borderColor: selectedCats.length > 0 ? token.colorPrimary : token.colorBorderSecondary,
            display: 'flex',
            alignItems: 'center',
            fontWeight: 500,
            fontSize: 13
          }}
          onClick={() => setFilterType('Category')}
        >
          {selectedCats.length > 0 ? `${selectedCats.length} Mixed` : 'Categories'}
          <DownOutlined style={{ fontSize: 10, marginLeft: 6 }} />
        </Button>

        <Button
          shape="round"
          icon={<FilterOutlined />}
          style={{ 
            backgroundColor: selectedPayees.length > 0 ? token.colorPrimaryBg : token.colorBgContainer,
            color: selectedPayees.length > 0 ? token.colorPrimary : token.colorTextSecondary,
            borderColor: selectedPayees.length > 0 ? token.colorPrimary : token.colorBorderSecondary,
            display: 'flex',
            alignItems: 'center',
            fontWeight: 500,
            fontSize: 13
          }}
          onClick={() => setFilterType('Payee')}
        >
          {selectedPayees.length > 0 ? `${selectedPayees.length} Payees` : 'Payees'}
          <DownOutlined style={{ fontSize: 10, marginLeft: 6 }} />
        </Button>
      </div>

      {hasActiveFilters && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <div style={{ 
            backgroundColor: token.colorBgContainer, 
            padding: '8px 16px', 
            borderRadius: 14, 
            border: `1px solid ${totalFiltered >= 0 ? token.colorSuccess + '40' : token.colorError + '40'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <Text strong style={{ 
              color: totalFiltered >= 0 ? token.colorSuccess : token.colorError,
              fontSize: 15
            }}>
              {totalFiltered >= 0 ? '+' : ''}{formatCurrency(totalFiltered)}
            </Text>
          </div>
        </div>
      )}

      {loading && listData.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Spin size="large" description="Loading transactions..." />
        </div>
      ) : listData.length > 0 ? (
        <div>
          {listData.map((item, index) => {
            if (item.itemType === 'header') {
              return <TransactionSectionHeader key={item.id} date={item.date} total={item.total} />;
            }
            return (
              <TransactionCard 
                key={item.id} 
                transaction={item} 
                onEdit={handleEdit} 
              />
            );
          })}
          
          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
              <Button 
                onClick={handleLoadMore} 
                loading={loadingMore}
                shape="round" 
                style={{ minWidth: 120 }}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          description={search ? "No matches found" : "No transactions yet"}
          style={{ marginTop: 60 }}
        >
          {!search && (
            <Button type="primary" shape="round" icon={<PlusOutlined />} onClick={() => { setEditingTransaction(null); setIsAddSheetOpen(true); }}>
              Add First Transaction
            </Button>
          )}
        </Empty>
      )}

      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        style={{ right: 24, bottom: 80 }}
        onClick={() => {
          setEditingTransaction(null);
          setIsAddSheetOpen(true);
        }}
      />

      <TransactionFilterSheet
        open={!!filterType}
        onClose={() => setFilterType(null)}
        type={filterType}
        title={filterType === 'Category' ? 'Categories' : 'Payees'}
        items={filterType === 'Category' ? categories : payees}
        selectedItems={filterType === 'Category' ? selectedCats : selectedPayees}
        onApply={(selected) => {
          if (filterType === 'Category') setSelectedCats(selected);
          if (filterType === 'Payee') setSelectedPayees(selected);
        }}
      />

      <AddTransactionSheet
        open={isAddSheetOpen}
        onCancel={() => {
          setIsAddSheetOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSave}
        initialValues={editingTransaction}
      />
    </div>
  );
};

export default Transactions;
