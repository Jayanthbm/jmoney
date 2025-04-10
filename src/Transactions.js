import React, { useEffect, useState, useCallback } from "react";
import AppLayout from "./components/AppLayout";
import { MdSync } from "react-icons/md";
import { groupBy } from "lodash";
import Fuse from "fuse.js";
import TransactionCard from "./components/TransactionCard";
import { storeTransactions, getAllTransactions, clearTransactions } from "./db";
import "./Transactions.css";
import { getRelativeTime } from "./utils";
import { loadTransactionsFromSupabase } from "./supabaseData";

const Transactions = () => {
  const [loading, setLoading] = useState(true); // for initial load
  const [syncing, setSyncing] = useState(false); // for refreshes only
  const [grouped, setGrouped] = useState({});
  const [search, setSearch] = useState("");
  const [allTransactions, setAllTransactions] = useState([]);
  const [lastSynced, setLastSynced] = useState(null);

  const groupTransactions = useCallback(
    (data) => {
      const term = search.trim().toLowerCase();

      let filtered = data;

      if (term) {
        const fuse = new Fuse(data, {
          keys: ["description", "category_name", "payee_name"],
          threshold: 0.3,
          includeScore: true,
        });

        filtered = fuse.search(term).map((result) => result.item);
      }

      const groupedData = groupBy(filtered, "date");
      setGrouped(groupedData);
    },
    [search]
  );

  const refreshData = useCallback(
    async (showSyncing = true) => {
      if (showSyncing) setSyncing(true);

      await clearTransactions();
      const fetched = await loadTransactionsFromSupabase();
      await storeTransactions(fetched);
      const now = Date.now();
      localStorage.setItem("last_transaction_fetch", now);
      setLastSynced(now);
      setAllTransactions(fetched);
      groupTransactions(fetched);

      if (showSyncing) setSyncing(false);
    },
    [groupTransactions]
  );

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const cached = await getAllTransactions();

      // Sort cached data by date descending
      const sorted = [...cached].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      const lastFetch = localStorage.getItem("last_transaction_fetch");
      const oneDay = 24 * 60 * 60 * 1000;

      if (sorted.length === 0) {
        const fetched = await loadTransactionsFromSupabase();
        await storeTransactions(fetched);
        const now = Date.now();
        localStorage.setItem("last_transaction_fetch", now);
        setLastSynced(now);
        setAllTransactions(fetched);
        groupTransactions(fetched);
      } else {
        setAllTransactions(sorted);
        groupTransactions(sorted);

        if (lastFetch) setLastSynced(Number(lastFetch));

        if (!lastFetch || Date.now() - Number(lastFetch) > oneDay) {
          refreshData(false); // Background sync
        }
      }

      setLoading(false);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Debounce search
    const debounce = setTimeout(() => {
      groupTransactions(allTransactions);
    }, 250); // Slightly faster

    return () => clearTimeout(debounce);
  }, [search, allTransactions, groupTransactions]);

  const handleCategoryClick = (category) => {
    setSearch(category);
  };

  const handlePayeeClick = (payee) => {
    setSearch(payee);
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
            {syncing && <MdSync className="syncing-icon" />} Last synced:{" "}
            {getRelativeTime(lastSynced)}
          </small>
        )}
      </div>
      <div className="search-bar-wrapper">
        <input
          type="text"
          placeholder="Search by description, category or payee"
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

      <div className="transaction-page-wrapper">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="transaction-group">
            <h2 className="transaction-date-header">{date}</h2>
            <div className="transaction-card-list">
              {items.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  onCategoryClick={() => handleCategoryClick(tx.category_name)}
                  onPayeeClick={() => handlePayeeClick(tx.payee_name)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default Transactions;
