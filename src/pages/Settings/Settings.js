import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { get, set } from "idb-keyval";
import * as MdIcons from "react-icons/md";

import AppLayout from "../../components/Layouts/AppLayout";

import { getRelativeTime } from "../../utils";

import "./Settings.css";

const CACHE_KEYS = {
  income: "settings-income-categories",
  expense: "settings-expense-categories",
  payees: "settings-payees",
};

const LAST_REFRESHED_KEY = "settings-last-refreshed";

const Settings = () => {
  const [categoryType, setCategoryType] = useState("Expense");
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [payees, setPayees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  const fetchIfMissing = async (key, fetcher) => {
    const cached = await get(key);
    if (cached && cached.length > 0) return cached;
    const fresh = await fetcher();
    await set(key, fresh);
    return fresh;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [expense, income, payeeList] = await Promise.all([
      fetchIfMissing(CACHE_KEYS.expense, async () => {
        const { data } = await supabase
          .from("categories")
          .select("*")
          .eq("type", "Expense")
          .order("name", { ascending: true });
        return data || [];
      }),
      fetchIfMissing(CACHE_KEYS.income, async () => {
        const { data } = await supabase
          .from("categories")
          .select("*")
          .eq("type", "Income")
          .order("name", { ascending: true });
        return data || [];
      }),
      fetchIfMissing(CACHE_KEYS.payees, async () => {
        const { data } = await supabase
          .from("payees")
          .select("*")
          .order("name", { ascending: true });
        return data || [];
      }),
    ]);

    setExpenseCategories(expense);
    setIncomeCategories(income);
    setPayees(payeeList);

    const last = localStorage.getItem(LAST_REFRESHED_KEY);
    if (last) setLastSynced(Number(last));

    setLoading(false);
  }, []);

  const refreshData = useCallback(async () => {
    setSyncing(true);

    const [expenseData, incomeData, payeeData] = await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("type", "Expense")
        .order("name", { ascending: true }),
      supabase
        .from("categories")
        .select("*")
        .eq("type", "Income")
        .order("name", { ascending: true }),
      supabase.from("payees").select("*").order("name", { ascending: true }),
    ]);

    const expense = expenseData.data || [];
    const income = incomeData.data || [];
    const payees = payeeData.data || [];

    await set(CACHE_KEYS.expense, expense);
    await set(CACHE_KEYS.income, income);
    await set(CACHE_KEYS.payees, payees);

    setExpenseCategories(expense);
    setIncomeCategories(income);
    setPayees(payees);

    const now = Date.now();
    localStorage.setItem(LAST_REFRESHED_KEY, now);
    setLastSynced(now);

    setSyncing(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const categoriesToShow =
    categoryType === "Expense" ? expenseCategories : incomeCategories;

  const renderIcon = (iconName) => {
    const Icon = MdIcons[iconName];
    return Icon ? <Icon size={16} style={{ marginRight: 8 }} /> : null;
  };

  return (
    <AppLayout title="Settings" loading={loading} onRefresh={refreshData}>
      <div className="sync-status">
        {lastSynced && (
          <small className="sync-time">
            {syncing && <MdIcons.MdSync className="syncing-icon" />} Last
            synced: {getRelativeTime(lastSynced)}
          </small>
        )}
      </div>
      <div className="settings-wrapper">
        {/* Categories */}
        <div className="settings-section">
          <div className="settings-header">
            <h2>Categories</h2>
            <div className="category-toggle">
              <button
                className={categoryType === "Expense" ? "active" : ""}
                onClick={() => setCategoryType("Expense")}
              >
                Expense
              </button>
              <button
                className={categoryType === "Income" ? "active" : ""}
                onClick={() => setCategoryType("Income")}
              >
                Income
              </button>
            </div>
          </div>
          <div className="category-grid">
            {categoriesToShow.map((category) => (
              <div className="category-card" key={category.id}>
                {renderIcon(category.icon)}
                <span>{category.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payees */}
        <div className="settings-section">
          <h2>Payees</h2>
          <div className="payee-grid">
            {payees.map((payee) => (
              <div className="payee-card" key={payee.id}>
                <img src={payee.logo} alt={payee.name} className="payee-logo" />
                <div className="payee-name">{payee.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
