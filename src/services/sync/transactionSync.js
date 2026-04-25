// src/services/sync/transactionSync.js
import { supabase } from '../supabase';
import { db } from '../../db/db';
import { isOnline, syncLog } from './baseSync';
import { STORAGE_KEYS, TABLES } from '../../constants';
import { logger } from '../../utils/logger';

/**
 * Pushes unsynced local transactions to Supabase.
 */
export const pushLocalTransactions = async (userId) => {
  if (!(await isOnline())) return;

  const unsyncedTx = await db.transactions
    .where('user_id').equals(userId)
    .and(tx => tx.sync_status === 1)
    .toArray();

  if (unsyncedTx.length === 0) return;

  syncLog('Transactions', `Pushing ${unsyncedTx.length} unsynced transactions...`);

  for (const tx of unsyncedTx) {
    if (tx.deleted === 1) {
      const { error } = await supabase.from(TABLES.TRANSACTIONS).delete().eq('id', tx.id);
      if (!error) {
        await db.transactions.delete(tx.id);
      } else {
        logger.error(`[Sync:Transactions] Error deleting transaction ${tx.id}:`, error);
      }
      continue;
    }

    const txToPush = {
      id: tx.id,
      user_id: tx.user_id,
      amount: tx.amount,
      transaction_timestamp: tx.transaction_timestamp,
      description: tx.description || '',
      category_id: tx.category_id,
      payee_id: tx.payee_id === 'null' ? null : tx.payee_id || null,
      type: tx.type || 'Expense',
      product_link: tx.product_link || null,
      latitude: tx.latitude || null,
      longitude: tx.longitude || null,
      created_at: tx.created_at || new Date().toISOString(),
      updated_at: tx.updated_at || new Date().toISOString(),
      sync_status: 'synced',
      ...(tx.tid && tx.tid !== 0 ? { tid: tx.tid } : {}),
    };

    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .upsert([txToPush], { onConflict: 'id' })
      .select('tid');

    if (error) {
      logger.error(`[Sync:Transactions] Error pushing transaction ${tx.id}:`, error);
    } else {
      const newTid = data?.[0]?.tid;
      if (newTid) {
        await db.transactions.update(tx.id, { tid: newTid, sync_status: 0 });
        logger.info(`[Sync:Transactions] Pushed ${tx.id}, new tid: ${newTid}`);
      } else {
        await db.transactions.update(tx.id, { sync_status: 0 });
        logger.info(`[Sync:Transactions] Pushed ${tx.id} (no tid change)`);
      }
    }
  }
};

/**
 * Syncs transactions from Supabase to local DB.
 */
export const syncTransactions = async (userId, isPartial = true) => {
  if (!userId || !(await isOnline())) return;

  syncLog('Transactions', `Starting ${isPartial ? 'Partial' : 'Force'} Sync...`);

  await pushLocalTransactions(userId);

  let lastTid = 0;

  if (isPartial) {
    const localMax = await db.transactions
      .where('user_id').equals(userId)
      .reverse()
      .sortBy('tid');
    lastTid = localMax.length > 0 ? localMax[0].tid || 0 : 0;
  } else {
    await db.transactions.where('user_id').equals(userId).delete();
  }

  const CHUNK_SIZE = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: rawData, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .select(`
        *,
        categories:category_id (
          name,
          icon,
          app_icon
        ),
        payees:payee_id (
          name,
          logo
        )
      `)
      .eq('user_id', userId)
      .gt('tid', lastTid)
      .order('tid', { ascending: true })
      .range(offset, offset + CHUNK_SIZE - 1);

    if (error) {
      logger.error('[Sync:Transactions] Error pulling transactions:', error);
      break;
    }

    if (!rawData || rawData.length === 0) {
      hasMore = false;
      break;
    }

    const data = rawData.map(item => ({
      ...item,
      category_name: item.categories?.name,
      category_icon: item.categories?.icon,
      category_app_icon: item.categories?.app_icon,
      payee_name: item.payees?.name,
      payee_logo: item.payees?.logo,
      sync_status: 0,
      date: item.transaction_timestamp.split('T')[0]
    }));

    await db.transaction('rw', db.transactions, async () => {
      for (const item of data) {
        // Remove related objects from Supabase join before saving to Dexie
        const { categories, payees, ...txToSave } = item;
        await db.transactions.put(txToSave);
      }
    });

    syncLog('Transactions', `Saved ${data.length} transactions to local DB.`);
    logger.info(`[Sync:Transactions] Successfully pulled and saved ${data.length} items`);
    offset += CHUNK_SIZE;
  }

  localStorage.setItem(
    `${STORAGE_KEYS.LAST_SYNC_TRANSACTIONS}${userId}`,
    new Date().toISOString(),
  );
  syncLog('Transactions', 'Sync completed.');
};
