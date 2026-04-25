// src/services/transactionService.js
import db from '../db/db';
import { format } from 'date-fns';

export const fetchTransactions = async ({
  userId,
  search = '',
  selectedCats = [],
  selectedPayees = [],
  startDate = null,
  endDate = null,
  page = 1,
  pageSize = 30,
}) => {
  if (!userId) return { listData: [], totalFiltered: 0, stickyHeaderIndices: [], hasMore: false };

  let collection = db.transactions
    .where('user_id').equals(userId)
    .filter(tx => tx.deleted !== 1);

  // Apply search
  if (search) {
    const searchLower = search.toLowerCase();
    collection = collection.filter(tx =>
      (tx.description && tx.description.toLowerCase().includes(searchLower)) ||
      (tx.payee_name && tx.payee_name.toLowerCase().includes(searchLower)) ||
      (tx.category_name && tx.category_name.toLowerCase().includes(searchLower))
    );
  }

  // Apply filters
  if (selectedCats.length > 0) {
    collection = collection.filter(tx => selectedCats.includes(tx.category_id));
  }
  if (selectedPayees.length > 0) {
    collection = collection.filter(tx => selectedPayees.includes(tx.payee_id));
  }
  if (startDate) {
    collection = collection.filter(tx => tx.date >= startDate);
  }
  if (endDate) {
    collection = collection.filter(tx => tx.date <= endDate);
  }

  // Calculate total filtered amount and count before pagination
  const allFiltered = await collection.toArray();
  const totalFiltered = allFiltered.reduce((sum, tx) => {
    const isExpense = tx.type?.toLowerCase() === 'expense';
    return sum + (isExpense ? -Math.abs(tx.amount) : Math.abs(tx.amount));
  }, 0);
  const totalCount = allFiltered.length;

  // Manual sorting and pagination
  const sortedTransactions = allFiltered.sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at));

  const offset = (page - 1) * pageSize;
  const paginatedTransactions = sortedTransactions.slice(offset, offset + pageSize);
  const hasMore = totalCount > offset + paginatedTransactions.length;

  // Multi-column grouping logic (Optimized O(N))
  const listData = [];
  const stickyHeaderIndices = [];
  const dateTotals = {};

  // Calculate daily totals for the currently visible set based on all filtered data
  allFiltered.forEach(tx => {
    const isExpense = tx.type?.toLowerCase() === 'expense';
    const txTotal = isExpense ? -Math.abs(tx.amount) : Math.abs(tx.amount);
    dateTotals[tx.date] = (dateTotals[tx.date] || 0) + txTotal;
  });

  // Build the list with headers for the paginated set
  let currentDate = null;
  paginatedTransactions.forEach((tx) => {
    if (tx.date !== currentDate) {
      currentDate = tx.date;
      stickyHeaderIndices.push(listData.length);
      listData.push({
        itemType: 'header',
        date: tx.date,
        total: dateTotals[tx.date],
        id: `h-${tx.date}`
      });
    }
    listData.push({ ...tx, itemType: 'transaction' });
  });

  return { listData, totalFiltered, stickyHeaderIndices, hasMore };
};

export const fetchTransactionFilterData = async (userId) => {
  if (!userId) return { categories: [], payees: [] };
  const categories = await db.categories.where('user_id').equals(userId).toArray();
  const payees = await db.payees.where('user_id').equals(userId).toArray();
  return { categories, payees };
};

export const deleteTransactionAsync = async (transactionId, userId) => {
  if (!transactionId || !userId) return;

  await db.transactions.update(transactionId, {
    deleted: 1,
    sync_status: 'pending',
    updated_at: new Date().toISOString()
  });

  // Trigger sync in background if needed
  window.dispatchEvent(new CustomEvent('trigger-sync-transactions'));
};

export const saveTransactionAsync = async (transaction, userId) => {
  const isUpdate = !!transaction.id;
  const now = new Date().toISOString();

  const txData = {
    ...transaction,
    user_id: userId,
    sync_status: 'pending',
    updated_at: now,
    deleted: 0
  };

  if (!isUpdate) {
    txData.id = crypto.randomUUID();
    txData.created_at = now;
    await db.transactions.add(txData);
  } else {
    await db.transactions.put(txData);
  }

  window.dispatchEvent(new CustomEvent('trigger-sync-transactions'));
  return txData;
};

export const fetchStatsBreakdown = async (userId, selectedCats, selectedPayees, search) => {
  // Simple implementation for stats breakdown
  const { listData } = await fetchTransactions({ userId, selectedCats, selectedPayees, search });
  const transactions = listData.filter(item => item.itemType === 'transaction');

  // Group by month
  const storage = {};
  transactions.forEach(tx => {
    const month = tx.date.substring(0, 7); // YYYY-MM
    if (!storage[month]) {
      storage[month] = { month, income: 0, expense: 0, total: 0 };
    }
    const val = Math.abs(tx.amount);
    if (tx.type === 'expense') {
      storage[month].expense += val;
      storage[month].total -= val;
    } else {
      storage[month].income += val;
      storage[month].total += val;
    }
  });

  return Object.values(storage).sort((a, b) => b.month.localeCompare(a.month));
};
