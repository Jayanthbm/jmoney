// src/pages/Transactions/Transactions.js

import "./Transactions.css";

import { MdClose, MdSync } from "react-icons/md";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCategoryCachekeys,
  getPayeeCacheKey,
  getRelativeTime,
  getTransactionCachekeys,
  isTransactionCacheExpired,
  refreshOverviewCache,
} from "../../utils";

import AddTransaction from "../../components/Views/AddTransaction";
import AppLayout from "../../components/Layouts/AppLayout";
import Button from "../../components/Button/Button";
import Fuse from "fuse.js";
import GroupedTransactions from "./GroupedTransactions";
import MyModal from "../../components/Layouts/MyModal";
import NoDataCard from "../../components/Cards/NoDataCard";
import SingleTransaction from "../../components/Views/SingleTransaction";
import TransactionControls from "./TransactionControls";
import TransactionFilters from "./TransactionFilters";
import { get } from "idb-keyval";
import {
  getAllTransactions,
} from "../../db/transactionDb";
import { groupBy } from "lodash";
import { loadTransactionsFromSupabase } from "../../supabaseData";
import { motion } from "framer-motion";

const { INCOME_CACHE_KEY, EXPENSE_CACHE_KEY } = getCategoryCachekeys();
const { PAYEE_CACHE_KEY } = getPayeeCacheKey();
const { LAST_TRANSACTION_FETCH } = getTransactionCachekeys();

const Transactions = () => {

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [grouped, setGrouped] = useState({});
  const [hasGrouped, setHasGrouped] = useState(false);
  const [search, setSearch] = useState("");
  const [allTransactions, setAllTransactions] = useState([]);
  const [lastSynced, setLastSynced] = useState(null);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
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
        const selectedIds = selectedCategories.map((c) => c.value);
        filtered = filtered.filter((tx) =>
          selectedIds.includes(tx.category_id)
        );
      }

      if (selectedPayees.length > 0) {
        const selectedIds = selectedPayees.map((p) => p.value);
        filtered = filtered.filter((tx) => selectedIds.includes(tx.payee_id));
      }

      const groupedData = groupBy(filtered, "date");
      Object.keys(groupedData).forEach((date) => {
        groupedData[date] = groupedData[date].sort(
          (a, b) => new Date(b.transaction_timestamp) - new Date(a.transaction_timestamp)
        );
      });
      setGrouped(groupedData);
      setHasGrouped(true);
      setFadeOut(false); // turn transition off after update
    }, 150); // syncs with CSS transition duration
  }, [search, selectedCategories, selectedPayees, allTransactions]);

  const refreshData = useCallback(async () => {
    setSyncing(true);
    const fetched = await loadTransactionsFromSupabase();
    setLastSynced(Date.now());
    setAllTransactions(fetched);
    setSyncing(false);
  }, []);

  const getAndSortTransactions = useCallback(async () => {
    const cached = await getAllTransactions();
    const sorted = [...cached].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    return sorted;
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const [expenseCategories, incomeCategories, cachedPayees] =
        await Promise.all([
          get(EXPENSE_CACHE_KEY),
          get(INCOME_CACHE_KEY),
          get(PAYEE_CACHE_KEY),
        ]);
      const sorted = await getAndSortTransactions();
      setExpenseCategories(expenseCategories || []);
      setIncomeCategories(incomeCategories || []);
      setPayees(cachedPayees || []);
      setAllTransactions(sorted);
      const last = localStorage.getItem(LAST_TRANSACTION_FETCH);
      if (last) {
        setLastSynced(Number(last));
      } else {
        const now = Date.now();
        localStorage.setItem(LAST_TRANSACTION_FETCH, now);
        setLastSynced(now);
      }
      setLoading(false);
      if (isTransactionCacheExpired()) {
        refreshData();
      }
    };

    init();
  }, [getAndSortTransactions, refreshData]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      groupTransactions();
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

  const payeeOptions = useMemo(() => payees.map((p) => ({
    value: p.id, label: p.name
  })), [payees]);

  const categoryOptions = useMemo(() => [
    {
      label: "Expense Categories",
      options: (expenseCategories || []).map((cat) => ({
        value: cat.id,
        label: cat.name,
      })),
    },
    {
      label: "Income Categories",
      options: (incomeCategories || []).map((cat) => ({
        value: cat.id,
        label: cat.name,
      })),
    },
  ], [expenseCategories, incomeCategories]);

  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalFadeOut, setModalFadeOut] = useState(false);

  const closeModal = () => {
    setModalFadeOut(true);
    setTimeout(() => {
      setShowModal(false);
      setModalFadeOut(false);
    }, 200);
  };

  const handleTransactionUpdated = async () => {
    const sorted = await getAndSortTransactions();
    setAllTransactions(sorted);
    await refreshOverviewCache();
  };

  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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

      <TransactionControls
        onSearchToggle={() => setShowSearch(!showSearch)}
        showSearch={showSearch}
        onFilterToggle={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
        onAddTransaction={() => {
          setSelectedTransaction(null);
          setShowModal(true);
        }}
      />

      <TransactionFilters
        showFilters={showFilters}
        categoryOptions={categoryOptions}
        selectedCategories={selectedCategories}
        onCategoryChange={setSelectedCategories}
        payeeOptions={payeeOptions}
        selectedPayees={selectedPayees}
        onPayeeChange={setSelectedPayees}
      />

      {showSearch && (
        <motion.div
          className="search-bar-wrapper"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
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
              <span
                className="search-clear-icon"
                onClick={() => setSearch("")}
                role="button"
                tabIndex={0}
                aria-label="Clear search"
                title="Clear search"
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSearch("")}
              >
                <MdClose />
              </span>
            )}
          </div>
        </motion.div>
      )}

      {!loading && hasGrouped && Object.keys(grouped).length === 0 ? (
        <NoDataCard message="No transactions found." height="100" width="150">
          <div style={{ marginTop: "2px" }}>
            <Button
              icon={<MdClose />}
              text="Clear Filters"
              variant="danger"
              onClick={clearFilters}
            />
          </div>
        </NoDataCard>
      ) : (
        !loading &&
        hasGrouped && (
          <GroupedTransactions
            grouped={grouped}
            fadeOut={fadeOut}
            onTransactionClick={(tx) => {
              setSelectedTransaction(tx);
              setShowModal(true);
            }}
          />
        )
      )}
      <MyModal
        showModal={showModal}
        modalFadeOut={modalFadeOut}
        onClose={() => setShowModal(false)}
      >
        {selectedTransaction === null ? (
          <AddTransaction
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
            payees={[
              {
                id: null,
                name: "None",
              },
              ...payees,
            ]}
            onClose={() => setShowModal(false)}
            onTransactionAdded={handleTransactionUpdated}
          />
        ) : (
          <SingleTransaction
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
            payees={[
              {
                id: null,
                name: "None",
              },
              ...payees,
            ]}
            transaction={selectedTransaction}
            onClose={closeModal}
            onTransactionUpdated={handleTransactionUpdated}
          />
        )}
      </MyModal>
    </AppLayout>
  );
};

export default Transactions;
