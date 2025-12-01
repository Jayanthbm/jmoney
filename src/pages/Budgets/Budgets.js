// src/pages/Budgets/Budgets.js
import "./Budgets.css";

import { AnimatePresence, motion } from "framer-motion";
import {
  addBudgetInDb,
  deleteBudgetInDb,
  updateBudgetInDb,
} from "../../supabaseData";
import { budgetSortOptions, sortBudgets } from "./budgetUtils";
import { getCachedBudgetAmountMap, getCachedBudgets } from "../../db/budgetDb";
import {
  getCategoryCachekeys,
  getMonthOptions,
  getRelativeTime,
  getSupabaseUserIdFromLocalStorage,
  groupAndSortTransactions,
} from "../../utils";
import { useCallback, useEffect, useMemo, useState } from "react";

import AppLayout from "../../components/Layouts/AppLayout";
import BudgetForm from "./components/BudgetForm";
import BudgetInfoCard from "./components/BudgetInfoCard";
import BudgetSummary from "./components/BudgetSummary";
import Button from "../../components/Button/Button";
import { FaCircleCheck, FaCirclePlus } from "react-icons/fa6";
import InlineLoader from "../../components/Loader/InlineLoader";
import { MdSync } from "react-icons/md";
import MonthYearSelector from "../../components/Views/MonthYearSelector";
import MyModal from "../../components/Layouts/MyModal";
import MySelect from "../../components/Select/MySelect";
import TransactionsMode from "../../components/Views/TransactionsMode";
import { get } from "idb-keyval";
import { getAllTransactions } from "../../db/transactionDb";
import { useMediaQuery } from "react-responsive";

const { EXPENSE_CACHE_KEY } = getCategoryCachekeys();

