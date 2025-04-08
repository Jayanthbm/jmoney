import { useCallback, useEffect, useState } from "react";
import AppLayout from "./components/AppLayout";
import { supabase } from "./supabaseClient";
import * as MdIcons from "react-icons/md";
import "./Settings.css";
import { get, set } from "idb-keyval";

const CACHE_KEY = "settings-cache";
const CACHE_EXPIRY_DAYS = 10;

const Settings = () => {
  const [categoryType, setCategoryType] = useState("Expense");
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [payees, setPayees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (forceRefresh = false) => {
    setLoading(true);

    const now = Date.now();
    const cache = await get(CACHE_KEY);

    const isCacheValid =
      cache &&
      !forceRefresh &&
      now - cache.timestamp < CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    if (isCacheValid) {
      setExpenseCategories(cache.expenseCategories || []);
      setIncomeCategories(cache.incomeCategories || []);
      setPayees(cache.payees || []);
      setLoading(false);
      return;
    }

    const [{ data: expenseData }, { data: incomeData }, { data: payeeData }] =
      await Promise.all([
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

    const newCache = {
      timestamp: now,
      expenseCategories: expenseData || [],
      incomeCategories: incomeData || [],
      payees: payeeData || [],
    };

    await set(CACHE_KEY, newCache);

    setExpenseCategories(newCache.expenseCategories);
    setIncomeCategories(newCache.incomeCategories);
    setPayees(newCache.payees);
    setLoading(false);
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
    <AppLayout
      title="Settings"
      loading={!incomeCategories || !expenseCategories || !payees || loading}
      onRefresh={() => fetchData(true)}
    >
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
