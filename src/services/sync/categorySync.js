// src/services/sync/categorySync.js
import { supabase } from '../supabase';
import { db } from '../../db/db';
import { isOnline, syncLog } from './baseSync';
import { STORAGE_KEYS, TABLES } from '../../constants';

/**
 * Pushes unsynced local categories to Supabase.
 */
export const pushLocalCategories = async (userId) => {
  if (!(await isOnline())) return;

  const unsyncedCategories = await db.categories
    .where('user_id').equals(userId)
    .and(cat => cat.sync_status === 1)
    .toArray();

  if (unsyncedCategories.length === 0) return;

  syncLog('Categories', `Pushing ${unsyncedCategories.length} unsynced categories...`);

  for (const cat of unsyncedCategories) {
    const { sync_status: _sync, ...catToPush } = cat;
    const { error } = await supabase
      .from(TABLES.CATEGORIES)
      .upsert([catToPush], { onConflict: 'id' });
    if (!error) {
      await db.categories.update(cat.id, { sync_status: 0 });
    }
  }
};

/**
 * Syncs categories from Supabase to local DB.
 */
export const syncCategories = async (userId) => {
  if (!userId || !(await isOnline())) return;

  syncLog('Categories', 'Starting Sync...');
  await pushLocalCategories(userId);

  const { data: categories, error } = await supabase
    .from(TABLES.CATEGORIES)
    .select('*')
    .eq('user_id', userId);

  if (!error && categories) {
    await db.transaction('rw', db.categories, async () => {
      await db.categories.where('user_id').equals(userId).delete();
      for (const item of categories) {
        await db.categories.put({ ...item, sync_status: 0 });
      }
    });
    syncLog('Categories', `Saved ${categories.length} categories to local DB.`);
    localStorage.setItem(
      `${STORAGE_KEYS.LAST_SYNC_CATEGORIES}${userId}`,
      new Date().toISOString(),
    );
  }
};
