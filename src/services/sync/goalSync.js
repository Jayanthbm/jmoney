// src/services/sync/goalSync.js
import { supabase } from '../supabase';
import { db } from '../../db/db';
import { isOnline, syncLog } from './baseSync';
import { STORAGE_KEYS, TABLES } from '../../constants';

/**
 * Pushes unsynced local goals to Supabase.
 */
export const pushLocalGoals = async (userId) => {
  if (!(await isOnline())) return;

  const unsyncedGoals = await db.goals
    .where('user_id').equals(userId)
    .and(g => g.sync_status === 1)
    .toArray();

  if (unsyncedGoals.length === 0) return;

  syncLog('Goals', `Pushing ${unsyncedGoals.length} unsynced goals...`);

  for (const goal of unsyncedGoals) {
    let success = false;
    if (goal.deleted === 1) {
      const { error } = await supabase.from(TABLES.GOALS).delete().eq('id', goal.id);
      if (!error) {
        await db.goals.delete(goal.id);
        success = true;
      }
    } else {
      const { sync_status: _sync, deleted: _del, ...goalToPush } = goal;
      const { error } = await supabase
        .from(TABLES.GOALS)
        .upsert([goalToPush], { onConflict: 'id' });
      if (!error) {
        await db.goals.update(goal.id, { sync_status: 0 });
        success = true;
      }
    }
  }
};

/**
 * Syncs goals from Supabase to local DB.
 */
export const syncGoals = async (userId) => {
  if (!userId || !(await isOnline())) return;

  syncLog('Goals', 'Starting Sync...');
  await pushLocalGoals(userId);

  const { data: goals, error } = await supabase
    .from(TABLES.GOALS)
    .select('*')
    .eq('user_id', userId);

  if (!error && goals) {
    await db.transaction('rw', db.goals, async () => {
      await db.goals.where('user_id').equals(userId).delete();
      for (const item of goals) {
        await db.goals.put({ ...item, sync_status: 0, deleted: 0 });
      }
    });
    syncLog('Goals', `Saved ${goals.length} goals to local DB.`);
    localStorage.setItem(
      `${STORAGE_KEYS.LAST_SYNC_GOALS}${userId}`,
      new Date().toISOString(),
    );
  }
};
