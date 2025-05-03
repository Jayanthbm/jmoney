// src/db/goalDb.js

import { get, set } from "idb-keyval";
import { getGoalsCacheKey } from "../utils";

export const addGoal = async (goal) => {
  const { GOALS_CACHE_KEY } = getGoalsCacheKey();
  const existing = (await get(GOALS_CACHE_KEY)) || [];
  const updated = [...existing, goal];
  await set(GOALS_CACHE_KEY, updated);
};

export const updateGoal = async (updatedGoal) => {
  const { GOALS_CACHE_KEY, GOALS_EXPIRY_KEY } = getGoalsCacheKey();
  const existing = (await get(GOALS_CACHE_KEY)) || [];
  const updated = existing.map((g) =>
    g.id === updatedGoal.id ? updatedGoal : g
  );
  await set(GOALS_CACHE_KEY, updated);
};

export const deleteGoal = async (id) => {
  const { GOALS_CACHE_KEY, GOALS_EXPIRY_KEY } = getGoalsCacheKey();
  const existing = (await get(GOALS_CACHE_KEY)) || [];
  const updated = existing.filter((g) => g.id !== id);
  await set(GOALS_CACHE_KEY, updated);
};
