// Transactions.js

import React, { useEffect, useState, useCallback } from "react";
import AppLayout from "./components/AppLayout";
import { MdSync } from "react-icons/md";
import { groupBy } from "lodash";
import Fuse from "fuse.js";
import { get } from "idb-keyval";

import TransactionCard from "./components/TransactionCard";
import { storeTransactions, getAllTransactions, clearTransactions } from "./db";
import { getRelativeTime } from "./utils";
import { loadTransactionsFromSupabase } from "./supabaseData";

import "./Transactions.css";

const Transactions = () => {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [grouped, setGrouped] = useState({});
  const [search, setSearch] = useState("");
  const [allTransactions, setAllTransactions] = useState([]);
  const [lastSynced, setLastSynced] = useState(null);

  const [categories, setCategories] = useState([]);
  const [payees, setPayees] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPayee, setSelectedPayee] = useState("");

  const groupTransactions = useCallback(() => {
    let filtered = [...allTransactions];

    if (search.trim()) {
      const fuse = new Fuse(filtered, {
        keys: ["description"],
        threshold: 0.3,
      });
      filtered = fuse.search(search.trim()).map((result) => result.item);
    }

    if (selectedCategory) {
      filtered = filtered.filter((tx) => tx.category_name === selectedCategory);
    }

    if (selectedPayee) {
      filtered = filtered.filter((tx) => tx.payee_name === selectedPayee);
    }

    const groupedData = groupBy(filtered, "date");
    setGrouped(groupedData);
  }, [search, selectedCategory, selectedPayee, allTransactions]);

  const refreshData = useCallback(async () => {
    setSyncing(true);
    await clearTransactions();
    const fetched = await loadTransactionsFromSupabase();
    await storeTransactions(fetched);
    setLastSynced(Date.now());
    setAllTransactions(fetched);
    setSyncing(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const [cached, expenseCategories, incomeCategories, cachedPayees] =
        await Promise.all([
          getAllTransactions(),
          get("settings-expense-categories"),
          get("settings-income-categories"),
          get("settings-payees"),
        ]);

      const sorted = [...cached].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setCategories([
        ...(expenseCategories || []),
        ...(incomeCategories || []),
      ]);
      setPayees(cachedPayees || []);
      setAllTransactions(sorted);
      setLastSynced(localStorage.getItem("last_transaction_fetch"));
      setLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      groupTransactions();
    }, 250);
    return () => clearTimeout(debounce);
  }, [
    search,
    selectedCategory,
    selectedPayee,
    allTransactions,
    groupTransactions,
  ]);

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const handlePayeeClick = (payeeName) => {
    setSelectedPayee(payeeName);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedPayee("");
  };

  return (
    <AppLayout
      title="Transactions"
      loading={loading}
      onRefresh={() => refreshData(true)}
    >
      <div className="sync-status">
        {lastSynced && (
          <small className="sync-time">
            {syncing && <MdSync className="syncing-icon" />} Last synced: 
            {getRelativeTime(lastSynced)}
          </small>
        )}
      </div>
      <div className="filters-wrapper">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={selectedPayee}
          onChange={(e) => setSelectedPayee(e.target.value)}
        >
          <option value="">All Payees</option>
          {payees.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>

        <button onClick={clearFilters} className="clear-filters-button">
          Clear Filters
        </button>
      </div>

      <div className="search-bar-wrapper">
        <input
          type="text"
          placeholder="Search by description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
          autoFocus
          spellCheck={false}
        />
        {search && (
          <button className="clear-search-button" onClick={() => setSearch("")}>
            Clear
          </button>
        )}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="no-data-card">
          <p>No transactions found.</p>
          <button onClick={clearFilters} className="clear-filters-button">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="transaction-page-wrapper">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="transaction-group">
              <h2 className="transaction-date-header">{date}</h2>
              <div className="transaction-card-list">
                {items.map((tx) => (
                  <TransactionCard
                    key={tx.id}
                    transaction={tx}
                    onCategoryClick={() =>
                      handleCategoryClick(tx.category_name)
                    }
                    onPayeeClick={() => handlePayeeClick(tx.payee_name)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Transactions;
