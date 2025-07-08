import { get } from "idb-keyval";
import { getGoalsCacheKey } from "../utils";
import { fetchGoalsData } from "../supabaseData";

export const getCachedGoals = async () => {
  const { GOALS_CACHE_KEY } = getGoalsCacheKey();
  let goals = await get(GOALS_CACHE_KEY);
  if (!goals || !Array.isArray(goals)) {
    goals = await fetchGoalsData();
  }
  return goals;
}