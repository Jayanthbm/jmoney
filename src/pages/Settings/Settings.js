// src/pages/Settings/Settings.js

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { get, set } from "idb-keyval";
import * as MdIcons from "react-icons/md";
import AppLayout from "../../components/Layouts/AppLayout";
import {
  getRelativeTime,
  getSupabaseUserIdFromLocalStorage,
} from "../../utils";
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

  const getVisibleLimit = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) return 6; // Mobile
    if (width < 1024) return 9; // Tablet
    return 12;
  }, []);

  const [visibleLimit, setVisibleLimit] = useState(getVisibleLimit());

  useEffect(() => {
    const handleResize = () => {
      setVisibleLimit(getVisibleLimit());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getVisibleLimit]);

  const categoriesToShow =
    categoryType === "Expense" ? expenseCategories : incomeCategories;

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllPayees, setShowAllPayees] = useState(false);

  const visibleCategories = showAllCategories
    ? categoriesToShow
    : categoriesToShow.slice(0, visibleLimit);

  const visiblePayees = showAllPayees ? payees : payees.slice(0, visibleLimit);

  const fetchIfMissing = async (key, fetcher) => {
    const cached = await get(key);
    if (cached && cached.length > 0) return cached;
    const fresh = await fetcher();
    await set(key, fresh);
    return fresh;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const userId = getSupabaseUserIdFromLocalStorage();

    const [expense, income, payeeList] = await Promise.all([
      fetchIfMissing(userId + "_" + CACHE_KEYS.expense, async () => {
        const { data } = await supabase
          .from("categories")
          .select("*")
          .eq("type", "Expense")
          .order("name", { ascending: true });
        return data || [];
      }),
      fetchIfMissing(userId + "_" + CACHE_KEYS.income, async () => {
        const { data } = await supabase
          .from("categories")
          .select("*")
          .eq("type", "Income")
          .order("name", { ascending: true });
        return data || [];
      }),
      fetchIfMissing(userId + "_" + CACHE_KEYS.payees, async () => {
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

    const last = localStorage.getItem(userId + "_" + LAST_REFRESHED_KEY);
    if (last) {
      setLastSynced(Number(last));
    } else {
      const now = Date.now();
      localStorage.setItem(userId + "_" + LAST_REFRESHED_KEY, now);
      setLastSynced(now);
    }

    setLoading(false);
  }, []);

  const refreshData = useCallback(async () => {
    setSyncing(true);
    const userId = getSupabaseUserIdFromLocalStorage();
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

    await set(userId + "_" + CACHE_KEYS.expense, expense);
    await set(userId + "_" + CACHE_KEYS.income, income);
    await set(userId + "_" + CACHE_KEYS.payees, payees);

    setExpenseCategories(expense);
    setIncomeCategories(income);
    setPayees(payees);

    const now = Date.now();
    localStorage.setItem(userId + "_" + LAST_REFRESHED_KEY, now);
    setLastSynced(now);

    setSyncing(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderIcon = (iconName) => {
    const Icon = MdIcons[iconName];
    return Icon ? <Icon size={16} style={{ marginRight: 8 }} /> : null;
  };

  const handleClearAndLogout = async () => {
    // Clear localStorage & sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Clear IndexedDB
    indexedDB.databases().then((dbs) => {
      dbs.forEach((db) => indexedDB.deleteDatabase(db.name));
    });

    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    await supabase.auth.signOut();
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
            {visibleCategories?.map((category) => (
              <div className="category-card" key={category.id}>
                {renderIcon(category.icon)}
                <span>{category.name}</span>
              </div>
            ))}
          </div>

          {categoriesToShow?.length > visibleLimit && (
            <button
              className="show-more-btn"
              onClick={() => setShowAllCategories((prev) => !prev)}
            >
              {showAllCategories ? "Show Less" : "Show More"}
            </button>
          )}
        </div>

        {/* Payees */}
        <div className="settings-section">
          <h2>Payees</h2>
          <div className="payee-grid">
            {visiblePayees.map((payee) => (
              <div className="payee-card" key={payee.id}>
                <img src={payee.logo} alt={payee.name} className="payee-logo" />
                <div className="payee-name">{payee.name}</div>
              </div>
            ))}
          </div>

          {payees.length > visibleLimit && (
            <button
              className="show-more-btn"
              onClick={() => setShowAllPayees((prev) => !prev)}
            >
              {showAllPayees ? "Show Less" : "Show More"}
            </button>
          )}
        </div>
      </div>
      <div className="settings-footer">
        <button className="clear-cache-btn" onClick={handleClearAndLogout}>
          Clear Cache and Logout
        </button>
      </div>
    </AppLayout>
  );
};

export default Settings;
