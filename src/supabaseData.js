// src/supabaseData.js

import { addGoal, deleteGoal, updateGoal } from "./db/goalDb";
import { del, set } from "idb-keyval";
import {
  deleteTransactionInDb,
  storeTransactions,
  updateTransactionInDb,
} from "./db/transactionDb";
import { getGoalsCacheKey, getSupabaseUserIdFromLocalStorage } from "./utils";

import { supabase } from "./supabaseClient";

export const loadTransactionsFromSupabase = async () => {
  const CHUNK_SIZE = 1000;
  const userId = getSupabaseUserIdFromLocalStorage();
  if (!userId) return [];
  let allData = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase.rpc("get_user_transactions", {
      uid: userId,
      search_term: "",
      limit_count: CHUNK_SIZE,
      offset_count: offset,
    });

    if (error) {
      console.error("Error fetching transactions:", error);
      break;
    }

    if (data.length === 0) {
      hasMore = false;
      break;
    }

    await storeTransactions(data);
    allData = [...allData, ...data];
    offset += CHUNK_SIZE;
  }

  return allData;
};

export const fetchUserOverviewData = async (uid) => {
  const today = new Date().toISOString().split("T")[0];

  const calls = [
    { key: "remainingForPeriod", fn: "get_user_overview_remaining" },
    { key: "dailyLimit", fn: "get_user_overview_daily_limit" },
    { key: "topCategories", fn: "get_user_overview_top_categories" },
    { key: "current_month", fn: "get_user_overview_current_month" },
    { key: "current_year", fn: "get_user_overview_current_year" },
    { key: "networth", fn: "get_user_overview_networth" },
  ];

  const result = {};

  for (const { key, fn } of calls) {
    const { data, error } = await supabase.rpc(fn, { uid });
    if (error) {
      console.error(`Error fetching ${key}:`, error);
      continue;
    }

    const normalizedData =
      Array.isArray(data) && data.length === 1 ? data[0] : data;

    result[key] = normalizedData;

    // ✅ Store to IndexedDB
    await set(uid + "_" + key, {
      data: normalizedData,
      timestamp: new Date().toISOString(),
      date: today,
    });
  }

  return result;
};

export const updateTransaction = async (id, payload, options = {}) => {
  const {
    incomeCategories = [],
    expenseCategories = [],
    payees = [],
  } = options;

  const allCategories = [...incomeCategories, ...expenseCategories];
  const category = allCategories.find((cat) => cat.id === payload.category_id);
  const payee = payees.find((p) => p.id === payload.payee_id);

  const updatedData = {
    id,
    amount: payload.amount,
    description: payload.description,
    transaction_timestamp: payload.transaction_timestamp,
    category_id: payload.category_id,
    category_name: category?.name || "",
    category_icon: category?.icon || "",
    payee_id: payload.payee_id || null,
    payee_name: payee?.name || null,
    payee_logo: payee?.logo || null,
    type: category?.type || "Expense",
    date: payload.transaction_timestamp.split("T")[0],
  };

  // 1. Update in IndexedDB immediately
  await updateTransactionInDb(updatedData);

  // 2. Sync with Supabase (async, fire-and-forget pattern)
  supabase
    .from("transactions")
    .update(payload)
    .eq("id", id)
    .then(({ error }) => {
      if (error) {
        console.error("Supabase update failed:", error);
        // Optional: Retry logic or error handling here
      }
    });

  return updatedData;
};

export const deleteTransaction = async (id) => {
  // 1. Delete from IndexedDB
  await deleteTransactionInDb(id);

  // 2. Sync delete with Supabase in background
  supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .then(({ error }) => {
      if (error) {
        console.error("Supabase delete failed:", error);
        // Optional: Retry logic or error handling here
      }
    });
};

export const addTransaction = async (payload, options = {}) => {
  const {
    incomeCategories = [],
    expenseCategories = [],
    payees = [],
  } = options;

  const allCategories = [...incomeCategories, ...expenseCategories];
  const category = allCategories.find((cat) => cat.id === payload.category_id);
  const payee = payees.find((p) => p.id === payload.payee_id);

  const newId = crypto.randomUUID();
  const newTransaction = {
    id: newId,
    amount: payload.amount,
    description: payload.description,
    transaction_timestamp: payload.transaction_timestamp,
    category_id: payload.category_id,
    category_name: category?.name || "",
    category_icon: category?.icon || "",
    payee_id: payload.payee_id || null,
    payee_name: payee?.name || null,
    payee_logo: payee?.logo || null,
    type: category?.type || "Expense",
    date: payload.transaction_timestamp.split("T")[0],
    user_id: getSupabaseUserIdFromLocalStorage(),
  };

  // 1. Store in IndexedDB first
  await updateTransactionInDb(newTransaction); // reuse update logic

  // 2. Sync with Supabase in the background
  supabase
    .from("transactions")
    .insert([
      {
        id: newTransaction.id,
        amount: newTransaction.amount,
        description: newTransaction.description,
        transaction_timestamp: newTransaction.transaction_timestamp,
        category_id: newTransaction.category_id,
        payee_id: newTransaction.payee_id,
        type: newTransaction.type,
        user_id: newTransaction.user_id,
      },
    ])
    .then(({ error }) => {
      if (error) {
        console.error("Supabase insert failed:", error);
      }
    });

  return newTransaction;
};

export const fetchGoalsData = async () => {
  const { GOALS_CACHE_KEY, GOALS_EXPIRY_KEY } = getGoalsCacheKey();
  const { data, error } = await supabase.from("goals").select("*");
  if (error) console.error("Error fetching goals:", error);
  else {
    localStorage.setItem(GOALS_EXPIRY_KEY, Date.now());
    await del(GOALS_CACHE_KEY);
    await set(GOALS_CACHE_KEY, data);
    return data;
  }
};

export const addGoalInDb = async (payload) => {
  const id = crypto.randomUUID();
  const userId = getSupabaseUserIdFromLocalStorage();

  const goal = {
    id,
    user_id: userId,
    name: payload.name,
    logo: payload.logo,
    goal_amount: parseFloat(payload.goal_amount),
    current_amount: parseFloat(payload.current_amount) || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 1. Add to IndexedDB
  await addGoal(goal);

  // 2. Sync with Supabase
  supabase
    .from("goals")
    .insert([goal])
    .then(({ error }) => {
      if (error) {
        console.error("Supabase insert failed:", error);
      }
    });

  return goal;
};

export const updateGoalInDb = async (goal) => {
  const updated = {
    ...goal,
    updated_at: new Date().toISOString(),
  };

  // 1. Update in IndexedDB
  await updateGoal(updated);

  // 2. Sync with Supabase
  supabase
    .from("goals")
    .update(updated)
    .eq("id", goal.id)
    .eq("user_id", goal.user_id)
    .then(({ error }) => {
      if (error) {
        console.error("Supabase update failed:", error);
      }
    });

  return updated;
};

export const deleteGoalInDb = async (id) => {
  const userId = getSupabaseUserIdFromLocalStorage();

  // 1. Delete from IndexedDB
  await deleteGoal(id);

  // 2. Sync with Supabase
  supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .then(({ error }) => {
      if (error) {
        console.error("Supabase delete failed:", error);
      }
    });
};
