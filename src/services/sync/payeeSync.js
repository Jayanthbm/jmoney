// src/services/sync/payeeSync.js
import { supabase } from '../supabase';
import { db } from '../../db/db';
import { isOnline, syncLog } from './baseSync';
import { STORAGE_KEYS, TABLES } from '../../constants';

/**
 * Pushes unsynced local payees to Supabase.
 */
export const pushLocalPayees = async (userId) => {
  if (!(await isOnline())) return;

  const unsyncedPayees = await db.payees
    .where('user_id').equals(userId)
    .and(p => p.sync_status === 1)
    .toArray();

  if (unsyncedPayees.length === 0) return;

  syncLog('Payees', `Pushing ${unsyncedPayees.length} unsynced payees...`);

  for (const payee of unsyncedPayees) {
    const { sync_status: _sync, ...payeeToPush } = payee;
    const { error } = await supabase
      .from(TABLES.PAYEES)
      .upsert([payeeToPush], { onConflict: 'id' });
    if (!error) {
      await db.payees.update(payee.id, { sync_status: 0 });
    }
  }
};

/**
 * Syncs payees from Supabase to local DB.
 */
export const syncPayees = async (userId) => {
  if (!userId || !(await isOnline())) return;

  syncLog('Payees', 'Starting Sync...');
  await pushLocalPayees(userId);

  const { data: payees, error } = await supabase
    .from(TABLES.PAYEES)
    .select('*')
    .eq('user_id', userId);

  if (!error && payees) {
    await db.transaction('rw', db.payees, async () => {
      await db.payees.where('user_id').equals(userId).delete();
      for (const item of payees) {
        await db.payees.put({ ...item, sync_status: 0 });
      }
    });
    syncLog('Payees', `Saved ${payees.length} payees to local DB.`);
    localStorage.setItem(
      `${STORAGE_KEYS.LAST_SYNC_PAYEES}${userId}`,
      new Date().toISOString(),
    );
  }
};
