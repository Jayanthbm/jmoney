// src/supabaseData.js

import { addBudget, deleteBudget, updateBudget } from "./db/budgetDb";
import { addGoal, deleteGoal, updateGoal } from "./db/goalDb";
import {
  clearTransactions,
  deleteTransactionInDb,
  getAllTransactions,
  storeTransactions,
  updateTransactionInDb,
} from "./db/transactionDb";
import { del, set } from "idb-keyval";
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

    allData = [...allData, ...data];
    offset += CHUNK_SIZE;
  }
  await clearTransactions();
  await storeTransactions(allData);
  return allData;
};

export const getMaxTransactionTimestamp = async () => {
  const userId = getSupabaseUserIdFromLocalStorage();
  const { data, error } = await supabase
    .from("transactions")
    .select("transaction_timestamp")
    .eq("user_id", userId)
    .order("transaction_timestamp", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error fetching max transaction timestamp:", error);
    return null;
  }

  return data.length > 0 ? data[0].transaction_timestamp : null;
};

export const needsTransactionSync = async () => {
  try {
    const allTx = await getAllTransactions();
    if (allTx.length < 1) {
      return true; // no local data → needs sync
    }

    const maxLocalDate = new Date(
      Math.max(
        ...allTx.map((tx) => new Date(tx.transaction_timestamp).getTime())
      )
    );

    const maxSupabaseDateStr = await getMaxTransactionTimestamp();
    const maxSupabaseDate = maxSupabaseDateStr
      ? new Date(maxSupabaseDateStr)
      : null;

    // If Supabase has no timestamp or local is behind, we need sync
    if (!maxSupabaseDate || maxLocalDate < maxSupabaseDate) {
      return true;
    }

    // If both are same or local is ahead, no sync needed
    return false;
  } catch (error) {
    console.error("Error in needsTransactionSync:", error);
    return true; // safe default → try to sync
  }
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
    product_link: payload.product_link || null,
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

export const fetchBudgetsData = async () => {
  const BUDGETS_CACHE_KEY = "budgets_cache";
  const { data, error } = await supabase.from("budgets").select("*");
  if (error) console.error("Error fetching budgets:", error);
  else {
    await del(BUDGETS_CACHE_KEY);
    await set(BUDGETS_CACHE_KEY, data);
    return data;
  }
};

export const addBudgetInDb = async (payload) => {
  const id = crypto.randomUUID();
  const userId = getSupabaseUserIdFromLocalStorage();

  const budget = {
    id,
    user_id: userId,
    name: payload.name,
    amount: payload.amount,
    interval: payload.interval,
    start_date: payload.start_date,
    categories: payload.categories,
    logo: payload.logo,
    created_at: new Date().toISOString(),
  };

  // 1. Add to IndexedDB
  await addBudget(budget);

  // 2. Sync to Supabase
  supabase
    .from("budgets")
    .insert([budget])
    .then(({ error }) => {
      if (error) {
        console.error("Supabase insert failed:", error);
      }
    });

  return budget;
};

export const updateBudgetInDb = async (budget) => {
  await updateBudget({
    ...budget,
    updated_at: new Date().toISOString(),
  });

  supabase
    .from("budgets")
    .update(budget)
    .eq("id", budget.id)
    .eq("user_id", budget.user_id)
    .then(({ error }) => {
      if (error) {
        console.error("Supabase update failed:", error);
      }
    });

  return {
    ...budget,
    updated_at: new Date().toISOString(),
  };
};

export const deleteBudgetInDb = async (id) => {
  const userId = getSupabaseUserIdFromLocalStorage();

  // 1. Delete from IndexedDB
  await deleteBudget(id);

  // 2. Sync with Supabase
  supabase
    .from("budgets")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .then(({ error }) => {
      if (error) {
        console.error("Supabase delete failed:", error);
      }
    });
};
