// src/supabaseData.js

import { set } from "idb-keyval";
import { storeTransactions } from "./db";
import { supabase } from "./supabaseClient";
import { getSupabaseUserIdFromLocalStorage } from "./utils";

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
    await set(key, {
      data: normalizedData,
      timestamp: new Date().toISOString(),
      date: today,
    });
  }

  return result;
};
