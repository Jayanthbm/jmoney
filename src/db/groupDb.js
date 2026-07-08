// src/db/groupDb.js

import { get, set } from "idb-keyval";
import { getGroupCacheKey } from "../utils";
import { fetchGroupsData } from "../supabaseData";

export const addGroup = async (group) => {
  const { GROUPS_CACHE_KEY } = getGroupCacheKey();
  const existing = (await get(GROUPS_CACHE_KEY)) || [];
  await set(GROUPS_CACHE_KEY, [...existing, group]);
};

export const updateGroup = async (updatedGroup) => {
  const { GROUPS_CACHE_KEY } = getGroupCacheKey();
  const existing = (await get(GROUPS_CACHE_KEY)) || [];
  const updated = existing.map((g) =>
    g.id === updatedGroup.id ? updatedGroup : g
  );
  await set(GROUPS_CACHE_KEY, updated);
};

export const deleteGroup = async (id) => {
  const { GROUPS_CACHE_KEY } = getGroupCacheKey();
  const existing = (await get(GROUPS_CACHE_KEY)) || [];
  const updated = existing.filter((g) => g.id !== id);
  await set(GROUPS_CACHE_KEY, updated);
};

export const getCachedGroups = async () => {
  const { GROUPS_CACHE_KEY } = getGroupCacheKey();
  let groups = await get(GROUPS_CACHE_KEY);
  if (!groups || !Array.isArray(groups)) {
    groups = await fetchGroupsData();
  }
  return groups;
};
