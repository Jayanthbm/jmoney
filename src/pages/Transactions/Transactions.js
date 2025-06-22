// src/pages/Transactions/Transactions.js

import "./Transactions.css";

import { AnimatePresence, motion } from "framer-motion";
import { IoIosAddCircle, IoIosFunnel, IoIosSearch } from "react-icons/io";
import { MdClose, MdSync } from "react-icons/md";
import React, { useCallback, useEffect, useState } from "react";
import {
  clearTransactions,
  getAllTransactions,
  storeTransactions,
} from "../../db/transactionDb";
import {
  formatDateToDayMonthYear,
  getCategoryCachekeys,
  getPayeeCacheKey,
  getRelativeTime,
  getSupabaseUserIdFromLocalStorage,
  getTransactionCachekeys,
  reCalculateBudget,
  refreshOverviewCache,
} from "../../utils";

import AddTransaction from "../../components/Views/AddTransaction";
import AppLayout from "../../components/Layouts/AppLayout";
import Button from "../../components/Button/Button";
import Fuse from "fuse.js";
import MyModal from "../../components/Layouts/MyModal";
import NoDataCard from "../../components/Cards/NoDataCard";
import Select from "react-select";
import SingleTransaction from "../../components/Views/SingleTransaction";
import TransactionCard from "../../components/Cards/TransactionCard";
import { get } from "idb-keyval";
import { groupBy } from "lodash";
import { loadTransactionsFromSupabase } from "../../supabaseData";
import { useMediaQuery } from "react-responsive";

const Transactions = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
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

  const getAndSortTransactions = useCallback(async () => {
    const cached = await getAllTransactions();
    const sorted = [...cached].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    return sorted;
  }, []);

  const { INCOME_CACHE_KEY, EXPENSE_CACHE_KEY } = getCategoryCachekeys();
  const { PAYEE_CACHE_KEY } = getPayeeCacheKey();
  const { LAST_TRANSACTION_FETCH } = getTransactionCachekeys();

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const [expenseCategories, incomeCategories, cachedPayees] =
        await Promise.all([
          get(INCOME_CACHE_KEY),
          get(EXPENSE_CACHE_KEY),
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
    };

    init();
  }, [getAndSortTransactions]);

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

  const payeeOptions = payees.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const categoryOptions = [
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
  ];

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
    await reCalculateBudget();
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

      <div className="transaction-controls">
        <div className="left-buttons">
          <Button
            icon={<IoIosSearch />}
            text={isMobile ? null : "Search Transactions"}
            variant="primary"
            onClick={() => {
              setShowSearch(!showSearch);
            }}
          />
          <Button
            icon={<IoIosFunnel />}
            text={isMobile ? null : "Filter Transactions"}
            variant="primary"
            onClick={() => {
              setShowFilters(!showFilters);
            }}
          />
        </div>
        <div className="right-button">
          <Button
            icon={<IoIosAddCircle />}
            text={isMobile ? null : "Add Transaction"}
            variant="primary"
            onClick={() => {
              setSelectedTransaction(null);
              setShowModal(true);
            }}
          />
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="filters-wrapper"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSearch("");
                    }
                  }}
                >
                  <MdClose />
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    <TransactionCard
                      key={tx.id}
                      transaction={tx}
                      onCardClick={() => {
                        setSelectedTransaction(tx);
                        setShowModal(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
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