const Budgets = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [viewMode, setViewMode] = useState("summary");

  const [month, setMonth] = useState({
    value: new Date().getMonth(),
    label: getMonthOptions()[new Date().getMonth()].label,
  });

  const [year, setYear] = useState({
    value: new Date().getFullYear(),
    label: new Date().getFullYear().toString(),
  });

  const [budgetMap, setBudgetMap] = useState({});
  const [budgetMapLoaded, setBudgetMapLoaded] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [orderBy, setOrderBy] = useState("name");

  const [selectedBudgetId, setSelectedBudgetId] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const [transactionTotal, setTransactionTotal] = useState(0);
  const [groupedTransactions, setGroupedTransactions] = useState({});

  const [openDialog, setOpenDialog] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleDialogOpen = (budget = null) => {
    setEditBudget(budget);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditBudget(null);
  };

  const handleSave = async (formData) => {
    if (saving) return;
    setSaving(true);
    try {
      const userId = getSupabaseUserIdFromLocalStorage();
      if (!userId) return;
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        categories: formData.categories.map((c) => c.value),
      };
      if (editBudget) {
        await updateBudgetInDb({
          ...payload,
          id: editBudget.id,
          user_id: userId,
        });
      } else {
        await addBudgetInDb(payload);
      }
      setSaving(false);
      handleDialogClose();
      setTimeout(async () => {
        await refreshData(false);
      }, 1000);
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudgetInDb(id);
      setTimeout(async () => {
        await refreshData(false);
      }, 1000);
    } catch (e) {
      console.error("Error deleting budget:", e);
    }
  };

  const loadBudgetMap = useCallback(
    async (force = false, forceBudgets = false) => {
      const map = await getCachedBudgetAmountMap(force, forceBudgets);
      setBudgetMap(map);
      setBudgetMapLoaded(true);
    },
    []
  );

  const refreshData = useCallback(
    async (force = true) => {
      setSyncing(true);
      setViewMode("summary");
      await loadBudgetMap(force, true);
      const last = localStorage.getItem(
        "budgets_amount_map_cache_last_fetched"
      );
      if (last) {
        setLastSynced(Number(last));
      } else {
        const now = Date.now();
        localStorage.setItem("budgets_amount_map_cache_last_fetched", now);
        setLastSynced(now);
      }
      setSyncing(false);
    },
    [loadBudgetMap]
  );

  const updateBudgets = useCallback(
    (budgets, selectedYear, selectedMonth, budgetMap) => {
      return budgets.map((budget) => {
        const amount = parseFloat(budget.amount);
        const spent = (budget.categories || []).reduce((total, categoryId) => {
          const key = `${selectedYear}_${selectedMonth}_${categoryId}`;
          return total + (budgetMap[key] || 0);
        }, 0);

        const percentage_spent =
          amount > 0 ? +((spent / amount) * 100).toFixed(2) : 0;
        const percentage_remaining = +(100 - percentage_spent).toFixed(2);

        return {
          ...budget,
          spent: +spent.toFixed(2),
          percentage_spent,
          percentage_remaining,
        };
      });
    },
    []
  );

  const loadBudgets = useCallback(async () => {
    setLoading(true);
    const allBudgets = await getCachedBudgets();
    const selectedYear = year.value;
    const selectedMonth = month.value;
    const updated = updateBudgets(
      allBudgets,
      selectedYear,
      selectedMonth,
      budgetMap
    );
    setBudgets(updated);

    // Also update selectedBudget if visible
    if (selectedBudgetId) {
      const current = updated.find((b) => b.id === selectedBudgetId);
      setSelectedBudget(current || null);
    }

    setLoading(false);
  }, [year, month, budgetMap, selectedBudgetId, updateBudgets]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const categories = await get(EXPENSE_CACHE_KEY);
      setCategoryOptions(
        categories?.map((cat) => ({ value: cat.id, label: cat.name })) || []
      );
      await loadBudgetMap();
      const last = localStorage.getItem(
        "budgets_amount_map_cache_last_fetched"
      );
      if (last) {
        setLastSynced(Number(last));
      } else {
        const now = Date.now();
        localStorage.setItem("budgets_amount_map_cache_last_fetched", now);
        setLastSynced(now);
      }
    };
    init();
  }, [loadBudgetMap]);

  useEffect(() => {
    if (budgetMapLoaded) {
      loadBudgets();
    }
  }, [budgetMapLoaded, year, month, budgetMap, loadBudgets]);

  const sortedBudgets = useMemo(
    () => sortBudgets(budgets, orderBy),
    [budgets, orderBy]
  );

  const onBudgetCardClick = useCallback((budget) => {
    setViewMode("info");
    setSelectedBudgetId(budget.id);
    setSelectedBudget(budget);
  }, []);

  const handleBackToSummary = () => {
    if (viewMode === "info") {
      setViewMode("summary");
      setSelectedBudget(null);
    } else {
      setViewMode("info");
    }
  };

  useEffect(() => {
    if (viewMode !== "transactions" || !selectedBudget?.categories?.length)
      return;

    let isMounted = true;

    const fetchTransactions = async () => {
      setLoading(true);
      const allTx = await getAllTransactions();
      const filtered = allTx.filter((tx) => {
        const date = new Date(tx.date);
        return (
          tx.type === "Expense" &&
          selectedBudget.categories.includes(tx.category_id) &&
          date.getMonth() === month.value &&
          date.getFullYear() === year.value
        );
      });

      if (!isMounted) return;

      setGroupedTransactions(groupAndSortTransactions(filtered));
      setTransactionTotal(filtered.reduce((sum, tx) => sum + tx.amount, 0));
      setLoading(false);
    };

    fetchTransactions();

    return () => {
      isMounted = false;
    };
  }, [viewMode, month, year, selectedBudget]);

  return (
    <>
      <AppLayout
        title={`Budgets ${selectedBudget ? "<> " + selectedBudget.name : ""} ${viewMode === "transactions" ? "<> Transactions" : ""}`}
        onRefresh={refreshData}
        onBack={viewMode === "summary" ? null : () => handleBackToSummary()}
      >
        <div className="sync-status">
          <small className="sync-time">
            {syncing ? (
              <span style={{ display: "flex", gap: 5 }}>
                <MdSync className="syncing-icon" />
                Recalculating Budget
              </span>
            ) : (
              <span style={{ display: "flex", gap: 5 }}>
                <FaCircleCheck />
                Calcualted:&nbsp;{getRelativeTime(lastSynced)}
              </span>
            )}
          </small>
        </div>
        {!loading && (
          <>
            <div className="budgets-header">
              <div className="left-buttons">
                {viewMode === "summary" && (
                  <MySelect
                    options={budgetSortOptions}
                    value={budgetSortOptions.find(
                      (opt) => opt.value === orderBy
                    )}
                    onChange={(selected) => setOrderBy(selected.value)}
                    isDisabled={loading}
                  />
                )}
              </div>
              <div className="right-controls">
                {/* Add Button */}
                {viewMode === "summary" && (
                  <Button
                    icon={<FaCirclePlus />}
                    text={isMobile ? null : "Add Budget"}
                    variant="primary"
                    onClick={() => handleDialogOpen()}
                  />
                )}
              </div>
            </div>
            {/* Month/Year Selectors */}
            <MonthYearSelector
              yearValue={year}
              onYearChange={(opt) => setYear(opt)}
              monthValue={month}
              onMonthChange={(opt) => setMonth(opt)}
              disabled={loading}
            />
          </>
        )}

        <AnimatePresence mode="wait">
          {viewMode === "summary" && (
            <BudgetSummary
              loading={loading}
              sortedBudgets={sortedBudgets}
              refreshData={refreshData}
              handleDialogOpen={handleDialogOpen}
              handleDelete={handleDelete}
              onBudgetCardClick={onBudgetCardClick}
            />
          )}
          {viewMode === "info" && selectedBudget && (
            <motion.div
              key="info"
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <BudgetInfoCard
                budget={selectedBudget}
                selectedYear={year}
                selectedMonth={month}
                onViewTransations={() => {
                  setViewMode("transactions");
                }}
              />
            </motion.div>
          )}

          {viewMode === "transactions" && (
            <>
              {loading ? (
                <InlineLoader text="Loading Transactions" />
              ) : (
                <motion.div
                  key="transactions"
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TransactionsMode
                    name={selectedBudget?.name}
                    amount={transactionTotal}
                    transactions={groupedTransactions}
                  />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </AppLayout>

      <MyModal showModal={openDialog} onClose={handleDialogClose}>
        <div
          style={{
            marginTop: 5,
            marginBottom: 10,
          }}
        >
          <h3>{editBudget ? "Edit Budget" : "Add Budget"}</h3>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <BudgetForm
            initialData={editBudget}
            onSave={handleSave}
            onCancel={handleDialogClose}
            saving={saving}
            categoryOptions={categoryOptions}
          />
        </motion.div>
      </MyModal>
    </>
  );
};

export default Budgets;
