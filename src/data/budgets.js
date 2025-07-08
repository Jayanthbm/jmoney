// src/data/budgets.js
import { get } from "idb-keyval";
import { fetchBudgetsData } from "../supabaseData";

export const getCachedBudgets = async () => {
  let budgets = await get("budgets_cache");
  if (!budgets || !Array.isArray(budgets)) {
    budgets = await fetchBudgetsData();
  }
  return budgets;
};
