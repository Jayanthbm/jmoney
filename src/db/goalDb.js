// src/db/goalDb.js

import { get, set } from "idb-keyval";
import { getSupabaseUserIdFromLocalStorage } from "../utils";

const getGoalCacheKey = () => {
  const userId = getSupabaseUserIdFromLocalStorage();
  return `${userId}_goals`;
};

export const addGoal = async (goal) => {
  const CACHE_KEY = getGoalCacheKey();
  const existing = (await get(CACHE_KEY)) || [];
  const updated = [...existing, goal];
  await set(CACHE_KEY, updated);
};

export const updateGoal = async (updatedGoal) => {
  const CACHE_KEY = getGoalCacheKey();
  const existing = (await get(CACHE_KEY)) || [];
  const updated = existing.map((g) =>
    g.id === updatedGoal.id ? updatedGoal : g
  );
  await set(CACHE_KEY, updated);
};

export const deleteGoal = async (id) => {
  const CACHE_KEY = getGoalCacheKey();
  const existing = (await get(CACHE_KEY)) || [];
  const updated = existing.filter((g) => g.id !== id);
  await set(CACHE_KEY, updated);
};
