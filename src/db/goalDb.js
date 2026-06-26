// src/db/goalDb.js

import { get, set } from "idb-keyval";

import { fetchGoalsData } from "../supabaseData";
import { getGoalsCacheKey } from "../utils";

export const addGoal = async (goal) => {
  const { GOALS_CACHE_KEY } = getGoalsCacheKey();
  const existing = (await get(GOALS_CACHE_KEY)) || [];
  const updated = [...existing, goal];
  await set(GOALS_CACHE_KEY, updated);
};

export const updateGoal = async (updatedGoal) => {
  const { GOALS_CACHE_KEY } = getGoalsCacheKey();
  const existing = (await get(GOALS_CACHE_KEY)) || [];
  const updated = existing.map((g) =>
    g.id === updatedGoal.id ? updatedGoal : g
  );
  await set(GOALS_CACHE_KEY, updated);
};

export const deleteGoal = async (id) => {
  const { GOALS_CACHE_KEY } = getGoalsCacheKey();
  const existing = (await get(GOALS_CACHE_KEY)) || [];
  const updated = existing.filter((g) => g.id !== id);
  await set(GOALS_CACHE_KEY, updated);
};

export const getCachedGoals = async () => {
  const { GOALS_CACHE_KEY } = getGoalsCacheKey();
  let goals = await get(GOALS_CACHE_KEY);
  if (!goals || !Array.isArray(goals)) {
    goals = await fetchGoalsData();
  }
  return goals;
}
