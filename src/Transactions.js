import React, { useEffect, useState, useCallback } from "react";
import AppLayout from "./components/AppLayout";
import { MdSync, MdClose } from "react-icons/md";
import { groupBy } from "lodash";
import Fuse from "fuse.js";
import Select from "react-select";
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
  const [hasGrouped, setHasGrouped] = useState(false);
  const [search, setSearch] = useState("");
  const [allTransactions, setAllTransactions] = useState([]);
  const [lastSynced, setLastSynced] = useState(null);

  const [categories, setCategories] = useState([]);
  const [payees, setPayees] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPayees, setSelectedPayees] = useState([]);

  const groupTransactions = useCallback(() => {
    let filtered = [...allTransactions];

    if (search.trim()) {
      const fuse = new Fuse(filtered, {
        keys: ["description"],
        threshold: 0.3,
      });
      filtered = fuse.search(search.trim()).map((result) => result.item);
    }

    if (selectedCategories.length > 0) {
      const selectedNames = selectedCategories.map((c) => c.value);
      filtered = filtered.filter((tx) =>
        selectedNames.includes(tx.category_name)
      );
    }

    if (selectedPayees.length > 0) {
      const selectedNames = selectedPayees.map((p) => p.value);
      filtered = filtered.filter((tx) => selectedNames.includes(tx.payee_name));
    }

    const groupedData = groupBy(filtered, "date");
    setGrouped(groupedData);
  }, [search, selectedCategories, selectedPayees, allTransactions]);

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
      setHasGrouped(true);
    }, 250);
    return () => clearTimeout(debounce);
  }, [
    search,
    selectedCategories,
    selectedPayees,
    allTransactions,
    groupTransactions,
  ]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedPayees([]);
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.name,
    label: cat.name,
  }));

  const payeeOptions = payees.map((p) => ({
    value: p.name,
    label: p.name,
  }));

  return (
    <AppLayout
      title="Transactions"
      loading={loading || !hasGrouped}
      onRefresh={refreshData}
    >
      <div className="sync-status">
        {lastSynced && (
          <small className="sync-time">
            {syncing && <MdSync className="syncing-icon" />} Last synced:{" "}
            {getRelativeTime(lastSynced)}
          </small>
        )}
      </div>

      <div className="filters-wrapper">
        <Select
          isMulti
          options={categoryOptions}
          value={selectedCategories}
          onChange={(selected) => setSelectedCategories(selected)}
          placeholder="Filter by Categories"
          className="react-select-container"
          classNamePrefix="react-select"
        />

        <Select
          isMulti
          options={payeeOptions}
          value={selectedPayees}
          onChange={(selected) => setSelectedPayees(selected)}
          placeholder="Filter by Payees"
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      <div className="search-bar-wrapper">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search by description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
            spellCheck={false}
          />
          {search && (
            <span className="search-clear-icon" onClick={() => setSearch("")}>
              <MdClose />
            </span>
          )}
        </div>
      </div>

      {!loading && hasGrouped && Object.keys(grouped).length === 0 ? (
        <div className="no-data-card">
          <p>No transactions found.</p>
          <button onClick={clearFilters} className="clear-filters-button">
            Clear Filters
          </button>
        </div>
      ) : (
        !loading &&
        hasGrouped && (
          <div className="transaction-page-wrapper">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date} className="transaction-group">
                <h2 className="transaction-date-header">{date}</h2>
                <div className="transaction-card-list">
                  {items.map((tx) => (
                    <TransactionCard key={tx.id} transaction={tx} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </AppLayout>
  );
};

export default Transactions;
