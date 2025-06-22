import { get, set } from "idb-keyval";

const BUDGETS_KEY = "budgets_cache";

export const addBudget = async (budget) => {
  const existing = (await get(BUDGETS_KEY)) || [];
  await set(BUDGETS_KEY, [...existing, budget]);
};

export const updateBudget = async (updatedBudget) => {
  const existing = (await get(BUDGETS_KEY)) || [];
  const updated = existing.map((b) =>
    b.id === updatedBudget.id ? updatedBudget : b
  );
  await set(BUDGETS_KEY, updated);
};

export const deleteBudget = async (id) => {
  const existing = (await get(BUDGETS_KEY)) || [];
  const filtered = existing.filter((b) => b.id !== id);
  await set(BUDGETS_KEY, filtered);
};