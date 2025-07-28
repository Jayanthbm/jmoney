import { get, set } from "idb-keyval";

import { fetchBudgetsData } from "../supabaseData";
import { getAllTransactions } from "./transactionDb";

const BUDGETS_KEY = "budgets_cache";

export const addBudget = async (budget) => {
  try {
    const existing = (await get(BUDGETS_KEY)) || [];
    await set(BUDGETS_KEY, [...existing, budget]);
    return true;
  } catch (error) {
    console.log("Error in adding budget", error);
    return false;
  }
};

export const updateBudget = async (updatedBudget) => {
  try {
    const existing = (await get(BUDGETS_KEY)) || [];
    const updated = existing.map((b) =>
      b.id === updatedBudget.id ? updatedBudget : b
    );
    await set(BUDGETS_KEY, updated);
    return true;
  } catch (error) {
    console.log("Error in updating budget", error);
    return false;
  }
};

export const deleteBudget = async (id) => {
  try {
    const existing = (await get(BUDGETS_KEY)) || [];
    const filtered = existing.filter((b) => b.id !== id);
    await set(BUDGETS_KEY, filtered);
    return true;
  } catch (error) {
    console.log("Error in deleting budget", error)
    return false;
  }
};

export const getCachedBudgets = async (force = false) => {
  let budgets = await get("budgets_cache");
  if (!budgets || !Array.isArray(budgets) || force) {
    budgets = await fetchBudgetsData();
  }
  return budgets;
};

export const getCachedBudgetAmountMap = async (force = false) => {
  let budget_amount_map = await get("budgets_amount_map_cache");

  if (!budget_amount_map || typeof budget_amount_map !== "object" || force) {
    const budgets = await getCachedBudgets(force);

    // Collect all budget category IDs
    const budget_categories = budgets.flatMap((budget) => budget.categories);

    const allTx = await getAllTransactions();

    // Filter relevant transactions
    const filteredTx = allTx.filter(
      (tx) => tx.type === "Expense" && budget_categories.includes(tx.category_id)
    );

    if (filteredTx.length === 0) {
      const emptyMap = {};
      await set("budgets_amount_map_cache", emptyMap);
      return emptyMap;
    }

    // Sort to find min date
    const sorted = filteredTx.sort((a, b) => new Date(a.date) - new Date(b.date));
    const minDate = new Date(sorted[0].date);
    const maxDate = new Date(); // current date

    // Step 1: Build empty map for all months and all budget categories
    const budgetAmountMap = {};
    const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

    while (
      current.getFullYear() < maxDate.getFullYear() ||
      (current.getFullYear() === maxDate.getFullYear() &&
        current.getMonth() <= maxDate.getMonth())
    ) {
      const year = current.getFullYear();
      const month = current.getMonth(); // 0-based

      for (const categoryId of budget_categories) {
        const key = `${year}_${month}_${categoryId}`;
        budgetAmountMap[key] = 0;
      }

      // Move to next month
      current.setMonth(current.getMonth() + 1);
    }

    // Step 2: Add transaction amounts to the map
    for (const tx of filteredTx) {
      const date = new Date(tx.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}_${month}_${tx.category_id}`;
      budgetAmountMap[key] += tx.amount;
    }

    // Rounding
    Object.keys(budgetAmountMap).forEach((key) => {
      budgetAmountMap[key] = parseFloat(budgetAmountMap[key].toFixed(2));
    });

    await set("budgets_amount_map_cache", budgetAmountMap);
    return budgetAmountMap;
  }

  return budget_amount_map;
};