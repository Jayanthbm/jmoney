// src/services/sync/budgetSync.js
import { supabase } from '../supabase';
import { db } from '../../db/db';
import { isOnline, syncLog } from './baseSync';
import { STORAGE_KEYS, TABLES } from '../../constants';
import { logger } from '../../utils/logger';

/**
 * Pushes unsynced local budgets to Supabase.
 */
export const pushLocalBudgets = async (userId) => {
  if (!(await isOnline())) return;

  const unsyncedBudgets = await db.budgets
    .where('user_id').equals(userId)
    .and(b => b.sync_status === 1)
    .toArray();

  if (unsyncedBudgets.length === 0) return;

  syncLog('Budgets', `Pushing ${unsyncedBudgets.length} unsynced budgets...`);

  for (const budget of unsyncedBudgets) {
    if (budget.deleted === 1) {
      const { error } = await supabase.from(TABLES.BUDGETS).delete().eq('id', budget.id);
      if (!error) {
        await db.budgets.delete(budget.id);
      } else {
        logger.error(`[Sync:Budgets] Error deleting budget ${budget.id}:`, error);
      }
      continue;
    }

    const { sync_status: _sync, deleted: _del, ...rest } = budget;
    // Standardize interval for Supabase constraint
    const interval = budget.interval === 'Monthly' ? 'Month' : budget.interval;

    let categoriesArray = [];
    try {
      categoriesArray = typeof budget.categories === 'string' 
        ? JSON.parse(budget.categories) 
        : (budget.categories || []);
    } catch (e) {
      categoriesArray = [];
    }

    if (categoriesArray.length === 0) {
      logger.error(`[Sync:Budgets] Skipping budget ${budget.id} due to empty categories array`);
      continue;
    }

    const budgetToPush = {
      ...rest,
      interval,
      categories: categoriesArray,
    };

    const { error } = await supabase
      .from(TABLES.BUDGETS)
      .upsert([budgetToPush], { onConflict: 'id' });
    if (!error) {
      await db.budgets.update(budget.id, { sync_status: 0 });
      logger.info(`[Sync:Budgets] Successfully pushed budget: ${budget.name}`);
    } else {
      logger.error(`[Sync:Budgets] Failed to push budget ${budget.id}:`, error);
    }
  }
};

/**
 * Syncs budgets from Supabase to local DB.
 */
export const syncBudgets = async (userId) => {
  if (!userId || !(await isOnline())) return;

  syncLog('Budgets', 'Starting Sync...');
  await pushLocalBudgets(userId);

  const { data: budgets, error } = await supabase
    .from(TABLES.BUDGETS)
    .select('*')
    .eq('user_id', userId);

  if (!error && budgets) {
    await db.transaction('rw', db.budgets, async () => {
      await db.budgets.where('user_id').equals(userId).delete();
      for (const item of budgets) {
        await db.budgets.put({ 
          ...item, 
          sync_status: 0,
          categories: typeof item.categories === 'object' ? JSON.stringify(item.categories) : item.categories
        });
      }
    });
    syncLog('Budgets', `Saved ${budgets.length} budgets to local DB.`);
    localStorage.setItem(
      `${STORAGE_KEYS.LAST_SYNC_BUDGETS}${userId}`,
      new Date().toISOString(),
    );
  } else if (error) {
    logger.error(`[Sync:Budgets] Pull failed:`, error);
  }
};
