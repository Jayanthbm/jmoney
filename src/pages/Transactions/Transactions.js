// src/pages/Transactions/Transactions.js

import React, { useEffect, useState, useCallback } from "react";
import { get } from "idb-keyval";
import { MdSync, MdClose } from "react-icons/md";
import { groupBy } from "lodash";
import Fuse from "fuse.js";
import Select from "react-select";
import AppLayout from "../../components/Layouts/AppLayout";
import Button from "../../components/Button/Button";
import TransactionCard from "../../components/Cards/TransactionCard";
import {
  storeTransactions,
  getAllTransactions,
  clearTransactions,
} from "../../db";
import {
  formatDateToDayMonthYear,
  getRelativeTime,
  getSupabaseUserIdFromLocalStorage,
} from "../../utils";
import { loadTransactionsFromSupabase } from "../../supabaseData";
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

  const [fadeOut, setFadeOut] = useState(false);

  const groupTransactions = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => {
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
        filtered = filtered.filter((tx) =>
          selectedNames.includes(tx.payee_name)
        );
      }

      const groupedData = groupBy(filtered, "date");
      setGrouped(groupedData);
      setHasGrouped(true);
      setFadeOut(false); // turn transition off after update
    }, 150); // syncs with CSS transition duration
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
      const userId = getSupabaseUserIdFromLocalStorage();
      const [cached, expenseCategories, incomeCategories, cachedPayees] =
        await Promise.all([
          getAllTransactions(),
          get(`${userId}_settings-expense-categories`),
          get(`${userId}_settings-income-categories`),
          get(`${userId}_settings-payees`),
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
      const last = localStorage.getItem(userId + "_last_transaction_fetch");
      if (last) {
        setLastSynced(Number(last));
      } else {
        const now = Date.now();
        localStorage.setItem(userId + "_last_transaction_fetch", now);
        setLastSynced(now);
      }
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
        <div className={`no-data-card ${fadeOut ? "fade-out" : ""}`}>
          <p>No transactions found.</p>
          <Button
            icon={<MdClose />}
            text="Clear Filters"
            variant="danger"
            onClick={clearFilters}
          />
        </div>
      ) : (
        !loading &&
        hasGrouped && (
          <div
            className={`transaction-page-wrapper ${fadeOut ? "fade-out" : ""}`}
          >
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date} className="transaction-group">
                <h2 className="transaction-date-header">
                  {formatDateToDayMonthYear(date)}
                </h2>
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
